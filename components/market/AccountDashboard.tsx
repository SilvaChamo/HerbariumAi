import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { User, CompanyDetail } from '../../types';
import InvoiceReceipt from './InvoiceReceipt';
import { databaseService } from '../../services/databaseService';

interface AccountDashboardProps {
    user: User;
    company: CompanyDetail | null;
    onEditCompany: () => void;
    onRegisterCompany: () => void;
    onLogout: () => void;
}

const AccountDashboard: React.FC<AccountDashboardProps> = ({
    user,
    company,
    onEditCompany,
    onRegisterCompany,
    onLogout
}) => {
    const [showReceipt, setShowReceipt] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [showSupportForm, setShowSupportForm] = useState(false);
    const [supportTicket, setSupportTicket] = useState({ subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [ticketSent, setTicketSent] = useState(false);
    const [stats, setStats] = useState({ views: 0, leads: 0 });

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
        <div className="flex-1 overflow-y-auto animate-in fade-in slide-in-from-bottom flex flex-col">
            {/* Profile Header */}
            <div className="bg-white p-8 border-b border-slate-100 flex flex-col items-center text-center space-y-4">
                <div
                    className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-[#10b981] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-100 border-4 border-white overflow-hidden"
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
                    <h2 className="text-xl font-bold text-[#1e293b]">
                        {user.name.includes('@')
                            ? user.name.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                            : user.name}
                        <span className="text-[10px] text-red-500 ml-1">(V2)</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">{user.email || user.name}</p>
                </div>
                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    Membro Botánica AI
                </div>
            </div>

            <div className="p-6 space-y-6 flex-1">
                {/* Subscription Status */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Área do Assinante</h3>

                    {company ? (
                        <div className="space-y-4">
                            {/* Company Card Mini */}
                            <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex items-center gap-4">
                                <img src={company.logo || 'https://via.placeholder.com/150'} className="w-14 h-14 rounded-lg object-cover border border-slate-50" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <h4 className="font-bold text-[#1e293b] truncate uppercase text-xs">{company.name}</h4>
                                        {company.isVerified && <i className="fa-solid fa-circle-check text-emerald-500 text-[10px]"></i>}
                                    </div>
                                    <p className="text-[10px] text-emerald-600 font-bold">Plano {company.plan}</p>
                                </div>
                                <button
                                    onClick={onEditCompany}
                                    className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:text-orange-500 transition-colors"
                                >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                            </div>

                            {/* Action Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowReceipt(true)}
                                    className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col items-center gap-3 group active:scale-95 transition-all"
                                >
                                    <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center text-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                                        <i className="fa-solid fa-receipt"></i>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-700 uppercase">Factura / Recibo</span>
                                </button>

                                <div className={`p-4 rounded-lg border shadow-sm flex flex-col items-center gap-3 ${company.isFeatured ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-80'}`}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${company.isFeatured ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        <i className={`fa-solid ${company.isFeatured ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                    </div>
                                    <div className="text-center">
                                        <span className={`text-[10px] font-black uppercase ${company.isFeatured ? 'text-emerald-700' : 'text-slate-500'}`}>
                                            {company.isFeatured ? 'Público' : 'Privado'}
                                        </span>
                                        <p className="text-[8px] font-bold text-slate-400">
                                            {company.isFeatured ? 'Visível no Mercado' : 'Invisível no Mercado'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Verification & Visibility Info */}
                            <div className={`p-5 rounded-lg text-white shadow-lg relative overflow-hidden ${company.isFeatured ? 'bg-emerald-500 shadow-emerald-100' : 'bg-slate-700 shadow-slate-200'}`}>
                                <i className={`fa-solid ${company.isFeatured ? 'fa-shield-check' : 'fa-lock'} absolute -right-4 -bottom-4 text-white/10 text-6xl`}></i>
                                <div className="relative z-10 flex items-center gap-3">
                                    <i className={`fa-solid ${company.isFeatured ? 'fa-circle-check' : 'fa-circle-info'} text-xl`}></i>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-wider">
                                            {company.isFeatured ? 'Conta Publicada' : 'Aguardando Destaque'}
                                        </p>
                                        <p className="text-[9px] font-bold opacity-80">
                                            {company.isFeatured
                                                ? 'Sua empresa está em destaque no mercado nacional.'
                                                : 'Sua empresa é visível apenas para si. Pague a taxa ou mude de plano para publicar.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Performance & Impact Dashboard */}
                            <div className="bg-slate-900 rounded-lg p-6 space-y-6 shadow-xl shadow-slate-200 relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>

                                <div className="flex items-center justify-between relative">
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Painel de Performance</h4>
                                        <p className="text-[14px] font-bold text-white leading-tight">Impacto do seu Negócio</p>
                                    </div>
                                    <div className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">Live</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 relative">
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-lg space-y-1">
                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                            <i className="fa-solid fa-eye text-[10px]"></i>
                                            <span className="text-[9px] font-black uppercase tracking-widest">Visitas</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-white">{stats.views}</span>
                                            <span className="text-[10px] font-bold text-emerald-400">Total</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-lg space-y-1">
                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                            <i className="fa-brands fa-whatsapp text-[10px]"></i>
                                            <span className="text-[9px] font-black uppercase tracking-widest">Leads</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-white">{stats.leads}</span>
                                            <span className="text-[10px] font-bold text-emerald-400">Mensagens</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-lg flex items-center justify-between relative">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-500">
                                            <i className="fa-brands fa-google text-lg"></i>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Status no Google</p>
                                            <p className="text-[11px] text-slate-400 font-medium">Indexação em curso...</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Google & Share Link */}
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Identidade Digital (SEO)</h4>
                                    <div className="flex gap-2 text-slate-300">
                                        <i className="fa-brands fa-google text-[10px]"></i>
                                        <i className="fa-brands fa-whatsapp text-[10px]"></i>
                                    </div>
                                </div>

                                <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-3">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="text-[10px] text-slate-500 font-medium truncate flex-1 opacity-70">
                                            agrodata.co.mz/directory/{company.slug || 'gerando...'}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(publicUrl);
                                                    alert('Link copiado!');
                                                }}
                                                className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center text-[10px] hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                                                title="Copiar Link"
                                            >
                                                <i className="fa-solid fa-copy"></i>
                                            </button>
                                            <button
                                                onClick={handleWhatsAppShare}
                                                className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-[10px] hover:bg-emerald-500 hover:text-white transition-all"
                                                title="Partilhar no WhatsApp"
                                            >
                                                <i className="fa-brands fa-whatsapp"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowQRCode(true)}
                                        className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-500 active:scale-95 transition-all"
                                    >
                                        <i className="fa-solid fa-qrcode text-xs"></i>
                                        Ver QR Code do Negócio
                                    </button>
                                </div>
                                <p className="text-[8px] text-slate-400 font-bold leading-relaxed px-1">
                                    Use este link e o QR Code no seu material de marketing para que o Google e clientes encontrem a sua empresa mais rápido.
                                </p>
                            </div>

                            {/* Verification & Visibility Info */}
                            <div className={`p-5 rounded-lg text-white shadow-lg relative overflow-hidden ${company.isFeatured ? 'bg-emerald-500 shadow-emerald-100' : 'bg-slate-700 shadow-slate-200'}`}>
                                <i className={`fa-solid ${company.isFeatured ? 'fa-shield-check' : 'fa-lock'} absolute -right-4 -bottom-4 text-white/10 text-6xl`}></i>
                                <div className="relative z-10 flex items-center gap-3">
                                    <i className={`fa-solid ${company.isFeatured ? 'fa-circle-check' : 'fa-circle-info'} text-xl`}></i>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-wider">
                                            {company.isFeatured ? 'Conta Publicada' : 'Aguardando Destaque'}
                                        </p>
                                        <p className="text-[9px] font-bold opacity-80">
                                            {company.isFeatured
                                                ? 'Sua empresa está em destaque no mercado nacional.'
                                                : 'Sua empresa é visível apenas para si. Pague a taxa ou mude de plano para publicar.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Product List Section */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Catálogo de Produtos</h3>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{company.products.length} Ativos</span>
                                </div>

                                {company.products.length > 0 ? (
                                    <div className="space-y-2">
                                        {company.products.map((prod, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-xs">
                                                        <i className="fa-solid fa-box"></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700">{prod.name}</p>
                                                        <p className="text-[9px] text-slate-400 uppercase font-black">{prod.category || 'Geral'}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-emerald-600">{prod.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-dashed border-slate-200 p-6 rounded-lg text-center">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Nenhum produto cadastrado</p>
                                        <button onClick={onEditCompany} className="mt-2 text-[10px] font-black text-emerald-600 hover:text-orange-500 hover:underline">Adicionar Itens</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-md rounded-lg p-4 border border-white shadow-sm flex items-center gap-3">
                            <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                                <i className="fa-solid fa-building-circle-plus"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-[#1e293b]">Crie o seu Perfil</h4>
                                <p className="text-[10px] text-slate-400 px-4">Cadastre a sua empresa ou serviços para aparecer no Mercado e gerir o seu negócio.</p>
                            </div>
                            <button
                                onClick={onRegisterCompany}
                                className="w-full py-4 bg-[#10b981] text-white rounded-lg font-bold text-xs uppercase shadow-lg shadow-emerald-100"
                            >
                                Começar Agora
                            </button>
                        </div>
                    )}
                </div>

                {/* Additional Settings/Info */}
                <div className="pt-6 space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Outras Definições</h3>
                    <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
                        <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 text-left">
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-user-shield text-slate-300"></i>
                                <span className="text-[11px] font-bold text-slate-700">Privacidade e Segurança</span>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[10px] text-slate-300"></i>
                        </button>
                        <button
                            onClick={() => setShowSupportForm(!showSupportForm)}
                            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-circle-question text-slate-300"></i>
                                <span className="text-[11px] font-bold text-slate-700">Central de Ajuda & Suporte</span>
                            </div>
                            <i className={`fa-solid ${showSupportForm ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px] text-slate-300`}></i>
                        </button>
                    </div>

                    {showSupportForm && (
                        <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                    <i className="fa-solid fa-headset"></i>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Suporte Técnico</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">Relate bugs ou peça ajuda</p>
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
                                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-xs font-semibold focus:border-emerald-500 outline-none"
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
                                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-xs font-semibold focus:border-emerald-500 outline-none resize-none"
                                            placeholder="Descreva o que está a acontecer..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-3 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-50 disabled:bg-slate-200"
                                    >
                                        {submitting ? 'A enviar...' : 'Abrir Ticket de Suporte'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Logout Section */}
            <div className="px-6 py-8">
                <button
                    onClick={onLogout}
                    className="w-full py-4 bg-slate-50 text-red-500 rounded-lg font-black text-xs uppercase tracking-widest border border-red-50 active:scale-95 transition-all"
                >
                    Sair da Conta
                </button>
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
                    <div className="bg-white w-full max-w-sm rounded-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">QR Code Profissional</h3>
                                <p className="text-xs text-slate-400 font-medium">Capture clientes do mundo físico para o seu perfil digital</p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-lg inline-block border-4 border-white shadow-inner">
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
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                    <p className="text-[10px] font-bold text-emerald-700 leading-relaxed">
                                        Imprima este código em cartões de visita, banners ou embalagens de produtos.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowQRCode(false)}
                                    className="w-full py-4 bg-slate-900 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-colors"
                                >
                                    Fechar Janela
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountDashboard;
