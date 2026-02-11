import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Use the flash preview model as it is suitable for text tasks and faster interactions
const MODEL_NAME = 'gemini-3-flash-preview'; // Updated to the latest valid model

export const generateContentJSON = async <T>(prompt: string): Promise<T> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Réponse vide de l'IA");

    return JSON.parse(text) as T;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};