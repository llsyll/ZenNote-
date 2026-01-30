
import { GoogleGenAI } from "@google/genai";

// Fix: Direct initialization using the required apiKey named parameter from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Polish the provided text using Gemini 3 Flash model.
 * It formats text for a minimalist reading card.
 */
export const polishText = async (text: string): Promise<string> => {
  try {
    // Fix: Use gemini-3-flash-preview for basic text tasks and use systemInstruction for better persona control
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Text to format: ${text}`,
      config: {
        systemInstruction: `Please act as a professional editor. Format the text to be suitable for a "Zen/Minimalist" reading card. 
        
        Rules:
        1. Correct typos and basic grammar.
        2. Add proper paragraph breaks for better readability on mobile screens.
        3. Do not change the core meaning or tone of the author.
        4. If the text is very short/one line, just return it as is (maybe fix punctuation).
        5. Return ONLY the formatted text, no explanations.`,
      },
    });

    // Fix: Access .text property directly (do not call as a method)
    return response.text || text;
  } catch (error) {
    console.error("Error polishing text:", error);
    throw error;
  }
};

/**
 * Summarize text into a short, poetic Chinese title.
 */
export const summarizeToTitle = async (text: string): Promise<string> => {
  try {
    // Fix: Use gemini-3-flash-preview for title generation
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a very short, poetic, 4-6 character Chinese title for this text. Return ONLY the title. Text: ${text.substring(0, 500)}`,
    });
    // Fix: Access .text property directly
    return response.text?.trim() || "随笔";
  } catch (error) {
    console.error("Error summarizing title:", error);
    return "随笔";
  }
};
