import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
    en: {
        translation: {
            "start_game": "Start Game",
            "leaderboard": "Leaderboard",
            "withdraw": "Withdraw",
            "earn_money": "Earn Money Systems",
            "coming_soon": "Coming Soon",
            "score": "Score",
            "best": "Best",
            "game_over": "LIQUIDATED!",
            "continue_stars": "Continue with Stars",
            "watch_ad": "Watch Ad",
            "restart": "Restart",
            "balance": "Balance",
            "daily": "Daily",
            "all_time": "All Time",
            "rank": "Rank",
            "player": "Player",
            "daily_limit_reached": "Daily Limit Reached",
            "time_left": "Time Left",
            "level": "Level",
            "hours": "hours",
            "minutes": "minutes",
            "home": "Home",
            "score_only_mode": "Limit Reached - Score Mode Only"
        }
    },
    az: {
        translation: {
            "start_game": "Oyuna Başla",
            "leaderboard": "Liderlər",
            "withdraw": "Çıxarış",
            "earn_money": "Pul Qazanma Sistemləri",
            "coming_soon": "Tezliklə",
            "score": "Xal",
            "best": "Rekord",
            "game_over": "LİKVİDASYON!",
            "continue_stars": "Ulduzlarla Davam Et",
            "watch_ad": "Reklam İzlə",
            "restart": "Yenidən Başla",
            "balance": "Balans",
            "daily": "Günlük",
            "all_time": "Ümumi",
            "rank": "Sıra",
            "player": "Oyunçu",
            "daily_limit_reached": "Günlük Limit Bitdi",
            "time_left": "Qalan Vaxt",
            "level": "Səviyyə",
            "hours": "saat",
            "minutes": "dəqiqə",
            "home": "Ana Səhifə",
            "score_only_mode": "Limit Doldu - Yalnız Xal Modu"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // Default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
