import React, { useState } from 'react';
import { CompanyDetail, PlanType, BillingPeriod } from '../../types';
import { formatCurrency, compressImage } from '../../utils';
import InvoiceReceipt from './InvoiceReceipt';

interface CompanyFormProps {
    initialData?: CompanyDetail;
    onSubmit: (company: CompanyDetail) => void;
    onClose: () => void;
    onAlert?: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
    onSwitchToProfessional?: () => void;
    user?: any;
}

import { databaseService } from '../../services/databaseService';

// Preços mensais base
const MONTHLY_PRICES: Record<string, number> = {
    'Free': 0,
    'Gratuito': 0,
    'Básico': 500,
    'Premium': 1500,
    'Parceiro': 5000
};

// Desconto anual (2 meses grátis = ~17% desconto)
const ANNUAL_DISCOUNT = 0.17;
const FEATURED_PRICE = 1000;

const getPlanPrice = (plan: string, billingPeriod: BillingPeriod): number => {
    // Normalize plan name to match keys if necessary, or just use the plan name from DB if it matches
    const price = MONTHLY_PRICES[plan] || 0;
    if (billingPeriod === 'annual') {
        return Math.round(price * 12 * (1 - ANNUAL_DISCOUNT));
    }
    return price;
};

const getProductLimit = (planName: string): number => {
    // Assuming plans content is standardized, or map DB names to these keys
    if (planName.toLowerCase().includes('parceiro')) return Infinity;
    if (planName.toLowerCase().includes('premium')) return 50;
    if (planName.toLowerCase().includes('básico')) return 10;
    return 3;
};

