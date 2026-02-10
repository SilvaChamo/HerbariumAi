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
            return 10;
        case 'premium':
            return 50;
        case 'partner':
            return null; // unlimited
        default:
            return 3; // Free plan
    }
};

export const databaseService = {
    // Companies
    async getCompanies(): Promise<CompanyDetail[]> {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('is_archived', false)
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
            products: d.products || [],
            slug: d.slug,
            isVerified: d.is_verified
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
                products: company.products,
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
            .eq('is_archived', false)
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
            products: data.products || [],
            slug: data.slug,
            isVerified: data.is_verified
        };
    },

    async deleteCompany(id: string): Promise<void> {
        const { error } = await supabase
            .from('companies')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async archiveCompany(id: string, isArchived: boolean = true): Promise<void> {
        const { error } = await supabase
            .from('companies')
            .update({ is_archived: isArchived })
            .eq('id', id);
        if (error) throw error;
    },

    // Video Ads
    async getVideoAds(): Promise<VideoAd[]> {
        console.log('Fetching filtered video ads...');
        const { data, error } = await supabase
            .from('video_ads')
            .select('*')
            .eq('is_archived', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error fetching videos:', error);
            throw error;
        }
        console.log('Filtered videos fetched:', data?.length);
        return (data || []).map(d => ({
            id: d.id,
            companyName: d.company_name,
            phone: d.phone,
            address: d.address,
            videoLink: d.video_link,
            embedUrl: d.embed_url,
            is_archived: d.is_archived,
            createdAt: d.created_at
        }));
    },

    async getAllVideoAds(): Promise<VideoAd[]> {
        console.log('Fetching all video ads (management)...');
        const { data, error } = await supabase
            .from('video_ads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error fetching all videos:', error);
            throw error;
        }
        return (data || []).map(d => ({
            id: d.id,
            companyName: d.company_name,
            phone: d.phone,
            address: d.address,
            videoLink: d.video_link,
            embedUrl: d.embed_url,
            is_archived: d.is_archived,
            createdAt: d.created_at
        }));
    },

    async saveVideoAd(ad: Partial<VideoAd>): Promise<VideoAd> {
        console.log('Saving video ad:', ad);
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

        if (error) {
            console.error('Supabase error saving video:', error);
            throw error;
        }
        console.log('Video saved successfully:', data.id);
        return {
            id: data.id,
            companyName: data.company_name,
            phone: data.phone,
            address: data.address,
            videoLink: data.video_link,
            embedUrl: data.embed_url,
            is_archived: data.is_archived,
            createdAt: data.created_at
        };
    },

    async deleteVideoAd(id: string): Promise<void> {
        console.log('Deleting video ad:', id);
        const { error } = await supabase
            .from('video_ads')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('Supabase error deleting video:', error);
            throw error;
        }
        console.log('Video deleted successfully from DB');
    },

    async archiveVideoAd(id: string, isArchived: boolean = true): Promise<void> {
        console.log('Archiving video ad:', id, isArchived);
        const { error } = await supabase
            .from('video_ads')
            .update({ is_archived: isArchived })
            .eq('id', id);
        if (error) {
            console.error('Supabase error archiving video:', error);
            throw error;
        }
        console.log('Video archive status updated successfully');
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
    },

    // Analytics & Leads
    async logPageView(targetType: 'company' | 'plant' | 'product', targetId: string, userId?: string, viewerId?: string): Promise<void> {
        const { error } = await supabase
            .from('page_views')
            .insert({
                target_type: targetType,
                target_id: targetId,
                user_id: userId,
                viewer_id: viewerId
            });
        if (error) console.error('Error logging page view:', error);
    },

    async submitLead(lead: {
        user_id?: string;
        sender_name: string;
        sender_email: string;
        sender_phone?: string;
        subject?: string;
        message: string;
        source_type?: string;
        source_id?: string;
    }): Promise<void> {
        const { error } = await supabase
            .from('leads')
            .insert(lead);
        if (error) throw error;
    },

    async submitSupportTicket(ticket: {
        user_id?: string;
        user_email?: string;
        subject: string;
        message: string;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
    }): Promise<void> {
        const { error } = await supabase
            .from('support_tickets')
            .insert(ticket);
        if (error) throw error;
    },

    async getCompanyStats(companyId: string) {
        // Get total page views
        const { count: viewsCount, error: viewsError } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .eq('target_id', companyId);

        if (viewsError) console.error('Error fetching views count:', viewsError);

        // Get total leads
        const { count: leadsCount, error: leadsError } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', companyId); // Leads sent to this company

        if (leadsError) console.error('Error fetching leads count:', leadsError);

        return {
            views: viewsCount || 0,
            leads: leadsCount || 0
        };
    },

    // --- Professionals ---
    async saveProfessional(professional: any, userId: string) {
        const { data, error } = await supabase
            .from('professionals')
            .upsert({
                ...professional,
                user_id: userId,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getProfessionals() {
        const { data, error } = await supabase
            .from('professionals')
            .select('*')
            .eq('is_archived', false)
            .order('rating', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async deleteProfessional(id: string): Promise<void> {
        const { error } = await supabase
            .from('professionals')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async archiveProfessional(id: string, isArchived: boolean = true): Promise<void> {
        const { error } = await supabase
            .from('professionals')
            .update({ is_archived: isArchived })
            .eq('id', id);
        if (error) throw error;
    },

    // --- Plans ---
    async getPlans() {
        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .eq('is_public', true)
            .order('price', { ascending: true }); // Assuming price is stored as text/number that sorts correctly, or add order column

        if (error) throw error;
        return data || [];
    },

    async getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_archived', false)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as any[];
    },

    async deleteProduct(id: string): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async archiveProduct(id: string, isArchived: boolean = true): Promise<void> {
        const { error } = await supabase
            .from('products')
            .update({ is_archived: isArchived })
            .eq('id', id);
        if (error) throw error;
    },

    async getProductsByCompany(companyId: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('company_id', companyId)
            .eq('is_archived', false)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as any[];
    },

    async getCompaniesByCategory(category: string) {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('is_archived', false)
            .ilike('category', `%${category}%`)
            .order('name', { ascending: true });
        if (error) throw error;
        return data.map(this.mapCompanyData);
    },

    async globalSearch(query: string) {
        if (!query || query.length < 2) return [];

        // Search Companies
        const { data: companies } = await supabase
            .from('companies')
            .select('*')
            .eq('is_archived', false)
            .ilike('name', `%${query}%`)
            .limit(10);

        // Search Professionals
        const { data: professionals } = await supabase
            .from('professionals')
            .select('*')
            .eq('is_archived', false)
            .or(`name.ilike.%${query}%,role.ilike.%${query}%`)
            .limit(10);

        // Search Products
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('is_archived', false)
            .ilike('name', `%${query}%`)
            .limit(10);

        const results = [
            ...(companies || []).map(c => ({ ...this.mapCompanyData(c), searchType: 'Empresa' })),
            ...(professionals || []).map(p => ({ ...p, searchType: 'Profissional' })),
            ...(products || []).map(pr => ({ ...pr, searchType: 'Produto' }))
        ];

        return results;
    },

    mapCompanyData(d: any): CompanyDetail {
        return {
            ...d,
            fullDescription: d.description || '',
            billingPeriod: d.billing_period,
            isFeatured: d.is_featured,
            geoLocation: d.geo_location,
            valueChain: d.value_chain,
            logo: d.logo_url || '',
            location: d.address || d.province || '',
            plan: mapDBToPlan(d.plan),
            products: d.products || [],
            slug: d.slug,
            isVerified: d.is_verified
        };
    },

    async getAppStats() {
        const [companies, products, professionals] = await Promise.all([
            supabase.from('companies').select('*', { count: 'exact', head: true }),
            supabase.from('products').select('*', { count: 'exact', head: true }),
            supabase.from('professionals').select('*', { count: 'exact', head: true })
        ]);

        return {
            companies: companies.count || 0,
            products: products.count || 0,
            professionals: professionals.count || 0
        };
    },

    async checkConnection() {
        try {
            const { error } = await supabase.from('plans').select('id').limit(1);
            return !error;
        } catch {
            return false;
        }
    },

    async getNews() {
        try {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .order('created_at', { ascending: false });

            if (error || !data || data.length === 0) throw new Error('No data');
            return data;
        } catch {
            // Mock agricultural news for Mozambique
            return [
                {
                    id: 'news-1',
                    name: 'Início da Campanha Agrária 2025',
                    activity: 'Notícias Rurais',
                    description: 'O Ministério da Agricultura anuncia as diretrizes para a nova campanha agrária, focando em sementes resilientes.',
                    searchType: 'Notícias',
                    icon: 'fa-wheat-awn',
                    date: '10 Fev 2026'
                },
                {
                    id: 'news-2',
                    name: 'Dica: Combate à Lagarta do Funil',
                    activity: 'Dicas Técnicas',
                    description: 'Saiba como identificar e tratar a praga do milho utilizando métodos biológicos acessíveis.',
                    searchType: 'Dicas',
                    icon: 'fa-bug-slash',
                    date: '08 Fev 2026'
                },
                {
                    id: 'news-3',
                    name: 'Preços do Mercado do Chimoio',
                    activity: 'Preços & Mercados',
                    description: 'Análise semanal dos preços dos cereais e hortícolas nos principais mercados da província de Manica.',
                    searchType: 'Notícias',
                    icon: 'fa-chart-pie',
                    date: '05 Fev 2026'
                }
            ];
        }
    }
};
