import { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { startGame } from '../game/gameSlice';
import WebApp from '@twa-dev/sdk';
import azcLogo from '../../assets/AZCash.logo.png';

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

    const handleNewsClick = () => {
        WebApp.HapticFeedback.impactOccurred('light');
        WebApp.openTelegramLink("https://t.me/CandleWickNews");
    };

    if (showLeaderboard) {
        return <Leaderboard onClose={() => setShowLeaderboard(false)} />;
    }

    const languages = [
        { code: 'en', label: 'EN' },
        { code: 'az', label: 'AZ' }
    ];

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/90 backdrop-blur-sm overflow-hidden">
            {/* Language Selector - Top Right */}
            <div className="absolute top-6 right-6 z-20">
                <div className="p-1 bg-slate-800/80 backdrop-blur-md rounded-full border border-slate-700/50 flex gap-1 shadow-xl">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`relative px-4 py-1.5 rounded-full text-xs font-black transition-all duration-300 overflow-hidden ${i18n.language === lang.code
                                ? 'text-slate-900 shadow-md transform scale-105'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {i18n.language === lang.code && (
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full -z-10"></div>
                            )}
                            {lang.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="animate-pulse mb-8 relative z-0">
                <div className="w-32 h-32 bg-gradient-to-tr from-yellow-400/30 to-orange-500/30 rounded-full blur-2xl opacity-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                <h1 className="relative text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-2xl tracking-tighter">
                    CANDLE WICK
                </h1>
            </div>

            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 w-4/5 max-w-sm shadow-2xl relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-600">
                            {user?.first_name?.charAt(0) || 'T'}
                        </div>
                        <span className="font-bold text-white text-sm tracking-wide">{user?.first_name || 'Trader'}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        <span className="font-mon font-bold text-yellow-100 text-sm">{coins.toLocaleString()}</span>
                        <img src={azcLogo} alt="AZC" className="w-5 h-5 object-contain drop-shadow-md" />
                    </div>
                </div>

                {/* Status Badge */}
                {isLimitReached && (
                    <div className="w-full py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-200/90 rounded-xl mb-4 text-center text-xs backdrop-blur-sm">
                        <div className="font-bold mb-0.5">{t('score_only_mode')}</div>
                        <div className="opacity-70 font-mono text-[10px]">{t('time_left')}: {timeLeft}</div>
                    </div>
                )}

                {/* Start Button */}
                <button
                    onClick={handleStart}
                    className={`group w-full py-4 font-black text-xl rounded-2xl shadow-lg transition-all transform active:scale-95 mb-4 relative overflow-hidden
                        ${isLimitReached
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-emerald-500/20 hover:shadow-emerald-500/30'
                        }`}
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></div>
                    <span className="relative flex items-center justify-center gap-2">
                        {isLimitReached ? <i className='bx bxs-lock-alt'></i> : <i className='bx bx-play'></i>}
                        {t('start_game')}
                    </span>
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            WebApp.HapticFeedback.impactOccurred('light');
                            setShowLeaderboard(true);
                        }}
                        className="w-[55%] py-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 font-bold text-sm transition-colors border border-slate-600/50 flex items-center justify-start pl-3 gap-2"
                    >
                        <i className='bx bxs-bar-chart-alt-2 text-xl'></i>
                        {t('leaderboard')}
                    </button>
                    <button className="w-[45%] py-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 font-bold text-sm transition-colors border border-slate-600/50 flex items-center justify-start pl-3 gap-2">
                        <i className='bx bxs-store text-xl'></i>
                        {t('market')}
                    </button>
                </div>
            </div>

            {/* High Score & News Area */}
            <div className="w-4/5 max-w-sm mt-6 flex items-stretch justify-between gap-4">
                {/* High Score (Left) - Fixed Width Logic */}
                <div className="flex-[2] flex flex-col justify-center items-start bg-slate-800/40 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50">
                    <p className="text-slate-500 text-[9px] uppercase tracking-widest font-black mb-1 flex items-center gap-1">
                        <i className='bx bxs-trophy text-slate-600'></i>
                        {t('best')}
                    </p>
                    <p className="text-2xl font-mono font-black text-white tracking-tight leading-none">{highScore}</p>
                </div>

                {/* News Button (Right) */}
                <button
                    onClick={handleNewsClick}
                    className="group relative w-20 flex-shrink-0 flex items-center justify-center bg-blue-600/10 backdrop-blur-md rounded-2xl border border-blue-500/30 hover:bg-blue-600/20 transition-all duration-300 active:scale-95 shadow-lg shadow-blue-500/5"
                >
                    <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <i className='bx bxs-news text-3xl text-blue-400 group-hover:text-blue-300 transition-colors drop-shadow-md'></i>
                </button>
            </div>

            {/* Footer: Timer & Copyright */}
            <div className="absolute bottom-6 flex flex-col items-center gap-3 w-full z-10 pointer-events-none">
                <div className="px-4 py-1.5 bg-slate-900/60 backdrop-blur-md rounded-full border border-white/5 shadow-sm">
                    <p className="text-slate-400 font-mono text-xs font-bold tracking-widest flex items-center gap-2">
                        <i className='bx bx-time-five text-slate-500 text-sm'></i>
                        {currentTime}
                    </p>
                </div>
                <p className="text-slate-600 text-[10px] font-bold tracking-wider uppercase opacity-50">
                    {t('copyright')}
                </p>
            </div>
        </div>
    );
};

export default Home;
