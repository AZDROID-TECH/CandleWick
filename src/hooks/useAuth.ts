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

                        // Check Daily Limit Reset
                        const lastReset = data.last_daily_reset ? new Date(data.last_daily_reset).getTime() : 0;
                        const now = Date.now();
                        const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

                        let currentDailyEarnings = data.daily_earnings || 0;
                        let currentDailyHighScore = data.daily_high_score || 0;
                        let newLastReset = data.last_daily_reset;

                        if (hoursSinceReset >= 24) {
                            // Reset daily earnings and high score
                            currentDailyEarnings = 0;
                            currentDailyHighScore = 0;
                            newLastReset = new Date().toISOString();
                            await updateDoc(userRef, {
                                daily_earnings: 0,
                                daily_high_score: 0,
                                last_daily_reset: newLastReset,
                                last_login: new Date().toISOString()
                            });
                        } else {
                            await updateDoc(userRef, {
                                last_login: new Date().toISOString()
                            });
                        }

                        dispatch(setHighScore(data.high_score || 0));
                        // Use specialized action to set initial state correctly
                        dispatch(setUserData({
                            total_azc: data.total_azc || 0,
                            daily_earnings: currentDailyEarnings,
                            daily_high_score: currentDailyHighScore,
                            last_daily_reset: newLastReset
                        }));
                    } else {
                        // Create new user
                        const nowISO = new Date().toISOString();
                        await setDoc(userRef, {
                            user_id: telegramUser.id,
                            username: telegramUser.username,
                            first_name: telegramUser.first_name,
                            total_azc: 0,
                            high_score: 0,
                            daily_earnings: 0,
                            daily_high_score: 0,
                            last_daily_reset: nowISO,
                            referrals: [],
                            completed_tasks: [],
                            created_at: nowISO,
                            last_login: nowISO
                        });

                        dispatch(setUserData({
                            total_azc: 0,
                            daily_earnings: 0,
                            daily_high_score: 0,
                            last_daily_reset: nowISO
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
