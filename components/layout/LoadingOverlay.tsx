import React from 'react';

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message = 'Analisando...' }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center animate-in fade-in">
            <div className="w-16 h-16 border-[6px] border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin mb-6"></div>
            <p className="font-bold text-[#1e293b] text-lg tracking-tight uppercase">{message}</p>
        </div>
    );
};

export default LoadingOverlay;
