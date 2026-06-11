import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

function initFirebase() {
	if (!app) {
		const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
		if (!apiKey) {
			console.warn('[Firebase] Variables de entorno no encontradas (.env). Firebase no disponible.');
		}
		console.log('[Firebase] Inicializando con projectId:', firebaseConfig.projectId);
		app = initializeApp(firebaseConfig);
		db = getFirestore(app);
		auth = getAuth(app);
	}
	return { app, db, auth };
}

export { initFirebase };
