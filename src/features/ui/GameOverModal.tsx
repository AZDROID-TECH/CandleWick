import { resetGame, continueGame } from '../game/gameSlice';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

const GameOverModal: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { score, highScore, adWatchCount } = useAppSelector(state => state.game);

    const handleWatchAd = async () => {
        const AdController = (window as any).Adsgram?.init({ blockId: "18830" });
        if (AdController) {
            AdController.show().then(() => {
                // user listen your ad till the end
                dispatch(continueGame());
            }).catch((result: any) => {
                // user skip ad or get error 
                console.log('Adsgram error or skip:', result);
                // Optionally show a toast "Ad failed"
            });
        } else {
            console.error("Adsgram script not loaded");
        }
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
                    <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white flex items-center justify-center gap-2">
                        <i className='bx bxs-star text-yellow-300'></i> {t('continue_stars')}
                    </button>

                    {remainingAds > 0 ? (
                        <button
                            onClick={handleWatchAd}
                            className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-white flex items-center justify-center gap-2"
                        >
                            <i className='bx bxs-video text-white'></i> {t('watch_ad')} ({remainingAds})
                        </button>
                    ) : (
                        <button className="w-full py-3 bg-slate-800 text-slate-500 rounded-lg font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                            <i className='bx bxs-video-off'></i> {t('no_ads_left')}
                        </button>
                    )}

                    <button
                        onClick={() => dispatch(resetGame())}
                        className="w-full py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-lg font-black text-lg mt-4"
                    >
                        {t('restart')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default GameOverModal;
