import React from 'react';

interface SkeletonProps {
    className?: string;
    count?: number;
}

export const SkeletonCard: React.FC<SkeletonProps> = ({ className = '', count = 3 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`bg-white border border-slate-100 rounded-[8px] p-4 flex gap-4 animate-pulse ${className}`}>
                    <div className="w-16 h-16 rounded-[8px] bg-slate-100 shrink-0" />
                    <div className="flex-1 space-y-3 py-1">
                        <div className="h-3 bg-slate-100 rounded-[8px] w-3/4" />
                        <div className="space-y-2">
                            <div className="h-2 bg-slate-100 rounded-[8px]" />
                            <div className="h-2 bg-slate-100 rounded-[8px] w-5/6" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export const SkeletonHeader: React.FC = () => (
    <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100" />
            <div className="space-y-2">
                <div className="h-2 bg-slate-100 rounded-[10px] w-12" />
                <div className="h-4 bg-slate-100 rounded-[10px] w-24" />
            </div>
        </div>
        <div className="w-20 h-6 rounded-full bg-slate-50" />
    </div>
);
