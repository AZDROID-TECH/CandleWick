import { useEffect, useState } from 'react';
import { getCurrentWeekId, getUSDateString } from '../utils/dateUtils';
import { signInAnonymously, User } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import auth from '../firebase/auth';
import db from '../firebase/db';
import WebApp from '@twa-dev/sdk';
import { useAppDispatch } from '../app/hooks';
import { setHighScore, setUserData } from '../features/game/gameSlice';
import { FirestoreUser } from '../types/firestore';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const initAuth = async () => {
            let currentUserData: Partial<FirestoreUser> | null = null;
            let isNewUser = false;

            try {
                // 1. Firebase-ə anonim giriş (backend token hələ yoxdur)
                // 1. Anonymous login to Firebase
                const userCredential = await signInAnonymously(auth);
                setUser(userCredential.user);

                // 2. Telegram ID istifadə edərək Firestore ilə sinxronizasiya
                // 2. Sync with Firestore using Telegram ID
                const telegramUser = WebApp.initDataUnsafe.user;

                if (telegramUser) {
                    const userRef = doc(db, 'users', telegramUser.id.toString());
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        // Məlumatları yüklə (Mövcud İstifadəçi)
                        // Load data (Existing User)
                        const data = userSnap.data() as FirestoreUser;

                        const currentUSDate = getUSDateString();
                        const currentWeekId = getCurrentWeekId();

                        const storedResetDate = data.last_daily_reset || "";
                        const storedWeekId = data.current_week_id || "";

                        // --- Ölkə Kodu Yoxlaması (Tək səfərlik) ---
                        let currentCountryCode = data.country_code;
                        if (!currentCountryCode) {
                            try {
                                const controller = new AbortController();
                                const timeoutId = setTimeout(() => controller.abort(), 2000);

                                const ipResponse = await fetch('https://ipapi.co/json/', {
                                    signal: controller.signal
                                }).catch(() => null);
                                clearTimeout(timeoutId);

                                if (ipResponse && ipResponse.ok) {
                                    const ipData = await ipResponse.json();
                                    if (ipData && ipData.country_code) {
                                        currentCountryCode = ipData.country_code;
                                    }
                                }
                            } catch (error) {
                                // Səssizcə davam et (Fail silently)
                            }
                        }

                        // Günlük və Həftəlik sıfırlama yoxlanışı
                        const shouldResetDaily = storedResetDate !== currentUSDate;
                        const shouldResetWeekly = storedWeekId !== currentWeekId;

                        const updateData: Partial<FirestoreUser> = {
                            last_login: new Date().toISOString()
                        };

                        if (currentCountryCode && currentCountryCode !== data.country_code) {
                            updateData.country_code = currentCountryCode;
                        }

                        // Dost sahəsi yoxdursa əlavə et (Migration)
                        if (!data.friends) {
                            updateData.friends = [];
                        }

                        // Mövcud istifadəçi link ilə gəlirsə və dost deyilsə (Referral)
                        const startParam = WebApp.initDataUnsafe.start_param;
                        if (startParam) {
                            const referrerId = parseInt(startParam);
                            if (!isNaN(referrerId) && referrerId !== telegramUser.id) {
                                const currentFriends = data.friends || [];
                                // Yerli dost siyahısında yoxdursa
                                if (!currentFriends.includes(referrerId)) {
                                    updateData.friends = [...currentFriends, referrerId];

                                    // Qarşı tərəfə də dost əlavə et (Async)
                                    try {
                                        const referrerRef = doc(db, 'users', referrerId.toString());
                                        // Sadəcə arrayUnion istifadə edə bilərik, amma oxuyub-yazmaq daha təhlükəsizdir (bütün datanı görmək üçün)
                                        const referrerSnap = await getDoc(referrerRef);
                                        if (referrerSnap.exists()) {
                                            const referrerData = referrerSnap.data() as FirestoreUser;
                                            const refFriends = referrerData.friends || [];
                                            if (!refFriends.includes(telegramUser.id)) {
                                                await updateDoc(referrerRef, {
                                                    friends: [...refFriends, telegramUser.id]
                                                });
                                            }
                                        }
                                    } catch (e) {
                                        console.error("Mutual friend add error:", e);
                                    }
                                }
                            }
                        }

                        // Reset Logic
                        let finalDailyEarnings = data.daily_earnings || 0;
                        let finalDailyHighScore = data.daily_high_score || 0;
                        let finalWeeklyHighScore = data.weekly_high_score || 0;
                        let finalLastReset = storedResetDate;

                        if (shouldResetDaily) {
                            finalDailyEarnings = 0;
                            finalDailyHighScore = 0;
                            finalLastReset = currentUSDate;
                            updateData.daily_earnings = 0;
                            updateData.daily_high_score = 0;
                            updateData.last_daily_reset = finalLastReset;
                        }

                        if (shouldResetWeekly) {
                            finalWeeklyHighScore = 0;
                            updateData.weekly_high_score = 0;
                            updateData.current_week_id = currentWeekId;
                        }

                        await updateDoc(userRef, updateData);

                        currentUserData = {
                            ...data,
                            daily_earnings: finalDailyEarnings,
                            daily_high_score: finalDailyHighScore,
                            weekly_high_score: finalWeeklyHighScore,
                            last_daily_reset: finalLastReset,
                            friends: updateData.friends || data.friends || []
                        };

                    } else {
                        // Yeni İstifadəçi Yarat (New User Creation)
                        isNewUser = true;
                        const nowISO = new Date().toISOString();
                        const usDate = getUSDateString();
                        const weekId = getCurrentWeekId();

                        // IPAPI time-out ilə
                        let newCountryCode = "AZ";
                        try {
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 2000);

                            const ipResponse = await fetch('https://ipapi.co/json/', {
                                signal: controller.signal
                            }).catch(() => null);
                            clearTimeout(timeoutId);

                            if (ipResponse && ipResponse.ok) {
                                const ipData = await ipResponse.json();
                                if (ipData && ipData.country_code) {
                                    newCountryCode = ipData.country_code;
                                }
                            }
                        } catch (e) {
                            // Ignore error
                        }

                        const startParam = WebApp.initDataUnsafe.start_param;
                        const referrerId = (startParam && !isNaN(parseInt(startParam))) ? parseInt(startParam) : undefined;
                        const initialFriends = (referrerId && referrerId !== telegramUser.id) ? [referrerId] : [];

                        const newUser: FirestoreUser = {
                            user_id: telegramUser.id,
                            username: telegramUser.username || undefined,
                            first_name: telegramUser.first_name || 'Anonymous',
                            total_azc: 0,
                            high_score: 0,
                            daily_earnings: 0,
                            daily_high_score: 0,
                            weekly_high_score: 0,
                            last_daily_reset: usDate,
                            current_week_id: weekId,
                            country_code: newCountryCode,
                            referrals: [],
                            referred_by: (referrerId && referrerId !== telegramUser.id) ? referrerId : undefined,
                            friends: initialFriends,
                            completed_tasks: [],
                            created_at: nowISO,
                            last_login: nowISO
                        };

                        await setDoc(userRef, newUser);
                        currentUserData = newUser;

                        // Referral Update Logic
                        if (referrerId && referrerId !== telegramUser.id) {
                            try {
                                const referrerRef = doc(db, 'users', referrerId.toString());
                                const referrerSnap = await getDoc(referrerRef);

                                if (referrerSnap.exists()) {
                                    const referrerData = referrerSnap.data() as FirestoreUser;
                                    const currentFriends = referrerData.friends || [];

                                    if (!currentFriends.includes(telegramUser.id)) {
                                        await updateDoc(referrerRef, {
                                            friends: [...currentFriends, telegramUser.id]
                                        });
                                    }
                                }
                            } catch (error) {
                                console.error("Referral processing error:", error);
                            }
                        }
                    }
                } else {
                    // Brauzer mühiti (Browser Env - Mock Data)
                    // console.log("Telegram user not found, using mock data");
                    // Brauzerdə test edərkən sonsuz yükləmə olmasın deyə boş data qaytar
                    currentUserData = {
                        total_azc: 0,
                        daily_earnings: 0,
                        daily_high_score: 0,
                        weekly_high_score: 0,
                        last_daily_reset: new Date().toISOString(),
                        current_week_id: "",
                        friends: []
                    } as Partial<FirestoreUser>; // Partial olaraq təyin etdik
                }

            } catch (error) {
                console.error("Auth Error:", error);
                // HƏTTA SƏHV OLSA BELƏ OYUNU AÇ (Fallback to Guest/Offline)
                // Even on error, ensure game loads so user is not stuck
                if (!currentUserData) {
                    currentUserData = {
                        total_azc: 0,
                        daily_earnings: 0,
                        daily_high_score: 0,
                        weekly_high_score: 0,
                        last_daily_reset: new Date().toISOString(),
                        current_week_id: "",
                        friends: []
                    } as Partial<FirestoreUser>; // Partial olaraq təyin etdik
                }
            } finally {
                // Hər zaman dispatch et ki, loading bitsin
                // Always dispatch to stop loading state
                if (currentUserData) {
                    dispatch(setUserData({
                        total_azc: currentUserData.total_azc || 0,
                        daily_earnings: currentUserData.daily_earnings || 0,
                        daily_high_score: currentUserData.daily_high_score || 0,
                        weekly_high_score: currentUserData.weekly_high_score || 0,
                        last_daily_reset: currentUserData.last_daily_reset || new Date().toISOString(),
                        current_week_id: currentUserData.current_week_id || "",
                        friends: currentUserData.friends || []
                    }));
                    if (currentUserData.high_score) {
                        dispatch(setHighScore(currentUserData.high_score));
                    }
                } else {
                    // Should not happen due to catch block, but safety net
                    dispatch(setUserData({
                        total_azc: 0,
                        daily_earnings: 0,
                        daily_high_score: 0,
                        weekly_high_score: 0,
                        last_daily_reset: new Date().toISOString(),
                        current_week_id: "",
                        friends: []
                    }));
                }
            }
        };

        if (!user) {
            initAuth();
        }
    }, [dispatch, user]);

    return { user };
};
