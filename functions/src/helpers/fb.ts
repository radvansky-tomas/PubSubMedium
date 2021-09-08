import * as admin from 'firebase-admin';

admin.initializeApp();

let firestore: admin.firestore.Firestore | null = null;


const db = (): admin.firestore.Firestore => {

    if (firestore === null) {
        firestore = admin.firestore();
        firestore.settings({ ignoreUndefinedProperties: true });
    }

    return firestore
}

let authInstance: admin.auth.Auth | null = null;

const auth = (): admin.auth.Auth => {
    if (authInstance === null) {
        authInstance = admin.auth();
    }

    return authInstance;
}

export { db, auth };