import { supabase } from '../supabaseClient';
import { CompanyDetail, PlantInfo } from '../types';

export const databaseService = {
    // Companies
    async getCompanies(): Promise<CompanyDetail[]> {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(d => ({
            ...d,
            fullDescription: d.full_description,
            billingPeriod: d.billing_period,
            isFeatured: d.is_featured,
            geoLocation: d.geo_location,
            valueChain: d.value_chain
        }));
    },

    async saveCompany(company: CompanyDetail, userId: string): Promise<CompanyDetail> {
        const { data, error } = await supabase
            .from('companies')
            .insert({
                user_id: userId,
                name: company.name,
                email: company.email,
                contact: company.contact,
                activity: company.activity,
                location: company.location,
                geo_location: company.geoLocation,
                value_chain: company.valueChain,
                logo: company.logo,
                full_description: company.fullDescription,
                services: company.services,
                products: company.products,
                plan: company.plan,
                billing_period: company.billingPeriod,
                is_featured: company.isFeatured
            })
            .select()
            .single();

        if (error) throw error;
        return {
            ...data,
            fullDescription: data.full_description,
            billingPeriod: data.billing_period,
            isFeatured: data.is_featured,
            geoLocation: data.geo_location,
            valueChain: data.value_chain
        };
    },

    async getMyCompany(userId: string): Promise<CompanyDetail | null> {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return {
            ...data,
            fullDescription: data.full_description,
            billingPeriod: data.billing_period,
            isFeatured: data.is_featured,
            geoLocation: data.geo_location,
            valueChain: data.value_chain
        };
    },

    // Collection
    async getCollection(userId: string): Promise<PlantInfo[]> {
        const { data, error } = await supabase
            .from('plant_collection')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async savePlant(plant: PlantInfo, userId: string): Promise<PlantInfo> {
        const { data, error } = await supabase
            .from('plant_collection')
            .insert({
                user_id: userId,
                name: plant.name,
                scientific_name: plant.scientificName,
                custom_name: plant.customName,
                confidence: plant.confidence,
                properties: plant.properties,
                benefits: plant.benefits,
                history: plant.history,
                origin: plant.origin,
                soil_type: plant.soilType,
                medicinal_uses: plant.medicinalUses,
                recipes: plant.recipes,
                image_url: plant.imageUrl,
                diagnosis: plant.diagnosis
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updatePlant(plantId: string, updates: Partial<PlantInfo>): Promise<void> {
        const { error } = await supabase
            .from('plant_collection')
            .update({
                custom_name: updates.customName,
                // Add other fields if needed
            })
            .eq('id', plantId);

        if (error) throw error;
    }
};
