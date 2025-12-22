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
    const { transcript, targetLanguage, conversationIntent } = body;

    if (!transcript || typeof transcript !== 'string') {
      console.log("Summary error: No transcript provided in request");
      return c.json({ error: "No transcript provided" }, 400);
    }

    const language = typeof targetLanguage === 'string' && targetLanguage.trim().length > 0
      ? targetLanguage.trim()
      : null;
    
    const intent = conversationIntent || 'casual';

    console.log(
      `Generating ${intent} summary for transcript (${transcript.length} chars) ` +
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
      ? `Write the analysis **in ${language}**.`
      : 'Write the analysis in the same language as the transcript.';

    // Intent-specific system prompts with strict filtering rules
    const intentPrompts: Record<string, string> = {
      meeting: `You are a meeting analysis expert. Your ONLY job is to extract decisions, action items, risks, and next steps.

ANALYSIS OBJECTIVE: Track what was decided, who owns what, and what's blocking progress.

FILTERING RULES:
- ONLY extract information about decisions made, action items assigned, deadlines, risks, blockers, and unresolved items
- IGNORE casual conversation, general discussion, or background context unless it leads to a decision
- IGNORE personal anecdotes or stories unless they reveal a blocker or risk
- Prioritize: decisions > action items > risks > deadlines > unresolved topics

EXTRACTION FORMAT (use these exact icons):
📌 Decision made: [who decided what]
⏭️ Action item: [owner] to [specific task] by [deadline if mentioned]
🔴 Risk/Blocker: [what's blocking progress]
⚠️ Unresolved: [topic needing follow-up]

Be atomic. One insight = one sentence. No generic summaries.`,
      
      interview: `You are an interview evaluation expert. Your ONLY job is to assess candidate fit through insights, strengths, weaknesses, and red flags.

ANALYSIS OBJECTIVE: Evaluate the candidate's qualifications, thought process, and potential concerns.

FILTERING RULES:
- ONLY extract insights about the candidate's skills, experience, thinking, strengths, weaknesses, and concerning patterns
- IGNORE interviewer questions or general pleasantries
- IGNORE company background or role descriptions unless the candidate responds to them
- Prioritize: red flags > unique strengths > notable quotes > unclear responses

EXTRACTION FORMAT (use these exact icons):
💡 Insight: [candidate's key strength or unique perspective]
🟢 Quote: "[memorable statement]" - reveals [what it shows]
🔴 Red flag: [concerning behavior, answer, or pattern]
⚠️ Unclear: [vague response or assumption made]

Be evaluative. Focus on signal, not noise.`,
      
      sales: `You are a sales call analyzer. Your ONLY job is to identify objections, pain points, buying signals, and next steps.

ANALYSIS OBJECTIVE: Understand what's preventing the sale and what's moving it forward.

FILTERING RULES:
- ONLY extract prospect objections, pain points they mentioned, buying signals, budget discussions, and proposed next steps
- IGNORE your own pitch, product features, or general small talk
- IGNORE background context unless it reveals a pain point or objection
- Prioritize: objections > pain points > buying signals > budget talk > next steps

EXTRACTION FORMAT (use these exact icons):
🔴 Objection: [prospect's concern or hesitation]
⚠️ Pain point: [problem they're experiencing]
🟢 Buying signal: [indication of interest or intent]
💰 Budget: [pricing discussion or constraint mentioned]
⏭️ Next step: [agreed follow-up action]

Be sales-focused. Capture deal momentum and friction.`,
      
      therapy: `You are a coaching session analyzer. Your ONLY job is to identify patterns, emotional shifts, breakthroughs, and action items.

ANALYSIS OBJECTIVE: Track recurring themes, insights, and growth opportunities in the client's journey.

FILTERING RULES:
- ONLY extract client insights, breakthrough moments, recurring patterns, emotional shifts, and suggested practices
- IGNORE coach questions or general conversation flow
- IGNORE session logistics or scheduling talk
- Prioritize: breakthroughs > recurring patterns > action items > areas needing attention

EXTRACTION FORMAT (use these exact icons):
🟢 Breakthrough: [client realization or shift in perspective]
🔄 Pattern: [recurring theme or behavior noticed]
📌 Action item: [practice or step suggested]
⚠️ Needs attention: [area requiring deeper work]

Be supportive and reflective. Focus on growth and patterns.`,
      
      lecture: `You are an educational content analyzer. Your ONLY job is to extract key concepts, definitions, examples, and questions.

ANALYSIS OBJECTIVE: Capture the core learning content and clarify complex ideas.

FILTERING RULES:
- ONLY extract core concepts taught, important definitions, illustrative examples, and topics needing clarification
- IGNORE administrative announcements, off-topic tangents, or class logistics
- IGNORE student questions unless they reveal something unclear in the material
- Prioritize: key concepts > definitions > examples > unclear topics

EXTRACTION FORMAT (use these exact icons):
🟢 Concept: [main idea or principle explained]
📚 Definition: [term] = [meaning in simple words]
💡 Example: [case study or illustration used]
⚠️ Unclear: [complex topic that may need review]

Be educational. Make learning scannable.`,
      
      casual: `You are a conversation summarizer. Your ONLY job is to capture memorable moments, key ideas, and things worth remembering.

ANALYSIS OBJECTIVE: Remember what matters from natural conversation.

FILTERING RULES:
- ONLY extract main topics discussed, interesting ideas shared, and things to remember or follow up on
- IGNORE small talk, greetings, or filler conversation
- IGNORE logistical details unless they're something to act on
- Prioritize: memorable moments > key ideas > follow-ups

EXTRACTION FORMAT (use these exact icons):
🟢 Topic: [main thing discussed]
💡 Idea: [interesting insight or thought shared]
📌 Remember: [important mention or detail]
⏭️ Follow-up: [something to do or revisit]

Be conversational. Capture what matters.`
    };

    const intentPrompt = intentPrompts[intent] || intentPrompts['casual'];

    // Mode-specific user instructions
    const modeInstructions: Record<string, string> = {
      meeting: `Extract ONLY decisions, action items, risks, and next steps from this meeting transcript. Ignore everything else.`,
      interview: `Evaluate this candidate based ONLY on their responses, strengths, weaknesses, and red flags. Ignore interviewer questions.`,
      sales: `Identify ONLY objections, pain points, buying signals, and next steps from this sales call. Ignore your pitch.`,
      therapy: `Extract ONLY patterns, breakthroughs, and action items from this coaching session. Ignore coach questions.`,
      lecture: `Capture ONLY key concepts, definitions, examples, and unclear topics from this lecture. Ignore logistics.`,
      casual: `Remember ONLY the main topics, interesting ideas, and follow-ups from this conversation. Ignore small talk.`
    };

    const userInstruction = modeInstructions[intent] || modeInstructions['casual'];

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
              intentPrompt + "\n\n" +
              summaryPromptLanguagePart + "\n\n" +
              "CRITICAL INSTRUCTIONS:\n" +
              "- Return ONLY insights that match your analysis objective\n" +
              "- Use ONLY the icons specified in your extraction format\n" +
              "- Do NOT provide generic summaries or overview text\n" +
              "- Each insight = ONE sentence maximum\n" +
              "- Filter out ALL irrelevant information\n" +
              "- NO introduction, NO conclusion, ONLY the extracted insights"
          },
          {
            role: "user",
            content: `${userInstruction}\n\nTranscript:\n${translatedTranscript}`
          }
        ],
        temperature: 0.5,
        max_tokens: 500,
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
