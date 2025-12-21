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
    const { transcript, targetLanguage } = body;

    if (!transcript || typeof transcript !== 'string') {
      console.log("Summary error: No transcript provided in request");
      return c.json({ error: "No transcript provided" }, 400);
    }

    const language = typeof targetLanguage === 'string' && targetLanguage.trim().length > 0
      ? targetLanguage.trim()
      : null;

    console.log(
      `Generating summary for transcript (${transcript.length} chars) ` +
      (language ? `in language: ${language}` : '(original language)')
    );

    let translatedTranscript = transcript;

    // If a target language is provided, first translate the transcript
    if (language) {
      console.log(`Translating transcript to: ${language}`);

      const translateResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
              content:
                "You are a precise translation engine. Translate the user's text into the requested language. " +
                "Only return the translated text, without explanations, quotes, or additional commentary."
            },
            {
              role: "user",
              content: `Translate the following transcript into ${language} and return only the translated text:\n\n${transcript}`
            }
          ],
          temperature: 0.2,
          max_tokens: 4000,
        }),
      });

      if (!translateResponse.ok) {
        const errorText = await translateResponse.text();
        console.log(`OpenAI GPT translation API error (${translateResponse.status}): ${errorText}`);
        return c.json({ 
          error: `OpenAI GPT translation API error: ${translateResponse.status} - ${errorText}` 
        }, 500);
      }

      const translateData = await translateResponse.json();

      if (!translateData.choices || !translateData.choices[0]?.message?.content) {
        console.log("GPT translation response missing content:", JSON.stringify(translateData));
        return c.json({ 
          error: "Invalid response from GPT translation API - no translated text found" 
        }, 500);
      }

      translatedTranscript = translateData.choices[0].message.content;
      console.log(
        `Translation successful, translated length: ${translatedTranscript.length} characters`
      );
    }

    // Now generate the summary in the same target language (or original if none provided)
    const summaryPromptLanguagePart = language
      ? `Write the summary **in ${language}**.`
      : 'Write the summary in the same language as the transcript.';

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
            content:
              "You are a helpful assistant that creates concise, actionable summaries. " +
              "Extract the key points and main takeaways from transcripts in clear bullet points. " +
              summaryPromptLanguagePart
          },
          {
            role: "user",
            content:
              `Please provide a concise summary with key takeaways as bullet points for the following transcript:\n\n${translatedTranscript}`
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
      translatedTranscript,
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
