import React, { useState } from 'react';
import { CompanyDetail, PlanType, BillingPeriod } from '../../types';
import { formatCurrency } from '../../utils';
import InvoiceReceipt from './InvoiceReceipt';

interface CompanyFormProps {
    initialData?: CompanyDetail;
    onSubmit: (company: CompanyDetail) => void;
    onClose: () => void;
}

const getProductLimit = (plan: PlanType): number => {
    if (plan === 'Parceiro') return Infinity;
    if (plan === 'Premium') return 20;
    if (plan === 'Básico') return 5;
    return 0;
};

// Preços mensais base
const MONTHLY_PRICES: Record<PlanType, number> = {
    'Free': 0,
    'Básico': 500,
    'Premium': 1500,
    'Parceiro': 5000
};

// Desconto anual (2 meses grátis = ~17% desconto)
const ANNUAL_DISCOUNT = 0.17;
const FEATURED_PRICE = 1000;

const getPlanPrice = (plan: PlanType, billingPeriod: BillingPeriod): number => {
    const monthlyPrice = MONTHLY_PRICES[plan];
    if (billingPeriod === 'annual') {
        return Math.round(monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT));
    }
    return monthlyPrice;
};

const CompanyForm: React.FC<CompanyFormProps> = ({ initialData, onSubmit, onClose }) => {
    const [formData, setFormData] = useState<CompanyDetail>(initialData || {
        registrationType: 'enterprise',
        name: '',
        email: '',
        contact: '',
        activity: '',
        location: '',
        geoLocation: '',
        valueChain: 'Consumidor',
        logo: '',
        fullDescription: '',
        services: '',
        products: [],
        plan: 'Free',
        billingPeriod: 'monthly',
        isFeatured: false
    });

    const [hasPaidPlan, setHasPaidPlan] = useState(false);
    const [hasPaidFeatured, setHasPaidFeatured] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'emola' | 'banco' | null>(null);
    const [paymentType, setPaymentType] = useState<'plan' | 'featured' | null>(null);
    const [paymentPhone, setPaymentPhone] = useState('');
    const [bankDetails, setBankDetails] = useState({ holder: '', bankName: '', nib: '', iban: '', agency: '' });
    const [showReceipt, setShowReceipt] = useState(false);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    const handleAddProductField = () => {
        const limit = getProductLimit(formData.plan || 'Free');
        if (formData.products.length < limit) {
            setFormData({ ...formData, products: [...formData.products, { name: '', price: '' }] });
        } else {
            alert(`Seu plano permite apenas ${limit} produtos.`);
        }
    };

    const updateProduct = (index: number, field: 'name' | 'price', value: string) => {
        const newProducts = [...formData.products];
        newProducts[index][field] = value;
        setFormData({ ...formData, products: newProducts });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullDescription?.trim()) {
            alert("Por favor, preencha a descrição completa da empresa.");
            return;
        }
        if (formData.plan !== 'Free' && !hasPaidPlan) {
            alert("Por favor, efectue o pagamento do plano.");
            return;
        }
        if (formData.isFeatured && !hasPaidFeatured) {
            alert("Por favor, efectue o pagamento para destacar.");
            return;
        }
        onSubmit(formData);
    };

    const isEnterprise = formData.registrationType === 'enterprise';

    return (
        <div className="absolute inset-0 bg-white z-[60] overflow-y-auto p-6 pb-24 space-y-4 animate-in slide-in-from-right duration-200 ease-out shadow-2xl">
            {/* Header Section */}
            <div className="space-y-1 relative">
                <button
                    onClick={onClose}
                    className="absolute -top-2 -right-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                    <i className="fa-solid fa-circle-xmark text-xl"></i>
                </button>
                <h2 className="text-[20px] font-black text-[#1e293b] leading-tight">CADASTRO</h2>
                <p className="text-[11px] text-slate-400 leading-relaxed tracking-tighter">Seleccione o tipo de cadastro</p>
            </div>

            {/* Registration Animated Tabs */}
            <div className="relative bg-slate-100/50 p-1.5 rounded-lg flex gap-1 h-12 overflow-hidden">
                {/* Sliding Background */}
                <div
                    className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-orange-500/10 border border-orange-500 rounded-md transition-all duration-300 ease-out z-0`}
                    style={{
                        transform: `translateX(${isEnterprise ? '0' : '100%'})`,
                        left: isEnterprise ? '6px' : '0px'
                    }}
                />

                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, registrationType: 'enterprise' })}
                    className={`relative flex-1 rounded-md text-[10px] font-black uppercase transition-colors duration-300 z-10 flex items-center justify-center gap-2 ${isEnterprise ? 'text-orange-600' : 'text-emerald-700 hover:text-orange-500'}`}
                >
                    <i className="fa-solid fa-building text-xs"></i>
                    Empresa
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, registrationType: 'professional' })}
                    className={`relative flex-1 rounded-md text-[10px] font-black uppercase transition-colors duration-300 z-10 flex items-center justify-center gap-2 ${!isEnterprise ? 'text-orange-600' : 'text-emerald-700 hover:text-orange-500'}`}
                >
                    <i className="fa-solid fa-user-tie text-xs"></i>
                    Profissional
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Nome Field */}
                <div className="relative">
                    <i className={`fa-solid ${isEnterprise ? 'fa-building' : 'fa-user'} absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm`}></i>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-2.5 pl-11 rounded-lg text-[12px] text-slate-700 focus:border-emerald-400 outline-none transition-all shadow-sm"
                        placeholder={isEnterprise ? "Nome da Empresa / Entidade" : "Nome Completo do Profissional"}
                    />
                </div>

                {/* Grid Logo (L) + Inputs (R) */}
                <div className="grid grid-cols-[110px_1fr] gap-3">
                    <div className="relative h-full">
                        <label className="flex flex-col items-center justify-center w-full h-full bg-white border border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all overflow-hidden">
                            {formData.logo ? (
                                <img src={formData.logo} className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <i className={`fa-solid ${isEnterprise ? 'fa-camera' : 'fa-id-badge'} text-slate-300 text-xl mb-1`}></i>
                                    <span className="text-[8px] font-black text-slate-400 uppercase text-center px-2 leading-tight">
                                        {isEnterprise ? 'Logo' : 'Foto'}
                                    </span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, logo: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>
                        {formData.logo && (
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, logo: '' })}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                            >
                                <i className="fa-solid fa-xmark text-[9px]"></i>
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="relative">
                            <i className="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[11px]"></i>
                            <input required type="tel" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full bg-white border border-slate-200 p-2.5 pl-9 rounded-lg text-[12px] focus:border-emerald-400 outline-none transition-all" placeholder="Telemóvel" />
                        </div>
                        <div className="relative">
                            <i className={`fa-solid ${isEnterprise ? 'fa-link' : 'fa-graduation-cap'} absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[11px]`}></i>
                            <select
                                required
                                value={formData.valueChain}
                                onChange={e => setFormData({ ...formData, valueChain: e.target.value as any })}
                                className="w-full bg-white border border-slate-200 p-2.5 pl-9 rounded-lg text-[12px] outline-none appearance-none focus:border-emerald-400 transition-all pr-8"
                            >
                                {isEnterprise ? (
                                    <>
                                        <option value="" disabled>Seleccione o sector</option>
                                        <option value="Consumidor">Consumidor</option>
                                        <option value="Produtor">Produtor</option>
                                        <option value="Fornecedor">Fornecedor</option>
                                        <option value="Serviços">Serviços</option>
                                        <option value="Agro-negócio">Agro-negócio</option>
                                        <option value="Outros">Outros</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="" disabled>Qualificação / Profissão</option>
                                        <option value="Engenheiro">Engenheiro</option>
                                        <option value="Agrónomo">Agrónomo</option>
                                        <option value="Técnico">Técnico</option>
                                        <option value="Agricultor">Agricultor</option>
                                        <option value="Pesquisador">Pesquisador</option>
                                        <option value="Extensionista">Extensionista</option>
                                    </>
                                )}
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-[9px] pointer-events-none"></i>
                        </div>
                        <div className="relative">
                            <i className="fa-solid fa-map-pin absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[11px]"></i>
                            <select
                                required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-white border border-slate-200 p-2.5 pl-9 rounded-lg text-[12px] outline-none appearance-none focus:border-emerald-400 transition-all pr-8"
                            >
                                <option value="" disabled>Província</option>
                                <option value="Niassa">Niassa</option>
                                <option value="Cabo Delgado">Cabo Delgado</option>
                                <option value="Nampula">Nampula</option>
                                <option value="Zambézia">Zambézia</option>
                                <option value="Tete">Tete</option>
                                <option value="Manica">Manica</option>
                                <option value="Sofala">Sofala</option>
                                <option value="Inhambane">Inhambane</option>
                                <option value="Gaza">Gaza</option>
                                <option value="Província de Maputo">Província de Maputo</option>
                                <option value="Cidade de Maputo">Cidade de Maputo</option>
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-[9px] pointer-events-none"></i>
                        </div>
                    </div>
                </div>

                {/* Additional Full Width Fields */}
                <div className="space-y-3">
                    <div className="relative">
                        <i className="fa-solid fa-location-arrow absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                        <input type="text" value={formData.geoLocation} onChange={e => setFormData({ ...formData, geoLocation: e.target.value })} className="w-full bg-white border border-slate-200 p-2.5 pl-11 rounded-lg text-[12px] focus:border-emerald-400 outline-none transition-all shadow-sm" placeholder="Endereço" />
                    </div>

                    <div className="relative">
                        <i className="fa-solid fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white border border-slate-200 p-2.5 pl-11 rounded-lg text-[12px] focus:border-emerald-400 outline-none transition-all shadow-sm" placeholder="E-mail" />
                    </div>

                    <div className="relative">
                        <i className="fa-solid fa-briefcase absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                        <input
                            required
                            type="text"
                            value={formData.activity}
                            onChange={e => setFormData({ ...formData, activity: e.target.value })}
                            className="w-full bg-white border border-slate-200 p-2.5 pl-11 rounded-lg text-[12px] text-emerald-700 focus:border-emerald-400 outline-none transition-all shadow-sm"
                            placeholder={isEnterprise ? "Actividade Principal (Ex: Revenda de Sementes)" : "Especialidade Principal (Ex: Agrónomo)"}
                        />
                    </div>

                    <div className="relative">
                        <textarea rows={3} value={formData.fullDescription} onChange={e => setFormData({ ...formData, fullDescription: e.target.value })} className="w-full bg-white border border-slate-200 p-3 pt-3 rounded-lg text-[12px] focus:border-emerald-400 outline-none transition-all" placeholder={isEnterprise ? "Descrição da empresa..." : "Sobre o profissional..."} />
                    </div>
                </div>

                {/* Services Section */}
                <div className="space-y-3 pt-1">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">
                        {isEnterprise ? 'Serviços Prestados' : 'Serviços Especializados'}
                    </p>
                    <textarea
                        rows={7}
                        value={formData.services}
                        onChange={e => setFormData({ ...formData, services: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-3 rounded-lg text-[12px] focus:border-emerald-400 outline-none transition-all shadow-sm"
                        placeholder="Detalhes adicionais..."
                    />
                </div>

                {/* Products/Honoraries Section */}
                <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            {isEnterprise ? 'Catálogo' : 'Tabela de Honorários'}
                        </p>
                        {formData.plan !== 'Parceiro' && <button type="button" className="text-[9px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-md uppercase" onClick={() => alert("Contacte a nossa equipa para upgrade.")}>Upgrade</button>}
                    </div>
                    {formData.products.map((prod, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-2 animate-in fade-in duration-200">
                            <input required type="text" placeholder="Item" value={prod.name} onChange={e => updateProduct(idx, 'name', e.target.value)} className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs" />
                            <input required type="text" placeholder="Preço" value={prod.price} onChange={e => updateProduct(idx, 'price', e.target.value)} className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs text-[#10b981]" />
                        </div>
                    ))}
                    {formData.plan === 'Free' ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
                            <p className="text-[10px] text-slate-400 italic">O plano gratuito não permite registar produtos.</p>
                        </div>
                    ) : (
                        <button type="button" onClick={handleAddProductField} className="w-full py-3 border border-dashed border-slate-300 rounded-lg text-slate-400 text-[11px] font-black uppercase">
                            <i className="fa-solid fa-plus mr-1"></i> Adicionar
                        </button>
                    )}
                </div>

                {/* Billing Period Selection */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Período de Facturação</p>
                    <div className="grid grid-cols-2 gap-2">
                        {(['monthly', 'annual'] as BillingPeriod[]).map(period => (
                            <button
                                key={period}
                                type="button"
                                onClick={() => { setFormData({ ...formData, billingPeriod: period }); setHasPaidPlan(false); }}
                                className={`p-2.5 rounded-lg border text-[11px] font-bold transition-all ${formData.billingPeriod === period ? 'bg-[#1e293b] border-slate-800 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                {period === 'monthly' ? 'MENSAL' : 'ANUAL (-17%)'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plans Selection */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Escolha seu Plano</p>
                    <div className="grid grid-cols-2 gap-2">
                        {(['Free', 'Básico', 'Premium', 'Parceiro'] as PlanType[]).map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => { setFormData({ ...formData, plan: p, products: [] }); setHasPaidPlan(false); }}
                                className={`p-2.5 rounded-lg border text-[12px] uppercase flex flex-col items-center gap-0.5 transition-all ${formData.plan === p ? 'bg-orange-500 border-orange-400 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                <span className="font-bold">{p}</span>
                                <span className="opacity-70 text-[11px] font-normal">
                                    {p === 'Free' ? '0 MT' : `${formatCurrency(getPlanPrice(p, formData.billingPeriod || 'monthly'))} MT`}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Featured (Destaque) Section */}
                <div className="px-1">
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg relative overflow-hidden group">
                        <i className="fa-solid fa-star absolute -right-2 -top-2 text-orange-200/50 text-5xl rotate-12 transition-transform group-hover:scale-110"></i>
                        <div className="relative flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="text-[12px] font-black text-orange-600 uppercase tracking-wider">Destacar Empresa</h4>
                                <p className="text-[10px] text-orange-700/60 leading-tight pr-8">Apareça no topo dos resultados e ganhe 5x mais visibilidade no mercado nacional.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setFormData({ ...formData, isFeatured: !formData.isFeatured }); setHasPaidFeatured(false); }}
                                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${formData.isFeatured ? 'bg-orange-500' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.isFeatured ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        {formData.isFeatured && (
                            <div className="mt-3 pt-3 border-t border-orange-100 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-orange-600 uppercase">Custo Adicional</span>
                                <span className="text-[11px] font-black text-orange-600">{formatCurrency(FEATURED_PRICE)} MT /mês</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary & Submit */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                    {/* Subscription Summary / Calculator */}
                    {formData.plan !== 'Free' && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="bg-[#1e293b] p-3">
                                <h3 className="text-white text-[10px] font-black uppercase tracking-widest text-center">Resumo da Facturação</h3>
                            </div>
                            <div className="p-4 space-y-2">
                                <div className="flex justify-between text-[11px] text-slate-500">
                                    <span>Plano {formData.plan} ({formData.billingPeriod === 'monthly' ? 'Mensal' : 'Anual'})</span>
                                    <span className="font-bold text-slate-700">{formatCurrency(getPlanPrice(formData.plan!, formData.billingPeriod || 'monthly'))} MT</span>
                                </div>
                                {formData.isFeatured && (
                                    <div className="flex justify-between text-[11px] text-slate-500">
                                        <span>Destaque Premium</span>
                                        <span className="font-bold text-slate-700">{formatCurrency(FEATURED_PRICE)} MT</span>
                                    </div>
                                )}
                                <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
                                    <span className="text-[12px] font-black text-slate-800 uppercase">Total Geral</span>
                                    <span className="text-lg font-black text-[#10b981]">
                                        {formatCurrency(getPlanPrice(formData.plan!, formData.billingPeriod || 'monthly') + (formData.isFeatured ? FEATURED_PRICE : 0))} MT
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Option */}
                    {((formData.plan !== 'Free' && !hasPaidPlan) || (formData.isFeatured && !hasPaidFeatured)) && (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                {(['mpesa', 'emola', 'banco'] as const).map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setPaymentMethod(m)}
                                        className={`flex-1 py-2 rounded-lg border text-[9px] font-black uppercase transition-all ${paymentMethod === m ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>


                            {(paymentMethod === 'mpesa' || paymentMethod === 'emola') && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Número para pagamento</label>
                                    <div className="relative">
                                        <i className="fa-solid fa-mobile-screen absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                                        <input
                                            type="tel"
                                            value={paymentPhone}
                                            onChange={e => setPaymentPhone(e.target.value)}
                                            className="w-full bg-white border border-slate-200 p-3 pl-11 rounded-lg text-xs focus:border-emerald-400 outline-none transition-all shadow-sm"
                                            placeholder={paymentMethod === 'mpesa' ? "Ex: 84 / 85..." : "Ex: 86 / 87..."}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!paymentPhone) {
                                                alert("Por favor, introduza o número de telemóvel.");
                                                return;
                                            }
                                            setIsPaymentProcessing(true);
                                            setTimeout(() => {
                                                setIsPaymentProcessing(false);
                                                setHasPaidPlan(true);
                                                setHasPaidFeatured(true);
                                                const finalData = {
                                                    ...formData,
                                                    paymentMethod,
                                                    paymentPhone,
                                                    plan: formData.plan,
                                                    isFeatured: formData.isFeatured
                                                } as CompanyDetail;
                                                onSubmit(finalData);
                                            }, 1500);
                                        }}
                                        disabled={isPaymentProcessing}
                                        className="w-full py-4 bg-[#10b981] text-white rounded-lg font-black text-[11px] uppercase shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isPaymentProcessing ? (
                                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        ) : (
                                            <i className="fa-solid fa-check-double rotate-3"></i>
                                        )}
                                        {isPaymentProcessing ? 'A VALIDAR...' : `PAGAR VIA ${paymentMethod.toUpperCase()}`}
                                    </button>
                                </div>
                            )}

                            {paymentMethod === 'banco' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Dados Bancários / Transferência</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="relative">
                                            <i className="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                                            <input
                                                type="text"
                                                placeholder="Titular da Conta"
                                                value={bankDetails.holder}
                                                onChange={e => setBankDetails({ ...bankDetails, holder: e.target.value })}
                                                className="w-full bg-white border border-slate-200 p-2.5 pl-11 rounded-lg text-xs focus:border-emerald-400 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="relative">
                                            <i className="fa-solid fa-building-columns absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                                            <input
                                                type="text"
                                                placeholder="Nome do Banco"
                                                value={bankDetails.bankName}
                                                onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                                className="w-full bg-white border border-slate-200 p-2.5 pl-11 rounded-lg text-xs focus:border-emerald-400 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="NIB"
                                                value={bankDetails.nib}
                                                onChange={e => setBankDetails({ ...bankDetails, nib: e.target.value })}
                                                className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-xs focus:border-emerald-400 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Agência"
                                                value={bankDetails.agency}
                                                onChange={e => setBankDetails({ ...bankDetails, agency: e.target.value })}
                                                className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-xs focus:border-emerald-400 outline-none transition-all shadow-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="IBAN"
                                                value={bankDetails.iban}
                                                onChange={e => setBankDetails({ ...bankDetails, iban: e.target.value })}
                                                className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-xs focus:border-emerald-400 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!bankDetails.holder || !bankDetails.bankName || !bankDetails.nib) {
                                                alert("Por favor, preencha os dados bancários obrigatórios (Titular, Banco e NIB).");
                                                return;
                                            }
                                            setIsPaymentProcessing(true);
                                            setTimeout(() => {
                                                setIsPaymentProcessing(false);
                                                setHasPaidPlan(true);
                                                setHasPaidFeatured(true);
                                                const finalData = {
                                                    ...formData,
                                                    paymentMethod: 'banco' as const,
                                                    plan: formData.plan,
                                                    isFeatured: formData.isFeatured,
                                                    bankDetails
                                                } as any;
                                                onSubmit(finalData);
                                            }, 1500);
                                        }}
                                        disabled={isPaymentProcessing}
                                        className="w-full py-4 bg-emerald-600 text-white rounded-lg font-black text-[11px] uppercase shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isPaymentProcessing ? (
                                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        ) : (
                                            <i className="fa-solid fa-file-invoice-dollar rotate-3"></i>
                                        )}
                                        {isPaymentProcessing ? 'A VALIDAR...' : 'CONFIRMAR TRANSFERÊNCIA'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={(formData.plan !== 'Free' && !hasPaidPlan) || (formData.isFeatured && !hasPaidFeatured)}
                        className="w-full bg-[#1e293b] hover:bg-orange-500 text-white py-4 rounded-lg font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-30"
                    >
                        Publicar Registo
                    </button>
                </div>
            </form>

            {showReceipt && (
                <InvoiceReceipt
                    company={{
                        ...formData,
                        paymentMethod,
                        paymentPhone
                    } as CompanyDetail}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </div>
    );
};

export default CompanyForm;
