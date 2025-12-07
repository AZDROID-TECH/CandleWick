import React from 'react';
import GameCanvas from '../game/GameCanvas';
import NewsToast from '../ui/NewsToast';
import { useAppSelector } from '../../app/hooks';
import { useTranslation } from 'react-i18next';

const GameScreen: React.FC = () => {
    const { score, coins } = useAppSelector(state => state.game);
    const { t } = useTranslation();

    return (
        <div className="relative w-full h-full overflow-hidden">
            <NewsToast />
            {/* HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-10">
                <div className="flex flex-col gap-4">
                    {/* Score */}
                    <div className="flex flex-col">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('score')}</span>
                        <span className="text-2xl font-mono font-black text-white drop-shadow-md leading-none">{score}</span>
                    </div>

                    {/* Balance */}
                    <div className="flex flex-col">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('balance')}</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-mono font-black text-white drop-shadow-md leading-none">{coins}</span>
                            <span className="text-sm font-bold text-white drop-shadow-md">AZC</span>
                        </div>
                    </div>
                </div>

                {/* Level Display */}
                <div className="flex flex-col items-end">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('level')}</span>
                    <span className="text-2xl font-mono font-black text-yellow-500 drop-shadow-md leading-none">
                        {Math.min(Math.floor(score / 100) + 1, 15)}
                    </span>
                </div>
            </div>

            {/* Canvas */}
            <GameCanvas />
        </div>
    );
};

export default GameScreen;
