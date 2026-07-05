import { cert, getApps, initializeApp, type App, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Service-account açarı YALNIZ server env-də saxlanılır (VITE_* deyil, istemci bundle-a düşmür).
// FIREBASE_SERVICE_ACCOUNT — tam service account JSON-u string kimi.
function loadServiceAccount(): ServiceAccount {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT env dəyişəni təyin edilməyib');
    }

    const parsed = JSON.parse(raw) as ServiceAccount & { private_key?: string };
    // Bəzi platformalarda private_key sətri \n literal kimi saxlanılır; onu bərpa et.
    if (typeof parsed.private_key === 'string') {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    return parsed;
}

// Serverless mühitdə tək instansiya (hot-reload/warm start-da təkrar init qarşısını al).
const app: App = getApps().length === 0
    ? initializeApp({ credential: cert(loadServiceAccount()) })
    : getApps()[0];

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
