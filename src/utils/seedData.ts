import { doc, setDoc } from 'firebase/firestore';
import db from '../firebase/db';
import { FirestoreUser } from '../types/firestore';
import { getUSDateString, getCurrentWeekId } from './dateUtils';

const NAMES = ["Ali", "Vali", "Aysel", "Nigar", "Orxan", "Leyla", "Murad", "Tural", "Zaur", "Elvin", "Gunel", "Sabina", "Anar", "Rashad", "Vusal"];
const COUNTRIES = ["AZ", "TR", "US", "RU", "GB", "DE"];

export const seedDatabase = async (count: number = 50) => {
    console.log(`Seeding ${count} users...`);
    const promises = [];
    const now = new Date().toISOString();
    const usDate = getUSDateString();
    const weekId = getCurrentWeekId();

    for (let i = 0; i < count; i++) {
        const id = 1000000 + i;
        const name = NAMES[Math.floor(Math.random() * NAMES.length)] + `_${Math.floor(Math.random() * 100)}`;
        const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        const score = Math.floor(Math.random() * 5000);
        const weeklyScore = Math.floor(Math.random() * score);

        const user: FirestoreUser = {
            user_id: id,
            first_name: name,
            username: name.toLowerCase(),
            total_azc: Math.floor(Math.random() * 10000),
            high_score: score,
            weekly_high_score: weeklyScore,
            daily_high_score: Math.floor(Math.random() * weeklyScore),
            daily_earnings: 0,
            last_daily_reset: usDate,
            current_week_id: weekId,
            country_code: country,
            referrals: [],
            friends: [],
            completed_tasks: [],
            created_at: now,
            last_login: now
        };

        promises.push(setDoc(doc(db, 'users', id.toString()), user));
    }

    await Promise.all(promises);
    console.log("Seeding complete!");
    return true;
};
