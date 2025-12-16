import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

const app = new Hono();

// CORS and logging
app.use("*", cors());
app.use("*", logger(console.log));

// Health check
app.get("/make-server-b1d03c55/health", (c) => {
  return c.json({ status: "ok" });
});

// Transcribe endpoint
app.post("/make-server-b1d03c55/transcribe", async (c) => {
  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      console.log("Transcription error: OPENAI_API_KEY environment variable not set");
      return c.json({ 
        error: "Server configuration error: OPENAI_API_KEY not configured" 
      }, 500);
    }

    // Parse the multipart form data
    const formData = await c.req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof File)) {
      console.log("Transcription error: No audio file provided in request");
      return c.json({ error: "No audio file provided" }, 400);
    }

    console.log(`Received audio file: ${audioFile.name}, size: ${audioFile.size} bytes, type: ${audioFile.type}`);

    // Create form data for OpenAI Whisper API
    const whisperFormData = new FormData();
    whisperFormData.append("file", audioFile);
    whisperFormData.append("model", "whisper-1");
    whisperFormData.append("response_format", "json");

    console.log("Sending request to OpenAI Whisper API...");

    const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.log(`OpenAI Whisper API error (${whisperResponse.status}): ${errorText}`);
      return c.json({ 
        error: `OpenAI Whisper API error: ${whisperResponse.status} - ${errorText}` 
      }, 500);
    }

    const whisperData = await whisperResponse.json();
    console.log("Received response from OpenAI Whisper API");

    // Extract the transcript from the response
    if (!whisperData.text) {
      console.log("Whisper API response missing transcript:", JSON.stringify(whisperData));
      return c.json({ 
        error: "Invalid response from Whisper API - no transcript found" 
      }, 500);
    }

    const transcript = whisperData.text;
    console.log(`Transcription successful, length: ${transcript.length} characters`);

    return c.json({ 
      transcript,
      audioSize: audioFile.size,
      audioType: audioFile.type 
    });

  } catch (error) {
    console.log(`Transcription processing error: ${error.message || error}`);
    return c.json({ 
      error: `Transcription failed: ${error.message || "Unknown error"}` 
    }, 500);
  }
});

Deno.serve(app.fetch);
