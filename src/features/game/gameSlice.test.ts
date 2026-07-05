import { describe, it, expect } from 'vitest';
import reducer, {
    startGame,
    endGame,
    collectCoin,
    claimDoubleReward,
    setUserData,
} from './gameSlice';

// Redux state-in başlanğıc formasını almaq üçün köməkçi (reducer @@INIT ilə)
const initial = () => reducer(undefined, { type: '@@INIT' });

describe('gameSlice reducer', () => {
    describe('collectCoin — günlük 1000 limiti', () => {
        it('limit altında məbləği tam əlavə edir', () => {
            // Arrange
            const state = { ...initial(), dailyEarnings: 0, coins: 0, sessionEarnings: 0 };

            // Act
            const next = reducer(state, collectCoin(50));

            // Assert
            expect(next.coins).toBe(50);
            expect(next.dailyEarnings).toBe(50);
            expect(next.sessionEarnings).toBe(50);
        });

        it('limiti keçən hissəni yalnız qalan yerə qədər doldurur', () => {
            // Arrange — artıq 980 qazanılıb
            const state = { ...initial(), dailyEarnings: 980, coins: 980, sessionEarnings: 0 };

            // Act — 50 daha istəsə də yalnız 20 əlavə olunmalı
            const next = reducer(state, collectCoin(50));

            // Assert
            expect(next.coins).toBe(1000);
            expect(next.dailyEarnings).toBe(1000);
        });

        it('limit dolubsa heç nə əlavə etmir', () => {
            // Arrange
            const state = { ...initial(), dailyEarnings: 1000, coins: 1000 };

            // Act
            const next = reducer(state, collectCoin(30));

            // Assert
            expect(next.coins).toBe(1000);
            expect(next.dailyEarnings).toBe(1000);
        });
    });

    describe('claimDoubleReward — 2x ödül limitə riayət edir', () => {
        it('session qazancını limitə qədər ikiqat edir', () => {
            // Arrange — 1x olaraq 200 qazanılıb (dailyEarnings=200, sessionEarnings=200)
            const state = {
                ...initial(),
                coins: 200,
                dailyEarnings: 200,
                sessionEarnings: 200,
                isPlaying: true,
            };

            // Act — 2x: +200 daha
            const next = reducer(state, claimDoubleReward());

            // Assert
            expect(next.coins).toBe(400);
            expect(next.dailyEarnings).toBe(400);
            expect(next.isPlaying).toBe(false);
            expect(next.score).toBe(0);
        });

        it('2x limiti keçirsə yalnız qalan yerə qədər əlavə edir', () => {
            // Arrange — 1x olaraq 900 (limitə 100 qalıb)
            const state = {
                ...initial(),
                coins: 900,
                dailyEarnings: 900,
                sessionEarnings: 900,
            };

            // Act
            const next = reducer(state, claimDoubleReward());

            // Assert — yalnız +100
            expect(next.coins).toBe(1000);
            expect(next.dailyEarnings).toBe(1000);
        });
    });

    describe('endGame — rekord yeniləmələri', () => {
        it('yüksək skoru yalnız aşıldıqda yeniləyir', () => {
            // Arrange
            const state = { ...initial(), score: 150, highScore: 100, dailyHighScore: 120, weeklyHighScore: 90 };

            // Act
            const next = reducer(state, endGame());

            // Assert
            expect(next.highScore).toBe(150);
            expect(next.dailyHighScore).toBe(150);
            expect(next.weeklyHighScore).toBe(150);
            expect(next.isGameOver).toBe(true);
            expect(next.isPlaying).toBe(false);
        });

        it('skor rekorddan aşağıdırsa rekordu dəyişmir', () => {
            // Arrange
            const state = { ...initial(), score: 50, highScore: 200 };

            // Act
            const next = reducer(state, endGame());

            // Assert
            expect(next.highScore).toBe(200);
        });
    });

    describe('startGame', () => {
        it('oyunu sıfırlayıb sessiya id-ni artırır', () => {
            // Arrange
            const state = { ...initial(), gameSessionId: 5, score: 99 };

            // Act
            const next = reducer(state, startGame());

            // Assert
            expect(next.isPlaying).toBe(true);
            expect(next.score).toBe(0);
            expect(next.gameSessionId).toBe(6);
        });
    });

    describe('setUserData', () => {
        it('Firestore məlumatını state-ə köçürüb yükləməni bitirir', () => {
            // Arrange
            const state = initial();

            // Act
            const next = reducer(state, setUserData({
                total_azc: 500,
                daily_earnings: 100,
                daily_high_score: 80,
                weekly_high_score: 200,
                last_daily_reset: '07/05/2026',
                current_week_id: '2026-W27',
                friends: [1, 2, 3],
            }));

            // Assert
            expect(next.coins).toBe(500);
            expect(next.dailyEarnings).toBe(100);
            expect(next.lastDailyReset).toBe('07/05/2026');
            expect(next.friends).toEqual([1, 2, 3]);
            expect(next.isLoading).toBe(false);
        });
    });
});
