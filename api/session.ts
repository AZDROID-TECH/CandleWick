import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyInitData } from './_lib/telegramAuth';
import { adminAuth, adminDb } from './_lib/admin';
import { getCurrentWeekId, getUSDateString } from './_lib/serverDate';

// start_param-dan referrer id-ni təhlükəsiz çıxar (özünə referral qadağandır).
const parseReferrerId = (startParam: string | null, userId: number): number | null => {
    if (!startParam) {
        return null;
    }
    const parsed = Number.parseInt(startParam, 10);
    if (!Number.isFinite(parsed) || parsed === userId) {
        return null;
    }
    return parsed;
};

// POST /api/session
// Body: { initData: string }
// Cavab: { token: string } — Firebase Custom Token (uid = Telegram user_id).
// Yan təsir: istifadəçi sənədini server-otoriter upsert edir (hesab yaradılması + referral).
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

    const body = (req.body ?? {}) as { initData?: unknown };
    const initData = typeof body.initData === 'string' ? body.initData : '';

    const result = verifyInitData(initData, botToken);
    if (!result.ok || !result.user) {
        res.status(401).json({ error: result.error || 'unauthorized' });
        return;
    }

    const user = result.user;
    const uid = String(user.id);

    let token: string;
    try {
        // uid = Telegram user_id → cihazdan asılı olmayan sabit hesab.
        token = await adminAuth.createCustomToken(uid, { telegram_id: user.id });
    } catch (error) {
        console.error('createCustomToken xətası:', error);
        res.status(500).json({ error: 'token_creation_failed' });
        return;
    }

    // Server-otoriter hesab upsert + referral. Uğursuz olsa belə token qaytarılır
    // (submit-score sonradan sənədi yarada bilər), ona görə bu blok token-i bloklamır.
    try {
        const initParams = new URLSearchParams(initData);
        const referrerId = parseReferrerId(initParams.get('start_param'), user.id);
        const userRef = adminDb.collection('users').doc(uid);
        const snap = await userRef.get();
        const nowISO = new Date().toISOString();

        if (!snap.exists) {
            const newUser: Record<string, unknown> = {
                auth_uid: uid,
                user_id: user.id,
                first_name: user.first_name || 'Anonymous',
                total_azc: 0,
                high_score: 0,
                daily_earnings: 0,
                daily_high_score: 0,
                weekly_high_score: 0,
                last_daily_reset: getUSDateString(),
                current_week_id: getCurrentWeekId(),
                referrals: [],
                friends: referrerId ? [referrerId] : [],
                completed_tasks: [],
                created_at: nowISO,
                last_login: nowISO
            };
            if (user.username) {
                newUser.username = user.username;
            }
            if (referrerId) {
                newUser.referred_by = referrerId;
            }
            await userRef.set(newUser);

            if (referrerId) {
                await adminDb.collection('users').doc(String(referrerId)).set(
                    { friends: FieldValue.arrayUnion(user.id) },
                    { merge: true }
                );
            }
        } else {
            const data = snap.data() || {};
            const update: Record<string, unknown> = {
                last_login: nowISO,
                auth_uid: uid
            };

            const friends: number[] = Array.isArray(data.friends) ? data.friends : [];
            if (referrerId && !friends.includes(referrerId) && !data.referred_by) {
                update.friends = FieldValue.arrayUnion(referrerId);
                update.referred_by = referrerId;
                await adminDb.collection('users').doc(String(referrerId)).set(
                    { friends: FieldValue.arrayUnion(user.id) },
                    { merge: true }
                );
            }

            await userRef.update(update);
        }
    } catch (error) {
        console.error('session upsert xətası (token yenə də qaytarılır):', error);
    }

    res.status(200).json({ token });
}
