import React, { useEffect, useState } from 'react';
import { MarketProduct, CompanyDetail } from '../../types';
import { databaseService } from '../../services/databaseService';

interface ProductDetailViewProps {
    product: MarketProduct;
    onBack: () => void;
    onViewCompany: (company: CompanyDetail) => void;
    onViewProfessional?: (prof: any) => void;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, onBack, onViewCompany, onViewProfessional }) => {
    const [company, setCompany] = useState<CompanyDetail | null>(null);
    const [professionalOwner, setProfessionalOwner] = useState<any | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [relatedProfessional, setRelatedProfessional] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Log view
        databaseService.logPageView('product', product.id).catch(console.error);

        // Fetch owner info to show who sells it
        const fetchContext = async () => {
            try {
                const [companies, allProducts, allProfessionals] = await Promise.all([
                    databaseService.getCompanies(),
                    databaseService.getProducts(),
                    databaseService.getProfessionals()
                ]);

                // Seller (Company or Professional)
                const sellerCompany = companies.find(c => c.id === product.company_id || c.user_id === product.user_id);
                if (sellerCompany) {
                    setCompany(sellerCompany);
                } else {
                    const sellerProf = allProfessionals.find(p => p.id === product.company_id || p.user_id === product.user_id);
                    if (sellerProf) setProfessionalOwner(sellerProf);
                }

                // Suggestions (same category, different product)
                const similar = allProducts
                    .filter(p => p.category === product.category && p.id !== product.id)
                    .slice(0, 3);
                setSuggestions(similar);

                // Related Professional (same province or role related to category)
                if (allProfessionals.length > 0) {
                    const expert = allProfessionals[Math.floor(Math.random() * allProfessionals.length)];
                    setRelatedProfessional(expert);
                }

            } catch (err) {
                console.error('Erro ao procurar dados relacionados:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContext();
    }, [product.id, product.company_id, product.user_id]);

    const handleBuyWhatsApp = () => {
        const target = company || professionalOwner;
        if (!target) return;
        const contact = target.contact || target.phone || target.whatsapp;
        if (!contact) return;
        const message = `Olá! Vi o produto *${product.name}* (${product.price} MT) na Botánica AI e gostaria de mais informações.`;
        window.open(`https://wa.me/${contact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="animate-in slide-in-from-bottom pb-20 bg-white dark:bg-[#0f172a] min-h-screen">
            <header className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 z-30">
                <button
                    onClick={onBack}
                    className="h-8 px-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-[12px] text-[10px] font-bold uppercase border border-slate-100 dark:border-slate-700"
                >
                    <i className="fa-solid fa-arrow-left mr-1"></i> Voltar
                </button>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase">Produto</span>
                </div>
            </header>

            <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                <img
                    src={product.image_url || 'https://via.placeholder.com/400'}
                    className="w-full h-full object-cover"
                    alt={product.name}
                />
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-white/20">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {product.price} <span className="text-[10px] uppercase font-bold text-slate-400">MT</span>
                    </span>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">{product.category}</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight break-words">{product.name}</h2>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Descrição</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {product.description || 'Este produto não possui uma descrição detalhada.'}
                    </p>
                </div>

                {(company || professionalOwner) && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-4">
                            <img src={company?.logo || professionalOwner?.image_url} className="w-12 h-12 rounded-[12px] object-contain bg-white p-1" alt={company?.name || professionalOwner?.name} />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendido por</p>
                                <h4 className="text-sm font-black text-slate-800 dark:text-white truncate">{company?.name || professionalOwner?.name}</h4>
                            </div>
                        </div>
                        <button
                            onClick={() => company ? onViewCompany(company) : onViewProfessional?.(professionalOwner)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-[12px] text-[10px] font-black uppercase hover:border-emerald-500 transition-all font-titles"
                        >
                            Ver Perfil do Vendedor
                        </button>
                    </div>
                )}

                {/* Suggestions Section */}
                {suggestions.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Produtos Relacionados</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide">
                            {suggestions.map((p, i) => (
                                <div key={i} className="min-w-[140px] w-[140px] space-y-2 group cursor-pointer" onClick={() => window.location.reload()}>
                                    <div className="aspect-square rounded-[12px] overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50">
                                        <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all" alt={p.name} />
                                    </div>
                                    <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight">{p.name}</h4>
                                    <p className="text-[10px] font-black text-emerald-600">{p.price} MT</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Professional */}
                {relatedProfessional && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 mb-20">
                        <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Especialista Sugerido</h3>
                        <div className="bg-orange-50/50 dark:bg-orange-900/10 p-4 rounded-[12px] border border-orange-100 dark:border-orange-800/30 flex items-center gap-4">
                            <img src={relatedProfessional.image_url} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800" alt={relatedProfessional.name} />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{relatedProfessional.name}</h4>
                                <p className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-tight">{relatedProfessional.role || relatedProfessional.profession}</p>
                            </div>
                            <button className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-orange-500 shadow-sm border border-orange-100 dark:border-orange-800">
                                <i className="fa-solid fa-chevron-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 fixed bottom-6 left-6 right-6 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
                    <button
                        onClick={handleBuyWhatsApp}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95"
                    >
                        <i className="fa-brands fa-whatsapp text-lg"></i>
                        Comprar Agora
                    </button>
                    <button
                        onClick={() => {
                            const shareUrl = window.location.href;
                            if (navigator.share) {
                                navigator.share({
                                    title: product.name,
                                    text: `Olha este produto na Botánica AI: ${product.name}`,
                                    url: shareUrl
                                });
                            } else {
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                            }
                        }}
                        className="flex-1 bg-slate-800 dark:bg-slate-700 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <i className="fa-solid fa-share-nodes"></i>
                        Partilhar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailView;
