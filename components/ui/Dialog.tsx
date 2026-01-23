import React from 'react';

interface DialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, title, message, type = 'info', onClose }) => {
    if (!isOpen) return null;

    const icons = {
        success: <i className="fa-solid fa-circle-check text-emerald-500 text-3xl"></i>,
        error: <i className="fa-solid fa-circle-xmark text-red-500 text-3xl"></i>,
        info: <i className="fa-solid fa-circle-info text-blue-500 text-3xl"></i>
    };

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-white w-full max-w-[280px] rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col items-center p-8 text-center border border-slate-100">
                <div className="mb-4 bg-slate-50 w-16 h-16 rounded-[20px] flex items-center justify-center shadow-inner">
                    {icons[type]}
                </div>

                <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tight leading-tight">
                    {title}
                </h3>

                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 px-2">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className="w-full bg-[#10b981] hover:bg-emerald-600 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-50 active:scale-95 transition-all"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
};

export default Dialog;
