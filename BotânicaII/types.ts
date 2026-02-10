
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface DiseaseDiagnosis {
  hasDisease: boolean;
  name?: string;
  symptoms?: string;
  pesticideOrCure?: string;
  marketSolution?: string;
  estimatedCostMZN?: string;
  whereToBuyMozambique?: string;
}

export interface PlantInfo {
  id: string;
  name: string;
  scientificName: string;
  customName?: string;
  confidence: number;
  properties: string[];
  benefits: string[];
  history: string;
  origin: string;
  soilType: string;
  medicinalUses: string[];
  recipes: Recipe[];
  imageUrl: string;
  diagnosis?: DiseaseDiagnosis;
}

export interface Recipe {
  type: 'Remédio' | 'Sabão' | 'Pomada' | 'Curativo';
  title: string;
  ingredients: string[];
  instructions: string[];
}

export enum AppTab {
  SCAN = 'scan',
  COLLECTION = 'collection',
  DISCOVER = 'discover',
  AUTH = 'auth'
}
