import React from 'react';
import { News } from '../../types';

interface NewsDetailViewProps {
    news: News;
    onBack: () => void;
}

const NewsDetailView: React.FC<NewsDetailViewProps> = ({ news, onBack }) => {
    return (
        <div className="animate-in slide-in-from-bottom pb-20 bg-white dark:bg-[#0f172a] min-h-screen">
            <header className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 z-30">
                <button
                    onClick={onBack}
                    className="h-8 px-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-[12px] text-[10px] font-bold uppercase border border-slate-100 dark:border-slate-700"
                >
                    <i className="fa-solid fa-arrow-left mr-1"></i> Voltar
                </button>
                <div className="bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-800/50">
                    <span className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest">{news.searchType}</span>
                </div>
            </header>

            <div className="p-6 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-[12px] flex items-center justify-center text-xl text-orange-500 shadow-sm border border-slate-100 dark:border-slate-700">
                            <i className={`fa-solid ${news.icon}`}></i>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{news.activity}</p>
                            <p className="text-[10px] font-bold text-orange-500 uppercase">{news.date}</p>
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{news.name}</h1>
                </div>

                {news.image_url && (
                    <div className="aspect-video w-full rounded-[12px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-lg">
                        <img src={news.image_url} className="w-full h-full object-cover" alt={news.name} />
                    </div>
                )}

                <div className="space-y-6">
                    <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic border-l-4 border-orange-500 pl-4 py-2 bg-slate-50 dark:bg-slate-800/30 rounded-r-[12px]">
                        {news.description}
                    </p>

                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {news.content || "O sector agrário continua a ser o pilar fundamental da economia moçambicana. Esta atualização traz informações cruciais para produtores e investidores interessados em maximizar a produtividade e garantir a sustentabilidade das suas explorações.\n\nA implementação de técnicas resilientes às mudanças climáticas tem mostrado resultados promissores em várias províncias."}
                        </p>

                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[12px] border border-emerald-100 dark:border-emerald-800/50 space-y-3">
                            <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Recomendação Técnica</h3>
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                                Recomendamos o uso de sementes certificadas e o acompanhamento técnico regular. Consulte a nossa rede de profissionais para apoio especializado na sua região.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Partilhar Informação</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 p-3 bg-[#1877F2] text-white rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                            <i className="fa-brands fa-facebook"></i> Facebook
                        </button>
                        <button className="flex items-center justify-center gap-2 p-3 bg-[#25D366] text-white rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                            <i className="fa-brands fa-whatsapp"></i> WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsDetailView;
