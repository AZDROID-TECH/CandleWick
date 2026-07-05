import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyInitData } from './_lib/telegramAuth';
import { adminDb } from './_lib/admin';
import { getCurrentWeekId, getUSDateString } from './_lib/serverDate';

// POST /api/submit-score
// Body: { initData, high_score, daily_high_score, weekly_high_score, total_azc }
// Sunucu-otoriter: istemcidən gələn mütləq dəyərlərə ETİBAR ETMİR — saxlanan dəyərlərlə
// müqayisə edib limitlərə görə clamp edir və Admin SDK ilə yazır (Firestore rules-dan yan keçir).

const MAX_DAILY_LIMIT = 1000;
// Skil oyunu üçün ağlabatan yuxarı sərhəd — açıq-aşkar saxta dəyərləri kəs.
const MAX_SCORE = 10_000_000;

const toSafeInt = (value: unknown): number => {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n) || n < 0) {
        return 0;
    }
    return Math.floor(n);
};

const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

interface StoredUser {
    total_azc?: number;
    high_score?: number;
    daily_earnings?: number;
    daily_high_score?: number;
    weekly_high_score?: number;
    last_daily_reset?: string;
    current_week_id?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'method_not_allowed' });
        return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        res.status(500).json({ error: 'server_not_configured' });
        return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const initData = typeof body.initData === 'string' ? body.initData : '';

    const auth = verifyInitData(initData, botToken);
    if (!auth.ok || !auth.user) {
        res.status(401).json({ error: auth.error || 'unauthorized' });
        return;
    }

    // İstemcidən gələn mütləq (absolute) dəyərlər — yalnız namizəd kimi qəbul edilir.
    const submittedTotal = toSafeInt(body.total_azc);
    const submittedHigh = clamp(toSafeInt(body.high_score), 0, MAX_SCORE);
    const submittedDailyHigh = clamp(toSafeInt(body.daily_high_score), 0, MAX_SCORE);
    const submittedWeeklyHigh = clamp(toSafeInt(body.weekly_high_score), 0, MAX_SCORE);

    const uid = String(auth.user.id);
    const userRef = adminDb.collection('users').doc(uid);

    try {
        const serverDate = getUSDateString();
        const serverWeekId = getCurrentWeekId();

        const result = await adminDb.runTransaction(async (tx) => {
            const snap = await tx.get(userRef);
            const stored = (snap.exists ? snap.data() : {}) as StoredUser;

            const resetDaily = stored.last_daily_reset !== serverDate;
            const resetWeekly = stored.current_week_id !== serverWeekId;

            const storedTotal = toSafeInt(stored.total_azc);
            const baseDailyEarnings = resetDaily ? 0 : toSafeInt(stored.daily_earnings);
            const remainingDaily = Math.max(0, MAX_DAILY_LIMIT - baseDailyEarnings);

            // total_azc yalnız ARTA bilər və artım günlük qalan icazəni keçə bilməz.
            const requestedDelta = clamp(submittedTotal - storedTotal, 0, remainingDaily);
            const newTotal = storedTotal + requestedDelta;
            const newDailyEarnings = baseDailyEarnings + requestedDelta;

            // Rekordlar monoton (yalnız artır); sıfırlama olsa yeni dövr üçün namizəddən götür.
            const newHigh = Math.max(toSafeInt(stored.high_score), submittedHigh);
            const newDailyHigh = resetDaily
                ? submittedDailyHigh
                : Math.max(toSafeInt(stored.daily_high_score), submittedDailyHigh);
            const newWeeklyHigh = resetWeekly
                ? submittedWeeklyHigh
                : Math.max(toSafeInt(stored.weekly_high_score), submittedWeeklyHigh);

            const updateData = {
                total_azc: newTotal,
                high_score: newHigh,
                daily_earnings: newDailyEarnings,
                daily_high_score: newDailyHigh,
                weekly_high_score: newWeeklyHigh,
                last_daily_reset: serverDate,
                current_week_id: serverWeekId,
                last_login: new Date().toISOString()
            };

            if (snap.exists) {
                tx.update(userRef, updateData);
            } else {
                // Sənəd yoxdursa minimal yarat (əsas hesab yaradılması useAuth/session tərəfindədir).
                tx.set(userRef, {
                    auth_uid: uid,
                    user_id: auth.user!.id,
                    first_name: auth.user!.first_name || 'Anonymous',
                    ...updateData
                }, { merge: true });
            }

            return updateData;
        });

        res.status(200).json({ ok: true, data: result });
    } catch (error) {
        console.error('submit-score xətası:', error);
        res.status(500).json({ error: 'write_failed' });
    }
}
