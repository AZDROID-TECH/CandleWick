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
            // 1. Firebase-ə anonim giriş (backend token hələ yoxdur)
            try {
                const userCredential = await signInAnonymously(auth);
                setUser(userCredential.user);

                // 2. Telegram ID istifadə edərək Firestore ilə sinxronizasiya

                const telegramUser = WebApp.initDataUnsafe.user;
                if (telegramUser) {
                    const userRef = doc(db, 'users', telegramUser.id.toString());
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        // Məlumatları yüklə
                        const data = userSnap.data() as FirestoreUser;


                        const currentUSDate = getUSDateString();
                        const currentWeekId = getCurrentWeekId();

                        const storedResetDate = data.last_daily_reset || "";
                        const storedWeekId = data.current_week_id || "";

                        // --- Ölkə Kodu Yoxlaması (Tək səfərlik) ---
                        let currentCountryCode = data.country_code;
                        if (!currentCountryCode) {
                            try {
                                // Tasarruf Modu: Sadece country yoksa çağır
                                const ipResponse = await fetch('https://ipapi.co/json/');
                                if (ipResponse.ok) {
                                    const ipData = await ipResponse.json();
                                    if (ipData && ipData.country_code) {
                                        currentCountryCode = ipData.country_code;
                                    }
                                }
                            } catch (error) {
                                console.error("IPAPI Error:", error);
                                // Səssizcə davam et, sonra yenə yoxlayacaq
                            }
                        }

                        // Əgər saxlanan tarix cari ABŞ tarixindən fərqlidirsə, sıfırlamanı işə sal
                        const shouldResetDaily = storedResetDate !== currentUSDate;
                        const shouldResetWeekly = storedWeekId !== currentWeekId;

                        let currentDailyEarnings = data.daily_earnings || 0;
                        let currentDailyHighScore = data.daily_high_score || 0;
                        let currentWeeklyHighScore = data.weekly_high_score || 0;
                        let newLastReset = storedResetDate;

                        const updateData: Partial<FirestoreUser> = {
                            last_login: new Date().toISOString()
                        }; // any YASAQDIR - Partial istifadə edirik

                        if (currentCountryCode && currentCountryCode !== data.country_code) {
                            updateData.country_code = currentCountryCode;
                        }

                        // Dost sahəsi yoxdursa əlavə et (Migration)
                        if (!data.friends) {
                            updateData.friends = [];
                        }

                        // Mövcud istifadəçi link ilə gəlirsə və dost deyilsə
                        const startParam = WebApp.initDataUnsafe.start_param;
                        if (startParam) {
                            const referrerId = parseInt(startParam);
                            if (!isNaN(referrerId) && referrerId !== telegramUser.id) {
                                const currentFriends = data.friends || [];
                                if (!currentFriends.includes(referrerId)) {
                                    // 1. Özünə dost əlavə et
                                    updateData.friends = [...currentFriends, referrerId];

                                    // 2. Digər tərəfə dost əlavə et (Async)
                                    try {
                                        const referrerRef = doc(db, 'users', referrerId.toString());
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


                        if (shouldResetDaily) {
                            // Yeni gün üçün günlük qazancı və rekordu sıfırla

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
                        // İstifadəçi Məlumatlarını Sinxronlaşdır

                        dispatch(setUserData({
                            total_azc: data.total_azc || 0,
                            daily_earnings: currentDailyEarnings,
                            daily_high_score: currentDailyHighScore,
                            weekly_high_score: currentWeeklyHighScore,
                            last_daily_reset: newLastReset,
                            current_week_id: shouldResetWeekly ? currentWeekId : storedWeekId || currentWeekId,
                            friends: data.friends || []
                        }));
                    } else {
                        // Yeni istifadəçi yarat

                        const nowISO = new Date().toISOString();
                        const usDate = getUSDateString();
                        const weekId = getCurrentWeekId();

                        // Yeni istifadəçi üçün də IPAPI yoxla
                        let newCountryCode = "AZ"; // Alternativ (Fallback)
                        try {
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 saniyə timeout

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
                            console.error("IPAPI New User Error:", e);
                        }

                        const startParam = WebApp.initDataUnsafe.start_param;

                        await setDoc(userRef, {
                            user_id: telegramUser.id,
                            username: telegramUser.username || undefined, // Firestore undefined qəbul etmir, amma null da ola bilər, interfeysə uyğunlaşdırıldı

                            first_name: telegramUser.first_name || 'Anonymous',
                            total_azc: 0,
                            high_score: 0,
                            daily_earnings: 0,
                            daily_high_score: 0,
                            weekly_high_score: 0, // YENİ
                            last_daily_reset: usDate,
                            current_week_id: weekId, // YENİ
                            country_code: newCountryCode,

                            referrals: [],
                            referred_by: (startParam && !isNaN(parseInt(startParam))) ? parseInt(startParam) : undefined,
                            friends: (startParam && !isNaN(parseInt(startParam))) ? [parseInt(startParam)] : [], // Referral varsa dost kimi əlavə et
                            completed_tasks: [],
                            created_at: nowISO,
                            last_login: nowISO
                        });

                        // Referral İşləməsi (Qarşılıqlı Dostluq)
                        if (startParam) {
                            const referrerId = parseInt(startParam);
                            if (!isNaN(referrerId) && referrerId !== telegramUser.id) {
                                try {
                                    const referrerRef = doc(db, 'users', referrerId.toString());
                                    const referrerSnap = await getDoc(referrerRef);

                                    if (referrerSnap.exists()) {
                                        const referrerData = referrerSnap.data() as FirestoreUser;
                                        const currentFriends = referrerData.friends || [];

                                        // Əgər yeni istifadəçi artıq dost siyahısında yoxdursa, əlavə et
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

                        dispatch(setUserData({
                            total_azc: 0,
                            daily_earnings: 0,
                            daily_high_score: 0,
                            weekly_high_score: 0,
                            last_daily_reset: usDate,
                            current_week_id: weekId,
                            friends: startParam ? [parseInt(startParam)] : []
                        }));
                    }
                } else {
                    // Brauzer/test mühiti üçün alternativ
                    console.log("Telegram istifadəçisi aşkarlanmadı, saxta məlumatlar yüklənir.");

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
            } catch (error) {
                console.error("Giriş uğursuz oldu", error);
            }

        };

        initAuth();
    }, [dispatch]);

    return { user };
};
