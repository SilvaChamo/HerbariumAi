import React, { useState, useEffect } from 'react';
import { VideoAd } from '../../types';
import { databaseService } from '../../services/databaseService';

interface VideoManagementProps {
    onClose: () => void;
    onAddVideo: () => void;
}

const VideoManagement: React.FC<VideoManagementProps> = ({ onClose, onAddVideo }) => {
    const [videos, setVideos] = useState<VideoAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        setLoading(true);
        try {
            const data = await databaseService.getAllVideoAds();
            setVideos(data);
        } catch (error: any) {
            console.error('Erro ao carregar vídeos:', error);
            alert('Erro ao carregar vídeos da base de dados: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        if (!confirm('Tem a certeza que deseja eliminar este vídeo permanentemente?')) return;

        try {
            await databaseService.deleteVideoAd(id);
            setVideos(prev => prev.filter(v => v.id !== id));
        } catch (error: any) {
            alert('Erro ao eliminar vídeo: ' + (error.message || 'Sem permissão ou erro de rede'));
        }
    };

    const handleArchive = async (id: string | undefined, currentStatus: boolean | undefined) => {
        if (!id) return;
        try {
            await databaseService.archiveVideoAd(id, !currentStatus);
            loadVideos();
        } catch (error: any) {
            alert('Erro ao alterar status do vídeo: ' + (error.message || 'Erro na base de dados'));
        }
    };

    const filteredVideos = videos.filter(v => {
        if (filter === 'active') return !v.is_archived;
        if (filter === 'archived') return !!v.is_archived;
        return true;
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-[#f8fafc] dark:bg-[#0f172a] rounded-[12px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Gestão de Vídeos</h2>
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Painel Administrativo • {videos.length} Spot(s)</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onAddVideo}
                            className="w-10 h-10 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none flex items-center justify-center hover:scale-110 transition-all"
                            title="Adicionar Novo Vídeo"
                        >
                            <i className="fa-solid fa-plus font-black"></i>
                        </button>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/50 shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 transition-all border border-slate-100 dark:border-slate-700"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-8 py-4 bg-white dark:bg-slate-900/50 flex gap-4 border-b border-slate-50 dark:border-slate-800">
                    <button
                        onClick={() => setFilter('all')}
                        className={`text-[9px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${filter === 'all' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`text-[9px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${filter === 'active' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400'}`}
                    >
                        Ativos
                    </button>
                    <button
                        onClick={() => setFilter('archived')}
                        className={`text-[9px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${filter === 'archived' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400'}`}
                    >
                        Arquivados
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">A carregar spots...</p>
                        </div>
                    ) : filteredVideos.length === 0 ? (
                        <div className="text-center py-12 space-y-4">
                            <i className="fa-solid fa-film text-4xl text-slate-200"></i>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhum vídeo encontrado</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredVideos.map((video) => (
                                <div
                                    key={video.id}
                                    className={`bg-white dark:bg-slate-800 p-5 rounded-xl border shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row gap-5 ${(video as any).is_archived ? 'opacity-60 grayscale' : 'border-slate-100 dark:border-slate-700'}`}
                                >
                                    {/* Video Preview / Icon */}
                                    <div className="w-full md:w-32 h-20 bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                                        <i className="fa-brands fa-youtube text-red-500 text-2xl group-hover:scale-125 transition-transform"></i>
                                        {(video as any).is_archived && (
                                            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Arquivado</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase text-xs truncate">{video.companyName}</h3>
                                            {(video as any).is_archived && <span className="bg-slate-100 dark:bg-slate-700 text-slate-400 text-[7px] font-black px-1.5 py-0.5 rounded uppercase">Arquivado</span>}
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                                            <i className="fa-solid fa-phone text-[8px]"></i> {video.phone}
                                        </p>
                                        <p className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold truncate mt-1">
                                            {video.videoLink}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-50 dark:border-slate-700 pt-4 md:pt-0 md:pl-5">
                                        <button
                                            onClick={() => window.open(video.videoLink, '_blank')}
                                            className="w-9 h-9 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
                                            title="Ver Vídeo"
                                        >
                                            <i className="fa-solid fa-play text-xs"></i>
                                        </button>

                                        <button
                                            onClick={() => handleArchive(video.id, (video as any).is_archived)}
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${(video as any).is_archived ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-500 hover:text-white'}`}
                                            title={(video as any).is_archived ? "Restaurar" : "Arquivar"}
                                        >
                                            <i className={`fa-solid ${(video as any).is_archived ? 'fa-rotate-left' : 'fa-box-archive'} text-xs`}></i>
                                        </button>

                                        <button
                                            onClick={() => handleDelete(video.id)}
                                            className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                            title="Eliminar permanentemente"
                                        >
                                            <i className="fa-solid fa-trash-can text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Agro Data Ads Manager • v2.0</p>
                </div>
            </div>
        </div>
    );
};

export default VideoManagement;
