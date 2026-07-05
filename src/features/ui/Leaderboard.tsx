import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import WebApp from '@twa-dev/sdk';
import db from '../../firebase/db';
import { FirestoreUser, firestoreUserSchema } from '../../types/firestore';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { useAppSelector } from '../../app/hooks';
import { formatTimeRemaining, getCurrentWeekId, getTimeUntilWeeklyReset } from '../../utils/dateUtils';

interface LeaderboardProps {
    onClose: () => void;
}

type LeaderboardTab = 'weekly' | 'all_time' | 'friends';
type LeaderboardCache = Record<LeaderboardTab, FirestoreUser[] | null>;

const QUERY_TIMEOUT_MS = 12000;

// Sərhəd doğrulaması: Firestore sıralama sənədlərini Zod ilə yoxla.
// Permissive sxem — etibarlı sətirlər dəyişməz keçir, ədədlər coerce olunur.
const mapUserDocs = (docs: QueryDocumentSnapshot[]): FirestoreUser[] =>
    docs.map(docSnapshot => {
        const parsed = firestoreUserSchema.safeParse(docSnapshot.data());
        return (parsed.success ? parsed.data : docSnapshot.data()) as FirestoreUser;
    });

const getFlagEmoji = (countryCode?: string) => {
    if (!countryCode) return '🏳️';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

const toErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message.includes('index')) {
        return 'FIRESTORE_INDEX_MISSING';
    }

    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
    }

    return 'UNKNOWN_ERROR';
};

