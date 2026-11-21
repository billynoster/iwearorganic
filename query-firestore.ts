import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  // Replace after creating the isolated I Wear Organic Firebase project.
  projectId: 'YOUR_FIREBASE_PROJECT_ID',
});

const db = getFirestore();

async function listCollections() {
  const collections = await db.listCollections();
  console.log(
    'Collections:',
    collections.map((c) => c.id)
  );
}

listCollections().catch(console.error);
