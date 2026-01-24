import React from 'react';
import { CompanyDetail } from '../../types';

interface CompanyDetailViewProps {
    company: CompanyDetail;
    onBack: () => void;
}

const CompanyDetailView: React.FC<CompanyDetailViewProps> = ({ company, onBack }) => {
    return (
        <div className="animate-in slide-in-from-bottom pb-20">
            <header className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="h-8 px-3 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase border border-slate-100"
                >
                    <i className="fa-solid fa-arrow-left mr-1"></i> Voltar
                </button>
                <span className="text-[9px] font-black text-emerald-600 uppercase border border-emerald-100 px-2 py-1 rounded-lg">
                    Verificado
                </span>
            </header>
            <div className="p-6 space-y-6">
                <div className="flex gap-5 items-center">
                    <div className="relative">
                        <img
                            src={company.logo || 'https://via.placeholder.com/150'}
                            className="w-24 h-24 rounded-2xl object-cover border border-slate-100 bg-slate-50"
                        />
                        {company.isVerified && (
                            <div className="absolute -right-2 -top-2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                                <i className="fa-solid fa-check text-[10px]"></i>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-black text-[#1e293b] leading-tight flex items-center gap-2">
                                {company.name}
                                {company.isVerified && <i className="fa-solid fa-circle-check text-emerald-500 text-sm"></i>}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                    {company.valueChain}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-emerald-600 font-bold">{company.activity}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                            <i className="fa-solid fa-location-dot mr-1 text-orange-500"></i> {company.location}
                        </p>
                    </div>
                </div>

                {/* Contactos */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-xs">
                            <i className="fa-solid fa-envelope"></i>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                            <p className="text-[10px] font-bold text-slate-700 truncate">{company.email}</p>
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-xs">
                            <i className="fa-solid fa-phone"></i>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Contacto</p>
                            <p className="text-[10px] font-bold text-slate-700 truncate">{company.contact}</p>
                        </div>
                    </div>
                </div>

                {company.geoLocation && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                        <i className="fa-solid fa-map-location-dot text-slate-400 ml-1"></i>
                        <p className="text-[10px] text-slate-500 font-medium">Coordenadas: <span className="text-slate-700 font-bold">{company.geoLocation}</span></p>
                    </div>
                )}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Sobre</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{company.fullDescription}</p>
                </div>
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Serviços</h3>
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {company.services || 'Nenhum serviço detalhado.'}
                        </p>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-1">Catálogo de Produtos</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {company.products.length > 0 ? company.products.map((p, i) => (
                            <div
                                key={i}
                                className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all group"
                            >
                                {p.photo && (
                                    <div className="aspect-[16/10] overflow-hidden">
                                        <img src={p.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} />
                                    </div>
                                )}
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-slate-800 leading-tight">{p.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-medium line-clamp-2 leading-relaxed">
                                                {p.description || 'Sem descrição adicional.'}
                                            </p>
                                        </div>
                                        <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                            <span className="text-xs font-black text-emerald-600">
                                                {p.price ? (p.price.includes('MT') ? p.price : `${p.price} MT`) : 'Sob Consulta'}
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
                                            className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                                        >
                                            <i className="fa-brands fa-whatsapp text-sm"></i>
                                            Comprar
                                        </button>
                                        <button
                                            onClick={() => {
                                                const productUrl = `https://agrodata.co.mz/directory/${company.slug}`;
                                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
                                            }}
                                            className="py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                                        >
                                            <i className="fa-brands fa-facebook text-sm"></i>
                                            Partilhar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-10 text-center bg-slate-50 border border-slate-100 rounded-[2rem] border-dashed">
                                <i className="fa-solid fa-boxes-stacked text-slate-200 text-3xl mb-3"></i>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Nenhum produto listado</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetailView;
