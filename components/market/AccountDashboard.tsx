import React, { useState } from 'react';
import { User, CompanyDetail } from '../../types';
import InvoiceReceipt from './InvoiceReceipt';

interface AccountDashboardProps {
    user: User;
    company: CompanyDetail | null;
    onEditCompany: () => void;
    onRegisterCompany: () => void;
    onLogout: () => void;
}

const AccountDashboard: React.FC<AccountDashboardProps> = ({
    user,
    company,
    onEditCompany,
    onRegisterCompany,
    onLogout
}) => {
    const [showReceipt, setShowReceipt] = useState(false);

    return (
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] animate-in fade-in slide-in-from-bottom flex flex-col">
            {/* Profile Header */}
            <div className="bg-white p-8 border-b border-slate-100 flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-[#10b981] rounded-[2.5rem] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-100 border-4 border-white">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#1e293b]">{user.name}</h2>
                    <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                </div>
                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    Membro Herbarium AI
                </div>
            </div>

            <div className="p-6 space-y-6 flex-1">
                {/* Subscription Status */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Área do Assinante</h3>

                    {company ? (
                        <div className="space-y-4">
                            {/* Company Card Mini */}
                            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <img src={company.logo || 'https://via.placeholder.com/150'} className="w-14 h-14 rounded-2xl object-cover border border-slate-50" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-[#1e293b] truncate uppercase text-xs">{company.name}</h4>
                                    <p className="text-[10px] text-emerald-600 font-bold">Plano {company.plan}</p>
                                </div>
                                <button
                                    onClick={onEditCompany}
                                    className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors"
                                >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                            </div>

                            {/* Action Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowReceipt(true)}
                                    className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 group active:scale-95 transition-all"
                                >
                                    <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center text-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                                        <i className="fa-solid fa-receipt"></i>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-700 uppercase">Factura / Recibo</span>
                                </button>

                                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center text-sm">
                                        <i className="fa-solid fa-box-open"></i>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[10px] font-black text-slate-700 uppercase">Produtos</span>
                                        <p className="text-[8px] font-bold text-slate-400">{company.products.length} Ativos</p>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Info */}
                            <div className="bg-emerald-500 p-5 rounded-3xl text-white shadow-lg shadow-emerald-100 relative overflow-hidden">
                                <i className="fa-solid fa-shield-check absolute -right-4 -bottom-4 text-white/10 text-6xl"></i>
                                <div className="relative z-10 flex items-center gap-3">
                                    <i className="fa-solid fa-circle-check text-xl"></i>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-wider">Conta Verificada</p>
                                        <p className="text-[9px] font-bold opacity-80">Seus dados estão protegidos e publicados no mercado.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto text-2xl">
                                <i className="fa-solid fa-building-circle-plus"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-[#1e293b]">Crie o seu Perfil</h4>
                                <p className="text-[10px] text-slate-400 px-4">Cadastre a sua empresa ou serviços para aparecer no Mercado e gerir o seu negócio.</p>
                            </div>
                            <button
                                onClick={onRegisterCompany}
                                className="w-full py-4 bg-[#10b981] text-white rounded-2xl font-bold text-xs uppercase shadow-lg shadow-emerald-100"
                            >
                                Começar Agora
                            </button>
                        </div>
                    )}
                </div>

                {/* Additional Settings/Info */}
                <div className="pt-6 space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Outras Definições</h3>
                    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                        <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 text-left">
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-user-shield text-slate-300"></i>
                                <span className="text-[11px] font-bold text-slate-700">Privacidade e Segurança</span>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[10px] text-slate-300"></i>
                        </button>
                        <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-circle-question text-slate-300"></i>
                                <span className="text-[11px] font-bold text-slate-700">Central de Ajuda</span>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[10px] text-slate-300"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Section */}
            <div className="px-6 py-8">
                <button
                    onClick={onLogout}
                    className="w-full py-4 bg-slate-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-50 active:scale-95 transition-all"
                >
                    Sair da Conta
                </button>
            </div>

            {/* Receipt Modal */}
            {showReceipt && company && (
                <InvoiceReceipt
                    company={company}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </div>
    );
};

export default AccountDashboard;
