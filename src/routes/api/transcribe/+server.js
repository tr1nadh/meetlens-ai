import { json } from "@sveltejs/kit";
import * as speechSDK from "@google-cloud/speech";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { Storage } from "@google-cloud/storage";
import fs from "fs";
import path from "path";
import os from "os";
import { GOOGLE_APPLICATION_CREDENTIALS, GCP_PROJECT_ID } from "$env/static/private";
import { GoogleAuth } from "google-auth-library";

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

const SpeechClient = speechSDK.v2.SpeechClient;
const PROJECT_ID = String(GCP_PROJECT_ID).trim();
const REGION = "us-central1"; 

const speechClient = new SpeechClient({ 
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
    apiEndpoint: `${REGION}-speech.googleapis.com` 
});

const storage = new Storage({ keyFilename: GOOGLE_APPLICATION_CREDENTIALS });
const BUCKET_NAME = "meetlens-audio";

const auth = new GoogleAuth({
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"]
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function cleanupWithGemini(rawText) {
    if (!rawText || rawText.length < 5) return rawText;
    try {
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        const endpoint = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/gemini-1.5-flash-001:generateContent`;

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${accessToken.token}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: `Task: Fix punctuation and grammar. Do not summarize. Keep exact meaning. Text: "${rawText}"` }] }],
                generationConfig: { temperature: 0.1 }
            })
        });

        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || rawText;
    } catch (err) {
        return rawText;
    }
}

export async function POST({ request }) {
    console.log("[LOG] POST: Pipeline started...");
    const timestamp = Date.now().toString();
    const inputPath = path.join(os.tmpdir(), `raw-${timestamp}`);
    const outputPath = path.join(os.tmpdir(), `clean-${timestamp}.wav`);

    try {
        const formData = await request.formData();
        const audioFile = formData.get("audio");
        if (!audioFile) return json({ error: "No audio" }, { status: 400 });

        fs.writeFileSync(inputPath, Buffer.from(await audioFile.arrayBuffer()));
        
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat('wav')
                .audioChannels(1)
                .audioFrequency(16000)
                .audioCodec("pcm_s16le")
                .on("end", resolve)
                .on("error", reject)
                .save(outputPath);
        });

        const stats = fs.statSync(outputPath);
        console.log(`[LOG] Local WAV created: ${stats.size} bytes`);

        const gcsName = `transcription/${timestamp}.wav`;
        const gcsUri = `gs://${BUCKET_NAME}/${gcsName}`;
        await storage.bucket(BUCKET_NAME).upload(outputPath, { destination: gcsName });

        const outputPrefix = `results/${timestamp}/`;

        const [operation] = await speechClient.batchRecognize({
            parent: `projects/${PROJECT_ID}/locations/${REGION}`,
            recognizer: `projects/${PROJECT_ID}/locations/${REGION}/recognizers/_`,
            config: {
                autoDecodingConfig: {}, 
                model: "chirp_2", 
                languageCodes: ["en-IN"], 
                features: { enableAutomaticPunctuation: true }
            },
            files: [{ uri: gcsUri }],
            recognitionOutputConfig: { 
                gcsOutputConfig: { uri: `gs://${BUCKET_NAME}/${outputPrefix}` } 
            }
        });

        return json({ operationId: operation.name, gcsName, timestamp });

    } catch (err) {
        console.error("[CRITICAL ERROR] POST:", err);
        return json({ error: err.message }, { status: 500 });
    } finally {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
}

export async function GET({ url }) {
    const id = url.searchParams.get("id");
    const gcsName = url.searchParams.get("gcsName");
    const timestamp = url.searchParams.get("timestamp");

    if (!id) return json({ error: "Missing ID" }, { status: 400 });

    try {
        const operation = await speechClient.checkBatchRecognizeProgress(String(id));
        if (!operation.done) return json({ completed: false });
        if (operation.error) throw new Error(operation.error.message);

        const prefixPath = `results/${timestamp}/`;
        let [files] = await storage.bucket(BUCKET_NAME).getFiles({ prefix: prefixPath });

        if (files.length === 0) {
            console.log("[LOG] Waiting for GCS files...");
            await sleep(8000); // Increased wait for Chirp processing
            [files] = await storage.bucket(BUCKET_NAME).getFiles({ prefix: prefixPath });
        }

        let rawTextParts = [];

        for (const file of files) {
            if (file.name.endsWith(".json")) {
                const [content] = await file.download();
                const jsonResult = JSON.parse(content.toString());
                
                // --- ROBUST EXTRACTION FOR V2 / CHIRP ---
                // Google Speech V2 often nests results inside a 'results' object 
                // which then contains another 'results' array.
                const searchResults = jsonResult.results?.results || jsonResult.results;

                if (Array.isArray(searchResults)) {
                    searchResults.forEach(res => {
                        if (res.alternatives && res.alternatives[0]?.transcript) {
                            rawTextParts.push(res.alternatives[0].transcript);
                        }
                    });
                } else if (typeof jsonResult === 'object') {
                    // Fallback: If structure is unusual, look for 'transcript' anywhere
                    const deepSearch = (obj) => {
                        if (!obj || typeof obj !== 'object') return;
                        if (obj.transcript && typeof obj.transcript === 'string') {
                            rawTextParts.push(obj.transcript);
                        } else {
                            Object.values(obj).forEach(val => deepSearch(val));
                        }
                    };
                    deepSearch(jsonResult);
                }
            }
        }

        // Deduplicate in case deepSearch found the same string twice
        const rawText = [...new Set(rawTextParts)].join(" ").trim();
        console.log("[LOG] STT Success. Raw Text length:", rawText.length);

        if (rawText.length === 0) {
            return json({ completed: true, text: "No speech detected.", rawText: "" });
        }

        const cleanText = await cleanupWithGemini(rawText);

        // Cleanup
        if (gcsName) storage.bucket(BUCKET_NAME).file(gcsName).delete().catch(() => {});
        for (const file of files) file.delete().catch(() => {});

        return json({ completed: true, text: cleanText, rawText });

    } catch (err) {
        console.error("[ERROR] GET Pipeline:", err);
        return json({ error: err.message }, { status: 500 });
    }
}