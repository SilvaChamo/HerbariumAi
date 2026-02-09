import React, { useEffect, useState } from 'react';
import { MarketProduct, CompanyDetail } from '../../types';
import { databaseService } from '../../services/databaseService';

interface ProductDetailViewProps {
    product: MarketProduct;
    onBack: () => void;
    onViewCompany: (company: CompanyDetail) => void;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, onBack, onViewCompany }) => {
    const [company, setCompany] = useState<CompanyDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Log view
        databaseService.logPageView('product', product.id).catch(console.error);

        // Fetch company info to show who sells it
        const fetchCompany = async () => {
            try {
                // In a real app, we'd have a getCompanyById or similar
                // For now, search results often include the info or we can fetch all and filter
                const companies = await databaseService.getCompanies();
                const seller = companies.find(c => c.id === product.company_id);
                if (seller) setCompany(seller);
            } catch (err) {
                console.error('Erro ao procurar empresa vendedora:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [product.id, product.company_id]);

    const handleBuyWhatsApp = () => {
        if (!company) return;
        const message = `Olá! Vi o produto *${product.name}* (${product.price} MT) na Botánica AI e gostaria de mais informações.`;
        window.open(`https://wa.me/${company.contact?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="animate-in slide-in-from-bottom pb-20 bg-white dark:bg-[#0f172a] min-h-screen">
            <header className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 z-30">
                <button
                    onClick={onBack}
                    className="h-8 px-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-[8px] text-[10px] font-bold uppercase border border-slate-100 dark:border-slate-700"
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

                {loading ? (
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    </div>
                ) : company ? (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-4">
                            <img src={company.logo} className="w-12 h-12 rounded-lg object-contain bg-white p-1" alt={company.name} />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendido por</p>
                                <h4 className="text-sm font-black text-slate-800 dark:text-white truncate">{company.name}</h4>
                            </div>
                        </div>
                        <button
                            onClick={() => onViewCompany(company)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase hover:border-emerald-500 transition-all font-titles"
                        >
                            Ver Perfil da Empresa
                        </button>
                    </div>
                ) : null}

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
                            const shareUrl = window.location.href; // In real app use product URL
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
