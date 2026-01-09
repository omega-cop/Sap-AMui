import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../types';

// Declare process to satisfy TypeScript since we don't have @types/node installed
// Vite will replace process.env.API_KEY with the actual string during build
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
};

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const identifyProduct = async (
  imageBase64: string,
  productList: Product[]
): Promise<{ matchedProductId: string | null; reason: string }> => {
  try {
    // We create a simplified list for the context window to save tokens and avoid confusion
    const productContext = productList.map(p => 
      `ID: ${p.id}, Name: ${p.name}, Brand: ${p.brand}, Price: ${p.price}`
    ).join('\n');

    const prompt = `
      You are a smart cashier assistant. 
      Analyze the provided image. Identify the main product shown.
      Compare it strictly against the following database of products:
      
      ${productContext}
      
      If the product in the image closely matches one in the list (considering visual appearance, brand, and likely product type), return its ID.
      If it does not match any known product, return null.
    `;

    // Clean base64 string if it contains metadata header
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedProductId: {
              type: Type.STRING,
              nullable: true,
              description: "The ID of the matching product from the list, or null if no match."
            },
            reason: {
              type: Type.STRING,
              description: "Short explanation of why it matched or didn't match."
            }
          },
          required: ["reason"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");

    const result = JSON.parse(resultText);
    return result;

  } catch (error) {
    console.error("Gemini AI Scan Error:", error);
    return { matchedProductId: null, reason: "Error connecting to AI service." };
  }
};
