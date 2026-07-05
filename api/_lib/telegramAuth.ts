import crypto from 'node:crypto';

// Telegram Mini App initData imzasının server tərəfli yoxlanması.
// Bax: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

export interface TelegramInitUser {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

export interface VerifyResult {
    ok: boolean;
    user?: TelegramInitUser;
    error?: string;
}

// auth_date təzəliyi üçün maksimum yaş (saniyə) — 24 saat
const MAX_AUTH_AGE_SECONDS = 86400;

export function verifyInitData(initData: string, botToken: string): VerifyResult {
    if (!initData || !botToken) {
        return { ok: false, error: 'missing_init_data_or_token' };
    }

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
        return { ok: false, error: 'missing_hash' };
    }

    // data_check_string: "hash" xaric bütün açar=dəyər cütləri, açar üzrə sıralanmış, \n ilə birləşdirilmiş
    const pairs: string[] = [];
    params.forEach((value, key) => {
        if (key !== 'hash') {
            pairs.push(`${key}=${value}`);
        }
    });
    pairs.sort();
    const dataCheckString = pairs.join('\n');

    // secret_key = HMAC_SHA256("WebAppData", bot_token)
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    // Sabit-vaxtlı müqayisə (timing attack qarşısını almaq üçün)
    let hashBuffer: Buffer;
    let computedBuffer: Buffer;
    try {
        hashBuffer = Buffer.from(hash, 'hex');
        computedBuffer = Buffer.from(computedHash, 'hex');
    } catch {
        return { ok: false, error: 'hash_decode_error' };
    }
    if (hashBuffer.length !== computedBuffer.length || !crypto.timingSafeEqual(hashBuffer, computedBuffer)) {
        return { ok: false, error: 'hash_mismatch' };
    }

    // auth_date təzəliyi
    const authDate = Number.parseInt(params.get('auth_date') || '0', 10);
    if (!Number.isFinite(authDate) || authDate <= 0) {
        return { ok: false, error: 'invalid_auth_date' };
    }
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (nowSeconds - authDate > MAX_AUTH_AGE_SECONDS) {
        return { ok: false, error: 'auth_date_expired' };
    }

    // user JSON-un parse edilməsi
    const userRaw = params.get('user');
    if (!userRaw) {
        return { ok: false, error: 'missing_user' };
    }

    try {
        const parsed = JSON.parse(userRaw) as TelegramInitUser;
        if (typeof parsed.id !== 'number' || !Number.isFinite(parsed.id)) {
            return { ok: false, error: 'invalid_user_id' };
        }
        return { ok: true, user: parsed };
    } catch {
        return { ok: false, error: 'user_parse_error' };
    }
}
