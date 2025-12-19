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

app.post("/make-server-b1d03c55/summarize", async (c) => {
  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      console.log("Summary error: OPENAI_API_KEY environment variable not set");
      return c.json({ 
        error: "Server configuration error: OPENAI_API_KEY not configured" 
      }, 500);
    }

    const body = await c.req.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== 'string') {
      console.log("Summary error: No transcript provided in request");
      return c.json({ error: "No transcript provided" }, 400);
    }

    console.log(`Generating summary for transcript (${transcript.length} chars)...`);

    const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates concise, actionable summaries. Extract the key points and main takeaways from transcripts in clear bullet points."
          },
          {
            role: "user",
            content: `Please provide a concise summary of the following transcript with key takeaways as bullet points:\n\n${transcript}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text();
      console.log(`OpenAI GPT API error (${gptResponse.status}): ${errorText}`);
      return c.json({ 
        error: `OpenAI GPT API error: ${gptResponse.status} - ${errorText}` 
      }, 500);
    }

    const gptData = await gptResponse.json();
    console.log("Received response from OpenAI GPT API");

    if (!gptData.choices || !gptData.choices[0]?.message?.content) {
      console.log("GPT API response missing summary:", JSON.stringify(gptData));
      return c.json({ 
        error: "Invalid response from GPT API - no summary found" 
      }, 500);
    }

    const summary = gptData.choices[0].message.content;
    console.log(`Summary generated successfully, length: ${summary.length} characters`);

    return c.json({ 
      summary,
      transcriptLength: transcript.length 
    });

  } catch (error) {
    console.log(`Summary processing error: ${error.message || error}`);
    return c.json({ 
      error: `Summary failed: ${error.message || "Unknown error"}` 
    }, 500);
  }
});

Deno.serve(app.fetch);
