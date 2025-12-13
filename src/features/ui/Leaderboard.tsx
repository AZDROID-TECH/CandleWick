import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentWeekId, getTimeUntilWeeklyReset, formatTimeRemaining } from '../../utils/dateUtils';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import db from '../../firebase/db';
import { FirestoreUser } from '../../types/firestore';
import WebApp from '@twa-dev/sdk';

interface LeaderboardProps {
    onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'weekly' | 'all_time'>('weekly');
    const [leaders, setLeaders] = useState<FirestoreUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        if (activeTab === 'weekly') {
            const updateTimer = () => {
                const ms = getTimeUntilWeeklyReset();
                setTimeLeft(formatTimeRemaining(ms));
            };
            updateTimer(); // Initial call
            const interval = setInterval(updateTimer, 60000); // 1 min update is enough for d/h/m
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    useEffect(() => {
        let isCancelled = false;
        // ... (rest is same)

        const fetchLeaders = async () => {
            setLoading(true);
            setLeaders([]);
            try {
                const usersRef = collection(db, 'users');
                let q;

                if (activeTab === 'weekly') {
                    // Weekly High Score
                    const currentWeekId = getCurrentWeekId();

                    q = query(
                        usersRef,
                        where('current_week_id', '==', currentWeekId),
                        orderBy('weekly_high_score', 'desc'),
                        limit(20)
                    );
                } else {
                    // All Time High Score (desc)
                    q = query(usersRef, orderBy('high_score', 'desc'), limit(20));
                }

                const snapshot = await getDocs(q);

                if (!isCancelled) {
                    const fetchedUsers: FirestoreUser[] = [];
                    snapshot.forEach(doc => {
                        fetchedUsers.push(doc.data() as FirestoreUser);
                    });
                    setLeaders(fetchedUsers);
                }
            } catch (error: any) {
                if (!isCancelled) {
                    console.error("Error fetching leaderboard:", error);
                    if (error?.message?.includes('index')) {
                        console.error("FIRESTORE INDEX MISSING. Click the link in console to create it.");
                        // Optional: You could show a UI message here if you want
                    }
                }
            } finally {
                if (!isCancelled) setLoading(false);
            }
        };

        fetchLeaders();

        return () => {
            isCancelled = true;
        };
    }, [activeTab]);

    return (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center p-4 overflow-hidden">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-6">
                <button
                    onClick={() => {
                        WebApp.HapticFeedback.impactOccurred('light');
                        onClose();
                    }}
                    className="text-white text-2xl"
                >
                    <i className='bx bx-arrow-back'></i>
                </button>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider">{t('leaderboard')}</h2>
                <div className="w-6"></div> {/* Spacer */}
            </div>

            {/* Tabs */}
            <div className="w-full max-w-md flex bg-slate-800 rounded-xl p-1 mb-6 relative z-10">
                <button
                    onClick={() => {
                        setActiveTab('weekly');
                        WebApp.HapticFeedback.selectionChanged();
                    }}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm uppercase transition-all ${activeTab === 'weekly' ? 'bg-yellow-500 text-slate-900 shadow-md' : 'text-slate-400'
                        }`}
                >
                    {t('weekly')}
                </button>
                <button
                    onClick={() => {
                        setActiveTab('all_time');
                        WebApp.HapticFeedback.selectionChanged();
                    }}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm uppercase transition-all ${activeTab === 'all_time' ? 'bg-yellow-500 text-slate-900 shadow-md' : 'text-slate-400'
                        }`}
                >
                    {t('all_time')}
                </button>
            </div>

            {/* Weekly Countdown Timer */}
            {activeTab === 'weekly' && timeLeft && (
                <div className="w-full max-w-md flex justify-center -mt-5 mb-4 z-0">
                    <div className="bg-slate-900/50 backdrop-blur-sm px-4 py-1.5 rounded-b-xl border border-t-0 border-slate-700/50 flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                        <i className='bx bx-timer text-yellow-500 text-sm'></i>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('resets_in')}</span>
                        <span className="text-xs text-white font-mono font-bold">{timeLeft}</span>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="w-full max-w-md flex-1 overflow-y-auto hide-scrollbar space-y-3 pb-8">
                {loading ? (
                    <div className="text-center text-slate-500 mt-10 animate-pulse">
                        Loading...
                    </div>
                ) : (
                    leaders.map((user, index) => (
                        <div
                            key={user.user_id}
                            className={`flex items-center justify-between p-4 rounded-xl border border-slate-700 ${index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-slate-800 border-yellow-500/50' : 'bg-slate-800/50'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 flex items-center justify-center font-black rounded-full ${index === 0 ? 'bg-yellow-500 text-slate-900' :
                                    index === 1 ? 'bg-slate-300 text-slate-900' :
                                        index === 2 ? 'bg-amber-700 text-white' :
                                            'bg-slate-700 text-slate-400'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-sm">
                                        {user.first_name || 'Anonymous'}
                                    </span>
                                    {/* <span className="text-xs text-slate-500">@{user.username}</span> */}
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-mono font-black text-lg text-white">
                                    {activeTab === 'weekly' ? (user.weekly_high_score || 0) : user.high_score}
                                </span>
                                <span className="text-[10px] uppercase text-slate-500 font-bold">{t('score')}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* Home Button */}
            <div className="w-full max-w-md mt-4">
                <button
                    onClick={() => {
                        WebApp.HapticFeedback.impactOccurred('medium');
                        onClose();
                    }}
                    className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <i className='bx bxs-home' ></i>
                    {t('home')}
                </button>
            </div>
        </div>
    );
};

export default Leaderboard;
