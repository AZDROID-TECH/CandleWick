// Helper to get current NY Date
const getNYDate = () => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
};

export const getTimeUntilWeeklyReset = (): number => {
    const nyNow = getNYDate();
    const day = nyNow.getDay(); // 0 (Sun) - 6 (Sat) in NY time

    // Calculate days until next Monday (1)
    let daysUntilMonday = (8 - (day || 7)) % 7;
    if (daysUntilMonday === 0) {
        // If it's Monday, check if we want next Monday (usually yes, unless logic requires exact 00:00 trigger)
        // Ideally, we want the end of the current week (next Monday 00:00)
        daysUntilMonday = 7;
    }

    // Target is NY midnight
    const targetNY = new Date(nyNow);
    targetNY.setDate(nyNow.getDate() + daysUntilMonday);
    targetNY.setHours(0, 0, 0, 0);

    return targetNY.getTime() - nyNow.getTime();
};

export const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return "0m";
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    // Format: 2d 10h 45m
    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    result += `${minutes}m`;

    return result.trim();
};

export const getCurrentWeekId = (): string => {
    const d = getNYDate();
    // ISO-8601 Week Number implementation adapted for NY Date object
    const dayNum = d.getDay() || 7;
    d.setDate(d.getDate() + 4 - dayNum);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

    return `${d.getFullYear()}-W${weekNo}`;
};

export const getUSDateString = (): string => {
    return new Date().toLocaleDateString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};
