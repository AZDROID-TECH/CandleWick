export interface FirestoreUser {
    user_id: number;
    username?: string;
    first_name: string;
    total_azc: number;
    high_score: number;
    referrals: number[];
    completed_tasks: string[];
    daily_earnings: number; // Günlük qazanc (Daily earnings)
    daily_high_score?: number; // Günlük ən yüksək xal
    weekly_high_score?: number;
    last_daily_reset: string; // Son sıfırlama tarixi (ISO string)
    current_week_id?: string;
    created_at: string;
    last_login: string;
}
