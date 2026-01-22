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
                    <img
                        src={company.logo || 'https://via.placeholder.com/150'}
                        className="w-24 h-24 rounded-2xl object-cover border border-slate-100 bg-slate-50"
                    />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-[#1e293b]">{company.name}</h2>
                            <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                {company.valueChain}
                            </span>
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
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Catálogo de Produtos</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {company.products.length > 0 ? company.products.map((p, i) => (
                            <div
                                key={i}
                                className="bg-white p-4 border border-slate-100 rounded-xl flex justify-between items-center shadow-sm"
                            >
                                <span className="text-xs font-bold text-slate-700">{p.name}</span>
                                <span className="text-xs font-black text-emerald-600">{p.price}</span>
                            </div>
                        )) : (
                            <p className="text-xs text-slate-400 italic">Nenhum produto listado.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetailView;
