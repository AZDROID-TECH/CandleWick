import React from 'react';
import GameCanvas from '../game/GameCanvas';
import AZCashLogo from '../../assets/AZCash.logo.png';
import { useAppSelector } from '../../app/hooks';
import { useTranslation } from 'react-i18next';

const GameScreen: React.FC = () => {
    const { score, coins, dailyEarnings, difficulty, gameSessionId } = useAppSelector(state => state.game);
    const { t } = useTranslation();

    return (
        <div className="relative w-full h-full overflow-hidden bg-slate-900">
            <GameCanvas key={gameSessionId} />

            <div className="absolute top-4 left-4 z-10 font-mono font-bold text-white drop-shadow-md pointer-events-none select-none">
                <div className="text-4xl text-yellow-400">{Math.floor(score)}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest">{t('score')}</div>
            </div>

            <div className="absolute top-4 right-4 z-10 flex flex-col items-end pointer-events-none select-none">
                <div className="mb-2">
                    <span className="bg-blue-600/80 border border-blue-400/50 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        LVL {difficulty}
                    </span>
                </div>

                <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-yellow-500/30">
                    <img src={AZCashLogo} alt="AZC" className="w-5 h-5" />
                    <span className="font-bold text-yellow-400">{coins}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                    Daily: {dailyEarnings}/1000
                </div>
            </div>
        </div>
    );
};

export default GameScreen;
