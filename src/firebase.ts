import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyArztdvpQw8rYoRitNA-QJWDyzrjDSl8xE",
  authDomain: "alfadanga-apps.firebaseapp.com",
  projectId: "alfadanga-apps",
  storageBucket: "alfadanga-apps.firebasestorage.app",
  messagingSenderId: "113762032599",
  appId: "1:113762032599:web:347ffe30f9f235e1f1c992"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
  experimentalForceLongPolling: true
});
export const storage = getStorage(app);
export default app;
