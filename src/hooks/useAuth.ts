import { useEffect, useState } from 'react';
import { getCurrentWeekId, getUSDateString } from '../utils/dateUtils';
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

                        const currentUSDate = getUSDateString();
                        const currentWeekId = getCurrentWeekId();

                        const storedResetDate = data.last_daily_reset || "";
                        const storedWeekId = data.current_week_id || "";

                        // If stored date is different from current US date, trigger reset
                        const shouldResetDaily = storedResetDate !== currentUSDate;
                        const shouldResetWeekly = storedWeekId !== currentWeekId;

                        let currentDailyEarnings = data.daily_earnings || 0;
                        let currentDailyHighScore = data.daily_high_score || 0;
                        let currentWeeklyHighScore = data.weekly_high_score || 0;
                        let newLastReset = storedResetDate;

                        const updateData: any = {
                            last_login: new Date().toISOString()
                        };

                        if (shouldResetDaily) {
                            // Reset daily earnings and high score for the new day
                            currentDailyEarnings = 0;
                            currentDailyHighScore = 0;
                            newLastReset = currentUSDate;

                            updateData.daily_earnings = 0;
                            updateData.daily_high_score = 0;
                            updateData.last_daily_reset = newLastReset;
                        }

                        if (shouldResetWeekly) {
                            currentWeeklyHighScore = 0;
                            updateData.weekly_high_score = 0;
                            updateData.current_week_id = currentWeekId;
                        }

                        await updateDoc(userRef, updateData);

                        dispatch(setHighScore(data.high_score || 0));
                        // Sync User Data
                        dispatch(setUserData({
                            total_azc: data.total_azc || 0,
                            daily_earnings: currentDailyEarnings,
                            daily_high_score: currentDailyHighScore,
                            weekly_high_score: currentWeeklyHighScore,
                            last_daily_reset: newLastReset,
                            current_week_id: shouldResetWeekly ? currentWeekId : storedWeekId || currentWeekId
                        }));
                    } else {
                        // Create new user
                        const nowISO = new Date().toISOString();
                        const usDate = getUSDateString();
                        const weekId = getCurrentWeekId();

                        await setDoc(userRef, {
                            user_id: telegramUser.id,
                            username: telegramUser.username || null, // Firestore crashes on undefined
                            first_name: telegramUser.first_name || 'Anonymous',
                            total_azc: 0,
                            high_score: 0,
                            daily_earnings: 0,
                            daily_high_score: 0,
                            weekly_high_score: 0, // NEW
                            last_daily_reset: usDate,
                            current_week_id: weekId, // NEW
                            referrals: [],
                            completed_tasks: [],
                            created_at: nowISO,
                            last_login: nowISO
                        });

                        dispatch(setUserData({
                            total_azc: 0,
                            daily_earnings: 0,
                            daily_high_score: 0,
                            weekly_high_score: 0,
                            last_daily_reset: usDate,
                            current_week_id: weekId
                        }));
                    }
                } else {
                    // Fallback for browser/dev testing
                    console.log("No Telegram user detected, loading mock data.");
                    dispatch(setUserData({
                        total_azc: 0,
                        daily_earnings: 0,
                        daily_high_score: 0,
                        weekly_high_score: 0,
                        last_daily_reset: new Date().toISOString(),
                        current_week_id: ""
                    }));
                }
            } catch (error) {
                console.error("Auth failed", error);
            }
        };

        initAuth();
    }, [dispatch]);

    return { user };
};
