
import { GoogleGenAI } from "@google/genai";
import { ChatMode } from "../types";

// Ensure API key is present
const apiKey = process.env.API_KEY;

// Safe initialization
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("API_KEY is missing. Entering demo mode.");
}

export const streamChatResponse = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  mode: ChatMode,
  imageData?: string // Base64 string optional
) => {
  
  // --- DEMO MODE FALLBACK ---
  // If no API key is present, simulate a response so the app doesn't crash or look broken.
  if (!ai) {
     return simulateStream("I'm currently running in Demo Mode (No API Key). I can simulate responses, but I can't see your images or access the real Gemini model right now. Add a key to unlock my full potential!");
  }

  let modelName = 'gemini-2.5-flash-lite';
  let config: any = {};

  switch (mode) {
    case ChatMode.FAST:
      modelName = 'gemini-2.5-flash-lite';
      config = {
        systemInstruction: "You are a helpful, witty, and extremely concise VFX assistant. Keep answers short and punchy.",
      };
      break;
    case ChatMode.SMART:
      modelName = 'gemini-3-pro-preview';
      config = {
        systemInstruction: "You are an expert VFX artist and technical creative. Provide detailed, helpful answers about visual effects, code, and creativity.",
      };
      break;
    case ChatMode.THINKING:
      modelName = 'gemini-3-pro-preview';
      config = {
        thinkingConfig: { thinkingBudget: 32768 }, 
      };
      break;
  }

  try {
      // If image is attached, we must use a fresh generateContent call or structured chat with inline data.
      // To keep it simple with history, we use chat.sendMessageStream.
      const chat = ai.chats.create({
        model: modelName,
        config: config,
        history: history.map(h => ({
          role: h.role,
          parts: h.parts
        }))
      });

      if (imageData) {
        // Construct multipart content
        const parts = [
          { text: message },
          { inlineData: { mimeType: 'image/jpeg', data: imageData } }
        ];
        return chat.sendMessageStream(parts);
      } else {
        return chat.sendMessageStream({ message });
      }

  } catch (e) {
      console.error("Gemini API Error:", e);
      return simulateStream("I encountered a connection error with the neural core. Please try again.");
  }
};

// Helper to simulate a stream for demo/error cases
async function* simulateStream(text: string) {
    const chunks = text.split(' ');
    for (const chunk of chunks) {
        await new Promise(r => setTimeout(r, 50)); // Simulate typing delay
        yield { text: chunk + ' ' };
    }
}
