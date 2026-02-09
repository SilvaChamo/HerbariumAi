import React from 'react';
import { CompanyDetail } from '../../types';
import { formatCurrency } from '../../utils';

interface InvoiceReceiptProps {
    company: CompanyDetail;
    onClose: () => void;
}

const InvoiceReceipt: React.FC<InvoiceReceiptProps> = ({ company, onClose }) => {
    const today = new Date().toLocaleDateString('pt-MZ');
    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    const getPlanPrice = () => {
        if (!company.plan || company.plan === 'Free') return 0;
        const prices: Record<string, number> = {
            'Básico': 500,
            'Premium': 1500,
            'Parceiro': 5000
        };
        const base = prices[company.plan] || 0;
        return company.billingPeriod === 'annual' ? base * 12 * 0.83 : base;
    };

    const planPrice = getPlanPrice();
    const featuredPrice = company.isFeatured ? 1000 : 0;
    const total = planPrice + featuredPrice;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-[10px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                {/* Receipt Header */}
                <div className="bg-emerald-500 p-8 text-white text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <i className="fa-solid fa-file-invoice-dollar text-[#10b981] text-2xl"></i>
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-widest">Recibo de Pagamento</h2>
                    <p className="text-emerald-100 text-[10px] font-bold mt-1 opacity-80">{invoiceNumber}</p>
                </div>

                {/* Receipt Body */}
                <div className="p-8 space-y-6 relative">
                    {/* Decorative Notch/Cutout effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-4 h-4 rounded-full bg-white dark:bg-slate-900" />
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">Emitido para</p>
                                <p className="font-bold text-[#1e293b] dark:text-slate-100">{company.name}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">{company.email}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">Data</p>
                                <p className="font-bold text-[#1e293b] dark:text-slate-100">{today}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-dashed border-slate-100 space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">
                                    Plano {company.plan} ({company.billingPeriod === 'monthly' ? 'Mensal' : 'Anual'})
                                </span>
                                <span className="font-bold text-slate-700 dark:text-slate-100">{formatCurrency(planPrice)} MT</span>
                            </div>
                            {company.isFeatured && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Destaque de Mercado</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-100">{formatCurrency(1000)} MT</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-dashed border-slate-100 space-y-2">
                            <div className="flex justify-between text-[10px] uppercase font-black text-slate-400">
                                <span>Método de Pagamento</span>
                                <span className="text-slate-600">{company.paymentMethod?.toUpperCase() || 'N/A'}</span>
                            </div>
                            {company.paymentPhone && (
                                <div className="flex justify-between text-[10px] items-center">
                                    <span className="text-slate-400 font-bold uppercase">Contacto Utilizado</span>
                                    <span className="text-slate-600 font-bold px-2 py-0.5 bg-slate-50 rounded border border-slate-100">
                                        <i className="fa-solid fa-mobile-screen mr-1 text-[8px]"></i>
                                        {company.paymentPhone}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t-2 border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <span className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Pago Total</span>
                            <span className="text-xl font-black text-[#10b981]">{formatCurrency(total)} MT</span>
                        </div>
                    </div>

                    {/* Status Stamp */}
                    <div className="pt-6 text-center">
                        <div className="inline-block px-4 py-1.5 border-2 border-emerald-500 rounded-lg -rotate-6">
                            <span className="text-emerald-500 font-black text-sm uppercase tracking-widest">PAGO</span>
                        </div>
                    </div>

                    <div className="pt-6 text-center">
                        <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">
                            Obrigado por escolher o Botânica.<br />
                            Conserve este recibo para seus arquivos.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-print"></i> Imprimir
                    </button>
                    <button
                        className="flex-1 py-3 bg-[#10b981] text-white rounded-lg text-[10px] font-black uppercase shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-share-nodes"></i> Partilhar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceReceipt;
