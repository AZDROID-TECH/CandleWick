export const getTimeUntilWeeklyReset = (): number => {
    const now = new Date();
    const today = now.getUTCDay(); // 0 (Sun) - 6 (Sat)

    // Calculate days until next Monday (1) (ISO Week Start)
    // If today is Monday (1), we want 7 days roughly, unless it's exactly 00:00:00
    // (8 - (today || 7)) % 7 gives:
    // Sun(0->7): 1 day
    // Mon(1): 0 days -> We want 7
    // Sat(6): 2 days

    let daysUntilMonday = (8 - (today || 7)) % 7;
    if (daysUntilMonday === 0) daysUntilMonday = 7;

    const targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday));
    targetDate.setUTCHours(0, 0, 0, 0);

    return targetDate.getTime() - now.getTime();
};

export const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return "0m";
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}g ${hours}s ${minutes}d`; // g=gün, s=saat, d=dakika (Common TR/AZ shorthand or localization?)
    // Let's stick to English generic "d h m" or localize in component.
    // The user asked for "şık ama sade". 
    // Let's return numbers and labels, or just formatted string.
    return `${days}d ${hours}h ${minutes}m`;
};

export const getCurrentWeekId = (): string => {
    const now = new Date();
    // ISO-8601 Week Number implementation for consistency
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
};

export const getUSDateString = (): string => {
    return new Date().toLocaleDateString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};
