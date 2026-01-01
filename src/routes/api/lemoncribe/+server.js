import { json } from "@sveltejs/kit";
import fetch from "node-fetch";
import FormData from "form-data";
import { env } from "$env/dynamic/private";

export async function POST({ request }) {
  console.log("[LOG] Lemonfox STT pipeline started");

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");
    const meetingType = formData.get("meetingType");

    if (!audioFile) {
      return json({ error: "No audio uploaded" }, { status: 400 });
    }

    // Convert the File/Blob to a Buffer for the API request
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    const lfForm = new FormData();
    lfForm.append("file", buffer, {
      filename: audioFile.name || "audio.mp3",
      contentType: audioFile.type || "audio/mpeg"
    });

    lfForm.append("response_format", "verbose_json");
    lfForm.append("language", "en");
    lfForm.append("speaker_labels", "true");

    const lfRes = await fetch("https://api.lemonfox.ai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.LEMONFOX_API_KEY}`,
        ...lfForm.getHeaders()
      },
      body: lfForm
    });

    if (!lfRes.ok) {
      const errText = await lfRes.text();
      throw new Error(`Lemonfox STT failed: ${errText}`);
    }

    const lfData = await lfRes.json();
    let transcript = "";

    // Process segments to include speaker labels
    if (Array.isArray(lfData?.segments)) {
      transcript = lfData.segments
        .map(s => {
          const speaker = s.speaker != null ? `Speaker ${s.speaker}` : "Speaker";
          return `${speaker}: ${s.text}`;
        })
        .join("\n");
    } else {
      transcript = lfData.text || "";
    }

    console.log("[LOG] STT completed. Length:", transcript.length);

    return json({
      completed: true,
      text: transcript || "No speech detected.",
      rawText: transcript,
      meetingType: meetingType || "General"
    });

  } catch (err) {
    console.error("[ERROR] Transcription pipeline:", err);
    return json({ error: err.message }, { status: 500 });
  }
}