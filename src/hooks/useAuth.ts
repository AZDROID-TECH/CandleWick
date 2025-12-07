import { useEffect, useState } from 'react';
import { signInAnonymously, User } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import auth from '../firebase/auth';
import db from '../firebase/db';
import WebApp from '@twa-dev/sdk';
import { useAppDispatch } from '../app/hooks';
import { setHighScore, setUserData } from '../features/game/gameSlice';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const initAuth = async () => {
            // 1. Sign in anonymously to Firebase (since we don't have custom token backend yet)
            try {
                const userCredential = await signInAnonymously(auth);
                setUser(userCredential.user);

                // 2. Sync with Firestore using Telegram ID
                const telegramUser = WebApp.initDataUnsafe.user;
                if (telegramUser) {
                    const userRef = doc(db, 'users', telegramUser.id.toString());
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        // Load data
                        const data = userSnap.data();

                        // Check Daily Limit Reset (Fixed Time: US/Eastern 00:00)

                        // Get current date string in US Eastern time (e.g., "12/7/2025")
                        const getUSDateString = () => {
                            return new Date().toLocaleDateString('en-US', {
                                timeZone: 'America/New_York',
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            });
                        };

                        const currentUSDate = getUSDateString();
                        const storedResetDate = data.last_daily_reset || "";

                        // If stored date is different from current US date, trigger reset
                        // (This handles the transition from ISO string to Date string naturally as they won't match)
                        const shouldReset = storedResetDate !== currentUSDate;

                        let currentDailyEarnings = data.daily_earnings || 0;
                        let currentDailyHighScore = data.daily_high_score || 0;
                        let newLastReset = storedResetDate;

                        if (shouldReset) {
                            // Reset daily earnings and high score for the new day
                            currentDailyEarnings = 0;
                            currentDailyHighScore = 0;
                            newLastReset = currentUSDate;

                            await updateDoc(userRef, {
                                daily_earnings: 0,
                                daily_high_score: 0,
                                last_daily_reset: newLastReset,
                                last_login: new Date().toISOString()
                            });
                        } else {
                            // Same day, just update login time
                            await updateDoc(userRef, {
                                last_login: new Date().toISOString()
                            });
                        }

                        dispatch(setHighScore(data.high_score || 0));
                        // Sync User Data
                        dispatch(setUserData({
                            total_azc: data.total_azc || 0,
                            daily_earnings: currentDailyEarnings,
                            daily_high_score: currentDailyHighScore,
                            last_daily_reset: newLastReset
                        }));
                    } else {
                        // Create new user
                        const nowISO = new Date().toISOString();

                        // Use correct US Date for initial reset field
                        const getUSDateString = () => {
                            return new Date().toLocaleDateString('en-US', {
                                timeZone: 'America/New_York',
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            });
                        };
                        const usDate = getUSDateString();

                        await setDoc(userRef, {
                            user_id: telegramUser.id,
                            username: telegramUser.username || null, // Firestore crashes on undefined
                            first_name: telegramUser.first_name || 'Anonymous',
                            total_azc: 0,
                            high_score: 0,
                            daily_earnings: 0,
                            daily_high_score: 0,
                            last_daily_reset: usDate,
                            referrals: [],
                            completed_tasks: [],
                            created_at: nowISO,
                            last_login: nowISO
                        });

                        dispatch(setUserData({
                            total_azc: 0,
                            daily_earnings: 0,
                            daily_high_score: 0,
                            last_daily_reset: usDate
                        }));
                    }
                }
            } catch (error) {
                console.error("Auth failed", error);
            }
        };

        initAuth();
    }, [dispatch]);

    return { user };
};
