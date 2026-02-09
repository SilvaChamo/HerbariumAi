import React, { useState, useEffect } from 'react';
import { databaseService } from '../../services/databaseService';
import { compressImage } from '../../utils';

interface ProfessionalFormProps {
    user: any;
    onClose: () => void;
    onSuccess: () => void;
}

const ProfessionalForm: React.FC<ProfessionalFormProps> = ({ user, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        profession: '',
        academic_level: '',
        specialties: '',
        bio: '',
        province: '',
        district: '',
        location: '',
        linkedin: '',
        photo_url: user?.avatar_url || '',
        category: 'Outros'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await databaseService.saveProfessional(formData, user.id);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar profissional:', error);
            alert('Erro ao salvar perfil profissional.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-white dark:bg-[#1a1f2c] z-[60] overflow-y-auto p-6 pb-24 space-y-4 animate-in slide-in-from-right duration-200 ease-out shadow-2xl">
            <div className="space-y-1 relative">
                <button
                    onClick={onClose}
                    className="absolute -top-2 -right-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                    <i className="fa-solid fa-circle-xmark text-xl"></i>
                </button>
                <h2 className="text-[20px] font-black text-[#1e293b] dark:text-white leading-tight">PERFIL PROFISSIONAL</h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed tracking-tighter">Registe-se como talento no mercado</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo Upload */}
                <div className="flex justify-center">
                    <label className="relative w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                        {formData.photo_url ? (
                            <img src={formData.photo_url} alt="Foto" className="w-full h-full object-cover" />
                        ) : (
                            <i className="fa-solid fa-camera text-slate-400 dark:text-slate-600 text-xl"></i>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    try {
                                        const compressed = await compressImage(file);
                                        const reader = new FileReader();
                                        reader.onloadend = () => setFormData({ ...formData, photo_url: reader.result as string });
                                        reader.readAsDataURL(compressed);
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }
                            }}
                        />
                    </label>
                </div>

                <div className="space-y-3">
                    <input
                        required
                        type="text"
                        placeholder="Nome Completo"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-lg text-xs outline-none focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <select
                            required
                            value={formData.academic_level}
                            onChange={e => setFormData({ ...formData, academic_level: e.target.value })}
                            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-lg text-xs outline-none focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-white"
                        >
                            <option value="">Nível Académico</option>
                            <option value="Médio">Técnico Médio</option>
                            <option value="Bacharel">Bacharel</option>
                            <option value="Licenciado">Licenciado</option>
                            <option value="Mestre">Mestre</option>
                            <option value="Doutor">Doutor</option>
                        </select>

                        <input
                            required
                            type="text"
                            placeholder="Profissão (Ex: Agrónomo)"
                            value={formData.profession}
                            onChange={e => setFormData({ ...formData, profession: e.target.value })}
                            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-lg text-xs outline-none focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                    </div>

                    <input
                        type="tel"
                        required
                        placeholder="Telefone / WhatsApp"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-lg text-xs outline-none focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <select
                            required
                            value={formData.province}
                            onChange={e => setFormData({ ...formData, province: e.target.value })}
                            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-lg text-xs outline-none focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-white"
                        >
                            <option value="">Província</option>
                            <option value="Maputo">Maputo</option>
                            <option value="Gaza">Gaza</option>
                            <option value="Inhambane">Inhambane</option>
                            <option value="Sofala">Sofala</option>
                            <option value="Manica">Manica</option>
                            <option value="Tete">Tete</option>
                            <option value="Zambézia">Zambézia</option>
                            <option value="Nampula">Nampula</option>
                            <option value="Niassa">Niassa</option>
                            <option value="Cabo Delgado">Cabo Delgado</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Distrito / Cidade"
                            value={formData.district}
                            onChange={e => setFormData({ ...formData, district: e.target.value })}
                            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-lg text-xs outline-none focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                    </div>

                    <textarea
                        required
                        rows={3}
                        placeholder="Resumo Profissional / Bio"
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-lg text-xs outline-none focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />

                    <textarea
                        rows={2}
                        placeholder="Especialidades (separadas por vírgula)"
                        value={formData.specialties}
                        onChange={e => setFormData({ ...formData, specialties: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-lg text-xs outline-none focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />

                    <input
                        type="url"
                        placeholder="LinkedIn (Opcional)"
                        value={formData.linkedin}
                        onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-lg text-xs outline-none focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#1e293b] dark:bg-emerald-600 text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-70 dark:hover:bg-emerald-500"
                    >
                        {loading ? 'A Salvar...' : 'Registar Perfil Profissional'}
                    </button>
                    <p className="text-[9px] text-center text-slate-400 mt-2">
                        Ao registar, concorda com os termos de uso para profissionais.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default ProfessionalForm;
