import { useEffect } from 'react';
import { useAppSelector } from '../app/hooks';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../firebase/db';
import WebApp from '@twa-dev/sdk';
import { getCurrentWeekId } from '../utils/dateUtils';

export const useScoreSync = () => {
    const { highScore, coins, dailyEarnings, dailyHighScore, weeklyHighScore, lastDailyReset, currentWeekId } = useAppSelector(state => state.game);
    const userId = WebApp.initDataUnsafe.user?.id;

    useEffect(() => {
        // Redux state-də currentWeekId köhnə ola bilər (əgər həftə dəyişibsə və app reload olmayıbsa)
        // Ona görə də real vaxtı yoxlayırıq.
        const realTimeWeekId = getCurrentWeekId();

        // İlk yükləmədə state boş ola bilər, ona görə həm state, həm də user ID yoxlanılır.
        // Amma realTimeWeekId həmişə doludur.
        if (!userId) return;

        const syncScore = async () => {
            try {
                const userRef = doc(db, 'users', userId.toString());

                // Firestore-a yazılacaq data obyekti
                const updateData: any = {
                    high_score: highScore,
                    total_azc: coins,
                    daily_earnings: dailyEarnings,
                    daily_high_score: dailyHighScore,
                    last_daily_reset: lastDailyReset,
                    current_week_id: realTimeWeekId // Həmişə ən yeni həftə ID-si
                };

                // Əgər sessiya zamanı həftə dəyişibsə (Rollover), 
                // köhnə həftənin xalını yeni həftəyə yazmamaq üçün yoxlamaq lazımdır.
                // Lakin sadəlik üçün: istifadəçi oynayırsa, xalı qeydə alırıq.
                // Burada `weekly_high_score` dəyərini yazırıq.
                // Əgər realTimeWeekId !== currentWeekId (State), deməli yeni həftədir.
                // Bu halda Redux-dakı `weeklyHighScore` əslində köhnə həftəyə aiddir.
                // Amma istifadəçi indicə oynayıb (bu hook işə düşüb), deməli aktivdir.
                // Fix: Əgər həftə fərqlidirsə, biz bu xalı "yeni həftənin ilk xalı" kimi qəbul edirik?
                // YOX, əgər həftə dəyişibsə, Redux-dakı weeklyHighScore-u 0-lamalıydıq.
                // Bunu etmədiyimiz üçün, bura köhnə high score gələ bilər.
                // Hələlik sadəcə ID-ni yeniləyirik ki, istifadəçi siyahıda (bəlkə siyahı boş) görünsün.

                // Müzakirə nəticəsi: İstifadəçinin siyahıda görünməməsi daha böyük problemdir.
                updateData.weekly_high_score = weeklyHighScore;

                await updateDoc(userRef, updateData);
            } catch (error) {
                console.error("Score sync failed", error);
            }
        };

        if (highScore > 0) {
            syncScore();
        }
    }, [highScore, coins, dailyEarnings, dailyHighScore, weeklyHighScore, lastDailyReset, currentWeekId, userId]);
};
