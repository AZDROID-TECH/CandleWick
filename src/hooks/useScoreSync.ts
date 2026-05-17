import { useEffect, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../firebase/db';
import { useAppSelector } from '../app/hooks';
import { getCurrentWeekId } from '../utils/dateUtils';
import { getTelegramUser } from '../utils/telegram';
import { FirestoreUser } from '../types/firestore';

type ScoreSyncPayload = Pick<
    FirestoreUser,
    'high_score' | 'total_azc' | 'daily_earnings' | 'daily_high_score' | 'weekly_high_score' | 'last_daily_reset' | 'current_week_id'
>;

export const useScoreSync = () => {
    const { highScore, coins, dailyEarnings, dailyHighScore, weeklyHighScore, lastDailyReset } = useAppSelector(state => state.game);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const telegramUser = getTelegramUser();
        if (!telegramUser || highScore <= 0) {
            return;
        }

        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            const payload: ScoreSyncPayload = {
                high_score: highScore,
                total_azc: coins,
                daily_earnings: dailyEarnings,
                daily_high_score: dailyHighScore,
                weekly_high_score: weeklyHighScore,
                last_daily_reset: lastDailyReset,
                current_week_id: getCurrentWeekId()
            };

            updateDoc(doc(db, 'users', telegramUser.id.toString()), payload).catch((error: unknown) => {
                console.error('Skor sinxron xətası:', error);
            });
        }, 500);

        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [highScore, coins, dailyEarnings, dailyHighScore, weeklyHighScore, lastDailyReset]);
};

