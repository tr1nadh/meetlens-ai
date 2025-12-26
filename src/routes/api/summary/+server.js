import { json } from "@sveltejs/kit";
import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";
import {
  GOOGLE_APPLICATION_CREDENTIALS,
  GCP_PROJECT_ID
} from "$env/static/private";

const REGION = "us-central1";
const PROJECT_ID = String(GCP_PROJECT_ID).trim();

// UPDATED: Using Gemini 2.0 Flash (the 2025 standard)
// If this still 404s, we swap to 'gemini-1.5-flash-002'
const MODEL_ID = "gemini-2.0-flash-001"; 

/* ---------------- VERTEX AUTH ---------------- */

const auth = new GoogleAuth({
  keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"]
});

/* ---------------- POST: SUMMARY ---------------- */

export async function POST({ request }) {
  try {
    const { transcript, meetingType } = await request.json();

    if (!transcript || transcript.length < 10) {
      return json({ error: "Transcript too short" }, { status: 400 });
    }

    // 1. Get Auth Token
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    // 2. Updated Endpoint Pattern
    // Note: We use the 'v1' endpoint which is stable for 2025
    const endpoint = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL_ID}:generateContent`;

    const prompt = `Summarize this ${meetingType || 'meeting'}. Focus on the main points. \n\nTranscript:\n${transcript}`;

    // 3. The API Request
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.1, // Lower temperature for more accurate summaries
          maxOutputTokens: 1024
        }
      })
    });

    // 4. Enhanced Error Diagnostic
    if (!res.ok) {
      const errData = await res.json();
      console.error("--- VERTEX DEBUG INFO ---");
      console.error("Project ID Used:", PROJECT_ID);
      console.error("Endpoint:", endpoint);
      console.error("Full Error:", JSON.stringify(errData, null, 2));
      
      // If we get a 404, suggest checking Model Garden
      if (res.status === 404) {
        return json({ 
          error: "Model Not Found", 
          message: "The model ID might not be enabled for your project or region.",
          suggestion: "Visit Vertex AI Model Garden in GCP Console to 'Enable' Gemini 2.0."
        }, { status: 404 });
      }

      throw new Error(`Vertex AI Error: ${res.status}`);
    }

    const data = await res.json();
    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return json({ summary: summary?.trim() || "No summary generated" });

  } catch (err) {
    console.error("[CRITICAL ERROR]", err);
    return json({ error: err.message }, { status: 500 });
  }
}