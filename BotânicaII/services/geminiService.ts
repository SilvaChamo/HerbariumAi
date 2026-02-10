
import { GoogleGenAI, Type } from "@google/genai";
import { PlantInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const identifyPlant = async (base64Image: string): Promise<PlantInfo> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Identifique esta planta e analise se ela apresenta sinais de doenças ou pragas (ex: ferrugem, pulgão, oídio). Forneça detalhes em Português.
  
  Para a planta: nome comum, científico, propriedades, benefícios, história, solo ideal, receitas naturais.
  
  IMPORTANTE - Para Doenças/Pragas:
  1. Identifique a doença específica.
  2. Indique o pesticida químico ou cura natural aplicável.
  3. FORNEÇA DADOS DO MERCADO MOÇAMBICANO: Onde encontrar (ex: Casa do Agricultor, mercados locais), custo estimado em Meticais (MZN).
  
  Se não for uma planta, responda com incerteza.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          scientificName: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          properties: { type: Type.ARRAY, items: { type: Type.STRING } },
          benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
          history: { type: Type.STRING },
          origin: { type: Type.STRING },
          soilType: { type: Type.STRING },
          medicinalUses: { type: Type.ARRAY, items: { type: Type.STRING } },
          diagnosis: {
            type: Type.OBJECT,
            properties: {
              hasDisease: { type: Type.BOOLEAN },
              name: { type: Type.STRING },
              symptoms: { type: Type.STRING },
              pesticideOrCure: { type: Type.STRING },
              marketSolution: { type: Type.STRING },
              estimatedCostMZN: { type: Type.STRING },
              whereToBuyMozambique: { type: Type.STRING }
            }
          },
          recipes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["type", "title", "ingredients", "instructions"]
            }
          }
        },
        required: ["name", "scientificName", "properties", "benefits", "history", "origin", "soilType", "medicinalUses", "recipes"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    imageUrl: `data:image/jpeg;base64,${base64Image}`
  };
};
