import React, { useEffect, useState } from 'react';
import { CompanyDetail } from '../../types';
import { databaseService } from '../../services/databaseService';

interface CompanyDetailViewProps {
    company: CompanyDetail;
    onBack: () => void;
}

const CompanyDetailView: React.FC<CompanyDetailViewProps> = ({ company, onBack }) => {
    const [leadForm, setLeadForm] = useState({ name: '', email: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [syncedProducts, setSyncedProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    useEffect(() => {
        if (company.id) {
            databaseService.logPageView('company', company.id).catch(console.error);

            // Fetch real-time products for this company
            setLoadingProducts(true);
            databaseService.getProductsByCompany(company.id)
                .then(setSyncedProducts)
                .catch(console.error)
                .finally(() => setLoadingProducts(false));
        }
    }, [company.id]);

    const handleSubmitLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await databaseService.submitLead({
                user_id: company.id, // Empregador que recebe o lead
                sender_name: leadForm.name,
                sender_email: leadForm.email,
                message: leadForm.message,
                source_type: 'company_profile',
                source_id: company.id
            });
            setSubmitted(true);
            setLeadForm({ name: '', email: '', message: '' });
        } catch (err) {
            console.error('Erro ao enviar lead:', err);
            alert('Erro ao enviar mensagem. Por favor, tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom pb-20 bg-white dark:bg-[#0f172a]">
            <header className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="h-8 px-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-[8px] text-[10px] font-bold uppercase border border-slate-100 dark:border-slate-700"
                >
                    <i className="fa-solid fa-arrow-left mr-1"></i> Voltar
                </button>
                <span className="text-[9px] font-black text-emerald-600 uppercase border border-emerald-100 px-2 py-1 rounded-[8px]">
                    Verificado
                </span>
            </header>
            <div className="p-6 space-y-6">
                <div className="flex gap-5 items-center">
                    <div className="relative">
                        <img
                            src={company.logo || 'https://via.placeholder.com/150'}
                            className="w-24 h-24 rounded-[8px] object-cover border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                        {company.isVerified && (
                            <div className="absolute -right-2 -top-2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900">
                                <i className="fa-solid fa-check text-[10px]"></i>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-black text-[#1e293b] dark:text-slate-100 leading-tight flex items-center gap-2">
                                {company.name}
                                {company.isVerified && <i className="fa-solid fa-circle-check text-emerald-500 text-sm"></i>}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                    {company.valueChain}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-emerald-600 font-bold">{company.activity}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            <i className="fa-solid fa-location-dot mr-1 text-orange-500"></i> {company.location}
                        </p>
                    </div>
                </div>

                {/* Contactos Rápidos */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-[8px] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 rounded-[8px] flex items-center justify-center text-xs">
                            <i className="fa-solid fa-envelope"></i>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Email</p>
                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-100 truncate">{company.email}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-[8px] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500 rounded-[8px] flex items-center justify-center text-xs">
                            <i className="fa-solid fa-phone"></i>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Contacto</p>
                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-100 truncate">{company.contact}</p>
                        </div>
                    </div>
                </div>

                {company.geoLocation && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-[8px] flex items-center gap-3">
                        <i className="fa-solid fa-map-location-dot text-slate-400 dark:text-slate-500 ml-1"></i>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Coordenadas: <span className="text-slate-700 dark:text-white font-bold">{company.geoLocation}</span></p>
                    </div>
                )}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Sobre</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{company.fullDescription}</p>
                </div>
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Serviços</h3>
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-[8px]">
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {company.services || 'Nenhum serviço detalhado.'}
                        </p>
                    </div>
                </div>

                {/* Formulário de Contacto */}
                <div className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-[8px] border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-paper-plane text-emerald-500"></i> Enviar Mensagem
                    </h3>
                    {submitted ? (
                        <div className="p-6 bg-emerald-50 rounded-[8px] text-center space-y-2 animate-in fade-in zoom-in">
                            <i className="fa-solid fa-circle-check text-3xl text-emerald-500"></i>
                            <h4 className="text-sm font-black text-emerald-800">Mensagem Enviada!</h4>
                            <p className="text-[10px] text-emerald-600 font-medium">A empresa entrará em contacto consigo em breve.</p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="mt-2 text-[10px] font-black text-emerald-600 uppercase border-b border-emerald-200"
                            >
                                Enviar outra
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitLead} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Seu Nome</label>
                                <input
                                    required
                                    type="text"
                                    value={leadForm.name}
                                    onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[8px] px-4 py-3 text-xs font-medium focus:border-emerald-500 dark:text-slate-100 transition-all outline-none"
                                    placeholder="Como quer ser chamado?"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Seu Email</label>
                                <input
                                    required
                                    type="email"
                                    value={leadForm.email}
                                    onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[8px] px-4 py-3 text-xs font-medium focus:border-emerald-500 dark:text-slate-100 transition-all outline-none"
                                    placeholder="exemplo@email.com"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Mensagem</label>
                                <textarea
                                    required
                                    value={leadForm.message}
                                    onChange={e => setLeadForm({ ...leadForm, message: e.target.value })}
                                    rows={4}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[8px] px-4 py-3 text-xs font-medium focus:border-emerald-500 dark:text-slate-100 transition-all outline-none resize-none"
                                    placeholder="Em que podemos ajudar?"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white py-4 rounded-[8px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95"
                            >
                                {submitting ? 'A enviar...' : 'Enviar Pedido de Contacto'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-1">Catálogo de Produtos</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {loadingProducts ? (
                            <div className="p-10 text-center animate-pulse">
                                <i className="fa-solid fa-circle-notch fa-spin text-emerald-500 text-xl"></i>
                                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">A sincronizar produtos...</p>
                            </div>
                        ) : (syncedProducts.length > 0 ? syncedProducts : (company.products || [])).length > 0 ? (syncedProducts.length > 0 ? syncedProducts : (company.products || [])).map((p, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[8px] overflow-hidden shadow-sm hover:shadow-md transition-all group"
                            >
                                {(p.photo || p.image_url) && (
                                    <div className="aspect-[16/10] overflow-hidden">
                                        <img src={p.photo || p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} />
                                    </div>
                                )}
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight break-words">{p.name}</h4>
                                            <p className="text-[9px] text-slate-400 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed break-words">
                                                {p.description || 'Sem descrição adicional.'}
                                            </p>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1.5 rounded-[8px] border border-emerald-100 dark:border-emerald-800 shrink-0">
                                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                {p.price ? (typeof p.price === 'string' && p.price.includes('MT') ? p.price : `${p.price} MT`) : 'Sob Consulta'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Share Action Grid */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => {
                                                const message = `Olá! Vi o vosso produto na Botánica AI e gostaria de mais informações:\n\n*Produto:* ${p.name}\n*Preço:* ${p.price || 'Sob Consulta'}\n*Descrição:* ${p.description || 'N/A'}\n\n*Empresa:* ${company.name}\n\nComo posso proceder com o pagamento e entrega?`;
                                                window.open(`https://wa.me/${company.contact?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                                            }}
                                            className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[8px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm dark:shadow-none transition-all active:scale-95"
                                        >
                                            <i className="fa-brands fa-whatsapp text-sm"></i>
                                            Comprar
                                        </button>
                                        <button
                                            onClick={() => {
                                                const productUrl = `https://agrodata.co.mz/directory/${company.slug}`;
                                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
                                            }}
                                            className="py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-[8px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                                        >
                                            <i className="fa-brands fa-facebook text-sm"></i>
                                            Partilhar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-[8px] border-dashed">
                                <i className="fa-solid fa-boxes-stacked text-slate-200 dark:text-slate-700 text-3xl mb-3"></i>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Nenhum produto sincronizado</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetailView;
