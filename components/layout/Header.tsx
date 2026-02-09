import React from 'react';
import { User, CompanyDetail } from '../../types';

interface HeaderProps {
    user: User | null;
    myCompany: CompanyDetail | null;
    showDashboard: boolean;
    onLogoClick: () => void;
    onDashboardToggle: () => void;
    onLogout: () => void;
    onNavigate: (tab: any) => void;
    onSearch: (query: string) => void;
    installPrompt: any;
    onInstall: () => void;
}

const Header: React.FC<HeaderProps> = ({
    user,
    myCompany,
    showDashboard,
    onLogoClick,
    onDashboardToggle,
    onLogout,
    onNavigate,
    onSearch,
    installPrompt,
    onInstall
}) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const menuSections = [
        {
            title: 'Funcionalidades',
            items: [
                { label: 'Scanner de Diagnóstico', icon: 'fa-qrcode', tab: 'scan', color: 'text-emerald-500' },
                { label: 'Mercado Agrário', icon: 'fa-store', tab: 'discover', color: 'text-orange-500' },
                { label: 'Rede de Profissionais', icon: 'fa-user-tie', tab: 'discover', params: 'Profissionais', color: 'text-blue-500' },
                { label: 'Minha Colecção', icon: 'fa-leaf', tab: 'collection', color: 'text-green-600' }
            ]
        },
        {
            title: 'Minha Conta',
            items: [
                { label: 'Meu Perfil', icon: 'fa-user', tab: 'account' },
                { label: 'Dashboard de Negócios', icon: 'fa-chart-line', tab: 'account', show: !!myCompany },
                { label: 'Sair da Conta', icon: 'fa-right-from-bracket', action: onLogout, show: !!user, color: 'text-red-400' }
            ]
        },
        {
            title: 'Suporte & Info',
            items: [
                { label: 'Instalar Aplicativo', icon: 'fa-download', action: onInstall, show: true, color: installPrompt ? 'text-emerald-600 animate-pulse' : 'text-slate-400' },
                { label: 'Aceder ao Site Principal', icon: 'fa-globe', action: () => window.open('https://agrodata.co.mz', '_blank'), color: 'text-emerald-600' },
                { label: 'Centro de Ajuda', icon: 'fa-circle-question', tab: 'account' }, // Usually leads to support form in account
                { label: 'Sobre a Botânica', icon: 'fa-circle-info' },
                { label: 'Termos & Privacidade', icon: 'fa-shield-halved' }
            ]
        }
    ];

    return (
        <>
            <header className="px-6 py-5 bg-white border-b border-slate-100 flex justify-between items-center z-[60] relative">
                <div onClick={onLogoClick} className="flex items-center gap-0 cursor-pointer">
                    <img src="/icon.png" alt="Botânica" className="w-12 h-12 rounded-lg" />
                    <div className="flex flex-col items-start leading-none">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                            {user ? 'Olá' : 'BEM-VINDO(A)'}
                        </p>
                        <h1 className="text-xl font-black text-emerald-700 tracking-tight flex items-center">
                            <span className="text-emerald-600">B</span>
                            <span className="text-emerald-700">ot</span>
                            <span className="text-orange-500">â</span>
                            <span className="text-emerald-700">nic</span>
                            <span className="text-emerald-700">a</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => onNavigate('account')}
                                className="h-9 w-9 bg-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-sm hover:bg-emerald-600 transition-all overflow-hidden"
                                style={{ borderRadius: '50%' }}
                                title={`${user.name} - Clique para ver dados da conta`}
                            >
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </button>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white" style={{ borderRadius: '50%' }}></div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="h-9 w-9 bg-slate-50 border border-slate-200 rounded-[10px] flex items-center justify-center hover:bg-orange-50 text-orange-600 transition-all"
                    >
                        <i className="fa-solid fa-bars-staggered text-sm"></i>
                    </button>
                </div>
            </header>

            {/* Off-canvas Menu */}
            {isMenuOpen && (
                <div className="absolute inset-0 z-[100] animate-in fade-in duration-300">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    <div className="absolute right-0 top-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-1">Navegação</span>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Menu Principal</h3>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="w-10 h-10 rounded-[10px] bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all active:scale-90"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-8 mt-2">
                            {/* Premium CTA for Guest or Business */}
                            {!myCompany && (
                                <div className="px-2">
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            window.dispatchEvent(new CustomEvent('open-company-form'));
                                        }}
                                        className="w-full bg-emerald-500 text-white p-4 rounded-[10px] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95 transition-all group"
                                    >
                                        <div className="w-8 h-8 bg-white/20 rounded-[10px] flex items-center justify-center">
                                            <i className="fa-solid fa-building-circle-plus text-sm"></i>
                                        </div>
                                        <span>Anunciar Negócio</span>
                                    </button>
                                </div>
                            )}

                            {menuSections.map((section, sIdx) => (
                                <div key={sIdx} className="space-y-3">
                                    <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] px-4">{section.title}</h4>
                                    <div className="space-y-1">
                                        {section.items.map((item: any, iIdx) => {
                                            if (item.show === false) return null;
                                            return (
                                                <button
                                                    key={iIdx}
                                                    className="w-full flex items-center gap-4 p-3 px-4 rounded-[10px] hover:bg-slate-50 transition-all group active:scale-95 text-left"
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        if (item.action) {
                                                            item.action();
                                                        } else if (item.tab) {
                                                            onNavigate(item.tab);
                                                            if (item.params) {
                                                                // If we had a direct category trigger, we'd use it here.
                                                                // For now let's use the tab change.
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <div className={`w-10 h-10 bg-slate-50 ${item.color || 'text-slate-400'} group-hover:scale-110 rounded-[10px] flex items-center justify-center text-sm transition-all shadow-sm border border-slate-100`}>
                                                        <i className={`fa-solid ${item.icon}`}></i>
                                                    </div>
                                                    <span className="font-bold text-slate-600 text-[13px] tracking-tight">{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                            <div className="flex items-center justify-between opacity-40 grayscale">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Botânica App v2.0</span>
                                <i className="fa-solid fa-seedling text-slate-400"></i>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default React.memo(Header);
