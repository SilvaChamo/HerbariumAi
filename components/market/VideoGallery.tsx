import React, { useState, useEffect } from 'react';
import { VideoAd } from '../../types';
import { databaseService } from '../../services/databaseService';

interface VideoGalleryProps {
    onClose: () => void;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ onClose }) => {
    const [videos, setVideos] = useState<VideoAd[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        setLoading(true);
        try {
            // Only active videos
            const data = await databaseService.getAllVideoAds();
            setVideos(data.filter(v => !v.is_archived));
        } catch (error: any) {
            console.error('Erro ao carregar galeria de vídeos:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] bg-white dark:bg-[#0f172a] flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <header className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-[12px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all border border-slate-100 dark:border-slate-700 active:scale-90"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Repositório</span>
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Galeria de Vídeos</h2>
                    </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full border border-orange-100 dark:border-orange-800/30">
                    <span className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-tight">{videos.length} Spot(s)</span>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-transparent pb-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">A carregar conteúdos...</p>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center">
                            <i className="fa-solid fa-film text-slate-200 dark:text-slate-700 text-5xl"></i>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Galeria Vazia</h4>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium px-10">Nenhum spot de vídeo disponível de momento.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {videos.map((video) => (
                            <div
                                key={video.id}
                                className="bg-white dark:bg-slate-800 rounded-[20px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
                            >
                                {/* Video Poster/Player Area */}
                                <div className="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                    <i className="fa-brands fa-youtube text-white/40 text-6xl group-hover:scale-110 transition-transform duration-700"></i>

                                    <button
                                        onClick={() => window.open(video.videoLink, '_blank')}
                                        className="absolute inset-0 w-full h-full flex items-center justify-center group/btn"
                                    >
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform group-hover/btn:scale-110 transition-all shadow-2xl">
                                            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                                <i className="fa-solid fa-play ml-1"></i>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Duration or category (placeholder if available in type) */}
                                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-black">
                                        SPOT PUBLICITÁRIO
                                    </div>
                                </div>

                                <div className="p-6 flex justify-between items-center">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-tight truncate">{video.companyName}</h4>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">Premium</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-2">
                                            <i className="fa-solid fa-phone text-[8px] text-emerald-500"></i> {video.phone}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => window.open(video.videoLink, '_blank')}
                                        className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[12px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        Assistir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 text-center uppercase tracking-[0.2em]">Explore o ecossistema Botânica AI</p>
            </div>
        </div>
    );
};

export default VideoGallery;
