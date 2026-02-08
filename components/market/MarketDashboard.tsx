import React from 'react';
import { CompanyDetail } from '../../types';

interface MarketDashboardProps {
    company: CompanyDetail;
    onClose: () => void;
    onEdit: () => void;
}

const MarketDashboard: React.FC<MarketDashboardProps> = ({ company, onClose, onEdit }) => {
    return (
        <div className="p-6 pb-20 space-y-6 animate-in fade-in slide-in-from-bottom">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-[#1e293b]">Gestão da Empresa</h2>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                        Painel de Controle • Plano {company.plan}
                    </p>
                </div>
                <button onClick={onClose} className="text-slate-300 hover:text-red-500">
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-[8px] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Visualizações</p>
                    <p className="text-xl font-black text-emerald-600">1.240</p>
                </div>
                <div className="bg-white p-4 rounded-[8px] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Destaque</p>
                    <p className={`text-xs font-bold ${company.isFeatured ? 'text-orange-500' : 'text-slate-300'}`}>
                        {company.isFeatured ? 'Ativado' : 'Inativo'}
                    </p>
                </div>
            </div>

            {/* New block inserted here */}
            <div className="bg-white p-3 rounded-[8px] border border-slate-100 shadow-sm flex items-center gap-3 active:scale-95 transition-all">
                <div className={`w-10 h-10 ${company.plan === 'Produtor' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'} rounded-[8px] flex items-center justify-center text-base`}>
                    {/* Icon based on role, assuming 'role' is derived from company.plan */}
                    {company.plan === 'Produtor' ? (
                        <i className="fa-solid fa-seedling"></i>
                    ) : (
                        <i className="fa-solid fa-store"></i>
                    )}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Plano Atual</p>
                    <p className="text-sm font-bold text-slate-700">{company.plan}</p>
                </div>
            </div>
            {/* End of new block */}

            <div className="bg-white p-6 rounded-[8px] border border-slate-100 shadow-sm space-y-4">
                <div className="flex gap-4 items-center border-b border-slate-50 pb-4">
                    <img
                        src={company.logo || 'https://via.placeholder.com/150'}
                        className="w-16 h-16 rounded-[8px] object-cover border border-slate-100"
                    />
                    <div>
                        <h3 className="font-bold text-lg">{company.name}</h3>
                        <p className="text-xs text-slate-400">
                            <i className="fa-solid fa-location-dot mr-1"></i> {company.location}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Actividade</p>
                    <p className="text-sm font-medium">{company.activity}</p>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase">
                        Serviços Cadastrados
                    </p>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-[8px]">
                        <p className="text-[10px] text-slate-600 font-bold whitespace-pre-wrap">
                            {company.services || 'Nenhum serviço detalhado.'}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase">
                        Produtos no Catálogo ({company.products.length})
                    </p>
                    <div className="space-y-2">
                        {company.products.map((p, i) => (
                            <div
                                key={i}
                                className="flex justify-between items-center text-xs p-2 bg-emerald-50/30 rounded-[8px]"
                            >
                                <span className="font-bold">{p.name}</span>
                                <span className="text-emerald-600 font-black">{p.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={onEdit}
                className="w-full py-4 bg-slate-900 text-white rounded-[8px] font-bold text-sm shadow-xl active:scale-95 transition-all"
            >
                <i className="fa-solid fa-pen-to-square mr-2"></i> Editar Informações
            </button>
        </div>
    );
};

export default MarketDashboard;
