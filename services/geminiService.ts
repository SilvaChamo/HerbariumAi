import { GoogleGenAI, Type } from "@google/genai";
import { PlantInfo } from "../types";

export const identifyPlant = async (base64Image: string): Promise<PlantInfo> => {
  // Try many sources for the API key to be extremely robust
  const apiKey = (import.meta.env?.VITE_GEMINI_API_KEY) ||
    ((typeof process !== 'undefined') ? process.env?.VITE_GEMINI_API_KEY : undefined) ||
    ((typeof process !== 'undefined') ? process.env?.GEMINI_API_KEY : undefined);

  if (!apiKey || apiKey === 'undefined') {
    throw new Error("Gemini API Key não configurada ou inválida. Verifique o seu ficheiro .env.local e reinicie o servidor (npm run dev).");
  }

  // Use v1beta and gemini-2.0-flash which is widely available and more robust
  const ai = new GoogleGenAI({
    apiKey: apiKey as string,
    apiVersion: 'v1beta'
  });

  const prompt = `Identifique esta planta e analise se ela apresenta sinais de doenças ou pragas (ex: ferrugem, pulgão, oídio). Forneça detalhes em Português.
  
  Para a planta: nome comum, científico, propriedades, benefícios, história, solo ideal, receitas naturais.
  
  IMPORTANTE - Para Doenças/Pragas:
  1. Identifique a doença específica.
  2. Indique o pesticida químico ou cura natural aplicável.
  3. FORNEÇA DADOS DO MERCADO MOÇAMBICANO: Onde encontrar (ex: Casa do Agricultor, mercados locais), custo estimado em Meticais (MZN).
  
  Se não for uma planta, responda com incerteza.

  RESPONDA APENAS COM UM OBJETO JSON VÁLIDO seguindo esta estrutura:
  {
    "name": "Nome Comum",
    "scientificName": "Nome Científico",
    "confidence": 0.95,
    "properties": ["propriedade 1", "propriedade 2"],
    "benefits": ["benefício 1"],
    "history": "Breve história",
    "origin": "Origem",
    "soilType": "Solo ideal",
    "medicinalUses": ["uso 1"],
    "diagnosis": {
      "hasDisease": true,
      "name": "Nome da Doença",
      "symptoms": "Sintomas",
      "pesticideOrCure": "Cura",
      "marketSolution": "Solução no mercado",
      "estimatedCostMZN": "Custo em Meticais",
      "whereToBuyMozambique": "Onde comprar"
    },
    "recipes": [
      {
        "type": "Chá/Culinária",
        "title": "Título",
        "ingredients": ["item 1"],
        "instructions": ["passo 1"]
      }
    ]
  }`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType: 'image/webp', data: base64Image } },
        { text: prompt }
      ]
    }]
  });

  if (!response.text) {
    throw new Error("O modelo não retornou texto. Verifique se a imagem é clara.");
  }

  // Robust parsing to handle potential markdown formatting from Gemini
  let jsonText = response.text;
  if (jsonText.includes('```json')) {
    jsonText = jsonText.split('```json')[1].split('```')[0];
  } else if (jsonText.includes('```')) {
    jsonText = jsonText.split('```')[1].split('```')[0];
  }

  try {
    const data = JSON.parse(jsonText.trim());
    return {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: `data:image/webp;base64,${base64Image}`
    };
  } catch (parseErr) {
    console.error("Parse error:", parseErr, "Raw text:", response.text);
    throw new Error("Erro ao processar a resposta da IA. Por favor, tente novamente.");
  }
};
