import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

// Helper to ensure API Key is ready
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key 缺失。请选择一个 Key。");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates an answer to an interview question using Search Grounding.
 */
export const generateInterviewAnswer = async (question: string) => {
  const ai = getAIClient();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a comprehensive, technical answer in Chinese suitable for a senior engineer interview for the following question about HashMaps: "${question}". 
      Keep technical terms (like HashMap, Put, Get, O(1), Rehash, ConcurrentHashMap, etc.) in English.
      Focus on internal mechanisms, time complexity, and edge cases.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a world-class computer science instructor and technical interviewer. You respond in Chinese but keep technical jargon in English.",
      },
    });

    return {
      text: response.text || "未能生成回答。",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};

/**
 * Generates an image representing a HashMap metaphor.
 */
export const generateMetaphorImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  imageSize: ImageSize
) => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        },
      },
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("API 未返回图像数据");
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};