const withTimeout = async <T,>(promise: Promise<T>, ms: number) => {
    let timeoutId: number | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
            reject(new Error('QUERY_TIMEOUT'));
        }, ms);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
        }
    }
};

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const { friends } = useAppSelector(state => state.game);
    const [activeTab, setActiveTab] = useState<LeaderboardTab>('weekly');
    const [leaders, setLeaders] = useState<FirestoreUser[]>([]);
    const [cache, setCache] = useState<LeaderboardCache>({
        weekly: null,
        all_time: null,
        friends: null
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    const [refreshTick, setRefreshTick] = useState(0);

    useEffect(() => {
        if (activeTab !== 'weekly') {
            return;
        }

        const updateTimer = () => {
            setTimeLeft(formatTimeRemaining(getTimeUntilWeeklyReset()));
        };

        updateTimer();
        const timer = window.setInterval(updateTimer, 60000);
        return () => window.clearInterval(timer);
    }, [activeTab]);

    useEffect(() => {
        let cancelled = false;

        const fetchTabData = async (tab: LeaderboardTab): Promise<FirestoreUser[]> => {
            const usersRef = collection(db, 'users');

            if (tab === 'weekly') {
                const weekId = getCurrentWeekId();
                const weeklyQuery = query(
                    usersRef,
                    where('current_week_id', '==', weekId),
                    orderBy('weekly_high_score', 'desc'),
                    limit(100)
                );
                const snapshot = await withTimeout(getDocs(weeklyQuery), QUERY_TIMEOUT_MS);
                return mapUserDocs(snapshot.docs);
            }

            if (tab === 'friends') {
                if (friends.length === 0) {
                    return [];
                }

                const chunks: number[][] = [];
                for (let i = 0; i < friends.length; i += 10) {
                    chunks.push(friends.slice(i, i + 10));
                }

                const friendRows: FirestoreUser[] = [];
                for (const chunk of chunks) {
                    if (chunk.length === 0) {
                        continue;
                    }

                    const friendQuery = query(usersRef, where('user_id', 'in', chunk));
                    const snapshot = await withTimeout(getDocs(friendQuery), QUERY_TIMEOUT_MS);
                    friendRows.push(...mapUserDocs(snapshot.docs));
                }

                friendRows.sort((a, b) => (b.high_score || 0) - (a.high_score || 0));
                return friendRows;
            }

            const allTimeQuery = query(usersRef, orderBy('high_score', 'desc'), limit(100));
            const snapshot = await withTimeout(getDocs(allTimeQuery), QUERY_TIMEOUT_MS);
            return mapUserDocs(snapshot.docs);
        };

        const run = async () => {
            const cachedRows = cache[activeTab];
            if (cachedRows) {
                setLeaders(cachedRows);
                setLoading(false);
            } else {
                setLoading(true);
                setLeaders([]);
            }
            setError(null);

            try {
                const rows = await fetchTabData(activeTab);
                if (cancelled) {
                    return;
                }

                setLeaders(rows);
                setCache(prev => ({
                    ...prev,
                    [activeTab]: rows
                }));
            } catch (fetchError: unknown) {
                if (cancelled) {
                    return;
                }
                console.error('Leaderboard yükləmə xətası:', fetchError);
                setError(toErrorMessage(fetchError));
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void run();
        return () => {
            cancelled = true;
        };
        // "cache" oxunur amma asılılığa salınmır: effektin özü setCache çağırır,
        // asılılığa salsaq hər cache yeniləməsi effekti yenidən işə salıb sonsuz
        // yenidən-yükləmə döngüsü yaradardı. Yalnız tab/dostlar/refresh dəyişəndə
        // yenilənməlidir.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, friends, refreshTick]);

    return (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center p-4 overflow-hidden">
            <div className="w-full flex justify-between items-center mb-6">
                <button
                    onClick={() => {
                        WebApp.HapticFeedback.impactOccurred('light');
                        onClose();
                    }}
                    className="text-white text-2xl"
                    aria-label={t('back')}
                >
                    <i className='bx bx-arrow-back' aria-hidden="true"></i>
                </button>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider">{t('leaderboard')}</h2>
                <div className="w-6"></div>
            </div>

            <div className="w-full max-w-md flex bg-slate-800 rounded-xl p-1 mb-6 relative z-10">
                <button
                    onClick={() => {
                        setActiveTab('weekly');
                        WebApp.HapticFeedback.impactOccurred('light');
                    }}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm uppercase transition-all ${activeTab === 'weekly' ? 'bg-yellow-500 text-slate-900 shadow-md' : 'text-slate-400'}`}
                >
                    {t('weekly')}
                </button>
                <button
                    onClick={() => {
                        setActiveTab('all_time');
                        WebApp.HapticFeedback.impactOccurred('light');
                    }}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm uppercase transition-all ${activeTab === 'all_time' ? 'bg-yellow-500 text-slate-900 shadow-md' : 'text-slate-400'}`}
                >
                    {t('all_time')}
                </button>
                <button
                    onClick={() => {
                        setActiveTab('friends');
                        WebApp.HapticFeedback.impactOccurred('light');
                    }}
                    className={`px-4 py-2 rounded-lg font-bold text-lg transition-all flex items-center justify-center ${activeTab === 'friends' ? 'bg-yellow-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-300'}`}
                >
                    <i className='bx bxs-group'></i>
                </button>
            </div>

            {activeTab === 'weekly' && timeLeft && (
                <div className="w-full max-w-md flex justify-center -mt-5 mb-4 z-0">
                    <div className="bg-slate-900/50 backdrop-blur-sm px-4 py-1.5 rounded-b-xl border border-t-0 border-slate-700/50 flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                        <i className='bx bx-timer text-yellow-500 text-sm'></i>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('resets_in')}</span>
                        <span className="text-xs text-white font-mono font-bold">{timeLeft}</span>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md flex-1 overflow-y-auto hide-scrollbar space-y-3 pb-8">
                {loading ? (
                    <div className="text-center text-slate-500 mt-10 animate-pulse">{t('loading_data')}</div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center mt-10 text-red-400 gap-2 px-6 text-center">
                        <i className='bx bx-error-circle text-4xl'></i>
                        <p className="font-bold">{t('leaderboard_error_title')}</p>
                        <p className="text-xs font-mono bg-slate-900/50 p-2 rounded border border-red-500/30 break-all">
                            {error === 'FIRESTORE_INDEX_MISSING'
                                ? t('leaderboard_index_missing')
                                : error === 'QUERY_TIMEOUT'
                                    ? t('leaderboard_timeout')
                                    : error}
                        </p>
                        <button
                            onClick={() => {
                                WebApp.HapticFeedback.impactOccurred('light');
                                setRefreshTick(value => value + 1);
                            }}
                            className="mt-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold"
                        >
                            {t('retry')}
                        </button>
                    </div>
                ) : leaders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-10 text-slate-500 gap-2">
                        <i className='bx bx-ghost text-4xl opacity-50'></i>
                        <p>{activeTab === 'friends' ? t('no_friends_yet') : t('no_records_found')}</p>
                    </div>
                ) : (
                    leaders.map((leader, index) => (
                        <div
                            key={leader.user_id}
                            className={`flex items-center justify-between p-4 rounded-xl border border-slate-700 ${index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-slate-800 border-yellow-500/50' : 'bg-slate-800/50'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 flex items-center justify-center font-black rounded-full ${index === 0 ? 'bg-yellow-500 text-slate-900' : index === 1 ? 'bg-slate-300 text-slate-900' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                    {index + 1}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-sm flex items-center gap-2">
                                        <span className="text-lg">{getFlagEmoji(leader.country_code)}</span>
                                        {leader.first_name || t('anonymous')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-mono font-black text-lg text-white">
                                    {activeTab === 'weekly' ? (leader.weekly_high_score || 0) : leader.high_score}
                                </span>
                                <span className="text-[10px] uppercase text-slate-500 font-bold">{t('score')}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="w-full max-w-md mt-4">
                <button
                    onClick={() => {
                        WebApp.HapticFeedback.impactOccurred('light');
                        onClose();
                    }}
                    className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <i className='bx bxs-home'></i>
                    {t('home')}
                </button>
            </div>
        </div>
    );
};

export default Leaderboard;
