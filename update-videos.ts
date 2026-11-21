import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({
  projectId: "ai-studio-5babc2fe-c84d-4fe8-827a-ea5925074179"
});
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('videos').get();
  let found = 0;
  for (const doc of snapshot.docs) {
    console.log(doc.id, '=>', doc.data().title);
    found++;
  }
  console.log("Found", found, "videos");
}
run();
