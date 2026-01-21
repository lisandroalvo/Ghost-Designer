
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const academyAIService = {
  generateMarketingCopy: async (businessName: string, classType: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a world-class marketing expert. Generate a high-energy, persuasive social media post for "${businessName}" promoting their ${classType} classes. 
      Focus on community, transformation, and professional coaching. 
      Include a clear call to action like "Click the link in bio to book your free trial!"
      Use emojis strategically to catch attention.`,
    });
    return response.text;
  },

  generateMarketingImage: async (prompt: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high-quality, professional marketing photograph for a modern fitness studio. Topic: ${prompt}. Professional lighting, 4k, energetic atmosphere.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  chatWithStudent: async (prompt: string, businessName: string, classSchedule: string, knowledgeBase?: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are the friendly, professional AI Assistant for "${businessName}". 
        Your goal is to help students manage their training and answer questions.
        
        STUDIO DATA:
        - Business Name: ${businessName}
        - Current Schedule: ${classSchedule}
        ${knowledgeBase ? `- Knowledge Base Info: ${knowledgeBase}` : ''}
        
        GUIDELINES:
        - Use the provided Studio Data and Knowledge Base to answer specifically.
        - Be encouraging and supportive.
        - Keep responses concise.
        - If you don't know the answer, politely suggest they contact the studio directly.`,
      },
    });
    return response.text;
  },

  summarizeCoachFeedback: async (rawTranscript: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Transform this raw coach's voice transcript into a professional, encouraging student progress summary. 
      Use bullet points for key takeaways and keep a motivational tone.
      
      TRANSCRIPT:
      "${rawTranscript}"`,
      config: {
        systemInstruction: "You are an AI Coach Assistant. Your job is to make raw coaching feedback sound professional, actionable, and inspiring for students.",
      }
    });
    return response.text;
  }
};
