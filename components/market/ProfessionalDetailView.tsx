import React, { useEffect } from 'react';
import { Professional } from '../../types';
import { databaseService } from '../../services/databaseService';

interface ProfessionalDetailViewProps {
    professional: Professional;
    onBack: () => void;
}

const ProfessionalDetailView: React.FC<ProfessionalDetailViewProps> = ({ professional, onBack }) => {

    useEffect(() => {
        // Log view
        databaseService.logPageView('company', professional.id).catch(console.error); // Professionals are stored in their own table but we can log as type company or add a new type
    }, [professional.id]);

    const handleWhatsApp = () => {
        const message = `Olá! Vi o seu perfil de *${professional.role}* na Botánica AI e gostaria de contratar os seus serviços.`;
        window.open(`https://wa.me/${professional.whatsapp?.replace(/[^0-9]/g, '') || professional.phone?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="animate-in slide-in-from-bottom pb-20 bg-white dark:bg-[#0f172a] min-h-screen">
            <header className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 z-30">
                <button
                    onClick={onBack}
                    className="h-8 px-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-[8px] text-[10px] font-bold uppercase border border-slate-100 dark:border-slate-700"
                >
                    <i className="fa-solid fa-arrow-left mr-1"></i> Voltar
                </button>
                <div className="bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-800/50">
                    <span className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase">Profissional</span>
                </div>
            </header>

            <div className="p-6 space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                        <img
                            src={professional.image_url || 'https://via.placeholder.com/150'}
                            className="w-32 h-32 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-800"
                            alt={professional.name}
                        />
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900">
                            <i className="fa-solid fa-check text-xs"></i>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{professional.name}</h2>
                        <p className="text-emerald-600 dark:text-emerald-500 font-bold text-sm mt-1 uppercase tracking-tight">{professional.role || professional.profession}</p>
                        <div className="flex items-center justify-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                                <i className="fa-solid fa-location-dot text-orange-500"></i>
                                {professional.location || 'Moçambique'}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                                <i className="fa-solid fa-star text-yellow-500"></i>
                                {professional.rating || '5.0'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                            <i className="fa-solid fa-phone"></i>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Contacto</p>
                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-100 truncate">{professional.phone || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                            <i className="fa-solid fa-envelope"></i>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-100 truncate">{professional.email || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Specialties */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Especialidades</h3>
                    <div className="flex flex-wrap gap-2">
                        {(professional.specialties || '').split(',').map((spec, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold">
                                {spec.trim()}
                            </span>
                        )) || <span className="text-xs text-slate-400 italic">Nenhuma especialidade listada.</span>}
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Sobre Mim</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {professional.bio || 'Este profissional ainda não preencheu a sua biografia.'}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 grid grid-cols-1 gap-3 fixed bottom-6 left-6 right-6 z-40">
                    <button
                        onClick={handleWhatsApp}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 dark:shadow-none transition-all active:scale-95"
                    >
                        <i className="fa-brands fa-whatsapp text-xl"></i>
                        Entrar em Contacto
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalDetailView;
