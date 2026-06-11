import { initFirebase } from './firebase';
import {
	collection,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
	onSnapshot,
	type DocumentData,
	type Unsubscribe
} from 'firebase/firestore';

let db: ReturnType<typeof initFirebase>['db'] | null = null;

function getDb() {
	if (!db) {
		({ db } = initFirebase());
	}
	return db;
}

export async function getAll<T>(collectionName: string): Promise<(T & { id: string })[]> {
	const snapshot = await getDocs(collection(getDb(), collectionName));
	return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as T & { id: string }));
}

export async function add<T extends DocumentData>(collectionName: string, data: T): Promise<string> {
	const docRef = await addDoc(collection(getDb(), collectionName), data);
	return docRef.id;
}

export async function update(collectionName: string, id: string, data: Partial<DocumentData>): Promise<void> {
	const docRef = doc(getDb(), collectionName, id);
	await updateDoc(docRef, data);
}

export async function remove(collectionName: string, id: string): Promise<void> {
	const docRef = doc(getDb(), collectionName, id);
	await deleteDoc(docRef);
}

export function subscribe<T>(collectionName: string, callback: (data: (T & { id: string })[]) => void): Unsubscribe {
	return onSnapshot(collection(getDb(), collectionName), snapshot => {
		const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as T & { id: string }));
		callback(data);
	}, error => {
		console.error(`Error en onSnapshot para ${collectionName}:`, error);
	});
}
