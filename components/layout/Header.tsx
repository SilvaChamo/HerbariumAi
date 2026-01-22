import React from 'react';
import { User, CompanyDetail } from '../../types';

interface HeaderProps {
    user: User | null;
    myCompany: CompanyDetail | null;
    showDashboard: boolean;
    onLogoClick: () => void;
    onDashboardToggle: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
    user,
    myCompany,
    showDashboard,
    onLogoClick,
    onDashboardToggle,
    onLogout
}) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const categories = [
        { label: 'Fornecedores', icon: 'fa-handshake' },
        { label: 'Produtores', icon: 'fa-seedling' },
        { label: 'Consumidores', icon: 'fa-user-tag' },
        { label: 'Profissionais', icon: 'fa-user-tie' },
        { label: 'Lojas de Insumos', icon: 'fa-shop' }
    ];

    return (
        <>
            <header className="px-6 py-5 bg-white border-b border-slate-100 flex justify-between items-center z-[60] relative">
                <div onClick={onLogoClick}>
                    <h1 className="text-xl font-bold text-[#1e293b] tracking-tight cursor-pointer">
                        Herbarium<span className="text-[#10b981]">AI</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                        {user ? `Olá, ${user.name}` : 'BEM-VINDO(A)'}
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    {myCompany && myCompany.plan !== 'Free' && (
                        <button
                            onClick={onDashboardToggle}
                            className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${showDashboard
                                ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg'
                                : 'bg-slate-50 text-emerald-500 border border-slate-200'
                                }`}
                        >
                            <i className="fa-solid fa-chart-line text-sm"></i>
                        </button>
                    )}
                    {user && (
                        <button
                            onClick={onLogout}
                            className="h-9 w-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-300 hover:text-orange-500 transition-all"
                        >
                            <i className="fa-solid fa-right-from-bracket"></i>
                        </button>
                    )}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="h-9 w-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-emerald-50 text-emerald-600 transition-all"
                    >
                        <i className="fa-solid fa-bars-staggered text-sm"></i>
                    </button>
                </div>
            </header>

            {/* Off-canvas Menu */}
            {isMenuOpen && (
                <div className="absolute inset-0 z-[100] animate-in fade-in duration-300">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Sidebar */}
                    <div className="absolute right-0 top-0 h-full w-[80%] max-w-[320px] bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Navegação</span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {categories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    className="w-full flex items-center gap-3 p-2.5 px-4 rounded-xl hover:bg-emerald-50 transition-all group"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <div className="w-9 h-9 bg-slate-50 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white rounded-lg flex items-center justify-center text-sm transition-all shadow-sm">
                                        <i className={`fa-solid ${cat.icon}`}></i>
                                    </div>
                                    <span className="font-bold text-slate-700 group-hover:text-emerald-600 text-[13px]">{cat.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                            <div className="flex items-center gap-3 p-4 bg-emerald-500 rounded-xl text-white shadow-lg">
                                <i className="fa-solid fa-circle-info text-xs opacity-70"></i>
                                <span className="text-[10px] font-bold leading-tight">Mais categorias serão adicionadas em breve.</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
