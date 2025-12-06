import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
    isPlaying: boolean;
    isGameOver: boolean;
    score: number;
    highScore: number;
    coins: number;
    dailyEarnings: number; // Redux state for daily tracking
    dailyHighScore: number;
    lastDailyReset: string; // Son sıfırlama vaxtı (ISO)
}

const initialState: GameState = {
    isPlaying: false,
    isGameOver: false,
    score: 0,
    highScore: 0,
    coins: 0,
    dailyEarnings: 0,
    dailyHighScore: 0,
    lastDailyReset: new Date().toISOString(), // Default now
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        startGame: (state) => {
            state.isPlaying = true;
            state.isGameOver = false;
            state.score = 0;
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
        },
        setHighScore: (state, action: PayloadAction<number>) => {
            state.highScore = action.payload;
        },
        setUserData: (state, action: PayloadAction<{ total_azc: number, daily_earnings: number, daily_high_score: number, last_daily_reset: string }>) => {
            state.coins = action.payload.total_azc;
            state.dailyEarnings = action.payload.daily_earnings;
            state.dailyHighScore = action.payload.daily_high_score;
            state.lastDailyReset = action.payload.last_daily_reset;
        }
    },
});

export const { startGame, endGame, incrementScore, collectCoin, resetGame, setHighScore, setUserData } = gameSlice.actions;

export default gameSlice.reducer;
