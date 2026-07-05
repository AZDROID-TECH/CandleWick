// Server tərəfli tarix köməkçiləri — istemcidəki src/utils/dateUtils.ts ilə EYNİ formatı verməlidir,
// əks halda günlük/həftəlik sıfırlama müqayisələri uyğunsuz olar.

const getNYDate = (): Date => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
};

// "MM/DD/YYYY" formatında NY tarixi (last_daily_reset ilə eyni).
export const getUSDateString = (): string => {
    return new Date().toLocaleDateString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

// "YYYY-Www" formatında ISO-8601 həftə id-si (current_week_id ilə eyni).
export const getCurrentWeekId = (): string => {
    const d = getNYDate();
    const dayNum = d.getDay() || 7;
    d.setDate(d.getDate() + 4 - dayNum);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};
