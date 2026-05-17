import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import WebApp from '@twa-dev/sdk';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { claimDoubleReward, continueGame, resetGame, startGame } from '../game/gameSlice';

const ADSGRAM_SCRIPT_ID = 'adsgram-sdk-script';
const ADSGRAM_SCRIPT_URLS = [
    'https://adsgram.ai/js/adsgram.js?v=1',
    'https://sad.adsgram.ai/js/sad.min.js'
];
const ADSGRAM_LOAD_TIMEOUT_MS = 6000;
const ADSGRAM_MAX_RETRIES = 2;

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    let timeoutId: number | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
            reject(new Error('Adsgram SDK timeout'));
        }, timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timeoutId !== null) {
            window.clearTimeout(timeoutId);
        }
    }
};

const loadAdsgramScriptFromUrl = async (url: string) => {
    const scriptId = `${ADSGRAM_SCRIPT_ID}-${btoa(url).replace(/=/g, '')}`;
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing && window.Adsgram) {
        return;
    }

    await withTimeout(new Promise<void>((resolve, reject) => {
        const script = existing || document.createElement('script');
        if (!existing) {
            script.id = scriptId;
            script.src = url;
            script.async = true;
            document.body.appendChild(script);
        }

        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Adsgram SDK yüklənmədi (${url})`));
    }), ADSGRAM_LOAD_TIMEOUT_MS);
};

const loadAdsgramScript = async () => {
    if (window.Adsgram) {
        return;
    }

    let lastError: unknown = null;
    for (let retry = 0; retry < ADSGRAM_MAX_RETRIES; retry += 1) {
        for (const url of ADSGRAM_SCRIPT_URLS) {
            try {
                await loadAdsgramScriptFromUrl(url);
                if (window.Adsgram) {
                    return;
                }
            } catch (error: unknown) {
                lastError = error;
            }
        }
    }

    throw lastError || new Error('Adsgram SDK yüklənmədi');
};

const GameOverModal: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { score, highScore, adWatchCount } = useAppSelector(state => state.game);

    const showMonetagAd = async (onReward: () => void) => {
        const showAd = window.show_10324597;
        if (typeof showAd !== 'function') {
            WebApp.showAlert(t('ad_load_error'));
            return false;
        }

        try {
            WebApp.HapticFeedback.impactOccurred('light');
            await showAd();
            onReward();
            return true;
        } catch (error: unknown) {
            console.error('Monetag xətası:', error);
            return false;
        }
    };

    const showAdsgramAd = async (blockIdRaw: string | undefined, onReward: () => void) => {
        try {
            const blockId = typeof blockIdRaw === 'string' ? blockIdRaw.trim() : '';
            await loadAdsgramScript();
            if (!window.Adsgram) {
                throw new Error('Adsgram obyekt tapılmadı');
            }

            if (!blockId) {
                WebApp.showAlert(t('ad_config_missing'));
                return false;
            }

            const adController = window.Adsgram.init({
                blockId,
                debug: false
            });

            const startedAt = Date.now();
            await adController.show();

            const watchedMs = Date.now() - startedAt;
            if (watchedMs < 15000) {
                WebApp.HapticFeedback.notificationOccurred('error');
                WebApp.showAlert(t('ad_warning_short'));
                return false;
            }

            onReward();
            return true;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : t('ad_load_error');
            console.error('Adsgram xətası:', error);
            console.warn('Adsgram uğursuz oldu, Monetag fallback işə salınır.');
            const monetagOk = await showMonetagAd(onReward);
            if (!monetagOk) {
                WebApp.showAlert(`${t('ad_load_error')}: ${message}`);
            }
            return monetagOk;
        }
    };

    const handleContinue = () => {
        void showMonetagAd(() => {
            dispatch(continueGame());
        });
    };

    const handleRestart = () => {
        WebApp.HapticFeedback.impactOccurred('light');
        dispatch(startGame());
    };

    const handleDoubleClaim = () => {
        const blockId = import.meta.env.VITE_TELEGRAM_BLOCK_ID_2X;
        void showAdsgramAd(blockId, () => {
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
                    <button
                        onClick={handleRestart}
                        className="w-full py-4 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-black text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <i className='bx bx-refresh text-3xl'></i>
                        {t('restart')}
                    </button>

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
                            {t('cannot_continue')}
                        </button>
                    )}

                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={() => {
                                WebApp.HapticFeedback.impactOccurred('light');
                                dispatch(resetGame());
                            }}
                            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            {t('claim_exit')}
                        </button>

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
