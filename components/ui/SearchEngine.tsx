import React, { useState, useEffect, useRef } from 'react';

interface SearchEngineProps {
    isVisible: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
    onCategoryFilter: (category: string) => void;
}

const SearchEngine: React.FC<SearchEngineProps> = ({ isVisible, onClose, onSearch, onCategoryFilter }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isVisible && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 400);
        }
    }, [isVisible]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
            onClose();
        }
    };

    return (
        <div
            className={`fixed inset-x-0 top-0 z-[110] transition-all duration-500 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                }`}
        >
            <div className="bg-white dark:bg-[#0f172a] shadow-2xl border-b border-slate-200 dark:border-slate-800 pt-16 pb-8 px-6">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] ml-1">Motor de Busca</h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all border border-slate-100 dark:border-slate-700 active:scale-95"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Pesquisar por empresa, produto ou serviço..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[12px] px-5 py-4 text-sm font-bold focus:outline-none focus:border-emerald-500 dark:text-white transition-all shadow-sm"
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 text-white rounded-[10px] flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95 transition-all"
                        >
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </form>

                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Filtros Populares</p>
                        <div className="flex flex-wrap gap-2">
                            {['Sementes', 'Fertilizantes', 'Tratores', 'Consultoria', 'Logística', 'Bio-Insumos'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        onCategoryFilter(cat);
                                        onClose();
                                    }}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-95 shadow-sm"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Click outside to close (backdrop) */}
            <div
                className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm -z-10 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />
        </div>
    );
};

export default SearchEngine;
