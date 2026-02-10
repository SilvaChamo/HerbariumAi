import React from 'react';
import { AppTab } from '../../types';

interface NavBarProps {
    activeTab: AppTab;
    onTabChange: (tab: AppTab) => void;
}

const NavBar: React.FC<NavBarProps> = ({ activeTab, onTabChange }) => {
    return (
        <nav className="bg-white dark:bg-[#1a1f2c] border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center z-50 transition-colors">
            <button
                onClick={() => onTabChange(AppTab.SCAN)}
                className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${activeTab === AppTab.SCAN ? 'text-[#f97316]' : 'text-slate-300 dark:text-slate-600'
                    }`}
            >
                <i className="fa-solid fa-camera-retro text-xl"></i>
                <span className="text-[8px] font-bold uppercase">Scanner</span>
            </button>
            <button
                onClick={() => onTabChange(AppTab.COLLECTION)}
                className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${activeTab === AppTab.COLLECTION ? 'text-[#f97316]' : 'text-slate-300 dark:text-slate-600'
                    }`}
            >
                <i className="fa-solid fa-chart-line text-xl"></i>
                <span className="text-[8px] font-bold uppercase transition-all">Mercado</span>
            </button>
            <button
                onClick={() => onTabChange(AppTab.DISCOVER)}
                className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${activeTab === AppTab.DISCOVER ? 'text-[#f97316]' : 'text-slate-300 dark:text-slate-600'
                    }`}
            >
                <i className="fa-solid fa-box-archive text-xl"></i>
                <span className="text-[8px] font-bold uppercase transition-all">Repositório</span>
            </button>
            <button
                onClick={() => onTabChange(AppTab.ACCOUNT)}
                className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${activeTab === AppTab.ACCOUNT ? 'text-[#f97316]' : 'text-slate-300 dark:text-slate-600'
                    }`}
            >
                <i className="fa-solid fa-circle-user text-xl"></i>
                <span className="text-[8px] font-bold uppercase">Minha Conta</span>
            </button>
        </nav>
    );
};

export default NavBar;
