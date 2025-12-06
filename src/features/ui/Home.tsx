import { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { startGame } from '../game/gameSlice';
import WebApp from '@twa-dev/sdk';

const Home: React.FC = () => {
    const { t, i18n } = useTranslation();
    const dispatch = useAppDispatch();
    const { highScore, coins, dailyEarnings, lastDailyReset } = useAppSelector(state => state.game);
    const user = WebApp.initDataUnsafe.user;
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>("");

    // Limit kontrolü ve sayaç (Limit check and timer)
    const isLimitReached = dailyEarnings >= 1000;

    useEffect(() => {
        if (!isLimitReached) return;

        const updateTimer = () => {
            const lastReset = new Date(lastDailyReset).getTime();
            const nextReset = lastReset + (24 * 60 * 60 * 1000); // +24 hours
            const now = Date.now();
            const diff = nextReset - now;

            if (diff <= 0) {
                setTimeLeft("00:00:00");
                // Refresh page or re-check auth could handle auto-reset, 
                // but simpler to just show 00 until reload for now.
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                // const s = Math.floor((diff % (1000 * 60)) / 1000); 
                // Müşteri isteği: "20 saat 10 dakika" formatı (Customer request: hour min format)
                setTimeLeft(`${h} ${t('hours')} ${m} ${t('minutes')}`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Hər dəqiqə yenilə (Update every minute)
        return () => clearInterval(interval);
    }, [isLimitReached, lastDailyReset, t]);

    const handleStart = () => {
        WebApp.HapticFeedback.impactOccurred('medium');
        dispatch(startGame());
    };

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        WebApp.HapticFeedback.impactOccurred('light');
    };

    if (showLeaderboard) {
        return <Leaderboard onClose={() => setShowLeaderboard(false)} />;
    }

    // Helper translations just for timer format if needed, 
    // but simpler to put hours/min inside the string or separate keys.
    // Let's assume standard 'h' 'm' or full words. 
    // Added crude manual translation for "hours" "minutes" below or use specific keys.

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/90 backdrop-blur-sm">
            {/* ... (Header) ... */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => changeLanguage('en')} className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-slate-600 text-white' : 'text-slate-500'}`}>EN</button>
                <button onClick={() => changeLanguage('az')} className={`px-2 py-1 rounded ${i18n.language === 'az' ? 'bg-slate-600 text-white' : 'text-slate-500'}`}>AZ</button>
            </div>

            <div className="animate-pulse mb-8">
                <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full blur-xl opacity-50 absolute"></div>
                <h1 className="relative text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-lg">
                    CANDLE WICK
                </h1>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 w-4/5 max-w-sm shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Player:</span>
                        <span className="font-bold text-white">{user?.first_name || 'Trader'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                        <i className='bx bxs-coin-stack'></i>
                        <span className="font-bold">{coins} AZC</span>
                    </div>
                </div>

                {isLimitReached ? (
                    <div className="w-full py-4 bg-red-500/20 border border-red-500 text-red-100 rounded-xl mb-4 text-center">
                        <div className="font-bold text-lg mb-1">{t('daily_limit_reached')}</div>
                        <div className="text-sm opacity-80">{t('time_left')}:</div>
                        <div className="font-mono text-xl font-black text-white">{timeLeft}</div>
                    </div>
                ) : (
                    <button
                        onClick={handleStart}
                        className="w-full py-4 bg-green-500 hover:bg-green-400 text-white font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all transform hover:scale-105 active:scale-95 mb-4"
                    >
                        {t('start_game')}
                    </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                    {/* ... buttons ... */}
                    <button
                        onClick={() => {
                            WebApp.HapticFeedback.impactOccurred('light');
                            setShowLeaderboard(true);
                        }}
                        className="py-2 bg-slate-700 rounded-lg text-slate-300 text-sm hover:bg-slate-600"
                    >
                        {t('leaderboard')}
                    </button>
                    <button className="py-2 bg-slate-700 rounded-lg text-slate-300 text-sm hover:bg-slate-600 opacity-50 cursor-not-allowed">
                        {t('withdraw')}
                    </button>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm uppercase tracking-widest mb-1">{t('best')}</p>
                <p className="text-3xl font-mono font-bold text-white">{highScore}</p>
            </div>
        </div>
    );
};

export default Home;
