import { initializeFirestore } from 'firebase/firestore';
import app from './client';

const db = initializeFirestore(app, {
    ignoreUndefinedProperties: true
});

export default db;
