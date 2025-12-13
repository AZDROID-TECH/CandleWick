import { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { startGame } from '../game/gameSlice';
import WebApp from '@twa-dev/sdk';

const Home: React.FC = () => {
    const { t, i18n } = useTranslation();
    const dispatch = useAppDispatch();
    const { highScore, coins, dailyEarnings } = useAppSelector(state => state.game);
    const user = WebApp.initDataUnsafe.user;
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [currentTime, setCurrentTime] = useState<string>("");

    // Limit kontrolü ve sayaç (Limit check and timer)
    const isLimitReached = dailyEarnings >= 1000;

    useEffect(() => {
        // Timer always runs to show reset time
        const updateTimer = () => {
            const now = new Date();

            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/New_York',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false
            });

            // Clock Formatter (HH:mm)
            const clockFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/New_York',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            setCurrentTime(clockFormatter.format(now));

            const parts = formatter.formatToParts(now);
            const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
            const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0');

            const hoursLeft = 23 - h;
            const minutesLeft = 59 - m;

            setTimeLeft(`${hoursLeft} ${t('hours')} ${minutesLeft} ${t('minutes')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000); // 1 sec for clock
        return () => clearInterval(interval);
    }, [t]);

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

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/90 backdrop-blur-sm">
            {/* ... Header ... */}
            <div className="absolute top-4 left-4 text-slate-500 font-mono text-sm font-bold tracking-widest opacity-80 z-20">
                {currentTime}
            </div>

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

                {/* Status Badge: Show if limit reached, but DON'T block start button below */}
                {isLimitReached && (
                    <div className="w-full py-2 bg-yellow-500/20 border border-yellow-500 text-yellow-100 rounded-lg mb-4 text-center text-xs">
                        <div className="font-bold">{t('score_only_mode')}</div>
                        <div className="opacity-80">{t('time_left')}: {timeLeft}</div>
                    </div>
                )}

                {/* Start Button: Always visible now */}
                <button
                    onClick={handleStart}
                    className={`w-full py-4 font-bold text-xl rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 mb-4 
                        ${isLimitReached
                            ? 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                            : 'bg-green-500 hover:bg-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                        }`}
                >
                    {t('start_game')}
                </button>

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

            <div className="absolute bottom-4 text-center w-full px-4">
                <p className="text-gray-500 text-[10px] font-medium opacity-60">
                    {t('copyright')}
                </p>
            </div>
        </div>
    );
};

export default Home;
