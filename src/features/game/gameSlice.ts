import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
    isPlaying: boolean;
    isGameOver: boolean;
    score: number;
    highScore: number;
    coins: number;
    dailyEarnings: number; // Günlük izləmə üçün Redux state
    dailyHighScore: number;
    weeklyHighScore: number;
    lastDailyReset: string; // Son sıfırlama vaxtı (ISO)
    currentWeekId: string;
    adWatchCount: number;
    isLoading: boolean;
    sessionEarnings: number;
    isResuming: boolean;
    difficulty: number;
    gameSessionId: number;
    friends: number[];
}

const initialState: GameState = {
    isPlaying: false,
    isGameOver: false,
    score: 0,
    highScore: 0,
    coins: 0,
    dailyEarnings: 0,
    dailyHighScore: 0,
    weeklyHighScore: 0,
    lastDailyReset: "", // Firestore yüklənənə qədər boş (US tarix formatı ilə doldurulur)
    currentWeekId: "",
    adWatchCount: 0,
    isLoading: true,
    sessionEarnings: 0,
    isResuming: false,
    difficulty: 1,
    gameSessionId: 0,
    friends: [],
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        startGame: (state) => {
            state.isPlaying = true;
            state.isGameOver = false;
            state.score = 0;
            state.adWatchCount = 0;
            state.difficulty = 1;
            state.sessionEarnings = 0;
            state.gameSessionId += 1;
        },
        endGame: (state) => {
            state.isPlaying = false;
            state.isGameOver = true;
            if (state.score > state.highScore) {
                state.highScore = state.score;
            }
            if (state.score > state.dailyHighScore) {
                state.dailyHighScore = state.score;
            }
            if (state.score > state.weeklyHighScore) {
                state.weeklyHighScore = state.score;
            }
        },
        incrementScore: (state, action: PayloadAction<number>) => {
            state.score += action.payload;
        },
        collectCoin: (state, action: PayloadAction<number>) => {
            // Limit yoxlaması UI/Canvas tərəfində edilir,
            // amma burada da məcburi etmək olar.
            // Ehtiyat üçün burada ciddi yoxlama edək.
            const amount = action.payload;
            const MAX_DAILY_LIMIT = 1000;

            if (state.dailyEarnings + amount <= MAX_DAILY_LIMIT) {
                state.coins += amount;
                state.dailyEarnings += amount;
                state.sessionEarnings += amount;
            } else {
                // Əgər tam məbləğ limiti keçirsə, qismən əlavə edilsin? Və ya rədd edilsin?
                // İndilik rədd etmək daha sadədir, amma qismən dolduraq.
                // Limitə qədər dolduraq.
                const allowed = Math.max(0, MAX_DAILY_LIMIT - state.dailyEarnings);
                if (allowed > 0) {
                    state.coins += allowed;
                    state.dailyEarnings += allowed;
                    state.sessionEarnings += allowed;
                }
            }
        },
        claimDoubleReward: (state) => {
            // 2x Məntiqi: İstifadəçi oyun zamanı 1x alıb. Biz +1x daha əlavə edirik.
            // Günlük Limitə riayət et.
            const MAX_DAILY_LIMIT = 1000;
            const amountToAdd = state.sessionEarnings;

            // Günlük limitdə qalan yeri hesabla
            // state.dailyEarnings artıq 1x məbləği ehtiva edir.
            const allowed = Math.max(0, MAX_DAILY_LIMIT - state.dailyEarnings);
            const actualAdd = Math.min(amountToAdd, allowed);

            if (actualAdd > 0) {
                state.coins += actualAdd;
                state.dailyEarnings += actualAdd;
            }

            // Oyundan Çıx (Ana səhifə vəziyyətinə sıfırla)
            state.isPlaying = false;
            state.isGameOver = false;
            state.score = 0;
        },
        resetGame: (state) => {
            state.isPlaying = false;
            state.isGameOver = false;
            state.score = 0;
            state.difficulty = 1;
        },
        setHighScore: (state, action: PayloadAction<number>) => {
            state.highScore = action.payload;
        },
        setUserData: (state, action: PayloadAction<{ total_azc: number, daily_earnings: number, daily_high_score: number, weekly_high_score: number, last_daily_reset: string, current_week_id: string, friends: number[] }>) => {
            state.coins = action.payload.total_azc;
            state.dailyEarnings = action.payload.daily_earnings;
            state.dailyHighScore = action.payload.daily_high_score;
            state.weeklyHighScore = action.payload.weekly_high_score;
            state.lastDailyReset = action.payload.last_daily_reset;
            state.currentWeekId = action.payload.current_week_id;
            state.friends = action.payload.friends;
            state.isLoading = false;
        },
        setDifficulty: (state, action: PayloadAction<number>) => {
            state.difficulty = action.payload;
        },
        continueGame: (state) => {
            state.isResuming = true;
            state.isGameOver = false;
            state.isPlaying = false;
            state.adWatchCount += 1;
        },
        resumeGame: (state) => {
            state.isResuming = false;
            state.isPlaying = true;
        }
    },
});

export const { startGame, endGame, incrementScore, collectCoin, resetGame, setHighScore, setUserData, continueGame, resumeGame, setDifficulty, claimDoubleReward } = gameSlice.actions;

export default gameSlice.reducer;

