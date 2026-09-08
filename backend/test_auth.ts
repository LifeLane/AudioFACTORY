import { adminAuth } from './firebaseAdmin';

async function run() {
  try {
    await adminAuth.verifyIdToken("null");
  } catch (err: any) {
    console.error(err.message);
  }
}
run();
