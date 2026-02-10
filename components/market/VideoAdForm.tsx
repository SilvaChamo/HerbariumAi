import React, { useState } from 'react';
import { CompanyDetail } from '../../types';
import InvoiceReceipt from './InvoiceReceipt';

interface VideoAdFormProps {
    onSubmit: (data: any) => void;
    onClose: () => void;
}

const VideoAdForm: React.FC<VideoAdFormProps> = ({ onSubmit, onClose }) => {
    const [step, setStep] = useState<'form' | 'payment'>('form');
    const [formData, setFormData] = useState({
        companyName: '',
        phone: '',
        address: '',
        videoLink: ''
    });

    const [paymentData, setPaymentData] = useState<any>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare mock payment data for the ad
        const adPayment = {
            companyName: formData.companyName,
            plan: 'Video Ad Spotlight',
            amount: 2000,
            billingPeriod: 'Uma vez',
            paymentMethod: 'mpesa', // Default for Mozambique
            isFeatured: true
        };

        setPaymentData(adPayment);
        setStep('payment');
    };

    if (step === 'payment') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
                <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[12px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                    <InvoiceReceipt
                        companyName={formData.companyName}
                        plan="Publicidade em Vídeo"
                        amount={2000}
                        billingPeriod="Spot Único"
                        onClose={onClose}
                        onConfirm={() => {
                            onSubmit(formData);
                            onClose();
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <form
                onSubmit={handleSubmit}
                className="relative w-full max-w-md bg-white dark:bg-[#1a1f2c] rounded-[12px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500 overflow-y-auto max-h-[90vh]"
            >
                <div className="p-8 pb-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Cadastrar Vídeo</h2>
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Spot Publicitário • 2.000 MT</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800/50 shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 transition-all border border-slate-100 dark:border-slate-700"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Nome da Empresa</label>
                            <input
                                required
                                type="text"
                                value={formData.companyName}
                                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="Ex: FarmMoz Lda"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-all dark:text-slate-100"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Telefone</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="84 / 85 / 82..."
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-all dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Endereço</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Ex: Maputo, Av. 24 Julho"
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-all dark:text-slate-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Link do Vídeo (YouTube)</label>
                            <div className="relative">
                                <i className="fa-brands fa-youtube absolute left-4 top-1/2 -translate-y-1/2 text-red-500 text-lg"></i>
                                <input
                                    required
                                    type="url"
                                    value={formData.videoLink}
                                    onChange={e => setFormData({ ...formData, videoLink: e.target.value })}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[12px] pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-all dark:text-slate-100"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-[12px] font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <span>Ir para Pagamento (2.000 MT)</span>
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/30 text-center">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                        <i className="fa-solid fa-shield-halved mr-1 text-emerald-500"></i> Pagamento Seguro & Verificado
                    </p>
                </div>
            </form>
        </div>
    );
};

export default VideoAdForm;
