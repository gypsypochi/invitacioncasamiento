import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    orderBy,
    query,
    setDoc,
    where
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import {
    deleteObject,
    getDownloadURL,
    getStorage,
    ref,
    uploadBytes,
    uploadBytesResumable
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

// Configuración de Firebase
export const firebaseConfig = {
    apiKey: "AIzaSyBKj8N1lOlYb2PNifEYpAzNLi-gJevApPk",
    authDomain: "centro-de-recuerdos-5c012.firebaseapp.com",
    projectId: "centro-de-recuerdos-5c012",
    storageBucket: "centro-de-recuerdos-5c012.firebasestorage.app",
    messagingSenderId: "289035844337",
    appId: "1:289035844337:web:f9c81188e71632f62d0750"
};

export function isFirebaseConfigured(config = firebaseConfig) {
    return Boolean(
        config.apiKey &&
        config.authDomain &&
        config.projectId &&
        config.storageBucket &&
        config.messagingSenderId &&
        config.appId
    );
}

function initializeFirebaseServices() {
    if (!isFirebaseConfigured(firebaseConfig)) {
        return {
            configured: false,
            app: null,
            firestore: null,
            storage: null,
            config: firebaseConfig
        };
    }

    const app = getApps().length > 0
        ? getApp()
        : initializeApp(firebaseConfig);

    return {
        configured: true,
        app,
        firestore: getFirestore(app),
        storage: getStorage(app),
        config: firebaseConfig
    };
}

const firebaseServices = initializeFirebaseServices();

export function initializeFirebase() {
    return firebaseServices;
}

export function getFirebaseApp() {
    return firebaseServices.app;
}

export function getFirebaseFirestore() {
    return firebaseServices.firestore;
}

export function getFirebaseStorage() {
    return firebaseServices.storage;
}

export function getFirebaseFirestoreHelpers() {
    return {
        collection,
        deleteDoc,
        doc,
        getDoc,
        getDocs,
        orderBy,
        query,
        setDoc,
        where
    };
}

export function getFirebaseStorageHelpers() {
    return {
        deleteObject,
        getDownloadURL,
        ref,
        uploadBytes,
        uploadBytesResumable
    };
}

if (typeof window !== "undefined") {
    window.recuerdosFirebase = firebaseServices;
    window.recuerdosFirebaseConfig = firebaseConfig;
    window.recuerdosFirebaseFirestoreHelpers = getFirebaseFirestoreHelpers();
    window.recuerdosFirebaseStorageHelpers = getFirebaseStorageHelpers();
}

if (firebaseServices.configured) {
    console.info("✅ Firebase inicializado correctamente.");
} else {
    console.warn("⚠️ Firebase todavía no está configurado.");
}
