import React from 'react';
import { CompanyDetail } from '../../types';

interface MarketDashboardProps {
    company: CompanyDetail;
    stats?: { views: number; leads: number };
    onClose: () => void;
    onEdit: () => void;
}

const MarketDashboard: React.FC<MarketDashboardProps> = ({ company, stats, onClose, onEdit }) => {
    return (
        <div className="p-6 pb-20 space-y-6 animate-in fade-in slide-in-from-bottom">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-[#1e293b] dark:text-slate-100">Gestão da Empresa</h2>
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">
                        Painel de Controle • Plano {company.plan}
                    </p>
                </div>
                <button onClick={onClose} className="text-slate-300 hover:text-red-500">
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Visualizações</p>
                    <p className="text-xl font-black text-emerald-600">{stats?.views || 0}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Interessados (Leads)</p>
                    <p className="text-xl font-black text-orange-500">{stats?.leads || 0}</p>
                </div>
            </div>

            {/* New block inserted here */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3 active:scale-95 transition-all">
                <div className={`w-10 h-10 ${company.plan === 'Produtor' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600'} rounded-lg flex items-center justify-center text-base`}>
                    {/* Icon based on role, assuming 'role' is derived from company.plan */}
                    {company.plan === 'Produtor' ? (
                        <i className="fa-solid fa-seedling"></i>
                    ) : (
                        <i className="fa-solid fa-store"></i>
                    )}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Plano Atual</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{company.plan}</p>
                </div>
            </div>
            {/* End of new block */}

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex gap-4 items-center border-b border-slate-50 dark:border-slate-700 pb-4">
                    <img
                        src={company.logo || 'https://via.placeholder.com/150'}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-100 dark:border-slate-700"
                    />
                    <div>
                        <h3 className="font-bold text-lg dark:text-slate-200">{company.name}</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            <i className="fa-solid fa-location-dot mr-1"></i> {company.location}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Actividade</p>
                    <p className="text-sm font-medium dark:text-slate-300">{company.activity}</p>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                        Serviços Cadastrados
                    </p>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-lg">
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold whitespace-pre-wrap">
                            {company.services || 'Nenhum serviço detalhado.'}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                        Produtos no Catálogo ({company.products.length})
                    </p>
                    <div className="space-y-2">
                        {company.products.map((p, i) => (
                            <div
                                key={i}
                                className="flex justify-between items-center text-[10px] p-2 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-lg border border-emerald-100/10"
                            >
                                <span className="font-bold dark:text-slate-300 break-words pr-2">{p.name}</span>
                                <span className="text-emerald-600 dark:text-emerald-500 font-black shrink-0">{p.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={onEdit}
                className="w-full py-4 bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg font-bold text-sm shadow-xl active:scale-95 transition-all"
            >
                <i className="fa-solid fa-pen-to-square mr-2"></i> Editar Informações
            </button>
        </div>
    );
};

export default MarketDashboard;
