import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
    isPlaying: boolean;
    isGameOver: boolean;
    score: number;
    highScore: number;
    coins: number;
    dailyEarnings: number; // Redux state for daily tracking
    dailyHighScore: number;
    weeklyHighScore: number;
    lastDailyReset: string; // Son sıfırlama vaxtı (ISO)
    currentWeekId: string;
    adWatchCount: number;
    isLoading: boolean;
    isResuming: boolean;
    difficulty: number;
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
    lastDailyReset: new Date().toISOString(), // Default now
    currentWeekId: "",
    adWatchCount: 0,
    isLoading: true,
    isResuming: false,
    difficulty: 1,
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
            // Limit check is done in UI/Canvas before dispatching if possible, 
            // but we can enforce here or just track.
            // Let's enforce strictly here to be safe.
            const amount = action.payload;
            const MAX_DAILY_LIMIT = 1000;

            if (state.dailyEarnings + amount <= MAX_DAILY_LIMIT) {
                state.coins += amount;
                state.dailyEarnings += amount;
            } else {
                // If adding full amount exceeds, add partial? Or reject?
                // Rejecting is simpler for now or partial fill.
                // Let's fill up to limit.
                const allowed = Math.max(0, MAX_DAILY_LIMIT - state.dailyEarnings);
                if (allowed > 0) {
                    state.coins += allowed;
                    state.dailyEarnings += allowed;
                }
            }
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
        setUserData: (state, action: PayloadAction<{ total_azc: number, daily_earnings: number, daily_high_score: number, weekly_high_score: number, last_daily_reset: string, current_week_id: string }>) => {
            state.coins = action.payload.total_azc;
            state.dailyEarnings = action.payload.daily_earnings;
            state.dailyHighScore = action.payload.daily_high_score;
            state.weeklyHighScore = action.payload.weekly_high_score;
            state.lastDailyReset = action.payload.last_daily_reset;
            state.currentWeekId = action.payload.current_week_id;
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

export const { startGame, endGame, incrementScore, collectCoin, resetGame, setHighScore, setUserData, continueGame, resumeGame, setDifficulty } = gameSlice.actions;

export default gameSlice.reducer;
