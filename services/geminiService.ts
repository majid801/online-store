import { GoogleGenAI } from "@google/genai";
import { Product } from '../types';

// Initialize the Gemini client
const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateAiGiftNote = async (products: Product[], recipientName: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "";

  const productNames = products.map(p => p.name).join(", ");
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, warm, and sophisticated gift note (max 30 words) for a package containing: ${productNames}. The recipient's name is ${recipientName}. Do not include quotes.`,
    });
    
    return response.text || "";
  } catch (error) {
    console.error("Error generating AI note:", error);
    return "Enjoy your new items!";
  }
};
