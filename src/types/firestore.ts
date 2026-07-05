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

import { z } from 'zod';

// Firestore sərhəd doğrulaması: köhnə/natamam sənədləri itirməmək üçün
// bütün sahələr optional; ədədi sahələr coerce edilir; naməlum sahələr saxlanılır.
// Məqsəd — tam sənədi rədd etmək deyil, tip pozğunluğuna qarşı təhlükəsiz oxumaq.
export const firestoreUserSchema = z.object({
    auth_uid: z.string().optional(),
    user_id: z.coerce.number().optional(),
    username: z.string().optional(),
    first_name: z.string().optional(),
    total_azc: z.coerce.number().optional(),
    high_score: z.coerce.number().optional(),
    referrals: z.array(z.coerce.number()).optional(),
    referred_by: z.coerce.number().optional(),
    friends: z.array(z.coerce.number()).optional(),
    completed_tasks: z.array(z.string()).optional(),
    daily_earnings: z.coerce.number().optional(),
    daily_high_score: z.coerce.number().optional(),
    weekly_high_score: z.coerce.number().optional(),
    last_daily_reset: z.string().optional(),
    current_week_id: z.string().optional(),
    country_code: z.string().optional(),
    created_at: z.string().optional(),
    last_login: z.string().optional(),
}).passthrough();
