import { useEffect, useState } from 'react';
import { signInAnonymously, User } from 'firebase/auth';
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import auth from '../firebase/auth';
import db from '../firebase/db';
import { useAppDispatch } from '../app/hooks';
import { setHighScore, setUserData } from '../features/game/gameSlice';
import { FirestoreUser } from '../types/firestore';
import { getCurrentWeekId, getUSDateString } from '../utils/dateUtils';
import { getTelegramStartParam, getTelegramUser } from '../utils/telegram';

const parseReferrerId = (startParam: string | undefined, userId: number): number | undefined => {
    if (!startParam) {
        return undefined;
    }

    const parsed = Number.parseInt(startParam, 10);
    if (!Number.isFinite(parsed) || parsed === userId) {
        return undefined;
    }

    return parsed;
};

const readCountryCode = async (): Promise<string | undefined> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const response = await fetch('https://ipapi.co/json/', { signal: controller.signal }).catch(() => null);
        clearTimeout(timeoutId);

        if (!response || !response.ok) {
            return undefined;
        }

        const data = await response.json() as { country_code?: unknown };
        return typeof data.country_code === 'string' ? data.country_code : undefined;
    } catch {
        return undefined;
    }
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const initAuth = async () => {
            let currentUserData: Partial<FirestoreUser> | null = null;

            try {
                const userCredential = await signInAnonymously(auth);
                setUser(userCredential.user);
                const authUid = userCredential.user.uid;

                const telegramUser = getTelegramUser();
                if (!telegramUser) {
                    currentUserData = {
                        total_azc: 0,
                        daily_earnings: 0,
                        daily_high_score: 0,
                        weekly_high_score: 0,
                        last_daily_reset: getUSDateString(),
                        current_week_id: getCurrentWeekId(),
                        friends: []
                    };
                    return;
                }

                const userRef = doc(db, 'users', telegramUser.id.toString());
                const userSnap = await getDoc(userRef);
                const currentUSDate = getUSDateString();
                const currentWeekId = getCurrentWeekId();
                const referrerId = parseReferrerId(getTelegramStartParam(), telegramUser.id);

                if (userSnap.exists()) {
                    const data = userSnap.data() as FirestoreUser;
                    const storedResetDate = data.last_daily_reset || '';
                    const storedWeekId = data.current_week_id || '';
                    const shouldResetDaily = storedResetDate !== currentUSDate;
                    const shouldResetWeekly = storedWeekId !== currentWeekId;

                    const updateData: Partial<FirestoreUser> = {
                        last_login: new Date().toISOString()
                    };
                    if (!data.auth_uid) {
                        updateData.auth_uid = authUid;
                    }

                    const countryCode = data.country_code || await readCountryCode();
                    if (countryCode && countryCode !== data.country_code) {
                        updateData.country_code = countryCode;
                    }

                    const existingFriends = data.friends || [];
                    if (!Array.isArray(data.friends)) {
                        updateData.friends = [];
                    }

                    if (referrerId && !existingFriends.includes(referrerId)) {
                        updateData.friends = [...existingFriends, referrerId];
                        await updateDoc(doc(db, 'users', referrerId.toString()), {
                            friends: arrayUnion(telegramUser.id)
                        }).catch((error: unknown) => {
                            console.error('Referral dost yeniləməsi xətası:', error);
                        });
                    }

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
                        updateData.last_daily_reset = currentUSDate;
                    }

                    if (shouldResetWeekly) {
                        finalWeeklyHighScore = 0;
                        updateData.weekly_high_score = 0;
                        updateData.current_week_id = currentWeekId;
                    }

                    await updateDoc(userRef, updateData);

                    currentUserData = {
                        ...data,
                        ...updateData,
                        daily_earnings: finalDailyEarnings,
                        daily_high_score: finalDailyHighScore,
                        weekly_high_score: finalWeeklyHighScore,
                        last_daily_reset: finalLastReset,
                        current_week_id: updateData.current_week_id || data.current_week_id || currentWeekId,
                        friends: updateData.friends || existingFriends
                    };
                } else {
                    const nowISO = new Date().toISOString();
                    const countryCode = await readCountryCode() || 'AZ';
                    const initialFriends = referrerId ? [referrerId] : [];

                    const newUser: FirestoreUser = {
                        auth_uid: authUid,
                        user_id: telegramUser.id,
                        username: telegramUser.username,
                        first_name: telegramUser.firstName,
                        total_azc: 0,
                        high_score: 0,
                        daily_earnings: 0,
                        daily_high_score: 0,
                        weekly_high_score: 0,
                        last_daily_reset: currentUSDate,
                        current_week_id: currentWeekId,
                        country_code: countryCode,
                        referrals: [],
                        referred_by: referrerId,
                        friends: initialFriends,
                        completed_tasks: [],
                        created_at: nowISO,
                        last_login: nowISO
                    };

                    await setDoc(userRef, newUser);
                    currentUserData = newUser;

                    if (referrerId) {
                        await updateDoc(doc(db, 'users', referrerId.toString()), {
                            friends: arrayUnion(telegramUser.id)
                        }).catch((error: unknown) => {
                            console.error('Referrer dost əlavə xətası:', error);
                        });
                    }
                }
            } catch (error: unknown) {
                console.error('Auth/Firestore kritik xətası:', error);
                if (!currentUserData) {
                    currentUserData = {
                        total_azc: 0,
                        daily_earnings: 0,
                        daily_high_score: 0,
                        weekly_high_score: 0,
                        last_daily_reset: getUSDateString(),
                        current_week_id: getCurrentWeekId(),
                        friends: []
                    };
                }
            } finally {
                const safeData = currentUserData || {
                    total_azc: 0,
                    daily_earnings: 0,
                    daily_high_score: 0,
                    weekly_high_score: 0,
                    last_daily_reset: getUSDateString(),
                    current_week_id: getCurrentWeekId(),
                    friends: []
                };

                dispatch(setUserData({
                    total_azc: safeData.total_azc || 0,
                    daily_earnings: safeData.daily_earnings || 0,
                    daily_high_score: safeData.daily_high_score || 0,
                    weekly_high_score: safeData.weekly_high_score || 0,
                    last_daily_reset: safeData.last_daily_reset || getUSDateString(),
                    current_week_id: safeData.current_week_id || getCurrentWeekId(),
                    friends: safeData.friends || []
                }));

                if (safeData.high_score) {
                    dispatch(setHighScore(safeData.high_score));
                }
            }
        };

        if (!user) {
            void initAuth();
        }
    }, [dispatch, user]);

    return { user };
};
