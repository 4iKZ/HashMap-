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

  // Strategy: Use gemini-2.5-flash-image for standard 1K requests to avoid permission issues (403).
  // Only use gemini-3-pro-image-preview if the user explicitly requests higher resolution (2K/4K).
  const isHighRes = imageSize === ImageSize.SIZE_2K || imageSize === ImageSize.SIZE_4K;
  const model = isHighRes ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  const config: any = {
    imageConfig: {
      aspectRatio: aspectRatio,
    },
  };

  // imageSize parameter is only supported by the Pro model
  if (isHighRes) {
    config.imageConfig.imageSize = imageSize;
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }],
      },
      config: config,
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("API 未返回图像数据");
  } catch (error: any) {
    console.error("Gemini Image Gen Error:", error);
    
    // Provide a more helpful error message for 403 on Pro model
    if (error.message?.includes('403') || error.status === 'PERMISSION_DENIED') {
        if (isHighRes) {
            throw new Error("您的 API Key 权限不足，无法使用高清 (Pro) 模型。请尝试切换回 1K 尺寸。");
        } else {
            throw new Error("API 权限被拒绝。请检查您的 API Key 是否有效，或是否已启用相关 API 服务。");
        }
    }
    throw error;
  }
};