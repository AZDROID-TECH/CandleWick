import { useEffect } from 'react';
import { useAppSelector } from '../app/hooks';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../firebase/db';
import WebApp from '@twa-dev/sdk';

export const useScoreSync = () => {
    const { highScore, coins, dailyEarnings, dailyHighScore, weeklyHighScore, lastDailyReset, currentWeekId } = useAppSelector(state => state.game);
    const userId = WebApp.initDataUnsafe.user?.id;

    useEffect(() => {
        if (!userId) return;

        const syncScore = async () => {
            try {
                const userRef = doc(db, 'users', userId.toString());
                // Yalnız yüksək xal dəyişdikdə yenilə
                // (Update only when high score changes)
                await updateDoc(userRef, {
                    high_score: highScore,
                    total_azc: coins,
                    daily_earnings: dailyEarnings,
                    daily_high_score: dailyHighScore,
                    weekly_high_score: weeklyHighScore,
                    last_daily_reset: lastDailyReset,
                    current_week_id: currentWeekId
                });
            } catch (error) {
                console.error("Score sync failed", error);
            }
        };

        // Debounce could be added here if needed, but for now strictly on change is fine 
        // as high score only updates on game over usually.
        if (highScore > 0) {
            syncScore();
        }
    }, [highScore, coins, dailyEarnings, dailyHighScore, weeklyHighScore, lastDailyReset, currentWeekId, userId]);
};
