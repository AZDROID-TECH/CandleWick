import React from 'react';
import AZCashLogo from '../../assets/AZCash.logo.png';

const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
                <img
                    src={AZCashLogo}
                    alt="Loading..."
                    className="relative w-24 h-24 object-contain animate-bounce"
                    style={{ animationDuration: '2s' }}
                />
            </div>

            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-slate-400 text-sm font-mono tracking-widest uppercase animate-pulse">
                    Loading Data...
                </div>
            </div>

            <div className="absolute bottom-8 text-xs text-slate-600">
                Candle Wick
            </div>
        </div>
    );
};

export default LoadingScreen;
