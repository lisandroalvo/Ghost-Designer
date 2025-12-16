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
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!geminiApiKey) {
      console.log("Transcription error: GEMINI_API_KEY environment variable not set");
      return c.json({ 
        error: "Server configuration error: GEMINI_API_KEY not configured" 
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

    // Convert the audio file to base64
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = btoa(
      new Uint8Array(audioBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    console.log(`Audio converted to base64, length: ${audioBase64.length}`);

    // Determine the MIME type for Gemini API
    let mimeType = audioFile.type;
    if (!mimeType || mimeType === "") {
      // Default to webm if type is not specified
      mimeType = "audio/webm";
    }

    console.log(`Using MIME type: ${mimeType}`);

    // Call Gemini API for transcription
    // Using gemini-1.5-flash model which supports audio input
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: "Transcribe this audio in full. Return only the exact words spoken, with no summarization, no commentary, and no additional text. If the audio is long, transcribe everything."
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: audioBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.95,
      }
    };

    console.log("Sending request to Gemini API...");

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.log(`Gemini API error (${geminiResponse.status}): ${errorText}`);
      return c.json({ 
        error: `Gemini API error: ${geminiResponse.status} - ${errorText}` 
      }, 500);
    }

    const geminiData = await geminiResponse.json();
    console.log("Received response from Gemini API");

    // Extract the transcript from the response
    if (!geminiData.candidates || !geminiData.candidates[0]?.content?.parts?.[0]?.text) {
      console.log("Gemini API response missing expected transcript data:", JSON.stringify(geminiData));
      return c.json({ 
        error: "Invalid response from Gemini API - no transcript found" 
      }, 500);
    }

    const transcript = geminiData.candidates[0].content.parts[0].text;
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
