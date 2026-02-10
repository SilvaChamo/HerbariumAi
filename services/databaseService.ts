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

export const databaseService = {
    // Helper to map DB company data to App CompanyDetail type
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

    // Companies
    async getCompanies(): Promise<CompanyDetail[]> {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .or('is_archived.eq.false,is_archived.is.null')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(d => this.mapCompanyData(d));
    },

    async getMyCompany(userId: string): Promise<CompanyDetail | null> {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', userId)
            .or('is_archived.eq.false,is_archived.is.null')
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return this.mapCompanyData(data);
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

        const savedCompany = this.mapCompanyData(data);

        // Update products separately to sync with products table
        if (company.products && company.products.length > 0) {
            try {
                await supabase.rpc('update_company_products', {
                    p_user_id: userId,
                    p_products: company.products
                });
            } catch (e) {
                console.warn('RPC update_company_products failed:', e);
            }

            // Also sync individually to the products table to ensure visibility in Mercado
            for (const prod of company.products) {
                await this.saveProduct({
                    ...prod,
                    company_id: savedCompany.id,
                    user_id: userId
                }).catch(err => console.error('Error syncing product:', err));
            }
        }

        return savedCompany;
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
        const { data, error } = await supabase
            .from('video_ads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const localBlacklist = JSON.parse(localStorage.getItem('deleted_videos_blacklist') || '[]');
        const visibleData = (data || []).filter(v => !localBlacklist.includes(v.id));

        return visibleData.map(d => ({
            id: d.id,
            companyName: d.company_name,
            phone: d.phone,
            address: d.address,
            videoLink: d.video_link,
            embedUrl: d.embed_url,
            is_archived: false,
            createdAt: d.created_at
        }));
    },

    async getAllVideoAds(): Promise<VideoAd[]> {
        const { data, error } = await supabase
            .from('video_ads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const localBlacklist = JSON.parse(localStorage.getItem('deleted_videos_blacklist') || '[]');
        const visibleData = (data || []).filter(v => !localBlacklist.includes(v.id));

        return visibleData.map(d => ({
            id: d.id,
            companyName: d.company_name,
            phone: d.phone,
            address: d.address,
            videoLink: d.video_link,
            embedUrl: d.embed_url,
            is_archived: false,
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
                embed_url: ad.embedUrl,
                user_id: ad.userId
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
            is_archived: false,
            createdAt: data.created_at
        };
    },

    async deleteVideoAd(id: string): Promise<void> {
        const { data, error } = await supabase
            .from('video_ads')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            const blacklist = JSON.parse(localStorage.getItem('deleted_videos_blacklist') || '[]');
            if (!blacklist.includes(id)) {
                blacklist.push(id);
                localStorage.setItem('deleted_videos_blacklist', JSON.stringify(blacklist));
            }
            return;
        }
    },

    async archiveVideoAd(id: string, isArchived: boolean = true): Promise<void> {
        try {
            const { error } = await supabase
                .from('video_ads')
                .update({ is_archived: isArchived })
                .eq('id', id);

            if (error) throw error;
        } catch (err: any) {
            const blacklist = JSON.parse(localStorage.getItem('deleted_videos_blacklist') || '[]');
            if (isArchived) {
                if (!blacklist.includes(id)) {
                    blacklist.push(id);
                    localStorage.setItem('deleted_videos_blacklist', JSON.stringify(blacklist));
                }
            } else {
                const newBlacklist = blacklist.filter((bid: string) => bid !== id);
                localStorage.setItem('deleted_videos_blacklist', JSON.stringify(newBlacklist));
            }
        }
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

    async submitLead(lead: any): Promise<void> {
        const { error } = await supabase
            .from('leads')
            .insert(lead);
        if (error) throw error;
    },

    async submitSupportTicket(ticket: any): Promise<void> {
        const { error } = await supabase
            .from('support_tickets')
            .insert(ticket);
        if (error) throw error;
    },

    async getCompanyStats(companyId: string) {
        const { count: viewsCount, error: viewsError } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .eq('target_id', companyId);

        if (viewsError) console.error('Error fetching views count:', viewsError);

        const { count: leadsCount, error: leadsError } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', companyId);

        if (leadsError) console.error('Error fetching leads count:', leadsError);

        return {
            views: viewsCount || 0,
            leads: leadsCount || 0
        };
    },

    // Professionals
    async saveProfessional(professional: any, userId: string) {
        const { data, error } = await supabase
            .from('professionals')
            .upsert({
                ...professional,
                user_id: userId,
                is_archived: false,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getProfessionalByUserId(userId: string) {
        const { data, error } = await supabase
            .from('professionals')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    async getProfessionals() {
        const { data, error } = await supabase
            .from('professionals')
            .select('*')
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
        // Table doesn't have is_archived, using status as proxy if needed, 
        // but for now we'll just log since we can't update a missing column
        console.warn('Professional table doesn\'t have is_archived column');
        const { error } = await supabase
            .from('professionals')
            .update({ status: isArchived ? 'archived' : 'active' })
            .eq('id', id);
        if (error) throw error;
    },

    // Plans
    async getPlans() {
        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .eq('is_public', true)
            .order('price', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    // Products
    async getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as any[];
    },

    async saveProduct(product: any) {
        const { data, error } = await supabase
            .from('products')
            .upsert({
                name: product.name,
                price: product.price,
                description: product.description,
                image_url: product.photo || product.image_url,
                company_id: product.company_id,
                user_id: product.user_id,
                is_available: true,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteProduct(id: string): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async archiveProduct(id: string, isArchived: boolean = true): Promise<void> {
        // Table doesn't have is_archived, using deleted_at as a soft delete proxy
        const { error } = await supabase
            .from('products')
            .update({ deleted_at: isArchived ? new Date().toISOString() : null })
            .eq('id', id);
        if (error) throw error;
    },

    async getProductsByCompany(companyId: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as any[];
    },

    // Search & Misc
    async getCompaniesByCategory(category: string) {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .or('is_archived.eq.false,is_archived.is.null')
            .ilike('category', `%${category}%`)
            .order('name', { ascending: true });
        if (error) throw error;
        return data.map(d => this.mapCompanyData(d));
    },

    async globalSearch(query: string) {
        if (!query || query.length < 2) return [];

        const { data: companies } = await supabase
            .from('companies')
            .select('*')
            .or('is_archived.eq.false,is_archived.is.null')
            .ilike('name', `%${query}%`)
            .limit(10);

        const { data: professionals } = await supabase
            .from('professionals')
            .select('*')
            .or(`name.ilike.%${query}%,role.ilike.%${query}%`)
            .limit(10);

        const { data: products } = await supabase
            .from('products')
            .select('*')
            .is('deleted_at', null)
            .ilike('name', `%${query}%`)
            .limit(10);

        return [
            ...(companies || []).map(c => ({ ...this.mapCompanyData(c), searchType: 'Empresa' })),
            ...(professionals || []).map(p => ({ ...p, searchType: 'Profissional' })),
            ...(products || []).map(pr => ({ ...pr, searchType: 'Produto' }))
        ];
    },

    async getAppStats() {
        const [companies, products, professionals] = await Promise.all([
            supabase.from('companies').select('*', { count: 'exact', head: true }).or('is_archived.eq.false,is_archived.is.null'),
            supabase.from('products').select('*', { count: 'exact', head: true }).is('deleted_at', null),
            supabase.from('professionals').select('*', { count: 'exact', head: true }).or('status.eq.active,status.is.null')
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
