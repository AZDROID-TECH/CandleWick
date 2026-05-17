export interface FirestoreUser {
    auth_uid: string;
    user_id: number;
    username?: string;
    first_name: string;
    total_azc: number;
    high_score: number;
    referrals: number[];
    referred_by?: number; // Kim tərəfindən dəvət edilib
    friends: number[]; // Dostların ID siyahısı
    completed_tasks: string[];
    daily_earnings: number; // Günlük qazanc
    daily_high_score?: number; // Günlük ən yüksək xal
    weekly_high_score?: number;
    last_daily_reset: string; // Son sıfırlama tarixi
    current_week_id?: string;
    country_code?: string; // ISO 2 hərfli ölkə kodu
    created_at: string;
    last_login: string;
}
