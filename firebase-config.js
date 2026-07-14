import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

// Configuración exclusiva de Firebase.
// Reemplazar estos valores con la configuración real de la app web creada en Firebase Console.
export const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

export function isFirebaseConfigured() {
    return Boolean(
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId &&
        firebaseConfig.appId
    );
}

export function initializeFirebase() {
    if (!isFirebaseConfigured()) {
        return null;
    }

    if (getApps().length > 0) {
        return getApp();
    }

    return initializeApp(firebaseConfig);
}
