import { json } from "@sveltejs/kit";
import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";
import {
  GOOGLE_APPLICATION_CREDENTIALS,
  GCP_PROJECT_ID
} from "$env/static/private";

const REGION = "us-central1";
const PROJECT_ID = String(GCP_PROJECT_ID).trim();
const MODEL_ID = "gemini-2.0-flash-001"; // Consistent with your working summary code

/* ---------------- VERTEX AUTH ---------------- */
const auth = new GoogleAuth({
  keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"]
});

export async function POST({ request }) {
  try {
    const { transcript, meetingType = "general meeting" } = await request.json();

    if (!transcript || transcript.trim().length < 20) {
      return json({ error: "Transcript is too short" }, { status: 400 });
    }

    // 1. Get Auth Token (Bearer Token)
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    // 2. Vertex AI Endpoint
    const endpoint = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL_ID}:generateContent`;

    const prompt = `
      You are a conversation analyst. Analyze the following ${meetingType} transcript.
      Return ONLY a valid JSON object with the following structure:
      {
        "tone": "string",
        "sentiment": "positive | neutral | negative | mixed",
        "emotions": ["string"],
        "confidenceLevel": "Low | Medium | High",
        "riskSignals": ["string"],
        "summary": "string"
      }
      Transcript:
      """
      ${transcript}
      """
    `;

    // 3. The API Request
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          // Explicitly requesting JSON response
          responseMimeType: "application/json"
        }
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error("Vertex API Error:", JSON.stringify(errData, null, 2));
      return json({ error: "Gemini failed to analyze tone" }, { status: res.status });
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Empty response from AI");
    }

    // 4. Parse and Return
    // Vertex with responseMimeType returns a clean string, but we parse to send as JSON object
    const toneResult = JSON.parse(rawText);
    return json(toneResult);

  } catch (err) {
    console.error("[TONE API CRITICAL]", err);
    return json({ error: err.message }, { status: 500 });
  }
}