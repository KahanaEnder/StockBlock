import { initFirebase } from './firebase';
import {
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	type User
} from 'firebase/auth';

let auth: ReturnType<typeof initFirebase>['auth'] | null = null;

function getAuth() {
	if (!auth) {
		({ auth } = initFirebase());
	}
	return auth;
}

export async function login(email: string, password: string): Promise<User> {
	const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
	return userCredential.user;
}

export async function logout(): Promise<void> {
	await signOut(getAuth());
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
	return onAuthStateChanged(getAuth(), callback);
}
