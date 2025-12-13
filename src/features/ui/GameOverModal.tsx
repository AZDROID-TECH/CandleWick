import { startGame, continueGame, claimDoubleReward, resetGame } from '../game/gameSlice';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import WebApp from '@twa-dev/sdk';

const GameOverModal: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { score, highScore, adWatchCount } = useAppSelector(state => state.game);

    const showAd = async (onReward: () => void) => {
        const loadScript = () => {
            return new Promise<void>((resolve, reject) => {
                if ((window as any).Adsgram) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = "https://adsgram.ai/js/adsgram.js?v=1";
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error("Adsgram script failed to load"));
                document.body.appendChild(script);
            });
        };

        try {
            await loadScript();
            if (!(window as any).Adsgram) throw new Error("Adsgram object not found after load");

            const blockId = import.meta.env.VITE_TELEGRAM_BLOCK_ID;
            if (!blockId) {
                console.error("VITE_TELEGRAM_BLOCK_ID is not defined in .env");
                alert("Ad configuration missing.");
                return;
            }

            const AdController = (window as any).Adsgram.init({
                blockId: blockId,
                debug: false // Production mode
            });

            AdController.show().then(() => {
                // user listen your ad till the end
                onReward();
            }).catch((result: any) => {
                // user skip ad or get error 
                console.log('Adsgram error or skip:', result);
            });

        } catch (error) {
            console.error(error);
            alert(`Ad Error: ${(error as Error).message}`);
        }
    };

    const handleContinue = () => {
        showAd(() => {
            dispatch(continueGame());
        });
    };

    const handleRestart = () => {
        WebApp.HapticFeedback.impactOccurred('medium');
        dispatch(startGame());
    };

    const handleDoubleClaim = () => {
        showAd(() => {
            WebApp.HapticFeedback.notificationOccurred('success');
            dispatch(claimDoubleReward());
        });
    };

    const remainingAds = 3 - (adWatchCount || 0);

    return (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md p-6">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-800 w-full max-w-sm rounded-2xl border-2 border-red-500/50 p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
            >
                <h2 className="text-4xl font-black text-center text-red-500 mb-2 drop-shadow-md tracking-tighter">
                    {t('game_over')}
                </h2>

                <div className="bg-slate-900/50 rounded-xl p-4 mb-6 text-center border border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-slate-400 text-xs uppercase">{t('score')}</p>
                            <p className="text-2xl font-mono text-white">{score}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase">{t('best')}</p>
                            <p className="text-2xl font-mono text-yellow-400">{Math.max(score, highScore)}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* 1. Instant Restart */}
                    <button
                        onClick={handleRestart}
                        className="w-full py-4 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-black text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <i className='bx bx-refresh text-3xl'></i>
                        {t('restart')}
                    </button>

                    {/* 2. Watch Ad (Continue) */}
                    {remainingAds > 0 ? (
                        <button
                            onClick={handleContinue}
                            className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-yellow-600/20 transition-colors"
                        >
                            <i className='bx bxs-video text-white text-xl'></i>
                            {t('watch_ad_continue')} ({remainingAds})
                        </button>
                    ) : (
                        <button className="w-full py-3 bg-slate-800 text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                            {t('no_ads_left')}
                        </button>
                    )}

                    {/* 3. Split: Exit vs 2x Claim */}
                    <div className="flex gap-3 mt-2">
                        {/* Exit / Claim 1x */}
                        <button
                            onClick={() => {
                                WebApp.HapticFeedback.impactOccurred('light');
                                dispatch(resetGame());
                            }}
                            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            {t('claim_exit')}
                        </button>

                        {/* Double Claim 2x */}
                        <button
                            onClick={handleDoubleClaim}
                            className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors"
                        >
                            <i className='bx bxs-video text-white text-xl'></i>
                            {t('double_claim_azc')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default GameOverModal;
