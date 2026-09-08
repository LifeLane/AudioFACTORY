import { adminDb } from './backend/firebaseAdmin';
adminDb.collection('test').doc('test').set({a:1}).then(() => console.log('success')).catch(e => console.error(e));