const CompanyForm: React.FC<CompanyFormProps> = ({ initialData, onSubmit, onClose, onAlert, onSwitchToProfessional, user }) => {
    const [plans, setPlans] = useState<any[]>([]);

    // Fetch plans from DB
    React.useEffect(() => {
        databaseService.getPlans().then(setPlans).catch(console.error);
    }, []);

    const [formData, setFormData] = useState<CompanyDetail>(() => {
        if (initialData) {
            return {
                ...initialData,
                registrationType: initialData.registrationType || 'enterprise'
            };
        }
        return {
            registrationType: 'enterprise',
            name: user?.name || '',
            email: user?.email || '',
            contact: '',
            activity: '',
            location: '',
            geoLocation: '',
            valueChain: 'Consumidor',
            logo: user?.avatar_url || '',
            fullDescription: '',
            services: '',
            products: [],
            plan: 'Gratuito', // Default to 'Gratuito' which matches DB name usually, or map it
            billingPeriod: 'monthly',
            isFeatured: false
        };
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
        const plan = formData.plan || 'Free';

        // Removed Free plan block

        const limit = getProductLimit(plan);
        if (formData.products.length < limit) {
            setFormData({ ...formData, products: [...formData.products, { name: '', price: '', photo: '', description: '', available: true }] });
        } else {
            onAlert?.('Limite Atingido', `Seu plano permite apenas ${limit} produtos.`, 'info');
        }
    };

    const updateProduct = (index: number, field: 'name' | 'price' | 'photo' | 'description', value: string) => {
        const newProducts = [...formData.products];
        newProducts[index][field] = value;
        setFormData({ ...formData, products: newProducts });
    };

    const toggleProductAvailability = (index: number) => {
        const newProducts = [...formData.products];
        newProducts[index].available = !newProducts[index].available;
        setFormData({ ...formData, products: newProducts });
    };

    const removeProduct = (index: number) => {
        const newProducts = formData.products.filter((_, i) => i !== index);
        setFormData({ ...formData, products: newProducts });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim()) { onAlert?.('Atenção', "Por favor, preencha o nome.", 'info'); return; }
        if (!formData.email?.trim()) { onAlert?.('Atenção', "Por favor, preencha o email.", 'info'); return; }
        if (!formData.contact?.trim()) { onAlert?.('Atenção', "Por favor, preencha o contacto.", 'info'); return; }
        if (!formData.activity?.trim()) { onAlert?.('Atenção', "Por favor, preencha a actividade.", 'info'); return; }
        if (!formData.location?.trim()) { onAlert?.('Atenção', "Por favor, preencha a localização.", 'info'); return; }
        if (!formData.fullDescription?.trim()) {
            onAlert?.('Atenção', "Por favor, preencha a descrição completa da empresa.", 'info');
            return;
        }
        if (formData.plan !== 'Free' && !hasPaidPlan) {
            onAlert?.('Atenção', "Por favor, efectue o pagamento do plano.", 'info');
            return;
        }
        if (formData.isFeatured && !hasPaidFeatured) {
            onAlert?.('Atenção', "Por favor, efectue o pagamento para destacar.", 'info');
            return;
        }
        onSubmit(formData);
    };

    const isEnterprise = formData.registrationType === 'enterprise';

    return (
        <div className="absolute inset-0 bg-white dark:bg-[#1a1f2c] z-[60] overflow-y-auto p-6 pb-24 space-y-4 animate-in slide-in-from-right duration-200 ease-out shadow-2xl">
            {/* Header Section */}
            <div className="space-y-1 relative">
                <button
                    onClick={onClose}
                    className="absolute -top-2 -right-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                    <i className="fa-solid fa-circle-xmark text-xl"></i>
                </button>
                <h2 className="text-[20px] font-black text-[#1e293b] dark:text-white leading-tight">CADASTRO</h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed tracking-tighter">Seleccione o tipo de cadastro</p>
            </div>

            {/* Registration Animated Tabs */}
            <div className="relative bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-[12px] flex gap-1 h-12 overflow-hidden">
                {/* Sliding Background */}
                <div
                    className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-orange-500/10 border border-orange-500 rounded-[12px] transition-all duration-300 ease-out z-0`}
                    style={{
                        transform: `translateX(${isEnterprise ? '0' : '100%'})`,
                        left: isEnterprise ? '6px' : '0px'
                    }}
                />

                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, registrationType: 'enterprise' })}
                    className={`relative flex-1 rounded-[12px] text-[10px] font-black uppercase transition-colors duration-300 z-10 flex items-center justify-center gap-2 ${isEnterprise ? 'text-orange-600' : 'text-emerald-700 hover:text-orange-500'}`}
                >
                    <i className="fa-solid fa-building text-xs"></i>
                    Empresa
                </button>
                <button
                    type="button"
                    onClick={() => onSwitchToProfessional?.()}
                    className={`relative flex-1 rounded-[12px] text-[10px] font-black uppercase transition-colors duration-300 z-10 flex items-center justify-center gap-2 ${!isEnterprise ? 'text-orange-600' : 'text-emerald-700 hover:text-orange-500'}`}
                >
                    <i className="fa-solid fa-user-tie text-xs"></i>
                    Profissional
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Nome Field */}
                <div className="relative">
                    <i className={`fa-solid ${isEnterprise ? 'fa-building' : 'fa-user'} absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-sm`}></i>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-2.5 pl-11 rounded-[12px] text-[12px] text-slate-700 dark:text-slate-100 focus:border-emerald-400 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        placeholder={isEnterprise ? "Nome da Empresa / Entidade" : "Nome Completo do Profissional"}
                    />
                </div>

                {/* Grid Logo (L) + Inputs (R) */}
                <div className="grid grid-cols-[110px_1fr] gap-3">
                    <div className="relative h-full">
                        <label className="flex flex-col items-center justify-center w-full h-full bg-white dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700/50 rounded-[12px] cursor-pointer hover:border-orange-400 hover:bg-orange-950/20 transition-all overflow-hidden">
                            {formData.logo ? (
                                <img src={formData.logo} className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <i className={`fa-solid ${isEnterprise ? 'fa-camera' : 'fa-id-badge'} text-slate-300 dark:text-slate-600 text-xl mb-1`}></i>
                                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase text-center px-2 leading-tight">
                                        {isEnterprise ? 'Logo' : 'Foto'}
                                    </span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        try {
                                            const compressedBlob = await compressImage(file);
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, logo: reader.result as string });
                                            };
                                            reader.readAsDataURL(compressedBlob);
                                        } catch (err) {
                                            console.error("Erro ao processar imagem:", err);
                                            // Fallback to original file if compression fails
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, logo: reader.result as string });
                                            };
                                            reader.readAsDataURL(file);
                                        }
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
                            <i className="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-[11px]"></i>
                            <input required type="tel" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-2.5 pl-9 rounded-[12px] text-[12px] dark:text-slate-100 focus:border-emerald-400 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="Telemóvel" />
                        </div>
                        <div className="relative">
                            <i className={`fa-solid ${isEnterprise ? 'fa-link' : 'fa-graduation-cap'} absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-[11px]`}></i>
                            <select
                                required
                                value={formData.valueChain}
                                onChange={e => setFormData({ ...formData, valueChain: e.target.value as any })}
                                className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-2.5 pl-9 rounded-[12px] text-[12px] dark:text-slate-100 outline-none appearance-none focus:border-emerald-400 transition-all pr-8"
                            >
                                {isEnterprise ? (
                                    <>
                                        <option value="" disabled>Seleccione o sector</option>
                                        <option value="Consumidores">Consumidores</option>
                                        <option value="Produtores">Produtores</option>
                                        <option value="Fornecedores">Fornecedores</option>
                                        <option value="Maquinaria">Maquinaria</option>
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
                            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-[9px] pointer-events-none"></i>
                        </div>

                    </div>
                </div>

                {/* Additional Full Width Fields */}
                <div className="space-y-3">
                    <div className="relative">
                        <i className="fa-solid fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-sm"></i>
                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-2.5 pl-11 rounded-[12px] text-[12px] dark:text-slate-100 focus:border-emerald-400 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="E-mail" />
                    </div>

                    <div className="relative">
                        <i className="fa-solid fa-location-arrow absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-sm"></i>
                        <input type="text" value={formData.geoLocation} onChange={e => setFormData({ ...formData, geoLocation: e.target.value })} className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-2.5 pl-11 rounded-[12px] text-[12px] dark:text-slate-100 focus:border-emerald-400 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="Endereço" />
                    </div>

                    <div className="relative">
                        <i className="fa-solid fa-map-pin absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-sm"></i>
                        <select
                            required
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-2.5 pl-11 rounded-[12px] text-[12px] dark:text-slate-100 outline-none appearance-none focus:border-emerald-400 transition-all pr-8 shadow-sm"
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
                        <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-[10px] pointer-events-none"></i>
                    </div>

                    <div className="relative">
                        <i className="fa-solid fa-briefcase absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-sm"></i>
                        <input
                            required
                            type="text"
                            value={formData.activity}
                            onChange={e => setFormData({ ...formData, activity: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-2.5 pl-11 rounded-[12px] text-[12px] text-emerald-700 dark:text-emerald-400 focus:border-emerald-400 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            placeholder={isEnterprise ? "Actividade Principal (Ex: Revenda de Sementes)" : "Especialidade Principal (Ex: Agrónomo)"}
                        />
                    </div>

                    <div className="relative">
                        <textarea rows={3} value={formData.fullDescription} onChange={e => setFormData({ ...formData, fullDescription: e.target.value })} className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 pt-3 rounded-[12px] text-[12px] dark:text-slate-100 focus:border-emerald-400 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder={isEnterprise ? "Descrição da empresa..." : "Sobre o profissional..."} />
                    </div>
                </div>

                {/* Services Section */}
                <div className="space-y-3 pt-3">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-[12px] flex items-center justify-center">
                            <i className="fa-solid fa-handshake-angle text-xs"></i>
                        </div>
                        <p className="text-[10px] font-black text-[#1e293b] dark:text-slate-100 uppercase tracking-widest">
                            {isEnterprise ? 'Nossos Serviços' : 'Meus Serviços'}
                        </p>
                    </div>
                    <div className="relative">
                        <textarea
                            rows={4}
                            value={formData.services}
                            onChange={e => setFormData({ ...formData, services: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-4 rounded-[12px] text-[12px] dark:text-slate-100 focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            placeholder="Descreva detalhadamente o que oferece (ex: Consultoria, Venda, Aluguer...)"
                        />
                    </div>
                </div>

                {/* Products Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-50 text-orange-500 rounded-[12px] flex items-center justify-center">
                                <i className="fa-solid fa-boxes-stacked text-xs"></i>
                            </div>
                            <p className="text-[10px] font-black text-[#1e293b] dark:text-slate-100 uppercase tracking-widest">
                                {isEnterprise ? 'Catálogo de Produtos' : 'Preçário / Honorários'}
                            </p>
                        </div>
                        {formData.plan !== 'Parceiro' && (
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-[12px]">
                                {formData.products.length} / {formData.plan === 'Free' ? '0' : getProductLimit(formData.plan || 'Free')}
                            </span>
                        )}
                    </div>
                    {formData.products.map((prod, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[12px] p-3 space-y-3 animate-in fade-in duration-200">
                            {/* Product Header with Remove Button */}
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Produto #{idx + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => removeProduct(idx)}
                                    className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <i className="fa-solid fa-trash text-[10px]"></i>
                                </button>
                            </div>

                            {/* Product Photo */}
                            <div className="relative">
                                <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700/50 rounded-[12px] cursor-pointer hover:border-orange-400 hover:bg-orange-950/20 transition-all overflow-hidden">
                                    {prod.photo ? (
                                        <img src={prod.photo} className="w-full h-full object-cover" alt="Produto" />
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-camera text-slate-300 dark:text-slate-600 text-2xl mb-1"></i>
                                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Foto do Produto</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                try {
                                                    const compressedBlob = await compressImage(file);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        updateProduct(idx, 'photo', reader.result as string);
                                                    };
                                                    reader.readAsDataURL(compressedBlob);
                                                } catch (err) {
                                                    console.error("Erro ao processar imagem do produto:", err);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        updateProduct(idx, 'photo', reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }
                                        }}
                                    />
                                </label>
                                {prod.photo && (
                                    <button
                                        type="button"
                                        onClick={() => updateProduct(idx, 'photo', '')}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <i className="fa-solid fa-xmark text-[9px]"></i>
                                    </button>
                                )}
                            </div>

                            {/* Product Name and Price */}
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    required
                                    type="text"
                                    placeholder="Nome do Produto"
                                    value={prod.name}
                                    onChange={e => updateProduct(idx, 'name', e.target.value)}
                                    className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 p-2.5 rounded-[12px] text-[10px] dark:text-slate-100 focus:border-emerald-400 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                                <input
                                    type="text"
                                    placeholder="Preço (MT)"
                                    value={prod.price}
                                    onChange={e => updateProduct(idx, 'price', e.target.value)}
                                    className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 p-2.5 rounded-[12px] text-[11px] text-emerald-600 dark:text-emerald-400 font-bold focus:border-emerald-400 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                            </div>

                            {/* Product Description */}
                            <textarea
                                placeholder="Descrição do produto..."
                                value={prod.description}
                                onChange={e => updateProduct(idx, 'description', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 p-2.5 rounded-[12px] text-[11px] dark:text-slate-100 focus:border-emerald-400 outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                rows={2}
                            />

                            {/* Availability Switcher */}
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-600">Disponibilidade</p>
                                    <p className="text-[9px] text-slate-400">{prod.available !== false ? 'Disponível' : 'Indisponível'}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toggleProductAvailability(idx)}
                                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${prod.available !== false ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${prod.available !== false ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {/* Button enabled for all plans now (within limits) */}
                    <button
                        type="button"
                        onClick={handleAddProductField}
                        className={`w-full py-3 border border-dashed rounded-[12px] text-[11px] font-black uppercase transition-all ${formData.products.length >= getProductLimit(formData.plan || 'Free')
                            ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                            : 'border-slate-300 text-slate-400 hover:border-orange-400 hover:text-orange-500'
                            }`}
                        disabled={formData.products.length >= getProductLimit(formData.plan || 'Free')}
                    >
                        <i className="fa-solid fa-plus mr-1"></i> Adicionar
                    </button>
                </div>

                {/* Billing Period Selection */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Período de Facturação</p>
                    <div className="grid grid-cols-2 gap-2">
                        {(['monthly', 'annual'] as BillingPeriod[]).map(period => (
                            <button
                                key={period}
                                type="button"
                                onClick={() => { setFormData({ ...formData, billingPeriod: period }); setHasPaidPlan(false); }}
                                className={`p-2.5 rounded-[12px] border text-[11px] font-bold transition-all ${formData.billingPeriod === period ? 'bg-[#1e293b] dark:bg-emerald-600 border-slate-800 dark:border-emerald-500 text-white shadow-md' : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400'}`}
                            >
                                {period === 'monthly' ? 'MENSAL' : 'ANUAL (-17%)'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plans Selection */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Escolha seu Plano</p>
                    <div className="grid grid-cols-2 gap-2">
                        {plans.length > 0 ? (
                            plans.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        const isPartner = p.name === 'Parceiro';
                                        setFormData({
                                            ...formData,
                                            plan: p.name,
                                            isFeatured: isPartner
                                        });
                                        setHasPaidPlan(false);
                                        if (isPartner) setHasPaidFeatured(true);
                                    }}
                                    className={`p-2.5 rounded-[12px] border text-[12px] uppercase flex flex-col items-center gap-0.5 transition-all ${formData.plan === p.name ? 'bg-orange-500 border-orange-400 text-white shadow-md' : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400'}`}
                                >
                                    <span className="font-bold">{p.name}</span>
                                    <span className="opacity-70 text-[11px] font-normal">
                                        {p.price}
                                    </span>
                                    <span className="opacity-60 text-[9px] font-medium mt-0.5">
                                        {getProductLimit(p.name)} produtos
                                    </span>
                                </button>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 col-span-2 text-center p-4">A carregar planos...</p>
                        )}
                    </div>
                </div>

                {/* Featured (Destaque) Section */}
                <div className="px-1">
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900 rounded-[12px] relative overflow-hidden group">
                        <i className="fa-solid fa-star absolute -right-2 -top-2 text-orange-200/50 text-5xl rotate-12 transition-transform group-hover:scale-110"></i>
                        <div className="relative flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="text-[12px] font-black text-orange-600 uppercase tracking-wider">Destacar Empresa</h4>
                                <p className="text-[10px] text-orange-700/60 leading-tight pr-8">
                                    {formData.plan === 'Parceiro'
                                        ? 'Destaque Premium incluído no plano Parceiro!'
                                        : formData.plan === 'Free'
                                            ? 'Apareça no topo dos resultados e ganhe 5x mais visibilidade.'
                                            : 'Adicione destaque premium por apenas 1.000 MT/mês extra.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={formData.plan === 'Parceiro'}
                                onClick={() => { setFormData({ ...formData, isFeatured: !formData.isFeatured }); setHasPaidFeatured(false); }}
                                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${formData.isFeatured ? 'bg-orange-500' : 'bg-slate-200'} ${formData.plan === 'Parceiro' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.isFeatured ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        {formData.isFeatured && (formData.plan === 'Free' || formData.plan === 'Básico' || formData.plan === 'Premium') && (
                            <div className="mt-3 pt-3 border-t border-orange-100 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-orange-600 uppercase">Taxa de Destaque</span>
                                <span className="text-[11px] font-black text-orange-600">{formatCurrency(FEATURED_PRICE)} MT /mês</span>
                            </div>
                        )}
                        {formData.isFeatured && formData.plan === 'Parceiro' && (
                            <div className="mt-3 pt-3 border-t border-orange-100 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Benefício do Plano</span>
                                <span className="text-[11px] font-black text-emerald-600">INCLUÍDO</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary & Submit */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    {/* Subscription Summary / Calculator */}
                    {formData.plan !== 'Free' && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-[12px] overflow-hidden shadow-sm">
                            <div className="bg-[#1e293b] dark:bg-emerald-900/40 p-3">
                                <h3 className="text-white text-[10px] font-black uppercase tracking-widest text-center">Resumo da Facturação</h3>
                            </div>
                            <div className="p-4 space-y-2">
                                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                    <span>Plano {formData.plan} ({formData.billingPeriod === 'monthly' ? 'Mensal' : 'Anual'})</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(getPlanPrice(formData.plan!, formData.billingPeriod || 'monthly'))} MT</span>
                                </div>
                                {formData.isFeatured && formData.plan !== 'Parceiro' && (
                                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                        <span>Destaque Premium</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(FEATURED_PRICE)} MT</span>
                                    </div>
                                )}
                                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                    <span className="text-[12px] font-black text-slate-800 dark:text-slate-100 uppercase">Total Geral</span>
                                    <span className="text-lg font-black text-[#10b981]">
                                        {formatCurrency(
                                            getPlanPrice(formData.plan!, formData.billingPeriod || 'monthly') +
                                            (formData.isFeatured && formData.plan !== 'Parceiro' ? FEATURED_PRICE : 0)
                                        )} MT
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
                                        className={`flex-1 py-2 rounded-[12px] border text-[9px] font-black uppercase transition-all ${paymentMethod === m ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-400 dark:text-slate-600'}`}
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
                                            className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 p-3 pl-11 rounded-[12px] text-xs dark:text-slate-100 focus:border-emerald-400 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
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
                                                setHasPaidFeatured(true); // Assuming featured is also paid if included
                                                onAlert?.('Sucesso', "Pagamento confirmado! Pode agora finalizar o registo.", 'success');
                                            }, 1500);
                                        }}
                                        disabled={isPaymentProcessing}
                                        className="w-full py-4 bg-[#10b981] text-white rounded-[12px] font-black text-[11px] uppercase shadow-xl shadow-emerald-100 dark:shadow-none flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
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
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 pl-11 rounded-[12px] text-xs dark:text-slate-100 focus:border-emerald-400 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="relative">
                                            <i className="fa-solid fa-building-columns absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                                            <input
                                                type="text"
                                                placeholder="Nome do Banco"
                                                value={bankDetails.bankName}
                                                onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 pl-11 rounded-[12px] text-xs dark:text-slate-100 focus:border-emerald-400 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="NIB"
                                                value={bankDetails.nib}
                                                onChange={e => setBankDetails({ ...bankDetails, nib: e.target.value })}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-[12px] text-xs dark:text-slate-100 focus:border-emerald-400 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Agência"
                                                value={bankDetails.agency}
                                                onChange={e => setBankDetails({ ...bankDetails, agency: e.target.value })}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-[12px] text-xs dark:text-slate-100 focus:border-emerald-400 outline-none transition-all shadow-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="IBAN"
                                                value={bankDetails.iban}
                                                onChange={e => setBankDetails({ ...bankDetails, iban: e.target.value })}
                                                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 p-2.5 rounded-[12px] text-xs dark:text-slate-100 focus:border-emerald-400 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
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
                                                onAlert?.('Sucesso', "Comprovativo enviado! Pode agora finalizar o registo.", 'success');
                                            }, 1500);
                                        }}
                                        disabled={isPaymentProcessing}
                                        className="w-full py-4 bg-emerald-600 text-white rounded-[12px] font-black text-[11px] uppercase shadow-xl shadow-emerald-100 dark:shadow-none flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
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

                    {((formData.plan === 'Free') || (hasPaidPlan && (!formData.isFeatured || hasPaidFeatured))) && (
                        <button
                            type="submit"
                            className="w-full bg-[#1e293b] dark:bg-emerald-600 hover:bg-orange-500 text-white py-4 rounded-[12px] font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 dark:hover:bg-emerald-500"
                        >
                            {formData.plan === 'Free' ? 'Publicar Registo Gratuito' : 'Finalizar e Publicar'}
                        </button>
                    )}
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
