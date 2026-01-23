
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
  AUTH = 'auth',
  ACCOUNT = 'account'
}

// Market Types
export interface MarketItem {
  id: string;
  category: string;
  title: string;
  location: string;
  description: string;
  contact: string;
  price?: string;
  isVerified: boolean;
  image?: string;
}

export type PlanType = 'Free' | 'Básico' | 'Premium' | 'Parceiro';

export type BillingPeriod = 'monthly' | 'annual';

export type ValueChainRole = 'Consumidor' | 'Produtor' | 'Fornecedor';

export interface CompanyDetail {
  id?: string;
  registrationType?: 'enterprise' | 'professional';
  name: string;
  email?: string;
  contact?: string;
  activity: string;
  location: string;
  geoLocation?: string;
  valueChain?: ValueChainRole;
  logo: string;
  fullDescription: string;
  services: string;
  products: { name: string; price?: string }[];
  plan?: PlanType;
  billingPeriod?: BillingPeriod;
  isFeatured?: boolean;
  paymentMethod?: 'mpesa' | 'emola' | 'banco' | null;
  paymentPhone?: string;
}

export interface VideoAd {
  id?: string;
  companyName: string;
  phone: string;
  address: string;
  videoLink: string;
  embedUrl: string;
  createdAt?: string;
}
