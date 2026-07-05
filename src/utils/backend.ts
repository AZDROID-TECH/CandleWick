// İstemci → backend körpüsü. Bütün çağırışlar "yumşaq" (soft) hazırlanıb:
// backend söndürülübsə və ya cavab verməsə, çağıran kod köhnə (birbaşa Firestore) rejimə keçir.
// Bu, canlı oyunun deploy tamamlanana qədər pozulmamasını təmin edir.

// VITE_USE_BACKEND === '1'/'true' olduqda backend rejimi aktivdir.
export const isBackendEnabled = (): boolean => {
    const flag = import.meta.env.VITE_USE_BACKEND;
    return flag === '1' || flag === 'true';
};

// API əsas ünvanı — Vercel-də frontend və /api eyni origin-dədir, ona görə default boşdur.
const apiBase = (import.meta.env.VITE_API_BASE as string | undefined) || '';

// Şəbəkə çağırışları üçün maksimum gözləmə (ms) — asılıb qalmanın qarşısını al.
const REQUEST_TIMEOUT_MS = 8000;

const fetchWithTimeout = async (url: string, options: RequestInit): Promise<Response | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } catch {
        return null;
    } finally {
        clearTimeout(timeoutId);
    }
};

// initData ilə Firebase Custom Token istə. Uğursuzluqda null → çağıran anonim rejimə keçir.
export const requestCustomToken = async (initData: string): Promise<string | null> => {
    if (!initData) {
        return null;
    }
    const response = await fetchWithTimeout(`${apiBase}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData })
    });
    if (!response || !response.ok) {
        return null;
    }
    try {
        const data = await response.json() as { token?: unknown };
        return typeof data.token === 'string' ? data.token : null;
    } catch {
        return null;
    }
};

export interface ScoreSubmitPayload {
    initData: string;
    high_score: number;
    daily_high_score: number;
    weekly_high_score: number;
    total_azc: number;
}

// Skoru sunucu-otoriter yaz. Uğur → true; əks halda false (çağıran köhnə rejimə keçə bilər).
export const submitScore = async (payload: ScoreSubmitPayload): Promise<boolean> => {
    if (!payload.initData) {
        return false;
    }
    const response = await fetchWithTimeout(`${apiBase}/api/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return Boolean(response && response.ok);
};
