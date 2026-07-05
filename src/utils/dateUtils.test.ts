import { describe, it, expect } from 'vitest';
import {
    formatTimeRemaining,
    getCurrentWeekId,
    getTimeUntilWeeklyReset,
} from './dateUtils';

describe('formatTimeRemaining', () => {
    it('sıfır və ya mənfi üçün "0m" qaytarır', () => {
        expect(formatTimeRemaining(0)).toBe('0m');
        expect(formatTimeRemaining(-1000)).toBe('0m');
    });

    it('yalnız dəqiqələri göstərir (1 saatdan az)', () => {
        // 45 dəqiqə
        expect(formatTimeRemaining(45 * 60 * 1000)).toBe('45m');
    });

    it('saat və dəqiqəni göstərir (1 gündən az)', () => {
        // 2 saat 10 dəqiqə
        const ms = (2 * 60 * 60 + 10 * 60) * 1000;
        expect(formatTimeRemaining(ms)).toBe('2h 10m');
    });

    it('gün, saat və dəqiqəni göstərir', () => {
        // 2 gün 3 saat 5 dəqiqə
        const ms = (2 * 24 * 60 * 60 + 3 * 60 * 60 + 5 * 60) * 1000;
        expect(formatTimeRemaining(ms)).toBe('2d 3h 5m');
    });

    it('gün varsa saat 0 olsa belə göstərilir', () => {
        // 1 gün 0 saat 30 dəqiqə
        const ms = (24 * 60 * 60 + 30 * 60) * 1000;
        expect(formatTimeRemaining(ms)).toBe('1d 0h 30m');
    });
});

describe('getCurrentWeekId', () => {
    it('YYYY-Www formatında qaytarır (2 rəqəmli həftə)', () => {
        const weekId = getCurrentWeekId();
        expect(weekId).toMatch(/^\d{4}-W\d{2}$/);
    });
});

describe('getTimeUntilWeeklyReset', () => {
    it('müsbət və 7 gündən çox olmayan müddət qaytarır', () => {
        const ms = getTimeUntilWeeklyReset();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        expect(ms).toBeGreaterThan(0);
        expect(ms).toBeLessThanOrEqual(sevenDaysMs);
    });
});
