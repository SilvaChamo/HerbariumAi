import { supabase } from '../supabaseClient';
import { CompanyDetail, PlantInfo, VideoAd } from '../types';

const mapPlanToDB = (plan: string): string => {
    const mapping: Record<string, string> = {
        'Free': 'free',
        'Básico': 'basic',
        'Premium': 'premium',
        'Parceiro': 'partner'
    };
    return mapping[plan] || 'free';
};

const mapDBToPlan = (plan: string): any => {
    const mapping: Record<string, string> = {
        'free': 'Free',
        'basic': 'Básico',
        'premium': 'Premium',
        'partner': 'Parceiro'
    };
    return mapping[plan] || 'Free';
};

// Helper to determine product limit based on plan
const getProductLimit = (plan: string): number | null => {
    switch (plan) {
        case 'basic':
            return 5;
        case 'premium':
            return 15;
        case 'partner':
            return null; // unlimited
        default:
            return null;
    }
};

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
            fullDescription: d.description || '',
            billingPeriod: d.billing_period,
            isFeatured: d.is_featured,
            geoLocation: d.geo_location,
            valueChain: d.value_chain,
            logo: d.logo_url || '',
            location: d.address || d.province || '',
            plan: mapDBToPlan(d.plan),
            products: d.products || []
        }));
    },

    async saveCompany(company: CompanyDetail, userId: string): Promise<CompanyDetail> {
        const { data, error } = await supabase
            .from('companies')
            .upsert({
                id: company.id,
                user_id: userId,
                name: company.name,
                email: company.email,
                contact: company.contact,
                activity: company.activity,
                address: company.geoLocation,
                province: company.location,
                geo_location: company.geoLocation,
                value_chain: company.valueChain,
                logo_url: company.logo,
                description: company.fullDescription,
                services: company.services,
                // products: company.products, // Temporarily disabled due to Supabase cache issue
                plan: mapPlanToDB(company.plan as string),
                billing_period: company.billingPeriod,
                is_featured: company.isFeatured,
                registration_type: company.registrationType
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) throw error;

        // Update products separately using raw SQL to bypass cache issue
        if (company.products && company.products.length > 0) {
            const { error: productsError } = await supabase.rpc('update_company_products', {
                p_user_id: userId,
                p_products: company.products
            });

            // If RPC doesn't exist, fallback to direct update
            if (productsError && productsError.message?.includes('function')) {
                await supabase
                    .from('companies')
                    .update({ products: company.products })
                    .eq('user_id', userId);
            }
        }

        return {
            ...data,
            fullDescription: data.description || '',
            billingPeriod: data.billing_period,
            isFeatured: data.is_featured,
            geoLocation: data.geo_location,
            valueChain: data.value_chain,
            logo: data.logo_url || '',
            location: data.address || data.province || '',
            plan: mapDBToPlan(data.plan),
            products: company.products || []
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
            fullDescription: data.description || '',
            billingPeriod: data.billing_period,
            isFeatured: data.is_featured,
            geoLocation: data.geo_location,
            valueChain: data.value_chain,
            logo: data.logo_url || '',
            location: data.address || data.province || '',
            plan: mapDBToPlan(data.plan),
            products: data.products || []
        };
    },

    // Video Ads
    async getVideoAds(): Promise<VideoAd[]> {
        const { data, error } = await supabase
            .from('video_ads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(d => ({
            id: d.id,
            companyName: d.company_name,
            phone: d.phone,
            address: d.address,
            videoLink: d.video_link,
            embedUrl: d.embed_url,
            createdAt: d.created_at
        }));
    },

    async saveVideoAd(ad: Partial<VideoAd>): Promise<VideoAd> {
        const { data, error } = await supabase
            .from('video_ads')
            .insert({
                company_name: ad.companyName,
                phone: ad.phone,
                address: ad.address,
                video_link: ad.videoLink,
                embed_url: ad.embedUrl
            })
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            companyName: data.company_name,
            phone: data.phone,
            address: data.address,
            videoLink: data.video_link,
            embedUrl: data.embed_url,
            createdAt: data.created_at
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
