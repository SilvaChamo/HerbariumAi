import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { User, CompanyDetail } from '../../types';
import InvoiceReceipt from './InvoiceReceipt';
import { databaseService } from '../../services/databaseService';
import { supabase } from '../../supabaseClient';

interface AccountDashboardProps {
    user: User;
    company: CompanyDetail | null;
    professional: any | null;
    onEditCompany: () => void;
    onRegisterCompany: () => void;
    onEditProfessional: () => void;
    onRegisterProfessional: () => void;
    onLogout: () => void;
    onAdminAction?: (action: string) => void;
    collection: any[];
    onViewPlant: (plant: any) => void;
    showCollections: boolean;
    setShowCollections: (show: boolean) => void;
}

const AccountDashboard: React.FC<AccountDashboardProps> = ({
    user,
    company,
    professional,
    onEditCompany,
    onRegisterCompany,
    onEditProfessional,
    onRegisterProfessional,
    onLogout,
    onAdminAction,
    collection,
    onViewPlant,
    showCollections,
    setShowCollections
}) => {
    const [showReceipt, setShowReceipt] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [showSupportForm, setShowSupportForm] = useState(false);
    const [supportTicket, setSupportTicket] = useState({ subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [ticketSent, setTicketSent] = useState(false);
    const [stats, setStats] = useState({ views: 0, leads: 0 });
    const [showSecurity, setShowSecurity] = useState(false);
    const [updatingUser, setUpdatingUser] = useState(false);
    const [securityForm, setSecurityForm] = useState({
        name: user.name,
        email: user.email,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (company?.id) {
            databaseService.getCompanyStats(company.id)
                .then(setStats)
                .catch(console.error);
        }
    }, [company?.id]);

    const publicUrl = `https://agrodata.co.mz/directory/${company?.slug}`;

    const handleWhatsAppShare = () => {
        const message = `Olá! Conheça a minha empresa no diretório oficial Agro Data: ${publicUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingUser(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: securityForm.name }
            });
            if (error) throw error;
            alert('Perfil atualizado com sucesso!');
        } catch (err: any) {
            alert('Erro ao atualizar perfil: ' + err.message);
        } finally {
            setUpdatingUser(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (securityForm.newPassword !== securityForm.confirmPassword) {
            alert('As novas senhas não coincidem!');
            return;
        }

        setUpdatingUser(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: securityForm.newPassword
            });
            if (error) throw error;
            alert('Senha atualizada com sucesso!');
            setSecurityForm(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
        } catch (err: any) {
            alert('Erro ao atualizar senha: ' + err.message);
        } finally {
            setUpdatingUser(false);
        }
    };

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await databaseService.submitSupportTicket({
                user_id: user.id,
                user_email: user.email,
                subject: supportTicket.subject,
                message: supportTicket.message
            });
            setTicketSent(true);
            setSupportTicket({ subject: '', message: '' });
        } catch (err) {
            console.error('Erro ao enviar ticket:', err);
            alert('Erro ao enviar ticket de suporte.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto animate-in fade-in slide-in-from-bottom flex flex-col bg-[#f1f5f9] dark:bg-[#0f172a]">
            {/* Profile Header */}
            <div className="bg-white dark:bg-slate-900 p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
                <div
                    className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-[#10b981] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-100 dark:shadow-none border-4 border-white overflow-hidden"
                    style={{ borderRadius: '50%' }}
                >
                    {user.avatar_url ? (
                        <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerText = user.name.charAt(0).toUpperCase();
                            }}
                        />
                    ) : (
                        user.name.charAt(0).toUpperCase()
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#1e293b] dark:text-slate-100">
                        {user.name.includes('@')
                            ? user.name.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                            : user.name}
                        <span className="text-[10px] text-red-500 ml-1">(V2)</span>
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">{user.email || user.name}</p>
                </div>
                <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                    Membro Botánica AI
                </div>
            </div>

            <div className="p-6 space-y-6 flex-1">
                {/* Meu Conteúdo Section */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-widest ml-1">Meu Conteúdo</h3>

                    {/* Company Profile Card */}
                    {company ? (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-[12px] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                                <div className="w-14 h-14 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                                    {company.logo ? (
                                        <img src={company.logo} className="w-full h-full object-contain" alt={company.name} />
                                    ) : (
                                        <i className="fa-solid fa-store text-slate-200 dark:text-slate-700 text-xl"></i>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-[#1e293b] dark:text-slate-200 truncate uppercase text-xs">{company.name}</h4>
                                    <p className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold uppercase">{company.plan || 'Plano Base'}</p>
                                </div>
                                <button
                                    onClick={onEditCompany}
                                    className="w-10 h-10 bg-slate-50 dark:bg-slate-700/50 rounded-[12px] flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors border border-slate-100 dark:border-slate-600"
                                >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                            </div>

                            {/* Company Stats Grid (Mini) */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">Visitas</p>
                                    <p className="text-sm font-black text-slate-700 dark:text-slate-100">{stats.views}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">Leads</p>
                                    <p className="text-sm font-black text-slate-700 dark:text-slate-100">{stats.leads}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-[12px] text-center">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Nenhuma empresa registada</p>
                            <button
                                onClick={onRegisterCompany}
                                className="mt-2 text-[10px] font-black text-emerald-600 dark:text-emerald-500 hover:text-orange-500 hover:underline uppercase tracking-widest"
                            >
                                Registar Empresa
                            </button>
                        </div>
                    )}

                    {/* Professional Profile Card */}
                    {professional ? (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-[12px] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                            <div className="w-14 h-14 rounded-[12px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 overflow-hidden">
                                {professional.photo ? (
                                    <img src={professional.photo} className="w-full h-full object-cover" alt={professional.name} />
                                ) : (
                                    <i className="fa-solid fa-user-tie text-lg"></i>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[#1e293b] dark:text-slate-200 truncate uppercase text-xs">{professional.name}</h4>
                                <p className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold uppercase">{professional.role || 'Profissional'}</p>
                            </div>
                            <button
                                onClick={onEditProfessional}
                                className="w-10 h-10 bg-slate-50 dark:bg-slate-700/50 rounded-[12px] flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors border border-slate-100 dark:border-slate-600"
                            >
                                <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-[12px] text-center">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Sem perfil profissional</p>
                            <button
                                onClick={onRegisterProfessional}
                                className="mt-2 text-[10px] font-black text-emerald-600 dark:text-emerald-500 hover:text-orange-500 hover:underline uppercase tracking-widest"
                            >
                                Criar Perfil
                            </button>
                        </div>
                    )}
                </div>

                {/* Quick Tools Grid */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-widest ml-1">Ferramentas rápidos</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setShowReceipt(true)}
                            className="bg-white dark:bg-slate-800 p-4 rounded-[12px] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center gap-3 group active:scale-95 transition-all text-center"
                        >
                            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-[12px] flex items-center justify-center text-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                                <i className="fa-solid fa-receipt"></i>
                            </div>
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-100 uppercase leading-none">Facturação</span>
                        </button>

                        <button
                            onClick={() => setShowCollections(true)}
                            className="bg-white dark:bg-slate-800 p-4 rounded-[12px] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center gap-3 group active:scale-95 transition-all text-center"
                        >
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-[12px] flex items-center justify-center text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <i className="fa-solid fa-leaf"></i>
                            </div>
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-100 uppercase leading-none">Colecções</span>
                        </button>
                    </div>
                </div>

                {/* Meus Produtos (Mini List) */}
                {company && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-widest">Meus Produtos</h3>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">{company.products.length}</span>
                        </div>
                        {company.products.length > 0 ? (
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                                {company.products.map((prod, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-500 rounded-lg flex items-center justify-center text-[10px]">
                                                <i className="fa-solid fa-box"></i>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-100 truncate">{prod.name}</p>
                                                <p className="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-black">{prod.category || 'Geral'}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 whitespace-nowrap">{prod.price}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-lg text-center">
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Nenhum produto cadastrado</p>
                                <button onClick={onEditCompany} className="mt-1 text-[10px] font-black text-emerald-600 hover:text-orange-500 hover:underline">Adicionar Itens</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Admin Panel (Only for admins) */}
            {user.isAdmin && (
                <div className="px-6 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black uppercase text-orange-500 dark:text-orange-400 tracking-widest">Painel Administrativo</h3>
                        <span className="text-[8px] font-black bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full uppercase">Super Admin</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onAdminAction?.('videos')}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20 shadow-sm flex flex-col items-center gap-2 group active:scale-95 transition-all text-center"
                        >
                            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-lg flex items-center justify-center text-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                                <i className="fa-solid fa-film"></i>
                            </div>
                            <span className="text-[9px] font-black text-slate-700 dark:text-slate-100 uppercase leading-tight">Gestão de Vídeos & Arquivados</span>
                        </button>

                        <button
                            onClick={() => onAdminAction?.('Produtos')}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20 shadow-sm flex flex-col items-center gap-2 group active:scale-95 transition-all text-center"
                        >
                            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-lg flex items-center justify-center text-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                                <i className="fa-solid fa-box-open"></i>
                            </div>
                            <span className="text-[9px] font-black text-slate-700 dark:text-slate-100 uppercase leading-tight">Gestão de Produtos</span>
                        </button>

                        <button
                            onClick={() => onAdminAction?.('Empresas')}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20 shadow-sm flex flex-col items-center gap-2 group active:scale-95 transition-all text-center"
                        >
                            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-lg flex items-center justify-center text-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                                <i className="fa-solid fa-building-shield"></i>
                            </div>
                            <span className="text-[9px] font-black text-slate-700 dark:text-slate-100 uppercase leading-tight">Gestão de Empresas</span>
                        </button>

                        <button
                            onClick={() => onAdminAction?.('Alertas')}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20 shadow-sm flex flex-col items-center gap-2 group active:scale-95 transition-all text-center"
                        >
                            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-lg flex items-center justify-center text-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                                <i className="fa-solid fa-comments"></i>
                            </div>
                            <span className="text-[9px] font-black text-slate-700 dark:text-slate-100 uppercase leading-tight">Mensagens & Leads</span>
                        </button>
                    </div>

                    <button
                        onClick={() => onAdminAction?.('Profissionais')}
                        className="w-full bg-slate-900 dark:bg-orange-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all group"
                    >
                        <i className="fa-solid fa-user-tie text-base"></i>
                        <span className="text-[10px] font-black uppercase tracking-widest">Gerenciar Profissionais</span>
                    </button>
                </div>
            )}

            {/* Logout Section */}
            <div className="px-6 py-8">
                <button
                    onClick={onLogout}
                    className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-red-500 dark:text-red-400 rounded-lg font-black text-xs uppercase tracking-widest border border-red-50 dark:border-red-900/30 active:scale-95 transition-all shadow-sm"
                >
                    Sair da Conta
                </button>
            </div>

            {/* Additional Settings/Info */}
            <div className="px-6 pb-12 space-y-3">
                <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-widest ml-1">Outras Definições</h3>
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <button
                        onClick={() => setShowSecurity(!showSecurity)}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700 text-left"
                    >
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-user-shield text-slate-300 dark:text-slate-600"></i>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-100">Privacidade e Segurança</span>
                        </div>
                        <i className={`fa-solid ${showSecurity ? 'fa-chevron-up' : 'fa-chevron-right'} text-[10px] text-slate-300 dark:text-slate-600`}></i>
                    </button>

                    {showSecurity && (
                        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 space-y-8 animate-in slide-in-from-top duration-300">
                            {/* Update Profile */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dados Pessoais</h4>
                                </div>
                                <form onSubmit={handleUpdateProfile} className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={securityForm.name}
                                            onChange={e => setSecurityForm({ ...securityForm, name: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-xs font-semibold focus:border-emerald-500 dark:text-slate-100 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1 opacity-60">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">E-mail (Não editável)</label>
                                        <input
                                            disabled
                                            type="email"
                                            value={securityForm.email}
                                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-xs font-semibold dark:text-slate-400 outline-none cursor-not-allowed"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={updatingUser}
                                        className="w-full py-3 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-50 dark:shadow-none active:scale-95 transition-all"
                                    >
                                        {updatingUser ? 'A Guardar...' : 'Actualizar Dados'}
                                    </button>
                                </form>
                            </div>

                            {/* Update Password */}
                            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Segurança da Conta</h4>
                                </div>
                                <form onSubmit={handleUpdatePassword} className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Nova Palavra-passe</label>
                                        <input
                                            required
                                            type="password"
                                            value={securityForm.newPassword}
                                            onChange={e => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-xs font-semibold focus:border-emerald-500 dark:text-slate-100 outline-none"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Confirmar Nova Palavra-passe</label>
                                        <input
                                            required
                                            type="password"
                                            value={securityForm.confirmPassword}
                                            onChange={e => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-xs font-semibold focus:border-emerald-500 dark:text-slate-100 outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={updatingUser}
                                        className="w-full py-3 bg-slate-900 dark:bg-orange-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                    >
                                        {updatingUser ? 'A Processar...' : 'Alterar Palavra-passe'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setShowSupportForm(!showSupportForm)}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-circle-question text-slate-300 dark:text-slate-600"></i>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-100">Central de Ajuda & Suporte</span>
                        </div>
                        <i className={`fa-solid ${showSupportForm ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px] text-slate-300 dark:text-slate-600`}></i>
                    </button>
                </div>

                {showSupportForm && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-top duration-300 mt-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 rounded-lg flex items-center justify-center">
                                <i className="fa-solid fa-headset"></i>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Suporte Técnico</h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Relate bugs ou peça ajuda</p>
                            </div>
                        </div>

                        {ticketSent ? (
                            <div className="p-6 bg-emerald-50 rounded-lg text-center space-y-2">
                                <i className="fa-solid fa-circle-check text-2xl text-emerald-500"></i>
                                <h5 className="text-xs font-black text-emerald-800">Ticket Recebido!</h5>
                                <p className="text-[9px] text-emerald-600 font-medium leading-relaxed">Nossa equipa analisará o seu pedido em breve.</p>
                                <button
                                    onClick={() => setTicketSent(false)}
                                    className="text-[9px] font-black text-emerald-600 uppercase border-b border-emerald-200 mt-2"
                                >
                                    Novo Ticket
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitTicket} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Assunto</label>
                                    <input
                                        required
                                        type="text"
                                        value={supportTicket.subject}
                                        onChange={e => setSupportTicket({ ...supportTicket, subject: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-4 py-3 text-xs font-semibold focus:border-emerald-500 dark:text-slate-100 outline-none"
                                        placeholder="Ex: Erro no Scanner, Pagamento..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Descrição do Problema</label>
                                    <textarea
                                        required
                                        value={supportTicket.message}
                                        onChange={e => setSupportTicket({ ...supportTicket, message: e.target.value })}
                                        rows={3}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-4 py-3 text-xs font-semibold focus:border-emerald-500 dark:text-slate-100 outline-none resize-none"
                                        placeholder="Descreva o que está a acontecer..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-50 dark:shadow-none disabled:bg-slate-200"
                                >
                                    {submitting ? 'A enviar...' : 'Abrir Ticket de Suporte'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>

            {/* Receipt Modal */}
            {showReceipt && company && (
                <InvoiceReceipt
                    company={company}
                    onClose={() => setShowReceipt(false)}
                />
            )}

            {/* QR Code Modal */}
            {showQRCode && company && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">QR Code Profissional</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Capture clientes do mundo físico para o seu perfil digital</p>
                            </div>

                            <div className="bg-slate-50 dark:bg-white p-6 rounded-lg inline-block border-4 border-white dark:border-slate-800 shadow-inner">
                                <QRCodeCanvas
                                    value={publicUrl}
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: company.logo || '',
                                        x: undefined,
                                        y: undefined,
                                        height: 40,
                                        width: 40,
                                        excavate: true,
                                    }}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                    <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-500 leading-relaxed">
                                        Imprima este código em cartões de visita, banners ou embalagens de produtos.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowQRCode(false)}
                                    className="w-full py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-orange-500 dark:hover:bg-emerald-500 transition-colors"
                                >
                                    Fechar Janela
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Collections Modal */}
            {showCollections && (
                <div className="fixed inset-0 bg-white dark:bg-[#0f172a] z-[120] flex flex-col animate-in slide-in-from-right duration-300">
                    <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <button
                            onClick={() => setShowCollections(false)}
                            className="w-10 h-10 rounded-[12px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all border border-slate-100 dark:border-slate-700 active:scale-90"
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Diagnósticos</span>
                            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Minhas Colecções</h3>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-12">
                        {collection.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {collection.map((plant, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            onViewPlant(plant);
                                            setShowCollections(false);
                                        }}
                                        className="bg-white dark:bg-slate-800 p-4 rounded-[12px] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:border-emerald-500 transition-all active:scale-[0.98] group cursor-pointer"
                                    >
                                        <div className="w-16 h-16 rounded-[12px] bg-slate-50 dark:bg-slate-900 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700">
                                            <img src={plant.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={plant.common_name} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate uppercase tracking-tight">{plant.common_name}</h4>
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-tight">{plant.scientific_name}</p>
                                        </div>
                                        <i className="fa-solid fa-chevron-right text-slate-200 dark:text-slate-700 text-xs"></i>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center">
                                    <i className="fa-solid fa-leaf text-slate-200 dark:text-slate-700 text-5xl"></i>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Colecção Vazia</h4>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium px-10">Você ainda não identificou nenhuma planta.</p>
                                </div>
                                <button
                                    onClick={() => setShowCollections(false)}
                                    className="px-8 py-4 bg-emerald-500 text-white rounded-[12px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95 transition-all"
                                >
                                    Voltar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountDashboard;
