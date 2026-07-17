const recuerdosConfig = {
    couple: {
        names: "Marcela y Jorge"
    },
    access: {
        eventCode: "marcela-jorge-2026",
        adminCode: "novios-2026"
    }
};

const recuerdosDemoData = {
    navigation: [
        {
            target: "photos-section",
            label: "Fotos Profesionales"
        },
        {
            target: "messages-section",
            label: "Muro de Mensajes"
        },
        {
            target: "albums-section",
            label: "Centro de Recuerdos"
        }
    ],
};

const accessStorageKey = "centroRecuerdosAccess";
const albumStorageKey = "centroRecuerdosAlbums";
const deviceStorageKey = "centroRecuerdosDeviceId";
const recuerdosEventId = recuerdosConfig.access.eventCode.toLowerCase();
let accessSessionVersion = 0;
const enableFirestoreUserSync = true;
const wallMessagesState = {
    items: [],
    loading: false,
    requestId: 0
};

function generatePersistentId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return `${prefix}-${window.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeDisplayName(displayName) {
    return String(displayName || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function normalizeAccessCode(value) {
    return String(value || "").trim().toLowerCase();
}

function getOrCreateDeviceId() {
    const storedDeviceId = localStorage.getItem(deviceStorageKey);

    if (storedDeviceId) {
        return storedDeviceId;
    }

    const deviceId = generatePersistentId("device");
    localStorage.setItem(deviceStorageKey, deviceId);
    return deviceId;
}

function normalizeAccessProfile(profile) {
    if (!profile) {
        return null;
    }

    const role = profile.role || profile.type || "guest";
    const displayName = role === "guest"
        ? (profile.displayName || profile.name || "")
        : (profile.displayName || profile.name || "Administrador");
    const deviceId = profile.deviceId || getOrCreateDeviceId();
    const normalizedName = normalizeDisplayName(displayName);
    const fallbackUserId = role === "guest" ? `guest-${normalizedName}` : deviceId;
    const currentUserId = profile.userId;
    const isLegacyUserId = currentUserId === deviceId || currentUserId === `guest-${deviceId}` || (currentUserId && currentUserId.includes(`-${deviceId}-`)) || (currentUserId && currentUserId.startsWith(`guest-${deviceId}-`));
    const userId = (role === "guest" && (isLegacyUserId || !currentUserId))
        ? fallbackUserId
        : (currentUserId || fallbackUserId);

    return {
        ...profile,
        userId,
        deviceId,
        role,
        type: profile.type || role,
        displayName,
        displayNameNormalized: profile.displayNameNormalized || normalizeDisplayName(displayName),
        name: role === "guest" ? displayName : (profile.name || ""),
        albumId: profile.albumId || null,
        createdAt: profile.createdAt || profile.enteredAt || null,
        lastSeenAt: profile.lastSeenAt || profile.enteredAt || profile.createdAt || null
    };
}

function saveAccessProfile(profile) {
    const normalizedProfile = normalizeAccessProfile(profile);

    if (!normalizedProfile) {
        return null;
    }

    localStorage.setItem(accessStorageKey, JSON.stringify(normalizedProfile));
    return normalizedProfile;
}

function invalidateAccessSession() {
    accessSessionVersion += 1;
    return accessSessionVersion;
}

function getCurrentAccessSessionVersion() {
    return accessSessionVersion;
}

function buildFirestoreUserRecord(profile) {
    const normalizedProfile = normalizeAccessProfile(profile);

    if (!normalizedProfile) {
        return null;
    }

    const now = new Date().toISOString();

    return {
        userId: normalizedProfile.userId,
        displayName: normalizedProfile.displayName,
        displayNameNormalized: normalizedProfile.displayNameNormalized,
        role: normalizedProfile.role,
        deviceId: normalizedProfile.deviceId,
        ...(normalizedProfile.albumId ? { albumId: normalizedProfile.albumId } : {}),
        createdAt: normalizedProfile.createdAt || normalizedProfile.enteredAt || now,
        lastSeenAt: now
    };
}

function classifyFirestoreError(error) {
    const code = String(error && (error.code || error.name || "")).toLowerCase();
    const message = String(error && (error.message || "")).toLowerCase();

    if (code.includes("permission-denied") || code.includes("unauthenticated") || message.includes("missing or insufficient permissions")) {
        return {
            category: "rules",
            detail: "Las reglas de Firestore están bloqueando la lectura o escritura en `events/{eventId}/users/{userId}`."
        };
    }

    if (code.includes("failed-precondition") || code.includes("unavailable") || code.includes("network-request-failed")) {
        return {
            category: "configuration",
            detail: "Firestore no pudo completar la operación por una configuración pendiente, conectividad o servicio no disponible."
        };
    }

    if (code.includes("firebase") || code.includes("app/no-app") || message.includes("firebase") || message.includes("initialize")) {
        return {
            category: "initialization",
            detail: "La inicialización de Firebase no se completó correctamente."
        };
    }

    return {
        category: "unknown",
        detail: "Ocurrió un error inesperado al comunicar la app con Firestore."
    };
}

function classifyFirebaseStorageError(error) {
    const code = String(error && (error.code || error.name || "")).toLowerCase();
    const message = String(error && (error.message || "")).toLowerCase();

    if (code.includes("storage/unauthorized") || code.includes("unauthorized") || message.includes("missing or insufficient permissions")) {
        return {
            category: "rules",
            detail: "Las reglas de Storage están bloqueando la subida o eliminación de archivos."
        };
    }

    if (code.includes("storage/bucket-not-found") || code.includes("bucket-not-found") || code.includes("storage/object-not-found")) {
        return {
            category: "bucket",
            detail: "El bucket configurado no existe o la ruta del archivo no es válida."
        };
    }

    if (code.includes("storage/retry-limit-exceeded") || code.includes("storage/unknown") || code.includes("network-request-failed") || message.includes("network")) {
        return {
            category: "configuration",
            detail: "Firebase Storage no pudo completar la operación por conectividad, configuración o servicio no disponible."
        };
    }

    return {
        category: "unknown",
        detail: "Ocurrió un error inesperado al comunicar la app con Firebase Storage."
    };
}

async function getFirebaseUserSyncApi() {
    const firebaseState = window.recuerdosFirebase || null;
    const firestoreHelpers = window.recuerdosFirebaseFirestoreHelpers || null;

    if (firebaseState && firebaseState.configured && firebaseState.firestore && firestoreHelpers && firestoreHelpers.doc && firestoreHelpers.getDoc && firestoreHelpers.setDoc) {
        return {
            firestore: firebaseState.firestore,
            ...firestoreHelpers
        };
    }

    try {
        const firebaseModule = await import("./firebase-config.js");
        const resolvedState = firebaseModule.initializeFirebase();
        const resolvedHelpers = firebaseModule.getFirebaseFirestoreHelpers();

        if (!resolvedState || !resolvedState.configured || !resolvedState.firestore) {
            return null;
        }

        return {
            firestore: resolvedState.firestore,
            ...resolvedHelpers
        };
    } catch (error) {
        const issue = classifyFirestoreError(error);
        console.error(`[Recuerdos] No se pudo preparar Firestore para usuarios. Motivo: ${issue.category}. ${issue.detail}`, error);
        return null;
    }
}

async function syncAccessProfileWithFirestore(profile = getStoredAccessProfile(), sessionVersion = getCurrentAccessSessionVersion()) {
    const normalizedProfile = normalizeAccessProfile(profile);

    if (!normalizedProfile) {
        return null;
    }

    if (!enableFirestoreUserSync) {
        return normalizedProfile;
    }

    if (sessionVersion !== getCurrentAccessSessionVersion()) {
        return normalizedProfile;
    }

    const firestoreApi = await getFirebaseUserSyncApi();

    if (!firestoreApi) {
        return normalizedProfile;
    }

    if (sessionVersion !== getCurrentAccessSessionVersion()) {
        return normalizedProfile;
    }

    try {
        const userRef = firestoreApi.doc(
            firestoreApi.firestore,
            "events",
            recuerdosEventId,
            "users",
            normalizedProfile.userId
        );
        const snapshot = await firestoreApi.getDoc(userRef);
        if (sessionVersion !== getCurrentAccessSessionVersion()) {
            return normalizedProfile;
        }

        const firestoreProfile = snapshot.exists() ? snapshot.data() : null;
        const mergedProfile = normalizeAccessProfile({
            ...normalizedProfile,
            userId: normalizedProfile.userId,
            deviceId: normalizedProfile.deviceId,
            role: (firestoreProfile && firestoreProfile.role) || normalizedProfile.role,
            type: (firestoreProfile && firestoreProfile.role) || normalizedProfile.type,
            displayName: (firestoreProfile && firestoreProfile.displayName) || normalizedProfile.displayName,
            name: (firestoreProfile && firestoreProfile.role === "guest")
                ? (firestoreProfile.displayName || normalizedProfile.displayName)
                : (normalizedProfile.name || ""),
            albumId: (firestoreProfile && firestoreProfile.albumId) || normalizedProfile.albumId || null,
            createdAt: (firestoreProfile && firestoreProfile.createdAt) || normalizedProfile.createdAt || normalizedProfile.enteredAt,
            lastSeenAt: new Date().toISOString()
        });
        const firestoreRecord = buildFirestoreUserRecord(mergedProfile);

        if (!firestoreRecord) {
            return mergedProfile;
        }

        await firestoreApi.setDoc(userRef, firestoreRecord, { merge: true });

        if (sessionVersion !== getCurrentAccessSessionVersion()) {
            return mergedProfile;
        }

        if (firestoreProfile) {
            saveAccessProfile(mergedProfile);
        }

        return mergedProfile;
    } catch (error) {
        if (sessionVersion !== getCurrentAccessSessionVersion()) {
            return normalizedProfile;
        }

        const issue = classifyFirestoreError(error);
        console.error(`[Recuerdos] No se pudo sincronizar el usuario con Firestore. Motivo: ${issue.category}. ${issue.detail}`, error);
        showToast(`No pudimos sincronizar tu sesión con Firebase. Se mantuvo guardada en este dispositivo.`, "error");
        return normalizedProfile;
    }
}

function getGuestAlbumFirestorePath(albumId) {
    return {
        albumId,
        albumDocPath: ["events", recuerdosEventId, "albums", albumId],
        photosCollectionPath: ["events", recuerdosEventId, "albums", albumId, "photos"]
    };
}

async function getFirebaseGuestAlbumApi() {
    const firebaseState = window.recuerdosFirebase || null;
    const firestoreHelpers = window.recuerdosFirebaseFirestoreHelpers || null;
    const storageHelpers = window.recuerdosFirebaseStorageHelpers || null;

    if (firebaseState && firebaseState.configured && firebaseState.firestore && firebaseState.storage && firestoreHelpers && storageHelpers) {
        return {
            firestore: firebaseState.firestore,
            storage: firebaseState.storage,
            ...firestoreHelpers,
            ...storageHelpers
        };
    }

    try {
        const firebaseModule = await import("./firebase-config.js");
        const resolvedState = firebaseModule.initializeFirebase();
        const resolvedFirestoreHelpers = firebaseModule.getFirebaseFirestoreHelpers();
        const resolvedStorageHelpers = firebaseModule.getFirebaseStorageHelpers();

        if (!resolvedState || !resolvedState.configured || !resolvedState.firestore || !resolvedState.storage) {
            return null;
        }

        return {
            firestore: resolvedState.firestore,
            storage: resolvedState.storage,
            ...resolvedFirestoreHelpers,
            ...resolvedStorageHelpers
        };
    } catch (error) {
        return null;
    }
}

function buildGuestAlbumFirestoreRecord(album, profile, overrides = {}) {
    const normalizedAlbum = normalizeGuestAlbumRecord(album);
    const now = new Date().toISOString();

    return {
        albumId: normalizedAlbum.id,
        albumType: normalizedAlbum.albumType || "guest",
        ownerUserId: overrides.ownerUserId || normalizedAlbum.ownerUserId || (profile && profile.userId) || null,
        ownerName: normalizedAlbum.ownerName,
        ownerType: normalizedAlbum.ownerType || "guest",
        title: normalizedAlbum.title || normalizedAlbum.ownerName,
        createdAt: normalizedAlbum.createdAt || now,
        lastActivityAt: overrides.lastActivityAt || normalizedAlbum.lastActivityAt || now,
        coverPhotoId: normalizedAlbum.coverPhotoId || null,
        coverPhotoUrl: normalizedAlbum.coverPhotoUrl || null,
        photoCount: typeof normalizedAlbum.photoCount === "number" ? normalizedAlbum.photoCount : (Array.isArray(normalizedAlbum.photos) ? normalizedAlbum.photos.length : 0),
        videoCount: typeof normalizedAlbum.videoCount === "number" ? normalizedAlbum.videoCount : (normalizedAlbum.video ? 1 : 0),
        video: normalizedAlbum.video ? {
            id: normalizedAlbum.video.id,
            kind: "video",
            name: normalizedAlbum.video.name,
            src: normalizedAlbum.video.src,
            createdAt: normalizedAlbum.video.createdAt,
            fileName: normalizedAlbum.video.fileName,
            mimeType: normalizedAlbum.video.mimeType,
            storagePath: normalizedAlbum.video.storagePath,
            downloadUrl: normalizedAlbum.video.downloadUrl
        } : null
    };
}

function buildGuestPhotoFirestoreRecord(item, profile, overrides = {}) {
    const normalizedItem = normalizeGuestMediaItem(item, "photo");
    const now = new Date().toISOString();

    return {
        photoId: normalizedItem.id,
        albumId: normalizedItem.albumId || overrides.albumId || (profile && profile.albumId) || null,
        albumType: normalizedItem.albumType || overrides.albumType || "guest",
        ownerUserId: normalizedItem.ownerUserId || overrides.ownerUserId || (profile && profile.userId) || null,
        ownerName: overrides.ownerName || (profile && profile.displayName) || normalizedItem.name || "Invitado",
        storagePath: normalizedItem.storagePath || null,
        downloadUrl: normalizedItem.downloadUrl || normalizedItem.src || "",
        fileName: normalizedItem.fileName || null,
        mimeType: normalizedItem.mimeType || null,
        published: normalizedItem.published !== false,
        createdAt: normalizedItem.createdAt || now,
        updatedAt: now,
        createdBy: normalizedItem.createdBy || overrides.createdBy || null,
        order: typeof normalizedItem.order === "number" ? normalizedItem.order : (typeof overrides.order === "number" ? overrides.order : 0),
        width: normalizedItem.width || null,
        height: normalizedItem.height || null
    };
}

function updateGuestAlbumPreviewMetadata(album) {
    const normalizedAlbum = normalizeGuestAlbumRecord(album);
    const photos = normalizedAlbum.photos || [];
    const firstPhoto = photos[0] || null;

    return normalizeGuestAlbumRecord({
        ...normalizedAlbum,
        ownerUserId: normalizedAlbum.ownerUserId || null,
        albumType: normalizedAlbum.albumType || "guest",
        title: normalizedAlbum.title || normalizedAlbum.ownerName || "Invitado",
        lastActivityAt: new Date().toISOString(),
        coverPhotoId: firstPhoto ? firstPhoto.id : null,
        coverPhotoUrl: firstPhoto ? firstPhoto.downloadUrl || firstPhoto.src : null,
        photoCount: photos.length,
        videoCount: normalizedAlbum.video ? 1 : 0
    });
}

function setGuestUploadProgress(nextProgress) {
    guestCenterState.uploadProgress = {
        ...guestCenterState.uploadProgress,
        ...nextProgress
    };
}

function resetGuestUploadProgress() {
    guestCenterState.uploadProgress = {
        active: false,
        completed: 0,
        total: 0,
        label: "",
        fileName: ""
    };
}

function isSupportedGuestImageFile(file) {
    if (!file) {
        return false;
    }

    const mimeType = String(file.type || "").toLowerCase();
    const extension = String(file.name || "").split(".").pop().toLowerCase();

    return Boolean(
        mimeType === "image/jpeg" ||
        mimeType === "image/jpg" ||
        mimeType === "image/png" ||
        mimeType === "image/webp" ||
        ["jpg", "jpeg", "png", "webp"].includes(extension)
    );
}

function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
        const objectUrl = window.URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            window.URL.revokeObjectURL(objectUrl);
            resolve({
                image,
                width: image.naturalWidth || image.width || 0,
                height: image.naturalHeight || image.height || 0
            });
        };

        image.onerror = () => {
            window.URL.revokeObjectURL(objectUrl);
            reject(new Error("No se pudo cargar la imagen."));
        };

        image.src = objectUrl;
    });
}

async function compressGuestImageFile(file) {
    const loadedImage = await loadImageFromFile(file);

    if (!loadedImage.width || !loadedImage.height) {
        throw new Error("No se pudo leer el tamaño de la imagen.");
    }

    const maxDimension = 1920;
    const scale = Math.min(1, maxDimension / loadedImage.width, maxDimension / loadedImage.height);
    const width = Math.max(1, Math.round(loadedImage.width * scale));
    const height = Math.max(1, Math.round(loadedImage.height * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("No se pudo preparar la compresión de la imagen.");
    }

    canvas.width = width;
    canvas.height = height;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(loadedImage.image, 0, 0, width, height);

    const blob = await new Promise((resolve) => {
        canvas.toBlob((result) => resolve(result), "image/jpeg", 0.84);
    });

    if (!blob) {
        throw new Error("No se pudo comprimir la imagen.");
    }

    return {
        blob,
        mimeType: "image/jpeg",
        width,
        height
    };
}

function createGuestAlbumUploadItem(file, index) {
    return normalizeGuestMediaItem({
        id: generateGuestId("guest-photo"),
        kind: "photo",
        name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Foto",
        src: window.URL.createObjectURL(file),
        createdAt: new Date().toISOString(),
        fileName: file.name,
        mimeType: file.type || null,
        objectUrl: null,
        albumId: null,
        albumType: "guest",
        ownerUserId: null,
        storagePath: null,
        downloadUrl: null,
        published: true,
        order: index,
        createdBy: "guest"
    }, "photo");
}

const recuerdosAppState = {
    messageColor: "rose",
    officialAlbum: {
        initialized: false,
        seedItems: [],
        uploadedItems: [],
        items: [],
        activeIndex: 0,
        lightboxIndex: null,
        adminPanelOpen: false,
        firebaseLoading: false,
        firebaseLoaded: false,
        firebaseBootstrapAttempted: false,
        guestRefreshAttempted: false,
        uploadProgress: {
            active: false,
            completed: 0,
            total: 0,
            label: "",
            fileName: ""
        }
    }
};

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

function renderAlbumsSection() {
    const section = document.getElementById("albums-section");
    const activeElement = document.activeElement;
    const shouldRestoreSearchFocus = Boolean(activeElement && activeElement.id === "guest-album-search");
    const searchSelection = shouldRestoreSearchFocus
        ? {
            value: activeElement.value,
            start: activeElement.selectionStart,
            end: activeElement.selectionEnd,
            direction: activeElement.selectionDirection
        }
        : null;
    const previousScrollY = window.scrollY;

    if (!section) {
        return;
    }

    const profile = getStoredAccessProfile();
    const isGuest = profile && profile.type === "guest" && profile.name;

    section.className = "section bg-lavanda recuerdos-center-section";

    if (isGuest) {
        section.innerHTML = renderGuestCenterSection(profile);
        renderGuestPersonalAlbumPreview();
        bindGuestAlbumInteractions();

        if (shouldRestoreSearchFocus) {
            const nextSearchInput = document.getElementById("guest-album-search");

            if (nextSearchInput) {
                nextSearchInput.focus({ preventScroll: true });

                if (searchSelection) {
                    const selectionStart = typeof searchSelection.start === "number" ? searchSelection.start : searchSelection.value.length;
                    const selectionEnd = typeof searchSelection.end === "number" ? searchSelection.end : searchSelection.value.length;

                    try {
                        nextSearchInput.setSelectionRange(selectionStart, selectionEnd, searchSelection.direction || "none");
                    } catch (error) {
                        nextSearchInput.setSelectionRange(selectionStart, selectionEnd);
                    }
                }
            }

            window.scrollTo({ top: previousScrollY, left: 0, behavior: "auto" });
        }
        return;
    }

    section.innerHTML = renderAdminCenterSection();
    bindAdminAlbumInteractions();

    if (shouldRestoreSearchFocus) {
        const nextSearchInput = document.getElementById("guest-album-search");

        if (nextSearchInput) {
            nextSearchInput.focus({ preventScroll: true });

            if (searchSelection) {
                const selectionStart = typeof searchSelection.start === "number" ? searchSelection.start : searchSelection.value.length;
                const selectionEnd = typeof searchSelection.end === "number" ? searchSelection.end : searchSelection.value.length;

                try {
                    nextSearchInput.setSelectionRange(selectionStart, selectionEnd, searchSelection.direction || "none");
                } catch (error) {
                    nextSearchInput.setSelectionRange(selectionStart, selectionEnd);
                }
            }
        }

        window.scrollTo({ top: previousScrollY, left: 0, behavior: "auto" });
    }
}

function initialsFromName(name) {
    return name
        .split(" ")
        .map((word) => word.trim().charAt(0))
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function getStoredAccessProfile() {
    const storedProfile = localStorage.getItem(accessStorageKey);

    if (!storedProfile) {
        return null;
    }

    try {
        return normalizeAccessProfile(JSON.parse(storedProfile));
    } catch (error) {
        return null;
    }
}

function clearAccessProfile() {
    localStorage.removeItem(accessStorageKey);
    invalidateAccessSession();
    clearPersonalAlbumContext();

    guestCenterState.albums = [];
    guestCenterState.firebaseLoaded = false;

    const officialAlbumState = recuerdosAppState.officialAlbum;
    officialAlbumState.guestRefreshAttempted = false;
}

function getStoredAlbums() {
    return getStoredGuestAlbums();
}

function saveAlbums(albums) {
    saveStoredGuestAlbums(albums);
}

function createOfficialAlbumItem(source, origin = "seed") {
    const title = source.title || "Fotografía oficial";

    return {
        id: source.id || `${origin}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        alt: source.alt || title,
        src: source.src,
        fallbackSrc: source.fallbackSrc || source.src,
        origin,
        fileName: source.fileName || null,
        objectUrl: source.objectUrl || null,
        createdAt: source.createdAt || new Date().toISOString(),
        albumId: source.albumId || "official",
        albumType: source.albumType || "official",
        storagePath: source.storagePath || null,
        downloadUrl: source.downloadUrl || source.src || null,
        mimeType: source.mimeType || null,
        width: source.width || null,
        height: source.height || null,
        published: source.published !== false,
        order: typeof source.order === "number" ? source.order : null,
        createdBy: source.createdBy || null,
        docId: source.docId || source.id || null
    };
}

function getOfficialAlbumFirestorePath() {
    return {
        albumId: "official",
        albumDocPath: ["events", recuerdosEventId, "albums", "official"],
        photosCollectionPath: ["events", recuerdosEventId, "albums", "official", "photos"]
    };
}

async function getFirebaseOfficialAlbumApi() {
    const firebaseState = window.recuerdosFirebase || null;
    const firestoreHelpers = window.recuerdosFirebaseFirestoreHelpers || null;
    const storageHelpers = window.recuerdosFirebaseStorageHelpers || null;

    if (firebaseState && firebaseState.configured && firebaseState.firestore && firebaseState.storage && firestoreHelpers && storageHelpers) {
        return {
            firestore: firebaseState.firestore,
            storage: firebaseState.storage,
            ...firestoreHelpers,
            ...storageHelpers
        };
    }

    try {
        const firebaseModule = await import("./firebase-config.js");
        const resolvedState = firebaseModule.initializeFirebase();
        const resolvedFirestoreHelpers = firebaseModule.getFirebaseFirestoreHelpers();
        const resolvedStorageHelpers = firebaseModule.getFirebaseStorageHelpers();

        if (!resolvedState || !resolvedState.configured || !resolvedState.firestore || !resolvedState.storage) {
            return null;
        }

        return {
            firestore: resolvedState.firestore,
            storage: resolvedState.storage,
            ...resolvedFirestoreHelpers,
            ...resolvedStorageHelpers
        };
    } catch (error) {
        return null;
    }
}

function normalizeOfficialAlbumFromRecord(record, id, fallbackIndex = 0) {
    if (!record) {
        return null;
    }

    const title = record.title || normalizeOfficialAlbumFileName(record.fileName) || "Fotografía oficial";

    return createOfficialAlbumItem({
        id,
        title,
        alt: record.alt || title,
        src: record.downloadUrl || record.src || "",
        fallbackSrc: record.downloadUrl || record.src || "",
        origin: record.origin || "upload",
        fileName: record.fileName || null,
        objectUrl: record.objectUrl || null,
        createdAt: record.createdAt || new Date().toISOString(),
        albumId: record.albumId || "official",
        albumType: record.albumType || "official",
        storagePath: record.storagePath || null,
        downloadUrl: record.downloadUrl || record.src || "",
        published: record.published !== false,
        order: typeof record.order === "number" ? record.order : fallbackIndex,
        createdBy: record.createdBy || null,
        docId: id
    });
}

function buildOfficialAlbumFirestoreRecord(item, overrides = {}) {
    const now = new Date().toISOString();
    const title = item.title || normalizeOfficialAlbumFileName(item.fileName) || "Fotografía oficial";

    return {
        photoId: item.id,
        albumId: "official",
        albumType: "official",
        title,
        alt: item.alt || title,
        fileName: item.fileName || null,
        storagePath: item.storagePath || null,
        downloadUrl: item.downloadUrl || item.src || "",
        mimeType: item.mimeType || null,
        width: item.width || null,
        height: item.height || null,
        published: item.published !== false,
        origin: item.origin || "upload",
        createdAt: item.createdAt || now,
        updatedAt: now,
        createdBy: item.createdBy || overrides.createdBy || null,
        order: typeof item.order === "number" ? item.order : overrides.order || 0
    };
}

function updateOfficialAlbumMetadata(items) {
    const officialAlbumState = recuerdosAppState.officialAlbum;
    const visibleItems = Array.isArray(items) ? items.filter(Boolean) : [];
    const firstItem = visibleItems[0] || null;

    officialAlbumState.items = visibleItems;
    officialAlbumState.seedItems = visibleItems.filter((item) => item.origin === "seed");
    officialAlbumState.uploadedItems = visibleItems.filter((item) => item.origin !== "seed");
    officialAlbumState.activeIndex = Math.min(officialAlbumState.activeIndex, Math.max(visibleItems.length - 1, 0));

    return {
        coverPhotoId: firstItem ? firstItem.id : null,
        coverPhotoUrl: firstItem ? firstItem.downloadUrl || firstItem.src : null,
        lastActivityAt: new Date().toISOString(),
        photoCount: visibleItems.length
    };
}

function setOfficialAlbumUploadProgress(nextProgress) {
    recuerdosAppState.officialAlbum.uploadProgress = {
        ...recuerdosAppState.officialAlbum.uploadProgress,
        ...nextProgress
    };
}

function resetOfficialAlbumUploadProgress() {
    recuerdosAppState.officialAlbum.uploadProgress = {
        active: false,
        completed: 0,
        total: 0,
        label: "",
        fileName: ""
    };
}

async function loadOfficialAlbumFromFirebase(force = false) {
    const officialAlbumState = recuerdosAppState.officialAlbum;

    if (officialAlbumState.firebaseLoading || (officialAlbumState.firebaseLoaded && !force)) {
        return;
    }

    officialAlbumState.firebaseLoading = true;

    const firebaseApi = await getFirebaseOfficialAlbumApi();

    if (!firebaseApi) {
        officialAlbumState.firebaseLoading = false;
        officialAlbumState.firebaseLoaded = true;
        return;
    }

    try {
        const paths = getOfficialAlbumFirestorePath();
        const albumRef = firebaseApi.doc(firebaseApi.firestore, ...paths.albumDocPath);
        const photosCollectionRef = firebaseApi.collection(firebaseApi.firestore, ...paths.photosCollectionPath);
        const snapshot = await firebaseApi.getDocs(photosCollectionRef);
        let remoteItems = [];

        if (!snapshot.empty) {
            remoteItems = snapshot.docs
                .map((docSnapshot, index) => normalizeOfficialAlbumFromRecord(docSnapshot.data(), docSnapshot.id, index))
                .filter(Boolean)
                .sort((a, b) => {
                    const orderA = typeof a.order === "number" ? a.order : 0;
                    const orderB = typeof b.order === "number" ? b.order : 0;
                    return orderA - orderB;
                });
        }

        const metadata = updateOfficialAlbumMetadata(remoteItems);
        await firebaseApi.setDoc(albumRef, {
            albumId: "official",
            albumType: "official",
            title: "Álbum Oficial",
            ...metadata
        }, { merge: true });

        officialAlbumState.firebaseLoaded = true;
        officialAlbumState.firebaseLoading = false;
        renderOfficialPhotosSection();
    } catch (error) {
        officialAlbumState.firebaseLoading = false;
        officialAlbumState.firebaseLoaded = true;
        console.error("[Recuerdos] No se pudo cargar el Álbum Oficial desde Firebase.", error);
        showToast("No se pudo cargar el Álbum Oficial desde Firebase. Se muestran los recuerdos disponibles en este dispositivo.", "error");
    }
}


function pathsForPhotoDoc(photoId) {
    const paths = getOfficialAlbumFirestorePath();
    return [...paths.photosCollectionPath, photoId];
}

function initializeOfficialAlbumState() {
    const officialAlbumState = recuerdosAppState.officialAlbum;

    if (officialAlbumState.initialized) {
        if (!officialAlbumState.firebaseLoaded && !officialAlbumState.firebaseLoading) {
            void loadOfficialAlbumFromFirebase();
        }
        return;
    }

    officialAlbumState.seedItems = [];
    officialAlbumState.uploadedItems = [];
    officialAlbumState.items = [];
    officialAlbumState.initialized = true;

    void loadOfficialAlbumFromFirebase();
}

function getOfficialAlbumVisibleItems(profile = getStoredAccessProfile()) {
    initializeOfficialAlbumState();

    const officialAlbumState = recuerdosAppState.officialAlbum;
    const items = officialAlbumState.items.slice();

    return items.slice();
}

function getOfficialAlbumActiveIndex(profile = getStoredAccessProfile()) {
    const officialAlbumState = recuerdosAppState.officialAlbum;
    const items = getOfficialAlbumVisibleItems(profile);

    if (!items.length) {
        officialAlbumState.activeIndex = 0;
        return 0;
    }

    if (officialAlbumState.activeIndex >= items.length) {
        officialAlbumState.activeIndex = items.length - 1;
    }

    if (officialAlbumState.activeIndex < 0) {
        officialAlbumState.activeIndex = 0;
    }

    return officialAlbumState.activeIndex;
}

function syncOfficialAlbumBodyLock() {
    const accessModal = document.getElementById("access-modal");
    const isAccessModalOpen = accessModal && !accessModal.hidden;
    const isLightboxOpen = recuerdosAppState.officialAlbum.lightboxIndex !== null;

    document.body.classList.toggle("modal-open", isAccessModalOpen || isLightboxOpen);
}

function renderOfficialAlbumEmptyState(profile = getStoredAccessProfile()) {
    const isAdmin = profile && profile.type === "admin";

    if (!isAdmin) {
        return `
            <div class="official-album-empty-state">
                <div class="album-empty-icon" aria-hidden="true">
                    <i class="fa-solid fa-camera"></i>
                </div>
                <h3>Próximamente estarán disponibles las fotografías oficiales del evento.</h3>
            </div>
        `;
    }

    return `
        <div class="official-album-empty-state">
            <div class="album-empty-icon" aria-hidden="true">
                <i class="fa-solid fa-camera"></i>
            </div>
            <h3>Las fotografías oficiales estarán disponibles luego del casamiento.</h3>
            <p>Esta galería se completa con imágenes locales de prueba hasta que llegue la siguiente etapa.</p>
        </div>
    `;
}

function renderOfficialAlbumGallery(items, activeIndex) {
    const activeItem = items[activeIndex] || items[0];

    if (!activeItem) {
        return "";
    }

    return `
        <div class="official-gallery-shell">
            <button class="official-gallery-main" type="button" data-official-action="open-lightbox" aria-label="Abrir fotografía principal">
                <img
                    src="${escapeHTML(activeItem.src)}"
                    alt="${escapeHTML(activeItem.alt)}"
                    class="official-gallery-main-image"
                    data-fallback-src="${escapeHTML(activeItem.fallbackSrc)}"
                >
            </button>

            <div class="official-gallery-thumbs" role="tablist" aria-label="Miniaturas del álbum oficial">
                ${items.map((item, index) => `
                    <button
                        class="official-gallery-thumb${index === activeIndex ? " is-active" : ""}"
                        type="button"
                        data-official-action="select"
                        data-official-index="${index}"
                        aria-label="Ver ${escapeHTML(item.title)}"
                        aria-pressed="${index === activeIndex ? "true" : "false"}"
                    >
                        <img
                            src="${escapeHTML(item.src)}"
                            alt="${escapeHTML(item.alt)}"
                            data-fallback-src="${escapeHTML(item.fallbackSrc)}"
                        >
                    </button>
                `).join("")}
            </div>
        </div>
    `;
}

function renderOfficialAlbumAdminPanel(items, isOpen) {
    return `
        <div class="official-admin-panel${isOpen ? " is-open" : ""}"${isOpen ? "" : " hidden"}>
            <div class="official-admin-panel-head">
                <h3>Administrar fotografías</h3>
                <p>Por ahora solo podés eliminar fotografías existentes para probar el flujo.</p>
            </div>

            ${items.length ? `
                <div class="official-admin-grid">
                    ${items.map((item, index) => `
                        <article class="official-admin-card">
                            <div class="official-admin-thumb">
                                <img
                                    src="${escapeHTML(item.src)}"
                                    alt="${escapeHTML(item.alt)}"
                                    data-fallback-src="${escapeHTML(item.fallbackSrc)}"
                                >
                            </div>
                            <div class="official-admin-copy">
                                <button class="btn-rectangular btn-secundario official-admin-delete-btn" type="button" data-official-action="delete" data-official-index="${index}">Eliminar</button>
                            </div>
                        </article>
                    `).join("")}
                </div>
            ` : `
                <div class="official-admin-empty">
                    <p>No hay fotografías para eliminar todavía.</p>
                </div>
            `}
        </div>
    `;
}

function renderOfficialAlbumLightbox(items, activeIndex) {
    const activeItem = items[activeIndex];

    if (!activeItem) {
        return "";
    }

    return `
        <div class="official-lightbox" id="official-lightbox" role="dialog" aria-modal="true" aria-label="Visor de fotografías oficiales">
            <div class="official-lightbox-backdrop" data-official-action="close"></div>
            <div class="official-lightbox-panel">
                <button class="official-lightbox-close" type="button" data-official-action="close" aria-label="Cerrar visor">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
                <button class="official-lightbox-nav official-lightbox-prev" type="button" data-official-action="prev" aria-label="Fotografía anterior">
                    <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
                </button>
                <button class="official-lightbox-nav official-lightbox-next" type="button" data-official-action="next" aria-label="Fotografía siguiente">
                    <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                </button>
                <figure class="official-lightbox-figure">
                    <img
                        src="${escapeHTML(activeItem.src)}"
                        alt="${escapeHTML(activeItem.alt)}"
                        class="official-lightbox-image"
                        data-fallback-src="${escapeHTML(activeItem.fallbackSrc)}"
                    >
                </figure>
            </div>
        </div>
    `;
}

function normalizeOfficialAlbumFileName(fileName) {
    return String(fileName || "fotografia")
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function createOfficialAlbumUploadItem(file) {
    const objectUrl = window.URL.createObjectURL(file);
    const title = normalizeOfficialAlbumFileName(file.name);

    return {
        id: `official-upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: title || "Fotografía nueva",
        alt: title || "Fotografía nueva",
        src: objectUrl,
        fallbackSrc: objectUrl,
        origin: "upload",
        fileName: file.name,
        objectUrl,
        createdAt: new Date().toISOString(),
        albumId: "official",
        albumType: "official",
        published: true,
        order: null,
        createdBy: "admin"
    };
}

function removeOfficialAlbumItemFromState(itemId) {
    const officialAlbumState = recuerdosAppState.officialAlbum;
    const item = officialAlbumState.items.find((entry) => entry.id === itemId);

    if (item && item.objectUrl) {
        window.URL.revokeObjectURL(item.objectUrl);
    }

    officialAlbumState.items = officialAlbumState.items.filter((entry) => entry.id !== itemId);
    officialAlbumState.seedItems = officialAlbumState.seedItems.filter((entry) => entry.id !== itemId);
    officialAlbumState.uploadedItems = officialAlbumState.uploadedItems.filter((entry) => entry.id !== itemId);

    const visibleItems = getOfficialAlbumVisibleItems(getStoredAccessProfile());

    if (!visibleItems.length) {
        officialAlbumState.activeIndex = 0;
        officialAlbumState.lightboxIndex = null;
        officialAlbumState.adminPanelOpen = false;
        document.removeEventListener("keydown", handleOfficialAlbumKeydown);
    } else if (officialAlbumState.activeIndex >= visibleItems.length) {
        officialAlbumState.activeIndex = visibleItems.length - 1;
    }

    if (officialAlbumState.lightboxIndex !== null) {
        if (officialAlbumState.lightboxIndex >= visibleItems.length) {
            officialAlbumState.lightboxIndex = visibleItems.length - 1;
        }
        if (officialAlbumState.lightboxIndex < 0) {
            officialAlbumState.lightboxIndex = 0;
        }
    }

    renderOfficialPhotosSection();
    syncOfficialAlbumBodyLock();
}

async function persistOfficialAlbumUploads(nextItems, files) {
    const firebaseApi = await getFirebaseOfficialAlbumApi();

    if (!firebaseApi) {
        showToast("No se pudo guardar la fotografía en Firebase. Se mantiene solo en esta sesión.", "error");
        return;
    }

    const officialAlbumState = recuerdosAppState.officialAlbum;
    const paths = getOfficialAlbumFirestorePath();
    const albumRef = firebaseApi.doc(firebaseApi.firestore, ...paths.albumDocPath);
    const createdBy = (getStoredAccessProfile() && getStoredAccessProfile().type) || "admin";
    const persistedItems = [];
    setOfficialAlbumUploadProgress({
        active: true,
        completed: 0,
        total: nextItems.length,
        label: "Subiendo fotografías oficiales",
        fileName: ""
    });
    renderOfficialPhotosSection();

    try {
        for (let index = 0; index < nextItems.length; index += 1) {
            const item = nextItems[index];
            const file = files[index];
            const existingIndex = officialAlbumState.items.findIndex((entry) => entry.id === item.id);

            if (!file) {
                setOfficialAlbumUploadProgress({
                    completed: index + 1,
                    total: nextItems.length,
                    fileName: ""
                });
                renderOfficialPhotosSection();
                continue;
            }

            setOfficialAlbumUploadProgress({
                completed: index,
                total: nextItems.length,
                fileName: file.name
            });
            renderOfficialPhotosSection();

            const compressed = await compressGuestImageFile(file);
            const storagePath = `events/${recuerdosEventId}/albums/official/photos/${item.id}.jpg`;
            const storageRef = firebaseApi.ref(firebaseApi.storage, storagePath);
            const uploadTask = firebaseApi.uploadBytesResumable(storageRef, compressed.blob, {
                contentType: compressed.mimeType || "image/jpeg"
            });
            const uploadSnapshot = await new Promise((resolve, reject) => {
                uploadTask.on("state_changed",
                    (snapshot) => {
                        const totalBytes = snapshot.totalBytes || compressed.blob.size || 1;
                        const fileProgress = totalBytes > 0 ? snapshot.bytesTransferred / totalBytes : 0;
                        setOfficialAlbumUploadProgress({
                            completed: index + fileProgress,
                            total: nextItems.length,
                            fileName: file.name
                        });
                        renderOfficialPhotosSection();
                    },
                    (error) => reject(error),
                    () => resolve(uploadTask.snapshot)
                );
            });
            const downloadUrl = await firebaseApi.getDownloadURL(uploadSnapshot.ref);

            if (!officialAlbumState.items.find((entry) => entry.id === item.id)) {
                await firebaseApi.deleteObject(storageRef);
                continue;
            }

            const record = buildOfficialAlbumFirestoreRecord({
                ...item,
                src: downloadUrl,
                fallbackSrc: downloadUrl,
                storagePath,
                downloadUrl,
                mimeType: compressed.mimeType,
                width: compressed.width,
                height: compressed.height,
                createdBy,
                order: typeof item.order === "number" ? item.order : officialAlbumState.items.length + index
            }, {
                createdBy,
                order: typeof item.order === "number" ? item.order : officialAlbumState.items.length + index
            });

            await firebaseApi.setDoc(firebaseApi.doc(firebaseApi.firestore, ...paths.photosCollectionPath, item.id), record, { merge: true });

            const normalizedItem = normalizeOfficialAlbumFromRecord(record, item.id, typeof item.order === "number" ? item.order : existingIndex >= 0 ? existingIndex : index);

            if (existingIndex >= 0) {
                const currentItem = officialAlbumState.items[existingIndex];
                if (currentItem && currentItem.objectUrl && currentItem.objectUrl !== normalizedItem.objectUrl) {
                    window.URL.revokeObjectURL(currentItem.objectUrl);
                }
                officialAlbumState.items[existingIndex] = normalizedItem;
            } else {
                officialAlbumState.items.push(normalizedItem);
            }

            persistedItems.push(normalizedItem);
            setOfficialAlbumUploadProgress({
                completed: index + 1,
                total: nextItems.length,
                fileName: file.name
            });
            renderOfficialPhotosSection();
        }

        const metadata = updateOfficialAlbumMetadata(officialAlbumState.items);
        await firebaseApi.setDoc(albumRef, {
            albumId: "official",
            albumType: "official",
            title: "Álbum Oficial",
            ...metadata
        }, { merge: true });

        renderOfficialPhotosSection();
        showToast(`${persistedItems.length} fotografía${persistedItems.length === 1 ? "" : "s"} guardada${persistedItems.length === 1 ? "" : "s"} en Firebase.`, "success");
    } catch (error) {
        console.error("[Recuerdos] No se pudo guardar una fotografï¿½a del Álbum Oficial en Firebase.", error);
        showToast("No se pudo guardar una fotografía en Firebase. Se mantiene visible en esta sesión.", "error");
    }
}

async function deleteOfficialAlbumItemRemote(targetItem, profile, index) {
    const firebaseApi = await getFirebaseOfficialAlbumApi();

    if (!firebaseApi) {
        showToast("No se pudo eliminar la fotografía en Firebase. Se mantiene en la galería.", "error");
        return;
    }

    try {
        const paths = getOfficialAlbumFirestorePath();
        const albumRef = firebaseApi.doc(firebaseApi.firestore, ...paths.albumDocPath);
        const photoRef = firebaseApi.doc(firebaseApi.firestore, ...paths.photosCollectionPath, targetItem.id);

        if (targetItem.storagePath) {
            await firebaseApi.deleteObject(firebaseApi.ref(firebaseApi.storage, targetItem.storagePath));
        }

        await firebaseApi.deleteDoc(photoRef);

        removeOfficialAlbumItemFromState(targetItem.id);

        const metadata = updateOfficialAlbumMetadata(recuerdosAppState.officialAlbum.items);
        await firebaseApi.setDoc(albumRef, {
            albumId: "official",
            albumType: "official",
            title: "Álbum Oficial",
            ...metadata
        }, { merge: true });
    } catch (error) {
        console.error("[Recuerdos] No se pudo eliminar una fotografï¿½a del Álbum Oficial en Firebase.", error);
        showToast("No se pudo eliminar la fotografía en Firebase. La galería se mantuvo intacta.", "error");
    }
}

function setOfficialAlbumActiveIndex(index) {
    const officialAlbumState = recuerdosAppState.officialAlbum;
    const items = getOfficialAlbumVisibleItems();

    if (!items.length) {
        officialAlbumState.activeIndex = 0;
        return;
    }

    const nextIndex = Math.max(0, Math.min(index, items.length - 1));
    officialAlbumState.activeIndex = nextIndex;
    renderOfficialPhotosSection();
}

function openOfficialAlbumLightbox(index) {
    const officialAlbumState = recuerdosAppState.officialAlbum;
    const items = getOfficialAlbumVisibleItems();

    if (!items.length) {
        return;
    }

    officialAlbumState.lightboxIndex = Math.max(0, Math.min(index, items.length - 1));
    officialAlbumState.activeIndex = officialAlbumState.lightboxIndex;
    renderOfficialPhotosSection();
    syncOfficialAlbumBodyLock();
    document.removeEventListener("keydown", handleOfficialAlbumKeydown);
    document.addEventListener("keydown", handleOfficialAlbumKeydown);
}

function closeOfficialAlbumLightbox() {
    const officialAlbumState = recuerdosAppState.officialAlbum;

    if (officialAlbumState.lightboxIndex === null) {
        return;
    }

    officialAlbumState.lightboxIndex = null;
    renderOfficialPhotosSection();
    document.removeEventListener("keydown", handleOfficialAlbumKeydown);
    syncOfficialAlbumBodyLock();
}

function moveOfficialAlbumLightbox(step) {
    const officialAlbumState = recuerdosAppState.officialAlbum;
    const items = getOfficialAlbumVisibleItems();

    if (!items.length || officialAlbumState.lightboxIndex === null) {
        return;
    }

    const nextIndex = (officialAlbumState.lightboxIndex + step + items.length) % items.length;
    officialAlbumState.lightboxIndex = nextIndex;
    officialAlbumState.activeIndex = nextIndex;
    renderOfficialPhotosSection();
    syncOfficialAlbumBodyLock();
}

function handleOfficialAlbumKeydown(event) {
    const officialAlbumState = recuerdosAppState.officialAlbum;

    if (officialAlbumState.lightboxIndex === null) {
        return;
    }

    if (event.key === "Escape") {
        closeOfficialAlbumLightbox();
        return;
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveOfficialAlbumLightbox(-1);
        return;
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        moveOfficialAlbumLightbox(1);
    }
}

function addOfficialAlbumFiles(files) {
    const imageFiles = Array.from(files || []).filter((file) => file && file.type && file.type.startsWith("image/"));

    if (!imageFiles.length) {
        showToast("Seleccioná al menos una imagen.", "default");
        return;
    }

    initializeOfficialAlbumState();

    const officialAlbumState = recuerdosAppState.officialAlbum;
    const nextItems = imageFiles.map((file) => createOfficialAlbumUploadItem(file));
    officialAlbumState.items = officialAlbumState.items.concat(nextItems);
    officialAlbumState.uploadedItems = officialAlbumState.uploadedItems.concat(nextItems);
    renderOfficialPhotosSection();
    void persistOfficialAlbumUploads(nextItems, imageFiles);
}

function deleteOfficialAlbumItem(index) {
    const officialAlbumState = recuerdosAppState.officialAlbum;
    const profile = getStoredAccessProfile();
    const items = getOfficialAlbumVisibleItems(profile);
    const targetItem = items[index];

    if (!targetItem) {
        return;
    }

    if (!window.confirm("¿Querés eliminar esta fotografía de la galería?")) {
        return;
    }

    if (targetItem.storagePath || targetItem.docId || targetItem.origin === "seed") {
        void deleteOfficialAlbumItemRemote(targetItem, profile, index);
        return;
    }

    removeOfficialAlbumItemFromState(targetItem.id);
}

function toggleOfficialAlbumAdminPanel() {
    const officialAlbumState = recuerdosAppState.officialAlbum;
    officialAlbumState.adminPanelOpen = !officialAlbumState.adminPanelOpen;
    renderOfficialPhotosSection();
}

function initializeOfficialAlbumInteractions() {
    const uploadButton = document.querySelector('[data-official-action="upload"]');
    const manageButtons = document.querySelectorAll('[data-official-action="manage"]');
    const fileInput = document.getElementById("official-photos-input");
    const galleryMain = document.querySelector('[data-official-action="open-lightbox"]');
    const thumbButtons = document.querySelectorAll('[data-official-action="select"]');
    const adminDeleteButtons = document.querySelectorAll('[data-official-action="delete"]');
    const lightbox = document.getElementById("official-lightbox");
    const closeButtons = document.querySelectorAll('[data-official-action="close"]');
    const prevButtons = document.querySelectorAll('[data-official-action="prev"]');
    const nextButtons = document.querySelectorAll('[data-official-action="next"]');

    if (uploadButton && fileInput) {
        uploadButton.addEventListener("click", () => fileInput.click());
    }

    if (fileInput) {
        fileInput.addEventListener("change", (event) => {
            addOfficialAlbumFiles(event.target.files);
            event.target.value = "";
        });
    }

    manageButtons.forEach((button) => {
        button.addEventListener("click", toggleOfficialAlbumAdminPanel);
    });

    if (galleryMain) {
        galleryMain.addEventListener("click", () => openOfficialAlbumLightbox(getOfficialAlbumActiveIndex()));
    }

    thumbButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.officialIndex);
            if (!Number.isNaN(index)) {
                setOfficialAlbumActiveIndex(index);
            }
        });
    });

    adminDeleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.officialIndex);
            if (!Number.isNaN(index)) {
                deleteOfficialAlbumItem(index);
            }
        });
    });

    closeButtons.forEach((button) => {
        button.addEventListener("click", closeOfficialAlbumLightbox);
    });

    prevButtons.forEach((button) => {
        button.addEventListener("click", () => moveOfficialAlbumLightbox(-1));
    });

    nextButtons.forEach((button) => {
        button.addEventListener("click", () => moveOfficialAlbumLightbox(1));
    });

    if (lightbox) {
        let touchStartX = 0;
        let touchStartY = 0;

        lightbox.addEventListener("click", (event) => {
            if (event.target && event.target.classList && event.target.classList.contains("official-lightbox-backdrop")) {
                closeOfficialAlbumLightbox();
            }
        });

        lightbox.addEventListener("touchstart", (event) => {
            const touch = event.touches[0];

            if (!touch) {
                return;
            }

            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });

        lightbox.addEventListener("touchend", (event) => {
            const touch = event.changedTouches[0];

            if (!touch) {
                return;
            }

            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;

            if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX < 0) {
                    moveOfficialAlbumLightbox(1);
                } else {
                    moveOfficialAlbumLightbox(-1);
                }
            }
        }, { passive: true });
    }
}

function applyOfficialAlbumImageFallbacks(root = document) {
    const images = root.querySelectorAll("img[data-fallback-src]");

    images.forEach((image) => {
        if (image.dataset.fallbackBound === "true") {
            return;
        }

        image.dataset.fallbackBound = "true";
        image.addEventListener("error", () => {
            const fallbackSrc = image.dataset.fallbackSrc;

            if (!fallbackSrc || image.dataset.fallbackApplied === "true") {
                return;
            }

            image.dataset.fallbackApplied = "true";
            image.src = fallbackSrc;
        });
    });
}

function getWallSessionKey(profile = getStoredAccessProfile()) {
    if (profile && profile.type === "guest" && profile.name) {
        return "guest:" + profile.name;
    }

    if (profile && profile.type === "admin") {
        return "admin";
    }

    return "visitor";
}

function getCurrentWallAuthor(profile = getStoredAccessProfile()) {
    if (profile && profile.type === "guest" && profile.name) {
        return profile.name;
    }

    if (profile && profile.type === "admin") {
        return "Administración";
    }

    return "Invitado";
}

function getWallColorPalette() {
    return [
        { key: "rose", label: "Rosa", className: "accent-rose" },
        { key: "lavender", label: "Lavanda", className: "accent-lavender" },
        { key: "sand", label: "Arena", className: "accent-sand" },
        { key: "plum", label: "Ciruela", className: "accent-plum" }
    ];
}

function normalizeWallMessage(message, index = 0) {
    const palette = getWallColorPalette();
    const normalizedColor = palette.some((color) => color.key === message.color)
        ? message.color
        : palette[index % palette.length].key;

    return {
        id: message.id || "wall-" + Date.now() + "-" + index,
        author: message.author || "Invitado",
        ownerKey: message.ownerKey || "visitor",
        role: message.role || "guest",
        createdAt: message.createdAt || new Date().toISOString(),
        editedAt: message.editedAt || null,
        text: message.text || "",
        color: normalizedColor
    };
}

function getWallMessagesCollectionPath() {
    return ["events", recuerdosEventId, "messages"];
}

function getWallMessageDocumentId(messageId) {
    return String(messageId || "").trim();
}

async function getFirebaseWallApi() {
    const firebaseState = window.recuerdosFirebase || null;
    const firestoreHelpers = window.recuerdosFirebaseFirestoreHelpers || null;

    if (firebaseState && firebaseState.configured && firebaseState.firestore && firestoreHelpers && firestoreHelpers.collection && firestoreHelpers.deleteDoc && firestoreHelpers.doc && firestoreHelpers.getDocs && firestoreHelpers.setDoc) {
        return {
            firestore: firebaseState.firestore,
            ...firestoreHelpers
        };
    }

    try {
        const firebaseModule = await import("./firebase-config.js");
        const resolvedState = firebaseModule.initializeFirebase();
        const resolvedHelpers = firebaseModule.getFirebaseFirestoreHelpers();

        if (!resolvedState || !resolvedState.configured || !resolvedState.firestore || !resolvedHelpers || !resolvedHelpers.collection || !resolvedHelpers.deleteDoc || !resolvedHelpers.doc || !resolvedHelpers.getDocs || !resolvedHelpers.setDoc) {
            return null;
        }

        return {
            firestore: resolvedState.firestore,
            ...resolvedHelpers
        };
    } catch (error) {
        console.error("[Recuerdos] No se pudo preparar Firestore para el muro de comentarios.", error);
        return null;
    }
}

function buildWallMessageRecord(profile, text, overrides = {}) {
    const normalizedProfile = normalizeAccessProfile(profile);

    if (!normalizedProfile) {
        return null;
    }

    return normalizeWallMessage({
        id: overrides.id || getWallMessageDocumentId(overrides.id || generatePersistentId("wall")),
        author: overrides.author || getCurrentWallAuthor(normalizedProfile),
        ownerKey: overrides.ownerKey || getWallSessionKey(normalizedProfile),
        role: overrides.role || normalizedProfile.role,
        createdAt: overrides.createdAt || new Date().toISOString(),
        editedAt: overrides.editedAt || null,
        text: typeof text === "string" ? text.trim() : "",
        color: overrides.color || recuerdosAppState.messageColor
    });
}

function sortWallMessages(messages) {
    return messages.slice().sort((left, right) => {
        const leftTime = new Date(left.createdAt || 0).getTime();
        const rightTime = new Date(right.createdAt || 0).getTime();

        if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
            return String(right.id || "").localeCompare(String(left.id || ""));
        }

        if (Number.isNaN(leftTime)) {
            return 1;
        }

        if (Number.isNaN(rightTime)) {
            return -1;
        }

        if (leftTime !== rightTime) {
            return rightTime - leftTime;
        }

        return String(right.id || "").localeCompare(String(left.id || ""));
    });
}

async function loadWallMessagesFromFirestore() {
    const firebaseApi = await getFirebaseWallApi();

    if (!firebaseApi) {
        return [];
    }

    const messagesCollectionRef = firebaseApi.collection(firebaseApi.firestore, ...getWallMessagesCollectionPath());
    const snapshot = await firebaseApi.getDocs(messagesCollectionRef);

    if (!snapshot || snapshot.empty) {
        return [];
    }

    const messages = snapshot.docs.map((docSnapshot, index) => normalizeWallMessage({
        id: docSnapshot.id,
        ...docSnapshot.data()
    }, index));

    return sortWallMessages(messages);
}

async function refreshWallMessagesFromFirestore({ render = true } = {}) {
    const requestId = wallMessagesState.requestId + 1;
    wallMessagesState.requestId = requestId;
    wallMessagesState.loading = true;

    try {
        const messages = await loadWallMessagesFromFirestore();

        if (requestId !== wallMessagesState.requestId) {
            return messages;
        }

        wallMessagesState.items = messages;
        return messages;
    } catch (error) {
        console.error("[Recuerdos] No se pudo leer el muro desde Firestore.", error);

        if (requestId === wallMessagesState.requestId) {
            wallMessagesState.items = [];
        }

        return [];
    } finally {
        if (requestId === wallMessagesState.requestId) {
            wallMessagesState.loading = false;
        }

        if (render && requestId === wallMessagesState.requestId) {
            renderMessageBoardCards();
        }
    }
}

async function createWallMessageInFirestore(profile, text) {
    const normalizedProfile = normalizeAccessProfile(profile);

    if (!normalizedProfile || normalizedProfile.type !== "guest") {
        return null;
    }

    const firebaseApi = await getFirebaseWallApi();

    if (!firebaseApi) {
        return null;
    }

    const messageId = generatePersistentId("wall");
    const messageRecord = buildWallMessageRecord(normalizedProfile, text, {
        id: messageId
    });

    if (!messageRecord) {
        return null;
    }

    const messageRef = firebaseApi.doc(firebaseApi.firestore, ...getWallMessagesCollectionPath(), messageId);
    await firebaseApi.setDoc(messageRef, messageRecord, { merge: true });
    return messageRecord;
}

async function updateWallMessageInFirestore(message, profile, text) {
    const normalizedProfile = normalizeAccessProfile(profile);

    if (!normalizedProfile || normalizedProfile.type !== "guest") {
        return null;
    }

    const messageId = getWallMessageDocumentId(message && message.id);

    if (!messageId) {
        return null;
    }

    const firebaseApi = await getFirebaseWallApi();

    if (!firebaseApi) {
        return null;
    }

    const nextRecord = normalizeWallMessage({
        ...message,
        text: text.trim(),
        editedAt: new Date().toISOString()
    });
    const messageRef = firebaseApi.doc(firebaseApi.firestore, ...getWallMessagesCollectionPath(), messageId);
    await firebaseApi.setDoc(messageRef, nextRecord, { merge: true });
    return nextRecord;
}

async function deleteWallMessageFromFirestore(messageId) {
    const normalizedMessageId = getWallMessageDocumentId(messageId);

    if (!normalizedMessageId) {
        return false;
    }

    const firebaseApi = await getFirebaseWallApi();

    if (!firebaseApi) {
        return false;
    }

    await firebaseApi.deleteDoc(firebaseApi.doc(firebaseApi.firestore, ...getWallMessagesCollectionPath(), normalizedMessageId));
    return true;
}

function getStoredWallMessages() {
    return wallMessagesState.items.slice();
}

function saveWallMessages(messages) {
    const normalizedMessages = Array.isArray(messages)
        ? messages.map((message, index) => normalizeWallMessage(message, index))
        : [];

    wallMessagesState.items = sortWallMessages(normalizedMessages);
    return wallMessagesState.items;
}

function formatWallTimestamp(isoDate) {
    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
        return "Hace un momento";
    }

    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function ensurePersonalAlbum(guestName) {
    return getCurrentUserGuestAlbum();
}

function openAccessModal() {
    const accessModal = document.getElementById("access-modal");

    if (!accessModal) {
        return;
    }

    accessModal.hidden = false;
    document.body.classList.add("modal-open");
}

function closeAccessModal() {
    const accessModal = document.getElementById("access-modal");

    if (!accessModal) {
        return;
    }

    accessModal.hidden = true;
    document.body.classList.remove("modal-open");

    if (typeof window.initMusicPlayerUI === "function") {
        window.initMusicPlayerUI();
    }
}

function showAccessFeedback(message) {
    const feedbackElement = document.getElementById("access-feedback");

    if (feedbackElement) {
        feedbackElement.textContent = message;
    }
}

function setAccessView(view, profile = getStoredAccessProfile()) {
    const welcomeState = document.getElementById("access-modal-welcome");
    const returningState = document.getElementById("access-modal-returning");
    const successState = document.getElementById("access-modal-success");
    const guestForm = document.getElementById("guest-access-form");
    const adminForm = document.getElementById("admin-access-form");
    const guestOption = document.getElementById("guest-access-option");
    const adminOption = document.getElementById("admin-access-option");
    const returningName = document.getElementById("access-modal-returning-name");
    const successName = document.getElementById("access-modal-success-name");
    const continueBtn = document.getElementById("continue-session-btn");
    const switchUserBtn = document.getElementById("switch-user-btn");
    const openAdminFormBtn = document.getElementById("open-admin-form-btn");

    if (!welcomeState || !returningState || !successState || !guestForm || !adminForm || !guestOption || !adminOption) {
        return;
    }

    welcomeState.hidden = view !== "welcome";
    returningState.hidden = view !== "returning";
    successState.hidden = view !== "success";
    guestForm.hidden = view !== "guest-form";
    adminForm.hidden = view !== "admin-form";
    showAccessFeedback("");

    guestOption.classList.toggle("active", view === "guest-form");
    adminOption.classList.toggle("active", view === "admin-form");

    if (view === "returning") {
        const isGuest = profile && profile.type === "guest";
        const displayName = isGuest && profile.name ? profile.name : "administrador";

        if (returningName) {
            returningName.textContent = isGuest
                ? "Tu sesión guardada es para " + profile.name + "."
                : "Tu sesión de administrador sigue disponible en este dispositivo.";
        }

        if (continueBtn) {
            continueBtn.textContent = isGuest ? "Continuar como " + profile.name : "Continuar como administrador";
            continueBtn.dataset.sessionType = isGuest ? "guest" : "admin";
        }

        if (switchUserBtn) {
            switchUserBtn.textContent = isGuest ? "Cambiar de usuario" : "Cerrar sesión";
            switchUserBtn.dataset.sessionType = isGuest ? "guest" : "admin";
        }

        if (openAdminFormBtn) {
            openAdminFormBtn.hidden = false;
            openAdminFormBtn.textContent = "Ingresar como administrador";
            openAdminFormBtn.dataset.sessionType = "admin";
        }

        returningState.dataset.sessionType = displayName;
        return;
    }

    if (view === "success") {
        if (successName) {
            successName.textContent = profile && profile.type === "guest" && profile.name ? "Hola, " + profile.name : "Bienvenido";
        }

        if (openAdminFormBtn) {
            openAdminFormBtn.hidden = true;
        }

        return;
    }

    if (openAdminFormBtn) {
        openAdminFormBtn.hidden = true;
    }

    if (view === "welcome") {
        guestOption.classList.add("active");
        adminOption.classList.remove("active");
    }

    if (view === "guest-form") {
        const guestNameInput = document.getElementById("guest-name");
        if (guestNameInput) {
            guestNameInput.focus();
        }
    }

    if (view === "admin-form") {
        const adminCodeInput = document.getElementById("admin-code");
        if (adminCodeInput) {
            adminCodeInput.focus();
        }
    }
}

function showAccessWelcome(profile = getStoredAccessProfile()) {
    if (profile) {
        setAccessView("returning", profile);
        return;
    }

    setAccessView("welcome", null);
}

function showAccessSuccess(profile = getStoredAccessProfile()) {
    setAccessView("success", profile);
    if (typeof window.initMusicPlayerUI === "function") {
        window.initMusicPlayerUI();
    }
}

function renderRecuerdosAppShell() {
    const root = document.getElementById("recuerdos-app-root");

    if (!root) {
        return;
    }

    root.innerHTML = `
        <header class="recuerdos-app-hero section" data-section="recuerdos-home" id="recuerdos-home">
            <h1 id="recuerdos-greeting" class="recuerdos-app-title">Bienvenido al Centro de Recuerdos</h1>
            <p id="recuerdos-welcome-text" class="recuerdos-app-text">Un espacio para guardar, recorrer y seguir construyendo los recuerdos del casamiento.</p>

            <div class="recuerdos-hero-actions">
                <button id="change-user-btn" class="btn-rectangular btn-secundario" type="button">Cambiar de usuario</button>
                <a class="btn-rectangular" href="index.html">Volver a la invitación</a>
            </div>

            <div class="music-player">
                <div class="player-track-info">
                    <span id="player-track-title" class="track-title">Cargando...</span>
                    <span id="player-track-artist" class="track-artist">Cargando...</span>
                </div>
                <div class="player-controls">
                    <button id="player-prev-btn" class="btn-player-control" type="button" aria-label="Pista anterior"><i class="fa-solid fa-backward-step"></i></button>
                    <button id="play-music-btn" class="btn-player-play" type="button" aria-label="Reproducir o pausar"><i class="fa-solid fa-pause"></i></button>
                    <button id="player-next-btn" class="btn-player-control" type="button" aria-label="Siguiente pista"><i class="fa-solid fa-forward-step"></i></button>
                </div>
                <div class="player-volume-container">
                    <i class="fa-solid fa-volume-high" id="player-volume-icon" aria-label="Silenciar"></i>
                    <input type="range" id="player-volume-slider" min="0" max="1" step="0.05" value="1" class="volume-slider" aria-label="Volumen">
                </div>
            </div>
        </header>

        <nav class="recuerdos-nav" aria-label="Navegación principal del Centro de Recuerdos">
            <div class="recuerdos-nav-shell">
                ${recuerdosDemoData.navigation.map((item) => `
                    <a class="recuerdos-nav-link" href="#${escapeHTML(item.target)}">${escapeHTML(item.label)}</a>
                `).join("")}
            </div>
        </nav>

        <section id="photos-section" class="section bg-lavanda" data-section="photos-section"></section>
        <section id="messages-section" class="section recuerdos-section recuerdos-section-messages" data-section="messages-section"></section>
        <section id="albums-section" class="section recuerdos-section recuerdos-section-albums" data-section="albums-section"></section>
        <footer id="footer" class="section">
            <h2 id="footer-names" class="nombres">Marcela y Jorge</h2>
            <p id="footer-text" class="agradecimiento">Gracias por acompañarnos y compartir nuestra felicidad...</p>
        </footer>
    `;

    const changeUserBtn = document.getElementById("change-user-btn");
    if (changeUserBtn) {
        changeUserBtn.addEventListener("click", handleChangeUser);
    }

    if (typeof window.initMusicPlayerUI === "function") {
        window.initMusicPlayerUI();
    }
}

function renderAccessModalShell() {
    const modal = document.getElementById("access-modal");

    if (!modal) {
        return;
    }

    modal.innerHTML = `
        <div class="access-modal-card">
            <div id="access-modal-welcome" class="access-modal-state">
                <p class="access-modal-kicker">Centro de Recuerdos</p>
                <h2 id="access-modal-title"><i class="fa-solid fa-heart" style="color: var(--color-dorado); font-size: 0.85em; margin-right: 0.5rem;"></i>Bienvenidos</h2>
                <p class="access-modal-text">Elegí cómo ingresar para continuar con el recuerdo compartido del evento.</p>

                <div class="access-options" aria-label="Opciones de ingreso">
                    <button id="guest-access-option" class="access-option active" type="button"><i class="fa-solid fa-users" style="margin-right: 0.5rem;"></i>Entrar como invitado</button>
                    <button id="admin-access-option" class="access-option" type="button"><i class="fa-solid fa-ring" style="margin-right: 0.5rem;"></i>Entrar como administrador</button>
                </div>
            </div>

            <div id="access-modal-returning" class="access-modal-state" hidden>
                <p class="access-modal-kicker">Centro de Recuerdos</p>
                <h2 id="access-modal-returning-title"><i class="fa-solid fa-heart" style="color: var(--color-dorado); font-size: 0.85em; margin-right: 0.5rem;"></i>Bienvenido nuevamente ❤️</h2>
                <p id="access-modal-returning-name" class="access-modal-text"></p>

                <div class="returning-actions">
                    <button id="continue-session-btn" class="btn-rectangular" type="button">Continuar</button>
                    <button id="switch-user-btn" class="btn-rectangular btn-secundario" type="button">Cambiar de usuario</button>
                    <button id="open-admin-form-btn" class="btn-rectangular btn-secundario" type="button">Ingresar como administrador</button>
                </div>
            </div>

            <div id="access-modal-success" class="access-modal-state" hidden>
                <p class="access-modal-kicker">Centro de Recuerdos</p>
                <h2 id="access-modal-success-title"><i class="fa-solid fa-heart" style="color: var(--color-dorado); font-size: 0.85em; margin-right: 0.5rem;"></i><span id="access-modal-success-name"></span> ❤️</h2>
                <p class="access-modal-text">Tu identidad quedó guardada en este dispositivo. Podés cerrar este mensaje y seguir recorriendo el Centro de Recuerdos.</p>
                <button id="close-access-success-btn" class="btn-rectangular" type="button">Cerrar</button>
            </div>

            <form id="guest-access-form" class="access-form" hidden>
                <p class="access-form-question">¿Cómo querés que aparezca tu álbum?</p>
                <label for="guest-name">Nombre</label>
                <input id="guest-name" name="guest-name" type="text" autocomplete="name" required>

                <label for="event-code">Código del evento</label>
                <input id="event-code" name="event-code" type="text" autocomplete="off" required>

                <button class="btn-rectangular" type="submit">Ingresar como invitado</button>
                <button id="guest-back-btn" class="access-back-btn" type="button">Volver</button>
            </form>

            <form id="admin-access-form" class="access-form" hidden>
                <label for="admin-code">Código administrador</label>
                <input id="admin-code" name="admin-code" type="text" autocomplete="off" required>

                <button class="btn-rectangular" type="submit">Ingresar como administrador</button>
                <button id="admin-back-btn" class="access-back-btn" type="button">Volver</button>
            </form>

            <p id="access-feedback" class="access-feedback" aria-live="polite"></p>
        </div>
    `;
}

function renderOfficialPhotosSection() {
    const section = document.getElementById("photos-section");

    if (!section) {
        return;
    }

    const profile = getStoredAccessProfile();
    const isAdmin = profile && profile.type === "admin";
    const officialAlbumState = recuerdosAppState.officialAlbum;
    const items = getOfficialAlbumVisibleItems(profile);
    const activeIndex = getOfficialAlbumActiveIndex(profile);
    const hasOfficialPhotos = items.length > 0;
    if (!isAdmin && !hasOfficialPhotos && !officialAlbumState.firebaseLoading && !officialAlbumState.guestRefreshAttempted) {
        officialAlbumState.guestRefreshAttempted = true;
        void loadOfficialAlbumFromFirebase(true);
    }


    section.className = "section bg-lavanda";

    section.innerHTML = `
        <i class="fa-solid fa-camera icon-evento" aria-hidden="true"></i>
        <h2>Álbum Oficial</h2>
        ${hasOfficialPhotos
            ? `<p class="official-photos-lead">La galería oficial reúne fotografías oficiales del evento.</p>
               <p class="official-photos-note">Seleccioná una miniatura o abrí la fotografía principal para verla en detalle.</p>`
            : (isAdmin ? `<p class="official-photos-lead">Pronto se subirán las fotografías oficiales.</p>` : "")}

        <div class="official-photos-actions"${isAdmin ? "" : " hidden"}>
            <button class="btn-rectangular" type="button" data-official-action="upload">Subir fotografías</button>
            <button class="btn-rectangular btn-secundario" type="button" data-official-action="manage">${officialAlbumState.adminPanelOpen ? "Cerrar administración" : "Administrar fotografías"}</button>
        </div>

        <input id="official-photos-input" type="file" accept="image/*" multiple hidden>

        <div class="official-album-shell">
            ${hasOfficialPhotos
                ? renderOfficialAlbumGallery(items, activeIndex)
                : renderOfficialAlbumEmptyState(profile)}
        </div>

        ${isAdmin ? renderOfficialAlbumAdminPanel(items, officialAlbumState.adminPanelOpen) : ""}
        ${officialAlbumState.lightboxIndex !== null ? renderOfficialAlbumLightbox(items, officialAlbumState.lightboxIndex) : ""}
    `;

    initializeOfficialAlbumInteractions();
    applyOfficialAlbumImageFallbacks(section);
    syncOfficialAlbumBodyLock();
}

function renderMessageBoardSection() {
    const section = document.getElementById("messages-section");

    if (!section) {
        return;
    }

    section.innerHTML = `
        <div class="recuerdos-section-copy">
            <p class="recuerdos-section-kicker">Muro</p>
            <h2>Muro de Comentarios y Saludos</h2>
            <p>Dejá un mensaje breve y seguí recorriendo los recuerdos compartidos del casamiento.</p>
        </div>

        <div class="message-board-layout">
            <form class="message-composer" aria-label="Escribir un saludo">
                <h3 id="message-composer-title">Firmá tu recuerdo</h3>
                <p id="message-composer-text">El nombre se toma de la sesión iniciada previamente.</p>

                <div class="message-composer-name-pill" id="message-composer-name-pill"></div>
                <textarea id="message-composer-input" class="message-composer-input" placeholder="Dejá un mensaje breve..." rows="4"></textarea>
                <button id="message-composer-btn" class="btn-rectangular" type="button">Preparar saludo</button>
            </form>

            <div class="message-board-grid" id="message-board-grid" aria-live="polite"></div>
        </div>
    `;

    const profile = getStoredAccessProfile();
    const namePill = document.getElementById("message-composer-name-pill");

    if (namePill) {
        namePill.textContent = profile && profile.type === "guest" && profile.name
            ? profile.name
            : profile && profile.type === "admin"
                ? "Administración"
                : "Invitado";
    }

    renderMessageBoardCards();
}

function renderMessageBoardCards() {
    const boardElement = document.getElementById("message-board-grid");

    if (!boardElement) {
        return;
    }

    const messages = getStoredWallMessages();

    if (!messages.length) {
        boardElement.innerHTML = `
            <article class="message-card">
                <div class="message-body">
                    <div class="message-body-head">
                        <strong class="message-author">TodavÃ­a no hay mensajes</strong>
                    </div>
                    <p class="message-text">Cuando lleguen saludos reales desde Firebase, van a aparecer acÃ¡.</p>
                </div>
            </article>
        `;
        return;
    }

    boardElement.innerHTML = messages.map((message) => `
        <article class="message-card">
            <span class="message-avatar">${escapeHTML(initialsFromName(message.author))}</span>
            <div class="message-body">
                <div class="message-body-head">
                    <strong class="message-author">${escapeHTML(message.author)}</strong>
                    <span class="message-meta">${escapeHTML(formatWallTimestamp(message.createdAt))}</span>
                </div>
                <p class="message-text">${escapeHTML(message.text)}</p>
            </div>
        </article>
    `).join("");
}

function getVisibleGuestAlbums() {
    const storedAlbums = getStoredAlbums().filter((album) => album.type === "guest");
    const albumsWithContent = storedAlbums.filter((album) => album.visible && (((album.photos || []).length > 0) || album.video));

    if (albumsWithContent.length > 0) {
        return albumsWithContent.map((album, index) => ({
            id: album.id,
            title: album.title || ("Fotos de " + album.ownerName),
            ownerName: album.ownerName,
            photoCount: (album.photos ? album.photos.length : 0) + (album.video ? 1 : 0),
            accentClass: ["accent-rose", "accent-lavender", "accent-sand", "accent-plum"][index % 4],
            initials: initialsFromName(album.ownerName)
        }));
    }

    return [];
}

function getActiveGuestAlbum() {
    const profile = getStoredAccessProfile();

    if (!profile || profile.type !== "guest" || !profile.name) {
        return null;
    }

    const storedAlbums = getStoredAlbums().filter((album) => album.type === "guest");
    return storedAlbums.find((album) => album.ownerName === profile.name) || null;
}

function renderPersonalAlbumPreview() {
    const titleElement = document.getElementById("personal-album-title");
    const descriptionElement = document.getElementById("personal-album-description");
    const listElement = document.getElementById("personal-album-media-list");
    const emptyStateElement = document.getElementById("personal-album-empty-state");
    const progressElement = document.getElementById("personal-upload-progress");
    const progressBarElement = document.getElementById("personal-upload-progress-bar");
    const progressTextElement = document.getElementById("personal-upload-progress-text");
    const profile = getStoredAccessProfile();
    const activeAlbum = getActiveGuestAlbum();

    if (!titleElement || !descriptionElement || !listElement || !emptyStateElement || !progressElement || !progressBarElement || !progressTextElement) {
        return;
    }

            const guestName = profile && profile.type === "guest" && profile.name ? profile.name : "Mi álbum";
    const hasContent = activeAlbum && (((activeAlbum.photos || []).length > 0) || activeAlbum.video);

    titleElement.textContent = guestName === "Mi álbum" ? "Mi álbum" : "Mi álbum, " + guestName;
    descriptionElement.textContent = hasContent
        ? "Así se verán tus fotos y tu video organizados en tu álbum propio."
        : "Subí tus fotos y tu video para mantenerlos ordenados en tu álbum propio.";

    const items = hasContent
        ? [
            ...(activeAlbum.photos || []).map((photo, index) => ({
                kind: "photo",
                title: photo.title || ("Foto " + (index + 1)),
                meta: "Guardada en tu álbum",
                iconClass: "fa-solid fa-image"
            })),
            ...(activeAlbum.video ? [{
                kind: "video",
                title: activeAlbum.video.title || "Video único",
                meta: "Guardado en tu álbum",
                iconClass: "fa-solid fa-video"
            }] : [])
        ]
        : [];

    listElement.innerHTML = items.map((item) => `
        <article class="personal-media-item ${item.kind === "video" ? "is-video" : "is-photo"}">
            <i class="${escapeHTML(item.iconClass)}" aria-hidden="true"></i>
            <div class="personal-media-copy">
                <p class="personal-media-kind">${item.kind === "video" ? "Video" : "Foto"}</p>
                <h4 class="personal-media-title">${escapeHTML(item.title)}</h4>
                <p class="personal-media-meta">${escapeHTML(item.meta)}</p>
            </div>
        </article>
    `).join("");

    emptyStateElement.hidden = hasContent;
    listElement.hidden = !hasContent;
    progressElement.hidden = true;
    progressBarElement.style.width = "0%";
    progressTextElement.textContent = "0%";
}

function renderAll() {
    updateLandingContent();
    renderOfficialPhotosSection();
    renderMessageBoardSection();
    renderAlbumsSection();
}

function showToast(message, variant = "default") {
    const toastContainer = document.getElementById("toast-container");

    if (!toastContainer) {
        return;
    }

    const toast = document.createElement("div");
    const toastIconClass = variant === "success"
        ? "fa-solid fa-circle-check"
        : variant === "error"
            ? "fa-solid fa-triangle-exclamation"
            : "fa-solid fa-circle-info";

    toast.className = "toast" + (variant === "success" ? " toast-success" : variant === "error" ? " toast-error" : "");
    toast.innerHTML = `
        <i class="${toastIconClass} toast-icon" aria-hidden="true"></i>
        <span class="toast-message">${escapeHTML(message)}</span>
    `;

    toastContainer.appendChild(toast);

    window.setTimeout(() => {
        toast.classList.add("hide");
        window.setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400);
    }, 3000);
}

function simulatePersonalUpload(label) {
    const progressElement = document.getElementById("personal-upload-progress");
    const progressBarElement = document.getElementById("personal-upload-progress-bar");
    const progressTextElement = document.getElementById("personal-upload-progress-text");

    if (!progressElement || !progressBarElement || !progressTextElement) {
        return;
    }

    progressElement.hidden = false;
    progressBarElement.style.width = "0%";
    progressTextElement.textContent = "0%";

    let progress = 0;
    const uploadTimer = window.setInterval(() => {
        progress += 12;
        if (progress >= 100) {
            progress = 100;
        }

        progressBarElement.style.width = progress + "%";
        progressTextElement.textContent = progress + "%";

        if (progress >= 100) {
            window.clearInterval(uploadTimer);
            window.setTimeout(() => {
                appendMockPersonalMedia(label);
                progressElement.hidden = true;
                showToast(label === "Video"
                    ? "Video listo: tu recuerdo quedó guardado."
                    : "Fotos listas: tus recuerdos quedaron guardados.", "success");
            }, 300);
        }
    }, 120);
}

function appendMockPersonalMedia(label) {
    const profile = getStoredAccessProfile();

    if (!profile || profile.type !== "guest" || !profile.name) {
        return;
    }

    let albums = getStoredAlbums();
    let album = albums.find((item) => item.ownerName === profile.name && item.type === "guest");

    if (!album) {
        album = ensurePersonalAlbum(profile.name);
        albums = getStoredAlbums();
    }

    if (label === "Video") {
        if (album.video) {
            showToast("Solo se permite un video por invitado.", "error");
            return;
        }

        album.video = {
            title: "Video único",
            meta: "Guardado en tu álbum"
        };
    } else {
        const photoIndex = (album.photos ? album.photos.length : 0) + 1;
        album.photos = album.photos || [];
        album.photos.push({
            title: "Foto " + photoIndex,
            meta: "Guardada en tu álbum"
        });
        album.visible = true;
    }

    const updatedAlbums = albums.map((item) => item.id === album.id ? album : item);
    saveAlbums(updatedAlbums);
    renderAlbumsSection();
}

function updateLandingContent() {
    const greetingElement = document.getElementById("recuerdos-greeting");
    const welcomeTextElement = document.getElementById("recuerdos-welcome-text");
    const profile = getStoredAccessProfile();

    if (!greetingElement || !welcomeTextElement) {
        return;
    }

    if (profile && profile.type === "guest" && profile.name) {
        document.title = "Centro de Recuerdos - " + profile.name;
        greetingElement.textContent = "Hola, " + profile.name + " ❤️";
        welcomeTextElement.textContent = "Tu identidad quedó guardada en este dispositivo. Desde acá podés recorrer cada parte del Centro de Recuerdos.";
        ensurePersonalAlbum(profile.name);
        return;
    }

    if (profile && profile.type === "admin") {
        document.title = "Centro de Recuerdos";
        greetingElement.textContent = "Bienvenido al Centro de Recuerdos";
        welcomeTextElement.textContent = "Accediste con permisos de administración para acompañar y curar los recuerdos del evento.";
        return;
    }

    document.title = "Centro de Recuerdos";
    greetingElement.textContent = "Bienvenido al Centro de Recuerdos";
    welcomeTextElement.textContent = "No hay una sesión activa. Volvé a la invitación para ingresar como invitado o administrador.";
}

function handleChangeUser() {
    clearAccessProfile();
    showAccessWelcome(null);
    openAccessModal();
    renderAll();
}

async function handleGuestAccess(event) {
    event.preventDefault();

    const guestName = document.getElementById("guest-name");
    const eventCode = document.getElementById("event-code");
    const guestNameValue = guestName ? guestName.value.trim() : "";
    const eventCodeValue = eventCode ? normalizeAccessCode(eventCode.value) : "";

    if (!guestNameValue || eventCodeValue !== normalizeAccessCode(recuerdosConfig.access.eventCode)) {
        showAccessFeedback("Revisá tu nombre y el código del evento para ingresar.");
        return;
    }

    const now = new Date().toISOString();
    const profile = saveAccessProfile({
        name: guestNameValue,
        displayName: guestNameValue,
        type: "guest",
        role: "guest",
        enteredAt: now,
        createdAt: now,
        lastSeenAt: now
    });

    await resolvePersonalAlbumForSession(profile);
    updateLandingContent();
    renderAll();
    showAccessSuccess(profile);
    void syncAccessProfileWithFirestore(getStoredAccessProfile());
}

function handleAdminAccess(event) {
    event.preventDefault();

    const adminCode = document.getElementById("admin-code");
    const adminCodeValue = adminCode ? normalizeAccessCode(adminCode.value) : "";

    if (adminCodeValue !== normalizeAccessCode(recuerdosConfig.access.adminCode)) {
        showAccessFeedback("Revisá el código administrador para ingresar.");
        return;
    }

    const now = new Date().toISOString();
    const profile = saveAccessProfile({
        type: "admin",
        role: "admin",
        displayName: "Administrador",
        name: "",
        enteredAt: now,
        createdAt: now,
        lastSeenAt: now
    });

    updateLandingContent();
    renderAll();
    closeAccessModal();
    void syncAccessProfileWithFirestore(getStoredAccessProfile());
}

function initializeAccessFlow() {
    const guestAccessOption = document.getElementById("guest-access-option");
    const adminAccessOption = document.getElementById("admin-access-option");
    const guestAccessForm = document.getElementById("guest-access-form");
    const adminAccessForm = document.getElementById("admin-access-form");
    const guestBackBtn = document.getElementById("guest-back-btn");
    const adminBackBtn = document.getElementById("admin-back-btn");
    const continueSessionBtn = document.getElementById("continue-session-btn");
    const switchUserBtn = document.getElementById("switch-user-btn");
    const openAdminFormBtn = document.getElementById("open-admin-form-btn");
    const closeAccessSuccessBtn = document.getElementById("close-access-success-btn");

    if (guestAccessOption) {
        guestAccessOption.addEventListener("click", () => setAccessView("guest-form"));
    }

    if (adminAccessOption) {
        adminAccessOption.addEventListener("click", () => setAccessView("admin-form"));
    }

    if (guestAccessForm) {
        guestAccessForm.addEventListener("submit", handleGuestAccess);
    }

    if (adminAccessForm) {
        adminAccessForm.addEventListener("submit", handleAdminAccess);
    }

    if (guestBackBtn) {
        guestBackBtn.addEventListener("click", () => showAccessWelcome(getStoredAccessProfile()));
    }

    if (adminBackBtn) {
        adminBackBtn.addEventListener("click", () => showAccessWelcome(getStoredAccessProfile()));
    }

    if (continueSessionBtn) {
        continueSessionBtn.addEventListener("click", closeAccessModal);
    }

    if (switchUserBtn) {
        switchUserBtn.addEventListener("click", handleChangeUser);
    }

    if (openAdminFormBtn) {
        openAdminFormBtn.addEventListener("click", () => setAccessView("admin-form"));
    }

    if (closeAccessSuccessBtn) {
        closeAccessSuccessBtn.addEventListener("click", closeAccessModal);
    }

    const storedProfile = getStoredAccessProfile();
    showAccessWelcome(storedProfile);
    updateLandingContent();
    openAccessModal();
    void syncAccessProfileWithFirestore(storedProfile);
}

function initializeToastInteractions() {
    const photosButton = document.getElementById("personal-upload-photos-btn");
    const videoButton = document.getElementById("personal-upload-video-btn");
    const messageButton = document.getElementById("message-composer-btn");

    if (photosButton) {
        photosButton.addEventListener("click", () => {
            simulatePersonalUpload("Fotos");
        });
    }

    if (videoButton) {
        videoButton.addEventListener("click", () => {
            simulatePersonalUpload("Video");
        });
    }

    if (messageButton) {
        messageButton.addEventListener("click", () => {
            const input = document.getElementById("message-composer-input");

            if (input && input.value.trim()) {
                showToast("Tu saludo quedó listo.", "success");
                input.value = "";
                return;
            }

            showToast("Escribí un mensaje para dejar tu saludo.", "default");
        });
    }
}

function renderMessageBoardSection() {
    const section = document.getElementById("messages-section");

    if (!section) {
        return;
    }

    const profile = getStoredAccessProfile();
    const canCompose = profile && profile.type === "guest";
    const selectedColor = recuerdosAppState.messageColor;
    const colorPalette = getWallColorPalette();

    section.className = "section";
    section.innerHTML = `
        <i class="fa-solid fa-envelope-open-text icon-evento" aria-hidden="true"></i>
        <h2>Muro de Comentarios y Saludos</h2>
        <p class="message-board-intro">Dej&aacute; un recuerdo, un saludo o unas palabras para acompa&ntilde;ar este momento tan especial.</p>

        ${canCompose ? `
            <div class="message-composer" aria-label="Escribir un saludo">
                <textarea
                    id="message-composer-input"
                    class="message-composer-input"
                    placeholder="Escrib&iacute; tu mensaje..."
                    rows="5"
                ></textarea>

                <div class="message-composer-toolbar">
                    <div class="message-color-selector" id="message-color-selector" aria-label="Elegir color del mensaje">
                        ${colorPalette.map((color) => `
                            <button
                                class="message-color-swatch${color.key === selectedColor ? " is-selected" : ""}"
                                type="button"
                                data-color="${color.key}"
                                aria-label="${color.label}"
                                aria-pressed="${color.key === selectedColor ? "true" : "false"}"
                            ></button>
                        `).join("")}
                    </div>

                    <button id="message-composer-btn" class="btn-rectangular" type="button">Publicar</button>
                </div>
            </div>
        ` : ""}

        <div class="message-board-wall" id="message-board-grid" aria-live="polite"></div>
    `;

    const composerInput = document.getElementById("message-composer-input");
    const composerButton = document.getElementById("message-composer-btn");
    const colorSelector = document.getElementById("message-color-selector");

    if (composerButton) {
        composerButton.addEventListener("click", () => {
            const text = composerInput ? composerInput.value.trim() : "";

            if (!text) {
                showToast("Escribí un mensaje para dejar tu saludo.", "default");
                return;
            }

            if (!profile) {
                showToast("Ingresá para dejar tu saludo.", "default");
                return;
            }

            const messages = getStoredWallMessages();
            messages.unshift({
                id: "wall-" + Date.now(),
                author: getCurrentWallAuthor(profile),
                ownerKey: getWallSessionKey(profile),
                createdAt: new Date().toISOString(),
                text,
                color: recuerdosAppState.messageColor
            });

            saveWallMessages(messages);

            if (composerInput) {
                composerInput.value = "";
            }

            renderMessageBoardCards();
            showToast("Tu saludo quedó publicado.", "success");
        });
    }

    if (colorSelector) {
        colorSelector.addEventListener("click", (event) => {
            const button = event.target.closest(".message-color-swatch");

            if (!button || !button.dataset.color) {
                return;
            }

            recuerdosAppState.messageColor = button.dataset.color;

            colorSelector.querySelectorAll(".message-color-swatch").forEach((swatch) => {
                const isSelected = swatch.dataset.color === button.dataset.color;
                swatch.classList.toggle("is-selected", isSelected);
                swatch.setAttribute("aria-pressed", isSelected ? "true" : "false");
            });
        });
    }

    renderMessageBoardCards();
}

function renderMessageBoardCards() {
    const boardElement = document.getElementById("message-board-grid");

    if (!boardElement) {
        return;
    }

    const profile = getStoredAccessProfile();
    const currentOwnerKey = getWallSessionKey(profile);
    const isAdmin = profile && profile.type === "admin";
    const messages = getStoredWallMessages();

    if (!messages.length) {
        boardElement.innerHTML = `
            <article class="message-note accent-sand">
                <div class="message-note-head">
                    <strong class="message-note-author">Todavía no hay comentarios</strong>
                </div>
                <p class="message-note-text">Cuando existan mensajes reales, van a aparecer aquí.</p>
            </article>
        `;
        return;
    }

    boardElement.innerHTML = messages.map((message) => {
        const canEditMessage = message.ownerKey === currentOwnerKey && currentOwnerKey !== "visitor";
        const canDeleteMessage = canEditMessage || isAdmin;

        return `
            <article class="message-note accent-${escapeHTML(message.color)}">
                <div class="message-note-head">
                    <strong class="message-note-author">${escapeHTML(message.author)}</strong>
                    <span class="message-note-meta">${escapeHTML(formatWallTimestamp(message.createdAt))}</span>
                </div>
                <p class="message-note-text">${escapeHTML(message.text)}</p>
                ${canEditMessage || canDeleteMessage ? `
                    <div class="message-note-actions">
                        ${canEditMessage ? `<button type="button" class="message-note-action" data-action="edit" data-message-id="${escapeHTML(message.id)}">Editar</button>` : ""}
                        ${canDeleteMessage ? `<button type="button" class="message-note-action" data-action="delete" data-message-id="${escapeHTML(message.id)}">Eliminar</button>` : ""}
                    </div>
                ` : ""}
            </article>
        `;
    }).join("");

    boardElement.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const action = button.dataset.action;
            const messageId = button.dataset.messageId;

            if (!action || !messageId) {
                return;
            }

            handleWallAction(action, messageId);
        });
    });
}

function handleWallAction(action, messageId) {
    const profile = getStoredAccessProfile();
    const currentOwnerKey = getWallSessionKey(profile);
    const isAdmin = profile && profile.type === "admin";
    const messages = getStoredWallMessages();
    const messageIndex = messages.findIndex((message) => message.id === messageId);

    if (messageIndex === -1) {
        return;
    }

    const message = messages[messageIndex];
    const canEditMessage = message.ownerKey === currentOwnerKey && currentOwnerKey !== "visitor";
    const canDeleteMessage = canEditMessage || isAdmin;

    if (action === "delete") {
        if (!canDeleteMessage) {
            return;
        }

        if (!window.confirm("¿Querés eliminar este mensaje?")) {
            return;
        }

        messages.splice(messageIndex, 1);
        saveWallMessages(messages);
        renderMessageBoardCards();
        return;
    }

    if (action === "edit") {
        if (!canEditMessage) {
            return;
        }

        const nextText = window.prompt("Editá tu mensaje", message.text);

        if (nextText === null) {
            return;
        }

        const trimmedText = nextText.trim();

        if (!trimmedText) {
            showToast("El mensaje no puede quedar vacío.", "default");
            return;
        }

        messages[messageIndex] = {
            ...message,
            text: trimmedText
        };

        saveWallMessages(messages);
        renderMessageBoardCards();
    }
}

function renderMessageBoardSection() {
    const section = document.getElementById("messages-section");

    if (!section) {
        return;
    }

    const profile = getStoredAccessProfile();
    const canCompose = profile && profile.type === "guest";
    const selectedColor = recuerdosAppState.messageColor;
    const colorPalette = getWallColorPalette();

    section.className = "section";
    section.innerHTML = `
        <i class="fa-solid fa-envelope-open-text icon-evento" aria-hidden="true"></i>
        <h2>Muro de Comentarios y Saludos</h2>
        <p class="message-board-intro">Dej&aacute; un recuerdo, un saludo o unas palabras para acompa&ntilde;ar este momento tan especial.</p>

        ${canCompose ? `
            <div class="message-composer" aria-label="Escribir un saludo">
                <textarea
                    id="message-composer-input"
                    class="message-composer-input"
                    placeholder="Escrib&iacute; tu mensaje..."
                    rows="5"
                ></textarea>

                <div class="message-composer-toolbar">
                    <div class="message-color-selector" id="message-color-selector" aria-label="Elegir color del mensaje">
                        ${colorPalette.map((color) => `
                            <button
                                class="message-color-swatch${color.key === selectedColor ? " is-selected" : ""}"
                                type="button"
                                data-color="${color.key}"
                                aria-label="${color.label}"
                                aria-pressed="${color.key === selectedColor ? "true" : "false"}"
                            ></button>
                        `).join("")}
                    </div>

                    <button id="message-composer-btn" class="btn-rectangular" type="button">Publicar</button>
                </div>
            </div>
        ` : ""}

        <div class="message-board-wall" id="message-board-grid" aria-live="polite"></div>
    `;

    const composerInput = document.getElementById("message-composer-input");
    const composerButton = document.getElementById("message-composer-btn");
    const colorSelector = document.getElementById("message-color-selector");

    if (composerButton) {
        composerButton.addEventListener("click", async () => {
            const text = composerInput ? composerInput.value.trim() : "";

            if (!text) {
                showToast("EscribÃ­ un mensaje para dejar tu saludo.", "default");
                return;
            }

            if (!profile || profile.type !== "guest") {
                showToast("IngresÃ¡ para dejar tu saludo.", "default");
                return;
            }

            try {
                await createWallMessageInFirestore(profile, text);
            } catch (error) {
                console.error("[Recuerdos] No se pudo publicar el mensaje en Firestore.", error);
                showToast("No pudimos publicar tu saludo.", "error");
                return;
            }

            if (composerInput) {
                composerInput.value = "";
            }

            await refreshWallMessagesFromFirestore();
            showToast("Tu saludo quedÃ³ publicado.", "success");
        });
    }

    if (colorSelector) {
        colorSelector.addEventListener("click", (event) => {
            const button = event.target.closest(".message-color-swatch");

            if (!button || !button.dataset.color) {
                return;
            }

            recuerdosAppState.messageColor = button.dataset.color;

            colorSelector.querySelectorAll(".message-color-swatch").forEach((swatch) => {
                const isSelected = swatch.dataset.color === button.dataset.color;
                swatch.classList.toggle("is-selected", isSelected);
                swatch.setAttribute("aria-pressed", isSelected ? "true" : "false");
            });
        });
    }

    void refreshWallMessagesFromFirestore();
}

function renderMessageBoardCards() {
    const boardElement = document.getElementById("message-board-grid");

    if (!boardElement) {
        return;
    }

    const profile = getStoredAccessProfile();
    const currentOwnerKey = getWallSessionKey(profile);
    const isAdmin = profile && profile.type === "admin";
    const messages = wallMessagesState.items;

    if (!messages.length) {
        boardElement.innerHTML = `
            <article class="message-note accent-sand">
                <div class="message-note-head">
                    <strong class="message-note-author">TodavÃ­a no hay comentarios</strong>
                </div>
                <p class="message-note-text">Cuando existan mensajes reales, van a aparecer aquÃ­.</p>
            </article>
        `;
        return;
    }

    boardElement.innerHTML = messages.map((message) => {
        const canEditMessage = profile && profile.type === "guest" && message.ownerKey === currentOwnerKey;
        const canDeleteMessage = canEditMessage || isAdmin;

        return `
            <article class="message-note accent-${escapeHTML(message.color)}">
                <div class="message-note-head">
                    <strong class="message-note-author">${escapeHTML(message.author)}</strong>
                    <span class="message-note-meta">${escapeHTML(formatWallTimestamp(message.createdAt))}</span>
                </div>
                <p class="message-note-text">${escapeHTML(message.text)}</p>
                ${canEditMessage || canDeleteMessage ? `
                    <div class="message-note-actions">
                        ${canEditMessage ? `<button type="button" class="message-note-action" data-action="edit" data-message-id="${escapeHTML(message.id)}">Editar</button>` : ""}
                        ${canDeleteMessage ? `<button type="button" class="message-note-action" data-action="delete" data-message-id="${escapeHTML(message.id)}">Eliminar</button>` : ""}
                    </div>
                ` : ""}
            </article>
        `;
    }).join("");

    boardElement.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const action = button.dataset.action;
            const messageId = button.dataset.messageId;

            if (!action || !messageId) {
                return;
            }

            void handleWallAction(action, messageId);
        });
    });
}

async function handleWallAction(action, messageId) {
    const profile = getStoredAccessProfile();
    const currentOwnerKey = getWallSessionKey(profile);
    const isAdmin = profile && profile.type === "admin";
    const messages = wallMessagesState.items;
    const messageIndex = messages.findIndex((message) => message.id === messageId);

    if (messageIndex === -1) {
        return;
    }

    const message = messages[messageIndex];
    const canEditMessage = profile && profile.type === "guest" && message.ownerKey === currentOwnerKey;
    const canDeleteMessage = canEditMessage || isAdmin;

    if (action === "delete") {
        if (!canDeleteMessage) {
            return;
        }

        if (!window.confirm("¿Querés eliminar este mensaje?")) {
            return;
        }

        try {
            await deleteWallMessageFromFirestore(messageId);
            await refreshWallMessagesFromFirestore();
        } catch (error) {
            console.error("[Recuerdos] No se pudo eliminar el mensaje desde Firestore.", error);
            showToast("No pudimos eliminar el mensaje.", "error");
        }
        return;
    }

    if (action === "edit") {
        if (!canEditMessage) {
            return;
        }

        const nextText = window.prompt("Editá tu mensaje", message.text);

        if (nextText === null) {
            return;
        }

        const trimmedText = nextText.trim();

        if (!trimmedText) {
            showToast("El mensaje no puede quedar vacío.", "default");
            return;
        }

        try {
            await updateWallMessageInFirestore(message, profile, trimmedText);
            await refreshWallMessagesFromFirestore();
        } catch (error) {
            console.error("[Recuerdos] No se pudo editar el mensaje en Firestore.", error);
            showToast("No pudimos actualizar el mensaje.", "error");
        }
    }
}

function renderAlbumsSection() {
    const section = document.getElementById("albums-section");
    const activeElement = document.activeElement;
    const shouldRestoreSearchFocus = Boolean(activeElement && activeElement.id === "guest-album-search");
    const searchSelection = shouldRestoreSearchFocus
        ? {
            value: activeElement.value,
            start: activeElement.selectionStart,
            end: activeElement.selectionEnd,
            direction: activeElement.selectionDirection
        }
        : null;
    const previousScrollY = window.scrollY;

    if (!section) {
        return;
    }

    const profile = getStoredAccessProfile();
    const isGuest = profile && profile.type === "guest" && profile.name;
    const guestName = isGuest ? profile.name : "";
    
    section.className = "section bg-lavanda recuerdos-center-section";
    section.innerHTML = `
        <i class="fa-solid fa-folder-open icon-evento" aria-hidden="true"></i>
        <h2>Centro de Recuerdos</h2>
        <p class="center-section-intro">${isGuest
            ? "Desde aquí podés subir tus recuerdos y recorrer los álbumes de los demás invitados."
            : "Desde aquí podés administrar el contenido compartido por los invitados y revisar todos los álbumes."}</p>

        ${isGuest ? `
            <div class="center-my-album">
                <i class="fa-solid fa-folder-open center-my-album-icon" aria-hidden="true"></i>
                <h3 id="personal-album-title">Mi Álbum - ${escapeHTML(guestName)}</h3>
                <div class="center-my-album-actions" aria-label="Acciones del álbum personal">
                    <button id="personal-upload-photos-btn" class="btn-rectangular" type="button">Subir fotografías</button>
                    <button id="personal-upload-video-btn" class="btn-rectangular btn-secundario" type="button">Subir video</button>
                </div>
            </div>
        ` : ""}

        <div class="center-explore">
            <h3>Explorar Álbumes</h3>

            <div class="center-explore-tools">
                <label class="center-search-field" for="guest-album-search">
                    <span>Buscar por nombre</span>
                    <input id="guest-album-search" type="search" autocomplete="off" placeholder="Escribí un nombre">
                </label>

                <button class="btn-rectangular btn-secundario center-presentation-btn" type="button">Presentación</button>
            </div>

            <div id="guest-albums-grid" class="center-albums-grid" aria-live="polite"></div>

            <button class="btn-rectangular center-more-btn" type="button">Ver más álbumes</button>
        </div>
    `;

    const searchInput = document.getElementById("guest-album-search");
    const gridElement = document.getElementById("guest-albums-grid");

    const renderDirectory = (query) => {
        if (!gridElement) {
            return;
        }

        const normalizedQuery = query.trim().toLowerCase();
        const filteredAlbums = getGuestFilteredAlbums(normalizedQuery, profile);

        gridElement.innerHTML = filteredAlbums.map((album) => `
            <article class="center-album-item">
                <i class="fa-solid fa-folder-open center-album-icon" aria-hidden="true"></i>
                <h4 class="center-album-name">${escapeHTML(album.ownerName)}</h4>
            </article>
        `).join("");
    };

    if (searchInput) {
        searchInput.oninput = (event) => renderDirectory(event.target.value);
        renderDirectory(searchInput.value);
    }
}

function renderAlbumsSection() {
    const section = document.getElementById("albums-section");
    const activeElement = document.activeElement;
    const shouldRestoreSearchFocus = Boolean(activeElement && activeElement.id === "guest-album-search");
    const searchSelection = shouldRestoreSearchFocus
        ? {
            value: activeElement.value,
            start: activeElement.selectionStart,
            end: activeElement.selectionEnd,
            direction: activeElement.selectionDirection
        }
        : null;
    const previousScrollY = window.scrollY;

    if (!section) {
        return;
    }

    const profile = getStoredAccessProfile();
    const isGuest = profile && profile.type === "guest" && profile.name;
    const guestName = isGuest ? profile.name : "";
    
    section.className = "section bg-lavanda recuerdos-center-section";
    section.innerHTML = `
        <i class="fa-solid fa-folder-open icon-evento" aria-hidden="true"></i>
        <h2>Centro de Recuerdos</h2>
        <p class="center-section-intro">${isGuest
            ? "Desde aquí podés subir tus recuerdos y recorrer los álbumes de los demás invitados."
            : "Desde aquí podés administrar el contenido compartido por los invitados y revisar todos los álbumes."}</p>

        ${isGuest ? `
            <article class="center-my-album-card">
                <i class="fa-solid fa-folder-open center-my-album-icon" aria-hidden="true"></i>
                <h3 id="personal-album-title">Mi Álbum - ${escapeHTML(guestName)}</h3>
                <div class="center-my-album-actions" aria-label="Acciones del álbum personal">
                    <button id="personal-upload-photos-btn" class="btn-rectangular" type="button">Subir fotografías</button>
                    <button id="personal-upload-video-btn" class="btn-rectangular btn-secundario" type="button">Subir video</button>
                </div>
            </article>
        ` : ""}

        <div class="center-explore">
            <h3>Explorar Álbumes</h3>

            <div class="center-explore-tools">
                <label class="center-search-field" for="guest-album-search">
                    <span>Buscar por nombre</span>
                    <input id="guest-album-search" type="search" autocomplete="off" placeholder="Escribí un nombre">
                </label>

                <button class="btn-rectangular btn-secundario center-presentation-btn" type="button">Presentación</button>
            </div>

            <div id="guest-albums-grid" class="center-albums-grid" aria-live="polite"></div>

            <button class="btn-rectangular center-more-btn" type="button">Ver más álbumes</button>
        </div>
    `;

    const searchInput = document.getElementById("guest-album-search");
    const gridElement = document.getElementById("guest-albums-grid");

    const renderDirectory = (query) => {
        if (!gridElement) {
            return;
        }

        const normalizedQuery = query.trim().toLowerCase();
        const filteredAlbums = getGuestFilteredAlbums(normalizedQuery, profile);

        gridElement.innerHTML = filteredAlbums.map((ownerName) => `
            <article class="center-album-item">
                <i class="fa-solid fa-folder-open center-album-icon" aria-hidden="true"></i>
                <h4 class="center-album-name">${escapeHTML(ownerName)}</h4>
            </article>
        `).join("");
    };

    if (searchInput) {
        searchInput.oninput = (event) => renderDirectory(event.target.value);
        renderDirectory(searchInput.value);
    }
}

const guestAlbumsStorageKey = "centroRecuerdosGuestAlbumsV1";

const guestCenterState = {
    visibleCount: 5,
    personalVisibleCount: 8,
    albumsPage: 1,
    personalPage: 1,
    searchQuery: "",
    uploadProgress: {
        active: false,
        completed: 0,
        total: 0,
        label: "",
        fileName: ""
    },
    viewer: {
        open: false,
        items: [],
        index: 0,
        title: ""
    },
    albums: [],
    firebaseLoading: false,
    firebaseLoaded: false,
    personalAlbum: null,
    personalAlbumLoaded: false,
    personalAlbumLoading: false
};

const adminCenterState = {
    albumsPage: 1,
    searchQuery: ""
};

function generateGuestId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return `${prefix}-${window.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateGuestAlbumId() {
    return generateGuestId("guest-album");
}

function normalizeGuestMediaItem(item, kind = "photo") {
    if (!item) {
        return null;
    }

    const mediaKind = item.kind || kind;

    return {
        id: item.id || generateGuestId("guest-media"),
        kind: mediaKind,
        name: item.name || (mediaKind === "video" ? "Video" : "Foto"),
        src: item.src || "",
        createdAt: item.createdAt || new Date().toISOString(),
        fileName: item.fileName || item.name || "",
        mimeType: item.mimeType || null,
        objectUrl: item.objectUrl || item.src || null,
        albumId: item.albumId || null,
        albumType: item.albumType || null,
        ownerUserId: item.ownerUserId || null,
        storagePath: item.storagePath || null,
        downloadUrl: item.downloadUrl || item.src || null,
        published: item.published !== false,
        order: typeof item.order === "number" ? item.order : null,
        createdBy: item.createdBy || null,
        docId: item.docId || item.id || null,
        width: item.width || null,
        height: item.height || null
    };
}

function normalizeGuestAlbumRecord(album) {
    if (!album) {
        return null;
    }

    const photos = Array.isArray(album.photos)
        ? album.photos.map((photo) => normalizeGuestMediaItem(photo, "photo")).filter(Boolean)
        : [];

    return {
        id: album.id || generateGuestId("guest-album"),
        ownerName: album.ownerName || "Invitado",
        ownerType: album.ownerType || "guest",
        ownerUserId: album.ownerUserId || null,
        albumType: album.albumType || "guest",
        title: album.title || album.ownerName || "Invitado",
        createdAt: album.createdAt || new Date().toISOString(),
        lastActivityAt: album.lastActivityAt || album.createdAt || new Date().toISOString(),
        coverPhotoId: album.coverPhotoId || null,
        coverPhotoUrl: album.coverPhotoUrl || null,
        photoCount: typeof album.photoCount === "number" ? album.photoCount : photos.length,
        photos,
        video: album.video ? normalizeGuestMediaItem(album.video, "video") : null,
        videoCount: typeof album.videoCount === "number" ? album.videoCount : (album.video ? 1 : 0)
    };
}

function getGuestPaginationWindow(items, page, pageSize) {
    const totalItems = Array.isArray(items) ? items.length : 0;
    const totalPages = Math.max(1, Math.ceil(Math.max(totalItems, 1) / pageSize));
    const currentPage = Math.min(Math.max(1, page || 1), totalPages);
    const startIndex = (currentPage - 1) * pageSize;

    return {
        currentPage,
        totalPages,
        totalItems,
        items: (items || []).slice(startIndex, startIndex + pageSize),
        startIndex
    };
}

function getStoredGuestAlbums() {
    return guestCenterState.albums || [];
}

function saveStoredGuestAlbums(albums) {
    guestCenterState.albums = (albums || []).map((album) => normalizeGuestAlbumRecord(album)).filter(Boolean);
}

async function loadGuestAlbumsFromFirebase(force = false) {
    if (guestCenterState.firebaseLoading || (guestCenterState.firebaseLoaded && !force)) {
        return;
    }

    guestCenterState.firebaseLoading = true;

    const firebaseApi = await getFirebaseGuestAlbumApi();

    if (!firebaseApi) {
        guestCenterState.firebaseLoading = false;
        guestCenterState.firebaseLoaded = true;
        return;
    }

    try {
        const albumsCollectionRef = firebaseApi.collection(firebaseApi.firestore, "events", recuerdosEventId, "albums");
        const albumsSnapshot = await firebaseApi.getDocs(albumsCollectionRef);
        
        if (albumsSnapshot.empty) {
            saveStoredGuestAlbums([]);
            guestCenterState.firebaseLoaded = true;
            guestCenterState.firebaseLoading = false;
            renderAlbumsSection();
            return;
        }

        const guestAlbums = albumsSnapshot.docs.map((docSnapshot) => {
            const albumData = docSnapshot.data();
            if (albumData.albumType !== "guest") {
                return null;
            }
            const albumId = docSnapshot.id;

            const existingAlbum = guestCenterState.albums.find(a => a.id === albumId);
            const photos = existingAlbum ? existingAlbum.photos : [];

            return normalizeGuestAlbumRecord({
                id: albumId,
                ownerName: albumData.ownerName || "Invitado",
                ownerType: albumData.ownerType || "guest",
                ownerUserId: albumData.ownerUserId || null,
                albumType: "guest",
                title: albumData.title || albumData.ownerName,
                createdAt: albumData.createdAt,
                lastActivityAt: albumData.lastActivityAt,
                coverPhotoId: albumData.coverPhotoId,
                coverPhotoUrl: albumData.coverPhotoUrl,
                photoCount: typeof albumData.photoCount === "number" ? albumData.photoCount : photos.length,
                photos: photos,
                video: albumData.video ? normalizeGuestMediaItem(albumData.video, "video") : null,
                videoCount: typeof albumData.videoCount === "number" ? albumData.videoCount : (albumData.video ? 1 : 0)
            });
        }).filter(Boolean);

        saveStoredGuestAlbums(guestAlbums);

        const profile = getStoredAccessProfile();
        if (profile && profile.type === "guest" && profile.name) {
            const myRealAlbum = guestAlbums.find((a) => a.ownerUserId === profile.userId || a.ownerName === profile.name);
            if (myRealAlbum && profile.albumId !== myRealAlbum.id) {
                profile.albumId = myRealAlbum.id;
                saveAccessProfile(profile);
            }
        }

        guestCenterState.firebaseLoaded = true;
        guestCenterState.firebaseLoading = false;
        renderAlbumsSection();
    } catch (error) {
        guestCenterState.firebaseLoading = false;
        guestCenterState.firebaseLoaded = true;
        console.error("[Recuerdos] No se pudo cargar los Álbumes de Invitados desde Firebase.", error);
        showToast("No se pudieron cargar los álbumes compartidos de Firebase. Se muestran los recuerdos en memoria.", "error");
    }
}

async function loadGuestAlbumPhotosIfNeeded(albumId) {
    const album = guestCenterState.albums.find(a => a.id === albumId) || (guestCenterState.personalAlbum && guestCenterState.personalAlbum.id === albumId ? guestCenterState.personalAlbum : null);
    if (!album) {
        return;
    }

    if ((album.photos && album.photos.length > 0) || !album.photoCount) {
        return;
    }

    const firebaseApi = await getFirebaseGuestAlbumApi();
    if (!firebaseApi) {
        return;
    }

    try {
        const paths = getGuestAlbumFirestorePath(albumId);
        const photosCollectionRef = firebaseApi.collection(firebaseApi.firestore, ...paths.photosCollectionPath);
        const photosSnapshot = await firebaseApi.getDocs(photosCollectionRef);
        
        const photos = photosSnapshot.docs.map((photoDoc) => {
            const photoData = photoDoc.data();
            return normalizeGuestMediaItem({
                ...photoData,
                id: photoDoc.id,
                src: photoData.downloadUrl || photoData.src || ""
            }, "photo");
        }).filter(Boolean).sort((a, b) => (a.order || 0) - (b.order || 0));

        album.photos = photos;
        album.photoCount = photos.length;
    } catch (error) {
        console.error(`[Recuerdos] No se pudieron cargar las fotos del álbum ${albumId} desde Firebase.`, error);
    }
}

async function persistGuestVideoUpload(videoItem, file) {
    const firebaseApi = await getFirebaseGuestAlbumApi();
    const profile = getStoredAccessProfile();
    const album = getOrCreateCurrentGuestAlbum();

    if (!firebaseApi || !profile || !album) {
        showToast("No se pudo guardar el video en Firebase. El video sigue visible en este dispositivo.", "error");
        return;
    }

    const paths = getGuestAlbumFirestorePath(album.id);
    const albumRef = firebaseApi.doc(firebaseApi.firestore, ...paths.albumDocPath);

    setGuestUploadProgress({
        active: true,
        completed: 0,
        total: 1,
        label: "Subiendo video",
        fileName: file.name
    });
    renderAlbumsSection();

    try {
        const storagePath = `events/${recuerdosEventId}/albums/${album.id}/video/${videoItem.id}-${file.name}`;
        const storageRef = firebaseApi.ref(firebaseApi.storage, storagePath);
        const uploadTask = firebaseApi.uploadBytesResumable(storageRef, file, {
            contentType: file.type
        });

        const uploadSnapshot = await new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const totalBytes = snapshot.totalBytes || file.size || 1;
                    const fileProgress = totalBytes > 0 ? snapshot.bytesTransferred / totalBytes : 0;
                    setGuestUploadProgress({
                        completed: fileProgress,
                        total: 1,
                        fileName: file.name
                    });
                    renderAlbumsSection();
                },
                (error) => reject(error),
                () => resolve(uploadTask.snapshot)
            );
        });

        const downloadUrl = await firebaseApi.getDownloadURL(uploadSnapshot.ref);

        if (!album.video || album.video.id !== videoItem.id) {
            await firebaseApi.deleteObject(storageRef);
            return;
        }

        album.video.src = downloadUrl;
        album.video.downloadUrl = downloadUrl;
        album.video.storagePath = storagePath;
        album.videoCount = 1;

        const storedAlbums = getStoredGuestAlbums();
        const nextAlbums = storedAlbums.map((entry) => entry.id === album.id ? album : entry);
        saveStoredGuestAlbums(nextAlbums);

        await firebaseApi.setDoc(albumRef, buildGuestAlbumFirestoreRecord(album, profile), { merge: true });

        showToast("Video guardado en Firebase.", "success");
    } catch (error) {
        console.error("[Recuerdos] No se pudo guardar el video en Firebase.", error);
        showToast("No se pudo subir el video a Firebase. El video sigue visible en este dispositivo.", "error");
    } finally {
        resetGuestUploadProgress();
        renderAlbumsSection();
    }
}

async function deleteGuestVideoRemote(targetVideo, album, profile) {
    const firebaseApi = await getFirebaseGuestAlbumApi();

    if (!firebaseApi) {
        showToast("No se pudo sincronizar la eliminación con Firebase. El cambio quedó en este dispositivo.", "error");
        return;
    }

    const paths = getGuestAlbumFirestorePath(album.id);
    const albumRef = firebaseApi.doc(firebaseApi.firestore, ...paths.albumDocPath);

    try {
        if (targetVideo.storagePath) {
            await firebaseApi.deleteObject(firebaseApi.ref(firebaseApi.storage, targetVideo.storagePath));
        }

        const storedAlbums = getStoredGuestAlbums();
        const nextAlbums = storedAlbums.map((item) => item.id === album.id ? album : item);
        saveStoredGuestAlbums(nextAlbums);

        await firebaseApi.setDoc(albumRef, buildGuestAlbumFirestoreRecord(album, profile), { merge: true });
    } catch (error) {
        console.error("[Recuerdos] No se pudo eliminar el video de Mi Álbum en Firebase.", error);
        showToast("No se pudo sincronizar la eliminación con Firebase. El video se mantiene visible en este dispositivo.", "error");
    }
}

function clearPersonalAlbumContext() {
    guestCenterState.personalAlbum = null;
    guestCenterState.personalAlbumLoaded = false;
    const listElement = document.getElementById("guest-personal-media-list");
    if (listElement) {
        listElement.innerHTML = "";
    }
}

async function resolvePersonalAlbumForSession(profile) {
    if (!profile || profile.type !== "guest" || !profile.name) {
        clearPersonalAlbumContext();
        return null;
    }

    if (guestCenterState.personalAlbumLoaded && guestCenterState.personalAlbum && guestCenterState.personalAlbum.ownerUserId === profile.userId) {
        return guestCenterState.personalAlbum;
    }

    const firebaseApi = await getFirebaseGuestAlbumApi();
    if (!firebaseApi) {
        return null;
    }

    try {
        const albumsRef = firebaseApi.collection(firebaseApi.firestore, "events", recuerdosEventId, "albums");
        
        const q = firebaseApi.query(
            albumsRef,
            firebaseApi.where("ownerUserId", "==", profile.userId)
        );
        const querySnapshot = await firebaseApi.getDocs(q);

        let albumDoc = null;
        if (!querySnapshot.empty) {
            albumDoc = querySnapshot.docs[0];
        } else {
            const qName = firebaseApi.query(
                albumsRef,
                firebaseApi.where("ownerName", "==", profile.name),
                firebaseApi.where("ownerType", "==", "guest")
            );
            const querySnapshotName = await firebaseApi.getDocs(qName);
            if (!querySnapshotName.empty) {
                albumDoc = querySnapshotName.docs[0];
            }
        }

        let album = null;
        if (albumDoc) {
            const data = albumDoc.data();
            album = normalizeGuestAlbumRecord({
                id: albumDoc.id,
                ...data
            });
            
            if (album.ownerUserId !== profile.userId) {
                album.ownerUserId = profile.userId;
                const docRef = firebaseApi.doc(firebaseApi.firestore, "events", recuerdosEventId, "albums", album.id);
                await firebaseApi.setDoc(docRef, { ownerUserId: profile.userId }, { merge: true });
            }
        } else {
            const newAlbumId = generateGuestId("guest-album");
            album = normalizeGuestAlbumRecord({
                id: newAlbumId,
                ownerName: profile.name,
                ownerType: "guest",
                ownerUserId: profile.userId,
                albumType: "guest",
                title: profile.name,
                createdAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
                coverPhotoId: null,
                coverPhotoUrl: null,
                photoCount: 0,
                photos: [],
                video: null,
                videoCount: 0
            });

            const docRef = firebaseApi.doc(firebaseApi.firestore, "events", recuerdosEventId, "albums", newAlbumId);
            await firebaseApi.setDoc(docRef, buildGuestAlbumFirestoreRecord(album, profile));
        }

        const photosCollectionRef = firebaseApi.collection(firebaseApi.firestore, "events", recuerdosEventId, "albums", album.id, "photos");
        const photosSnapshot = await firebaseApi.getDocs(photosCollectionRef);
        
        album.photos = photosSnapshot.docs.map((photoDoc) => {
            const photoData = photoDoc.data();
            return normalizeGuestMediaItem({
                ...photoData,
                id: photoDoc.id,
                src: photoData.downloadUrl || photoData.src || ""
            }, "photo");
        }).filter(Boolean).sort((a, b) => (a.order || 0) - (b.order || 0));
        
        album.photoCount = album.photos.length;

        if (profile.albumId !== album.id) {
            profile.albumId = album.id;
            saveAccessProfile(profile);
        }

        guestCenterState.personalAlbum = album;
        guestCenterState.personalAlbumLoaded = true;
        return album;
    } catch (error) {
        console.error("[Recuerdos] Error al resolver el álbum del usuario.", error);
        return null;
    }
}

function getCurrentUserGuestAlbum() {
    return guestCenterState.personalAlbum;
}

function getCurrentGuestAlbum(profile = getStoredAccessProfile()) {
    return guestCenterState.personalAlbum;
}

function getOrCreateCurrentGuestAlbum() {
    return guestCenterState.personalAlbum;
}

function getGuestPublicAlbums(profile = getStoredAccessProfile()) {
    const currentAlbum = getCurrentGuestAlbum(profile);
    const hasCurrentContent = Boolean(currentAlbum && ((currentAlbum.photos || []).length > 0 || currentAlbum.video));
    const storedPublicAlbums = getStoredGuestAlbums()
        .filter((album) => (album.photos && album.photos.length > 0) || (album.photoCount && album.photoCount > 0) || album.video)
        .filter((album) => !currentAlbum || album.id !== currentAlbum.id);

    return [
        ...(hasCurrentContent ? [currentAlbum] : []),
        ...storedPublicAlbums,
    ];
}

function getGuestFilteredAlbums(query, profile = getStoredAccessProfile()) {
    const normalizedQuery = query.trim().toLowerCase();
    const albums = getGuestPublicAlbums(profile);

    if (!normalizedQuery) {
        return albums;
    }

    return albums.filter((album) => album.ownerName.toLowerCase().includes(normalizedQuery));
}

function getAdminFilteredAlbums(query) {
    return getGuestFilteredAlbums(query, { type: "admin" });
}

function getGuestAlbumMediaItems(album) {
    if (!album) {
        return [];
    }

    return [
        ...(album.photos || []).map((photo) => normalizeGuestMediaItem(photo, "photo")),
        ...(album.video ? [normalizeGuestMediaItem(album.video, "video")] : [])
    ].filter(Boolean);
}

function ensureGuestViewerListeners() {
    document.removeEventListener("keydown", handleGuestViewerKeydown);
    document.addEventListener("keydown", handleGuestViewerKeydown);
}

function openGuestViewer(items, startIndex = 0, title = "") {
    if (!items || !items.length) {
        return;
    }

    guestCenterState.viewer = {
        open: true,
        items,
        index: Math.max(0, Math.min(startIndex, items.length - 1)),
        title
    };

    renderAlbumsSection();
    ensureGuestViewerListeners();
}

function closeGuestViewer() {
    if (!guestCenterState.viewer.open) {
        return;
    }

    guestCenterState.viewer = {
        open: false,
        items: [],
        index: 0,
        title: ""
    };

    document.removeEventListener("keydown", handleGuestViewerKeydown);
    renderAlbumsSection();
}

function moveGuestViewer(step) {
    const viewer = guestCenterState.viewer;

    if (!viewer.open || !viewer.items.length) {
        return;
    }

    viewer.index = (viewer.index + step + viewer.items.length) % viewer.items.length;
    renderAlbumsSection();
}

function handleGuestViewerKeydown(event) {
    if (!guestCenterState.viewer.open) {
        return;
    }

    if (event.key === "Escape") {
        closeGuestViewer();
        return;
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveGuestViewer(-1);
        return;
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        moveGuestViewer(1);
    }
}

function renderGuestViewer() {
    if (!guestCenterState.viewer.open || !guestCenterState.viewer.items.length) {
        return "";
    }

    const currentItem = guestCenterState.viewer.items[guestCenterState.viewer.index];

    if (!currentItem) {
        return "";
    }

    const content = currentItem.kind === "video"
        ? `
            <video class="guest-viewer-media" controls playsinline preload="metadata" src="${escapeHTML(currentItem.src)}"></video>
        `
        : `
            <img class="guest-viewer-media" src="${escapeHTML(currentItem.src)}" alt="${escapeHTML(currentItem.name)}">
        `;
    const thumbnails = guestCenterState.viewer.items.map((item, index) => {
        const isActive = index === guestCenterState.viewer.index;

        return `
            <button class="guest-viewer-thumb ${isActive ? "is-active" : ""}" type="button" data-guest-action="select-viewer-item" data-guest-media-index="${index}" aria-label="Ver elemento ${index + 1}">
                ${item.kind === "video" ? `
                    <video class="guest-viewer-thumb-media" src="${escapeHTML(item.src)}" muted playsinline preload="metadata" aria-hidden="true"></video>
                    <span class="guest-viewer-thumb-play" aria-hidden="true"><i class="fa-solid fa-play"></i></span>
                ` : `
                    <img class="guest-viewer-thumb-media" src="${escapeHTML(item.src)}" alt="">
                `}
            </button>
        `;
    }).join("");

    return `
        <div class="official-lightbox" id="guest-media-viewer" role="dialog" aria-modal="true" aria-label="Visor de recuerdos">
            <div class="official-lightbox-backdrop" data-guest-action="close-viewer"></div>
            <div class="official-lightbox-panel">
                <button class="official-lightbox-close" type="button" data-guest-action="close-viewer" aria-label="Cerrar visor">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
                <button class="official-lightbox-nav official-lightbox-prev" type="button" data-guest-action="previous" aria-label="Anterior">
                    <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
                </button>
                <button class="official-lightbox-nav official-lightbox-next" type="button" data-guest-action="next" aria-label="Siguiente">
                    <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                </button>
                <figure class="official-lightbox-figure">
                    ${content}
                </figure>
                <div class="guest-viewer-thumbnails" aria-label="Miniaturas del visor">
                    ${thumbnails}
                </div>
            </div>
        </div>
    `;
}

function updateGuestProfileAlbumId(album) {
    const profile = getStoredAccessProfile();

    if (!profile || profile.type !== "guest") {
        return;
    }

    const nextProfile = {
        ...profile,
        albumId: album.id
    };

    saveAccessProfile(nextProfile);
    void syncAccessProfileWithFirestore(nextProfile);
}



function addGuestPhotos(files) {
    const imageFiles = Array.from(files || []).filter((file) => file && file.type && file.type.startsWith("image/"));

    if (!imageFiles.length) {
        return;
    }

    const album = getOrCreateCurrentGuestAlbum();

    if (!album) {
        return;
    }

    if (imageFiles.length > 20) {
        showToast("Podés subir hasta 20 fotografías por carga. Hacé otra carga para seguir agregando.", "default");
        return;
    }

    const currentPhotos = Array.isArray(album.photos) ? album.photos.slice() : [];
    const appendedPhotos = imageFiles.map((file) => ({
        id: generateGuestId("guest-photo"),
        kind: "photo",
        name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Foto",
        src: window.URL.createObjectURL(file),
        createdAt: new Date().toISOString(),
        fileName: file.name,
        mimeType: file.type,
        objectUrl: null
    }));

    album.photos = currentPhotos.concat(appendedPhotos);

    const storedAlbums = getStoredGuestAlbums();
    const nextAlbums = storedAlbums.some((item) => item.id === album.id)
        ? storedAlbums.map((item) => (item.id === album.id ? album : item))
        : storedAlbums.concat(album);

    saveStoredGuestAlbums(nextAlbums);
    renderAlbumsSection();

    showToast("Tus fotografías quedaron agregadas al álbum.", "success");
}

function addGuestVideo(file) {
    if (!file || !file.type || !file.type.startsWith("video/")) {
        return;
    }

    const album = getOrCreateCurrentGuestAlbum();

    if (!album) {
        return;
    }

    if (album.video && (album.video.objectUrl || album.video.src)) {
        window.URL.revokeObjectURL(album.video.objectUrl || album.video.src);
    }

    album.video = {
        id: generateGuestId("guest-video"),
        kind: "video",
        name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Video",
        src: window.URL.createObjectURL(file),
        createdAt: new Date().toISOString(),
        fileName: file.name,
        mimeType: file.type,
        objectUrl: null
    };

    const storedAlbums = getStoredGuestAlbums();
    const nextAlbums = storedAlbums.some((item) => item.id === album.id)
        ? storedAlbums.map((item) => (item.id === album.id ? album : item))
        : storedAlbums.concat(album);

    saveStoredGuestAlbums(nextAlbums);
    renderAlbumsSection();
    showToast("Tu video quedó agregado al álbum.", "success");
}

function removeGuestMedia(mediaId) {
    const album = getOrCreateCurrentGuestAlbum();

    if (!album || !mediaId) {
        return;
    }

    const isPhoto = Array.isArray(album.photos) && album.photos.some((photo) => photo.id === mediaId);
    const isVideo = album.video && album.video.id === mediaId;

    if (!isPhoto && !isVideo) {
        return;
    }

    let targetPhoto = null;

    if (isPhoto) {
        targetPhoto = album.photos.find((photo) => photo.id === mediaId) || null;
        if (targetPhoto && (targetPhoto.objectUrl || targetPhoto.src)) {
            window.URL.revokeObjectURL(targetPhoto.objectUrl || targetPhoto.src);
        }
        album.photos = album.photos.filter((photo) => photo.id !== mediaId);
    }

    if (isVideo && album.video && album.video.objectUrl) {
        window.URL.revokeObjectURL(album.video.objectUrl);
        album.video = null;
    }

    const storedAlbums = getStoredGuestAlbums();
    const nextAlbums = storedAlbums.some((item) => item.id === album.id)
        ? storedAlbums.map((item) => (item.id === album.id ? album : item))
        : storedAlbums.concat(album);

    saveStoredGuestAlbums(nextAlbums);
    renderAlbumsSection();
}

async function openGuestMediaFromAlbum(albumId, startIndex = 0) {
    const profile = getStoredAccessProfile();
    await loadGuestAlbumPhotosIfNeeded(albumId);

    const album = albumId === (profile && profile.albumId)
        ? getOrCreateCurrentGuestAlbum()
        : [...getGuestPublicAlbums(profile), getOrCreateCurrentGuestAlbum()].find((item) => item && item.id === albumId);

    if (!album) {
        return;
    }

    const items = getGuestAlbumMediaItems(album);
    openGuestViewer(items, startIndex, album.ownerName);
}

async function openGuestPresentation() {
    const profile = getStoredAccessProfile();
    const currentAlbum = getOrCreateCurrentGuestAlbum();
    const catalog = [currentAlbum, ...getGuestPublicAlbums(profile)].filter(Boolean);

    const promises = catalog.map((album) => loadGuestAlbumPhotosIfNeeded(album.id));
    await Promise.all(promises);

    const items = catalog.flatMap((album) => getGuestAlbumMediaItems(album));

    if (!items.length) {
        return;
    }

    openGuestViewer(items, 0, "Presentación");
}

function bindGuestAlbumInteractions() {
    const photosButton = document.getElementById("guest-upload-photos-btn");
    const videoButton = document.getElementById("guest-upload-video-btn");
    const photosInput = document.getElementById("guest-photos-input");
    const videoInput = document.getElementById("guest-video-input");
    const searchInput = document.getElementById("guest-album-search");
    const loadMoreButton = document.getElementById("guest-load-more-btn");
    const personalLoadMoreButton = document.getElementById("guest-personal-load-more-btn");
    const presentationButton = document.getElementById("guest-presentation-btn");
    const grid = document.getElementById("guest-albums-grid");
    const personalList = document.getElementById("guest-personal-media-list");
    const viewer = document.getElementById("guest-media-viewer");

    if (photosButton && photosInput) {
        photosButton.onclick = () => photosInput.click();
    }

    if (videoButton && videoInput) {
        videoButton.onclick = () => videoInput.click();
    }

    if (photosInput) {
        photosInput.onchange = (event) => {
            addGuestPhotos(event.target.files);
            event.target.value = "";
        };
    }

    if (videoInput) {
        videoInput.onchange = (event) => {
            const file = event.target.files && event.target.files[0];
            addGuestVideo(file);
            event.target.value = "";
        };
    }

    if (searchInput) {
        searchInput.oninput = (event) => {
            guestCenterState.searchQuery = event.target.value;
            guestCenterState.visibleCount = 5;
            renderAlbumsSection();
        };
    }

    if (loadMoreButton) {
        loadMoreButton.onclick = () => {
            guestCenterState.visibleCount += 5;
            renderAlbumsSection();
        };
    }

    if (presentationButton) {
        presentationButton.onclick = openGuestPresentation;
    }

    if (grid) {
        grid.querySelectorAll("[data-guest-album-id]").forEach((card) => {
            card.addEventListener("click", () => {
                const albumId = card.dataset.guestAlbumId;
                if (albumId) {
                    openGuestMediaFromAlbum(albumId, 0);
                }
            });

            card.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    const albumId = card.dataset.guestAlbumId;
                    if (albumId) {
                        openGuestMediaFromAlbum(albumId, 0);
                    }
                }
            });
        });
    }

    if (personalList) {
        personalList.querySelectorAll("[data-guest-action=\"open-personal-media\"]").forEach((button) => {
            button.addEventListener("click", () => {
                const mediaIndex = Number(button.dataset.guestMediaIndex);
                const album = getOrCreateCurrentGuestAlbum();
                const mediaItems = getGuestAlbumMediaItems(album);
                if (!Number.isNaN(mediaIndex) && mediaItems[mediaIndex]) {
                    openGuestViewer(mediaItems, mediaIndex, "Mi Álbum");
                }
            });
        });

        personalList.querySelectorAll("[data-guest-action=\"delete-personal-media\"]").forEach((button) => {
            button.addEventListener("click", () => {
                const mediaId = button.dataset.guestMediaId;
                if (mediaId) {
                    removeGuestMedia(mediaId);
                }
            });
        });
    }

    if (viewer) {
        let touchStartX = 0;
        let touchStartY = 0;

        viewer.querySelectorAll("[data-guest-action]").forEach((button) => {
            button.addEventListener("click", () => {
                const action = button.dataset.guestAction;

                if (action === "close-viewer") {
                    closeGuestViewer();
                } else if (action === "previous") {
                    moveGuestViewer(-1);
                } else if (action === "next") {
                    moveGuestViewer(1);
                }
            });
        });

        viewer.addEventListener("touchstart", (event) => {
            const touch = event.touches[0];
            if (!touch) {
                return;
            }
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });

        viewer.addEventListener("touchend", (event) => {
            const touch = event.changedTouches[0];
            if (!touch) {
                return;
            }

            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;

            if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY)) {
                moveGuestViewer(deltaX < 0 ? 1 : -1);
            }
        }, { passive: true });
    }
}

function renderGuestCenterSection(profile) {
    const currentAlbum = getOrCreateCurrentGuestAlbum();
    const hasContent = Boolean(currentAlbum && ((currentAlbum.photos || []).length > 0 || currentAlbum.video));
    const albumTitle = profile && profile.type === "guest" && profile.name ? `Mi Álbum - ${profile.name}` : "Mi Álbum";
    const albumDescription = hasContent
        ? "Tus recuerdos ya están guardados en este álbum."
        : "Sumá fotografías y un video para armar tu álbum personal.";
    const personalItems = currentAlbum ? getGuestAlbumMediaItems(currentAlbum) : [];
    const catalog = getGuestFilteredAlbums(guestCenterState.searchQuery, profile);
    const visibleCatalog = catalog.slice(0, guestCenterState.visibleCount);

    return `
        <div class="recuerdos-section-copy">
            <p class="recuerdos-section-kicker">Álbumes</p>
            <h2>Centro de Recuerdos</h2>
            <p>Tu álbum personal convive con otros álbumes guardados en este dispositivo.</p>
        </div>

        <div class="albums-layout">
            <article class="center-my-album-card guest-my-album-card">
                <i class="fa-solid fa-folder-open center-my-album-icon" aria-hidden="true"></i>
                <h3 id="personal-album-title">${escapeHTML(albumTitle)}</h3>
                <p id="personal-album-description" class="personal-album-description">${escapeHTML(albumDescription)}</p>

                <div class="center-my-album-actions" aria-label="Acciones del álbum personal">
                    <button id="guest-upload-photos-btn" class="btn-rectangular" type="button">Subir fotografías</button>
                    <button id="guest-upload-video-btn" class="btn-rectangular btn-secundario" type="button">Subir video</button>
                </div>

                <input id="guest-photos-input" type="file" accept="image/*" multiple hidden>
                <input id="guest-video-input" type="file" accept="video/*" hidden>

                <div class="guest-personal-album-media">
                    <div id="guest-personal-empty-state" class="album-empty-state" ${hasContent ? "hidden" : ""}>
                        <i class="fa-solid fa-photo-film album-empty-icon" aria-hidden="true"></i>
                        <h3>Tu álbum está esperando recuerdos</h3>
                        <p>Sumá fotografías y un video para verlo completo.</p>
                    </div>

                    <div id="guest-personal-media-list" class="guest-personal-media-list" aria-live="polite"></div>
                </div>
            </article>

            <aside class="guest-albums">
                <div class="guest-albums-header">
                    <p class="recuerdos-section-kicker">Buscar invitados</p>
                    <h3>Explorar álbumes</h3>
                    <p>Buscá por nombre y abrí cualquier álbum para ver todas sus fotos.</p>
                </div>

                <label class="guest-search-field" for="guest-album-search">
                    <span>Buscar por nombre</span>
                    <input id="guest-album-search" type="search" autocomplete="off" placeholder="Escribí un nombre para explorar" value="${escapeHTML(guestCenterState.searchQuery)}">
                </label>

                <div class="guest-albums-summary" id="guest-albums-summary">${escapeHTML(catalog.length ? `${Math.min(visibleCatalog.length, catalog.length)} de ${catalog.length} álbumes visibles` : "No hay álbumes para mostrar")}</div>
                <div id="guest-albums-grid" class="guest-albums-grid" aria-live="polite">
                    ${visibleCatalog.map((album) => {
                        const firstPhoto = album.photos[0];
                        const cover = firstPhoto ? firstPhoto.src : "assets/img-1.png";
                        const initials = initialsFromName(album.ownerName);
                        const count = (album.photos || []).length + (album.video ? 1 : 0);
                        return `
                            <button class="guest-album-item accent-rose" type="button" data-guest-album-id="${escapeHTML(album.id)}">
                                <span class="guest-album-initials" aria-hidden="true" style="background-image: ${firstPhoto ? `url('${escapeHTML(cover)}')` : "none"}">${escapeHTML(firstPhoto ? "" : initials)}</span>
                                <div class="guest-album-copy">
                                    <p class="guest-album-owner">${escapeHTML(album.ownerName)}</p>
                                    <h4 class="guest-album-title">${escapeHTML(album.ownerName)}</h4>
                                    <p class="guest-album-meta">${count} recuerdo${count === 1 ? "" : "s"}</p>
                                </div>
                            </button>
                        `;
                    }).join("")}
                </div>

                <button id="guest-load-more-btn" class="btn-rectangular center-more-btn" type="button"${visibleCatalog.length >= catalog.length ? " hidden" : ""}>Ver más álbumes</button>
            </aside>
        </div>

        ${renderGuestViewer()}
    `;
}

function renderGuestCenterSection(profile) {
    const currentAlbum = getOrCreateCurrentGuestAlbum();
    const hasContent = Boolean(currentAlbum && ((currentAlbum.photos || []).length > 0 || currentAlbum.video));
    const personalPhotoCount = Array.isArray(currentAlbum && currentAlbum.photos) ? currentAlbum.photos.length : 0;
    const albumTitle = profile && profile.type === "guest" && profile.name ? `Mi Álbum - ${profile.name}` : "Mi Álbum";
    const albumDescription = hasContent
        ? "Tus recuerdos ya están guardados en este álbum."
        : "Sumá fotografías y un video para armar tu álbum personal.";
    const personalItems = currentAlbum ? getGuestAlbumMediaItems(currentAlbum) : [];
    const personalPagination = getGuestPaginationWindow(personalItems, guestCenterState.personalPage, 10);
    guestCenterState.personalPage = personalPagination.currentPage;
    const showPersonalPagination = hasContent && personalPagination.totalItems > 10;
    const uploadProgress = guestCenterState.uploadProgress || {
        active: false,
        completed: 0,
        total: 0,
        label: "",
        fileName: ""
    };
    const showUploadProgress = Boolean(uploadProgress.active);
    const uploadPercent = uploadProgress.active && uploadProgress.total > 0
        ? Math.min(100, Math.max(0, Math.round((uploadProgress.completed / uploadProgress.total) * 100)))
        : 0;
    const hasReachedPhotoLimit = personalPhotoCount >= 50;
    const catalog = getGuestFilteredAlbums(guestCenterState.searchQuery, profile);
    const albumsPagination = getGuestPaginationWindow(catalog, guestCenterState.albumsPage, 10);
    guestCenterState.albumsPage = albumsPagination.currentPage;
    const albumSummary = catalog.length ? `${albumsPagination.currentPage} de ${albumsPagination.totalPages}` : "0 de 0";
    const albumAccentClasses = ["accent-rose", "accent-lavender", "accent-sand", "accent-plum"];
    const hasGuestAlbums = catalog.length > 0;
    const guestAlbumsGridContent = hasGuestAlbums
        ? albumsPagination.items.map((album, index) => {
            const accentClass = album.accentClass || albumAccentClasses[index % albumAccentClasses.length];
            return `
                            <button class="guest-album-item ${escapeHTML(accentClass)}" type="button" data-guest-album-id="${escapeHTML(album.id)}">
                                <span class="guest-album-initials" aria-hidden="true">
                                    <i class="fa-solid fa-folder-open" aria-hidden="true"></i>
                                </span>
                                <span class="guest-album-name">${escapeHTML(album.ownerName)}</span>
                            </button>
                        `;
        }).join("")
        : `
            <div class="album-empty-state guest-empty-album-card">
                <i class="fa-solid fa-folder-open guest-empty-album-icon" aria-hidden="true"></i>
                <h3>No hay álbumes de invitados todavía</h3>
                <p>Cuando existan álbumes reales en Firebase, aparecerán aquí.</p>
            </div>
        `;

    return `
        <div class="recuerdos-section-copy">
            <p class="recuerdos-section-kicker">Álbumes</p>
            <h2>Centro de Recuerdos</h2>
            <p>Tu álbum personal convive con otros álbumes guardados en este dispositivo.</p>
        </div>

        <div class="albums-layout">
            <article class="center-my-album-card guest-my-album-card">
                <i class="fa-solid fa-folder-open center-my-album-icon" aria-hidden="true"></i>
                <h3 id="personal-album-title">${escapeHTML(albumTitle)}</h3>
                <p id="personal-album-description" class="personal-album-description">${escapeHTML(albumDescription)}</p>

                <div class="center-my-album-actions guest-upload-actions" aria-label="Acciones del álbum personal">
                    <div class="guest-upload-action">
                        <button id="guest-upload-photos-btn" class="btn-rectangular" type="button" ${hasReachedPhotoLimit ? "disabled" : ""}>Subir fotografías</button>
                        <button class="guest-upload-info-btn" type="button" data-guest-action="toggle-upload-info" data-guest-info="photos" aria-label="Información sobre fotografías" aria-expanded="false">
                            <span aria-hidden="true">ⓘ</span>
                        </button>
                        <span class="guest-upload-tooltip" role="tooltip">Podés seleccionar hasta 20 fotografías por carga.</span>
                    </div>
                    <div class="guest-upload-action">
                        <button id="guest-upload-video-btn" class="btn-rectangular btn-secundario" type="button">Subir video</button>
                        <button class="guest-upload-info-btn" type="button" data-guest-action="toggle-upload-info" data-guest-info="video" aria-label="Información sobre video" aria-expanded="false">
                            <span aria-hidden="true">ⓘ</span>
                        </button>
                        <span class="guest-upload-tooltip" role="tooltip">Podés subir un video por vez. Tamaño máximo: 100 MB.</span>
                    </div>
                </div>

                ${hasReachedPhotoLimit ? `
                    <p class="guest-album-limit-note">Ya alcanzaste el máximo permitido de 50 fotografías.</p>
                ` : ""}

                ${showUploadProgress ? `
                    <div class="media-upload-progress guest-upload-progress" aria-live="polite">
                        <div class="media-upload-progress-head">
                            <span class="media-upload-progress-label">${escapeHTML(uploadProgress.label || "Subiendo fotografías")}</span>
                            <span class="media-upload-progress-meta">${uploadProgress.completed} / ${uploadProgress.total}</span>
                        </div>
                        <div class="media-upload-progress-track">
                            <span class="media-upload-progress-bar" style="width: ${uploadPercent}%"></span>
                        </div>
                        ${uploadProgress.fileName ? `<div class="media-upload-progress-file">${escapeHTML(uploadProgress.fileName)}</div>` : ""}
                    </div>
                ` : ""}

                <input id="guest-photos-input" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple hidden>
                <input id="guest-video-input" type="file" accept="video/*" hidden>

                <div class="guest-personal-album-media">
                    <div id="guest-personal-empty-state" class="album-empty-state guest-empty-album-card" ${hasContent ? "hidden" : ""}>
                        <i class="fa-solid fa-photo-film guest-empty-album-icon" aria-hidden="true"></i>
                        <h3>Tu álbum está esperando recuerdos</h3>
                        <p>Sumá fotografías para empezar a guardar recuerdos en este álbum.</p>
                    </div>

                    <div id="guest-personal-media-list" class="guest-personal-media-list" aria-live="polite"></div>
                    <div id="guest-personal-pagination" class="guest-pagination" ${showPersonalPagination ? "" : "hidden"}>
                        <button class="guest-pagination-btn" type="button" data-guest-action="personal-page-prev" aria-label="Página anterior">Anterior</button>
                        <span class="guest-pagination-label" data-guest-role="page-indicator">${personalPagination.currentPage} de ${personalPagination.totalPages}</span>
                        <button class="guest-pagination-btn" type="button" data-guest-action="personal-page-next" aria-label="Página siguiente">Siguiente</button>
                    </div>
                </div>
            </article>

            <aside class="guest-albums">
                <div class="guest-albums-header">
                    <i class="fa-solid fa-folder-open guest-albums-heading-icon" aria-hidden="true"></i>
                    <h3>Explorar álbumes</h3>
                    <div class="guest-albums-toolbar">
                        <label class="guest-search-field" for="guest-album-search">
                            <span>Buscar por nombre</span>
                            <input id="guest-album-search" type="search" autocomplete="off" placeholder="Escribí un nombre para explorar" value="${escapeHTML(guestCenterState.searchQuery)}">
                        </label>

                        <div class="guest-albums-summary" id="guest-albums-summary">${escapeHTML(albumSummary)}</div>
                    </div>
                </div>

                <div id="guest-albums-grid" class="guest-albums-grid" aria-live="polite">
                    ${guestAlbumsGridContent}
                </div>

                <div id="guest-albums-pagination" class="guest-pagination" ${albumsPagination.totalPages > 1 ? "" : "hidden"}>
                    <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-prev" aria-label="Página anterior">Anterior</button>
                    <span class="guest-pagination-label" data-guest-role="page-indicator">${albumsPagination.currentPage} de ${albumsPagination.totalPages}</span>
                    <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-next" aria-label="Página siguiente">Siguiente</button>
                </div>
            </aside>
        </div>

        ${renderGuestViewer()}
    `;
}

function renderGuestCenterSection(profile) {
    const currentAlbum = getOrCreateCurrentGuestAlbum();
    const photoCount = currentAlbum ? (currentAlbum.photos || []).length : 0;
    const hasContent = Boolean(currentAlbum && ((currentAlbum.photos || []).length > 0 || currentAlbum.video));
    const albumTitle = profile && profile.type === "guest" && profile.name ? `Mi Álbum - ${profile.name}` : "Mi Álbum";
    const albumDescription = hasContent
        ? "Tus recuerdos ya están guardados en este álbum."
        : "Sumá fotografías y un video para armar tu álbum personal.";
    const personalItems = currentAlbum ? getGuestAlbumMediaItems(currentAlbum) : [];
    const personalPagination = getGuestPaginationWindow(personalItems, guestCenterState.personalPage, 10);
    guestCenterState.personalPage = personalPagination.currentPage;
    const showPersonalPagination = hasContent && personalPagination.totalItems > 10;
    const catalog = getGuestFilteredAlbums(guestCenterState.searchQuery, profile);
    const albumsPagination = getGuestPaginationWindow(catalog, guestCenterState.albumsPage, 10);
    guestCenterState.albumsPage = albumsPagination.currentPage;
    const albumSummary = catalog.length ? `${albumsPagination.currentPage} de ${albumsPagination.totalPages}` : "0 de 0";
    const albumAccentClasses = ["accent-rose", "accent-lavender", "accent-sand", "accent-plum"];
    const uploadProgress = guestCenterState.uploadProgress || {
        active: false,
        completed: 0,
        total: 0,
        label: "",
        fileName: ""
    };
    const uploadPercent = uploadProgress.active && uploadProgress.total > 0
        ? Math.min(100, Math.max(0, Math.round((uploadProgress.completed / uploadProgress.total) * 100)))
        : 0;
    const hasReachedPhotoLimit = photoCount >= 50;

    return `
        <div class="recuerdos-section-copy">
            <p class="recuerdos-section-kicker">Álbumes</p>
            <h2>Centro de Recuerdos</h2>
            <p>Tu álbum personal convive con otros álbumes guardados en este dispositivo.</p>
        </div>

        <div class="albums-layout">
            <article class="center-my-album-card guest-my-album-card">
                <i class="fa-solid fa-folder-open center-my-album-icon" aria-hidden="true"></i>
                <h3 id="personal-album-title">${escapeHTML(albumTitle)}</h3>
                <p id="personal-album-description" class="personal-album-description">${escapeHTML(albumDescription)}</p>

                <div class="center-my-album-actions guest-upload-actions" aria-label="Acciones del álbum personal">
                    <div class="guest-upload-action">
                        <button id="guest-upload-photos-btn" class="btn-rectangular" type="button" ${hasReachedPhotoLimit ? "disabled" : ""}>Subir fotografías</button>
                        <button class="guest-upload-info-btn" type="button" data-guest-action="toggle-upload-info" data-guest-info="photos" aria-label="Información sobre fotografías" aria-expanded="false">
                            <span aria-hidden="true">ⓘ</span>
                        </button>
                        <span class="guest-upload-tooltip" role="tooltip">Podés seleccionar hasta 20 fotografías por carga.</span>
                    </div>
                    <div class="guest-upload-action">
                        <button id="guest-upload-video-btn" class="btn-rectangular btn-secundario" type="button">Subir video</button>
                        <button class="guest-upload-info-btn" type="button" data-guest-action="toggle-upload-info" data-guest-info="video" aria-label="Información sobre video" aria-expanded="false">
                            <span aria-hidden="true">ⓘ</span>
                        </button>
                        <span class="guest-upload-tooltip" role="tooltip">Podï¿½s subir un video por vez. Tamaño mï¿½ximo: 100 MB.</span>
                    </div>
                </div>

                ${hasReachedPhotoLimit ? `<p class="guest-album-limit-note">Alcanzaste el máximo permitido de 50 fotografías en tu álbum.</p>` : ""}

                ${uploadProgress.active ? `
                    <div class="media-upload-progress guest-upload-progress" aria-live="polite">
                        <div class="media-upload-progress-head">
                            <span class="media-upload-progress-label">${escapeHTML(uploadProgress.label || "Subiendo fotografías")}</span>
                            <span class="media-upload-progress-meta">${uploadProgress.completed} / ${uploadProgress.total}</span>
                        </div>
                        <div class="media-upload-progress-track">
                            <span class="media-upload-progress-bar" style="width: ${uploadPercent}%"></span>
                        </div>
                        ${uploadProgress.fileName ? `<div class="media-upload-progress-file">${escapeHTML(uploadProgress.fileName)}</div>` : ""}
                    </div>
                ` : ""}

                <input id="guest-photos-input" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple hidden>
                <input id="guest-video-input" type="file" accept="video/*" hidden>

                <div class="guest-personal-album-media">
                    <div id="guest-personal-empty-state" class="album-empty-state guest-empty-album-card" ${hasContent ? "hidden" : ""}>
                        <i class="fa-solid fa-photo-film guest-empty-album-icon" aria-hidden="true"></i>
                        <h3>Tu álbum está esperando recuerdos</h3>
                        <p>Sumá fotografías para empezar a guardar recuerdos en este álbum.</p>
                    </div>

                    <div id="guest-personal-media-list" class="guest-personal-media-list" aria-live="polite"></div>
                    <div id="guest-personal-pagination" class="guest-pagination" ${showPersonalPagination ? "" : "hidden"}>
                        <button class="guest-pagination-btn" type="button" data-guest-action="personal-page-prev" aria-label="Página anterior">Anterior</button>
                        <span class="guest-pagination-label" data-guest-role="page-indicator">${personalPagination.currentPage} de ${personalPagination.totalPages}</span>
                        <button class="guest-pagination-btn" type="button" data-guest-action="personal-page-next" aria-label="Página siguiente">Siguiente</button>
                    </div>
                </div>
            </article>

            <aside class="guest-albums">
                <div class="guest-albums-header">
                    <i class="fa-solid fa-folder-open guest-albums-heading-icon" aria-hidden="true"></i>
                    <h3>Explorar álbumes</h3>
                    <div class="guest-albums-toolbar">
                        <label class="guest-search-field" for="guest-album-search">
                            <span>Buscar por nombre</span>
                            <input id="guest-album-search" type="search" autocomplete="off" placeholder="Escribí un nombre para explorar" value="${escapeHTML(guestCenterState.searchQuery)}">
                        </label>

                        <div class="guest-albums-summary" id="guest-albums-summary">${escapeHTML(albumSummary)}</div>
                    </div>
                </div>

                <div id="guest-albums-grid" class="guest-albums-grid" aria-live="polite">
                    ${albumsPagination.items.map((album, index) => {
                        const accentClass = album.accentClass || albumAccentClasses[index % albumAccentClasses.length];
                        return `
                            <button class="guest-album-item ${escapeHTML(accentClass)}" type="button" data-guest-album-id="${escapeHTML(album.id)}">
                                <span class="guest-album-initials" aria-hidden="true">
                                    <i class="fa-solid fa-folder-open" aria-hidden="true"></i>
                                </span>
                                <span class="guest-album-name">${escapeHTML(album.ownerName)}</span>
                            </button>
                        `;
                    }).join("")}
                </div>

                <div id="guest-albums-pagination" class="guest-pagination" ${albumsPagination.totalPages > 1 ? "" : "hidden"}>
                    <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-prev" aria-label="Página anterior">Anterior</button>
                    <span class="guest-pagination-label" data-guest-role="page-indicator">${albumsPagination.currentPage} de ${albumsPagination.totalPages}</span>
                    <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-next" aria-label="Página siguiente">Siguiente</button>
                </div>
            </aside>
        </div>

        ${renderGuestViewer()}
    `;
}

function renderGuestCenterSection(profile) {
    const currentAlbum = getOrCreateCurrentGuestAlbum();
    const photoCount = currentAlbum ? (currentAlbum.photos || []).length : 0;
    const hasContent = Boolean(currentAlbum && ((currentAlbum.photos || []).length > 0 || currentAlbum.video));
    const albumTitle = profile && profile.type === "guest" && profile.name ? `Mi Álbum - ${profile.name}` : "Mi Álbum";
    const albumDescription = hasContent
        ? "Tus recuerdos ya están guardados en este álbum."
        : "Sumá fotografías y un video para armar tu álbum personal.";
    const personalItems = currentAlbum ? getGuestAlbumMediaItems(currentAlbum) : [];
    const personalPagination = getGuestPaginationWindow(personalItems, guestCenterState.personalPage, 10);
    guestCenterState.personalPage = personalPagination.currentPage;
    const showPersonalPagination = hasContent && personalPagination.totalItems > 10;
    const catalog = getGuestFilteredAlbums(guestCenterState.searchQuery, profile);
    const albumsPagination = getGuestPaginationWindow(catalog, guestCenterState.albumsPage, 10);
    guestCenterState.albumsPage = albumsPagination.currentPage;
    const albumSummary = catalog.length ? `${albumsPagination.currentPage} de ${albumsPagination.totalPages}` : "0 de 0";
    const albumAccentClasses = ["accent-rose", "accent-lavender", "accent-sand", "accent-plum"];
    const uploadProgress = guestCenterState.uploadProgress || {
        active: false,
        completed: 0,
        total: 0,
        label: "",
        fileName: ""
    };
    const uploadPercent = uploadProgress.active && uploadProgress.total > 0
        ? Math.min(100, Math.max(0, Math.round((uploadProgress.completed / uploadProgress.total) * 100)))
        : 0;
    const hasReachedPhotoLimit = photoCount >= 50;

    return `
        <div class="recuerdos-section-copy">
            <p class="recuerdos-section-kicker">Álbumes</p>
            <h2>Centro de Recuerdos</h2>
            <p>Tu álbum personal convive con otros álbumes guardados en este dispositivo.</p>
        </div>

        <div class="albums-layout">
            <article class="center-my-album-card guest-my-album-card">
                <i class="fa-solid fa-folder-open center-my-album-icon" aria-hidden="true"></i>
                <h3 id="personal-album-title">${escapeHTML(albumTitle)}</h3>
                <p id="personal-album-description" class="personal-album-description">${escapeHTML(albumDescription)}</p>

                <div class="center-my-album-actions guest-upload-actions" aria-label="Acciones del álbum personal">
                    <div class="guest-upload-action">
                        <button id="guest-upload-photos-btn" class="btn-rectangular" type="button" ${hasReachedPhotoLimit ? "disabled" : ""}>Subir fotografías</button>
                        <button class="guest-upload-info-btn" type="button" data-guest-action="toggle-upload-info" data-guest-info="photos" aria-label="Información sobre fotografías" aria-expanded="false">
                            <span aria-hidden="true">ⓘ</span>
                        </button>
                        <span class="guest-upload-tooltip" role="tooltip">Podés seleccionar hasta 20 fotografías por carga.</span>
                    </div>
                    <div class="guest-upload-action">
                        <button id="guest-upload-video-btn" class="btn-rectangular btn-secundario" type="button">Subir video</button>
                        <button class="guest-upload-info-btn" type="button" data-guest-action="toggle-upload-info" data-guest-info="video" aria-label="Información sobre video" aria-expanded="false">
                            <span aria-hidden="true">ⓘ</span>
                        </button>
                        <span class="guest-upload-tooltip" role="tooltip">Podï¿½s subir un video por vez. Tamaño mï¿½ximo: 100 MB.</span>
                    </div>
                </div>

                ${hasReachedPhotoLimit ? `<p class="guest-album-limit-note">Alcanzaste el máximo permitido de 50 fotografías en tu álbum.</p>` : ""}

                ${uploadProgress.active ? `
                    <div class="media-upload-progress guest-upload-progress" aria-live="polite">
                        <div class="media-upload-progress-head">
                            <span class="media-upload-progress-label">${escapeHTML(uploadProgress.label || "Subiendo fotografías")}</span>
                            <span class="media-upload-progress-meta">${uploadProgress.completed} / ${uploadProgress.total}</span>
                        </div>
                        <div class="media-upload-progress-track">
                            <span class="media-upload-progress-bar" style="width: ${uploadPercent}%"></span>
                        </div>
                        ${uploadProgress.fileName ? `<div class="media-upload-progress-file">${escapeHTML(uploadProgress.fileName)}</div>` : ""}
                    </div>
                ` : ""}

                <input id="guest-photos-input" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple hidden>
                <input id="guest-video-input" type="file" accept="video/*" hidden>

                <div class="guest-personal-album-media">
                    <div id="guest-personal-empty-state" class="album-empty-state guest-empty-album-card" ${hasContent ? "hidden" : ""}>
                        <i class="fa-solid fa-photo-film guest-empty-album-icon" aria-hidden="true"></i>
                        <h3>Tu álbum está esperando recuerdos</h3>
                        <p>Sumá fotografías para empezar a guardar recuerdos en este álbum.</p>
                    </div>

                    <div id="guest-personal-media-list" class="guest-personal-media-list" aria-live="polite"></div>
                    <div id="guest-personal-pagination" class="guest-pagination" ${showPersonalPagination ? "" : "hidden"}>
                        <button class="guest-pagination-btn" type="button" data-guest-action="personal-page-prev" aria-label="Página anterior">Anterior</button>
                        <span class="guest-pagination-label" data-guest-role="page-indicator">${personalPagination.currentPage} de ${personalPagination.totalPages}</span>
                        <button class="guest-pagination-btn" type="button" data-guest-action="personal-page-next" aria-label="Página siguiente">Siguiente</button>
                    </div>
                </div>
            </article>

            <aside class="guest-albums">
                <div class="guest-albums-header">
                    <i class="fa-solid fa-folder-open guest-albums-heading-icon" aria-hidden="true"></i>
                    <h3>Explorar álbumes</h3>
                    <div class="guest-albums-toolbar">
                        <label class="guest-search-field" for="guest-album-search">
                            <span>Buscar por nombre</span>
                            <input id="guest-album-search" type="search" autocomplete="off" placeholder="Escribí un nombre para explorar" value="${escapeHTML(guestCenterState.searchQuery)}">
                        </label>

                        <div class="guest-albums-summary" id="guest-albums-summary">${escapeHTML(albumSummary)}</div>
                    </div>
                </div>

                <div id="guest-albums-grid" class="guest-albums-grid" aria-live="polite">
                    ${albumsPagination.items.map((album, index) => {
                        const accentClass = album.accentClass || albumAccentClasses[index % albumAccentClasses.length];
                        return `
                            <button class="guest-album-item ${escapeHTML(accentClass)}" type="button" data-guest-album-id="${escapeHTML(album.id)}">
                                <span class="guest-album-initials" aria-hidden="true">
                                    <i class="fa-solid fa-folder-open" aria-hidden="true"></i>
                                </span>
                                <span class="guest-album-name">${escapeHTML(album.ownerName)}</span>
                            </button>
                        `;
                    }).join("")}
                </div>

                <div id="guest-albums-pagination" class="guest-pagination" ${albumsPagination.totalPages > 1 ? "" : "hidden"}>
                    <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-prev" aria-label="Página anterior">Anterior</button>
                    <span class="guest-pagination-label" data-guest-role="page-indicator">${albumsPagination.currentPage} de ${albumsPagination.totalPages}</span>
                    <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-next" aria-label="Página siguiente">Siguiente</button>
                </div>
            </aside>
        </div>

        ${renderGuestViewer()}
    `;
}

function renderGuestCenterSection(profile) {
    const currentAlbum = getOrCreateCurrentGuestAlbum();
    const photoCount = currentAlbum ? (currentAlbum.photos || []).length : 0;
    const hasContent = Boolean(currentAlbum && ((currentAlbum.photos || []).length > 0 || currentAlbum.video));
    const albumTitle = profile && profile.type === "guest" && profile.name ? `Mi Álbum - ${profile.name}` : "Mi Álbum";
    const albumDescription = hasContent
        ? "Tus recuerdos ya están guardados en este álbum."
        : "Sumá fotografías y un video para armar tu álbum personal.";
    const personalItems = currentAlbum ? getGuestAlbumMediaItems(currentAlbum) : [];
    const personalPagination = getGuestPaginationWindow(personalItems, guestCenterState.personalPage, 10);
    guestCenterState.personalPage = personalPagination.currentPage;
    const showPersonalPagination = hasContent && personalPagination.totalItems > 10;
    const catalog = getGuestFilteredAlbums(guestCenterState.searchQuery, profile);
    const albumsPagination = getGuestPaginationWindow(catalog, guestCenterState.albumsPage, 10);
    guestCenterState.albumsPage = albumsPagination.currentPage;
    const albumSummary = catalog.length ? `${albumsPagination.currentPage} de ${albumsPagination.totalPages}` : "0 de 0";
    const albumAccentClasses = ["accent-rose", "accent-lavender", "accent-sand", "accent-plum"];
    const uploadProgress = guestCenterState.uploadProgress || {
        active: false,
        completed: 0,
        total: 0,
        label: "",
        fileName: ""
    };
    const uploadPercent = uploadProgress.active && uploadProgress.total > 0
        ? Math.min(100, Math.max(0, Math.round((uploadProgress.completed / uploadProgress.total) * 100)))
        : 0;
    const hasReachedPhotoLimit = photoCount >= 50;

    return `
        <div class="recuerdos-section-copy">
            <p class="recuerdos-section-kicker">Álbumes</p>
            <h2>Centro de Recuerdos</h2>
            <p>Tu álbum personal convive con otros álbumes guardados en este dispositivo.</p>
        </div>

        <div class="albums-layout">
            <article class="center-my-album-card guest-my-album-card">
                <i class="fa-solid fa-folder-open center-my-album-icon" aria-hidden="true"></i>
                <h3 id="personal-album-title">${escapeHTML(albumTitle)}</h3>
                <p id="personal-album-description" class="personal-album-description">${escapeHTML(albumDescription)}</p>

                <div class="center-my-album-actions guest-upload-actions" aria-label="Acciones del álbum personal">
                    <div class="guest-upload-action">
                        <button id="guest-upload-photos-btn" class="btn-rectangular" type="button" ${hasReachedPhotoLimit ? "disabled" : ""}>Subir fotografías</button>
                        <button class="guest-upload-info-btn" type="button" data-guest-action="toggle-upload-info" data-guest-info="photos" aria-label="Información sobre fotografías" aria-expanded="false">
                            <span aria-hidden="true">ⓘ</span>
                        </button>
                        <span class="guest-upload-tooltip" role="tooltip">Podés seleccionar hasta 20 fotografías por carga.</span>
                    </div>
                    <div class="guest-upload-action">
                        <button id="guest-upload-video-btn" class="btn-rectangular btn-secundario" type="button">Subir video</button>
                        <button class="guest-upload-info-btn" type="button" data-guest-action="toggle-upload-info" data-guest-info="video" aria-label="Información sobre video" aria-expanded="false">
                            <span aria-hidden="true">ⓘ</span>
                        </button>
                        <span class="guest-upload-tooltip" role="tooltip">Podï¿½s subir un video por vez. Tamaño mï¿½ximo: 100 MB.</span>
                    </div>
                </div>

                ${hasReachedPhotoLimit ? `<p class="guest-album-limit-note">Alcanzaste el máximo permitido de 50 fotografías en tu álbum.</p>` : ""}

                ${uploadProgress.active ? `
                    <div class="media-upload-progress guest-upload-progress" aria-live="polite">
                        <div class="media-upload-progress-head">
                            <span class="media-upload-progress-label">${escapeHTML(uploadProgress.label || "Subiendo fotografías")}</span>
                            <span class="media-upload-progress-meta">${uploadProgress.completed} / ${uploadProgress.total}</span>
                        </div>
                        <div class="media-upload-progress-track">
                            <span class="media-upload-progress-bar" style="width: ${uploadPercent}%"></span>
                        </div>
                        ${uploadProgress.fileName ? `<div class="media-upload-progress-file">${escapeHTML(uploadProgress.fileName)}</div>` : ""}
                    </div>
                ` : ""}

                <input id="guest-photos-input" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple hidden>
                <input id="guest-video-input" type="file" accept="video/*" hidden>

                <div class="guest-personal-album-media">
                    <div id="guest-personal-empty-state" class="album-empty-state guest-empty-album-card" ${hasContent ? "hidden" : ""}>
                        <i class="fa-solid fa-photo-film guest-empty-album-icon" aria-hidden="true"></i>
                        <h3>Tu álbum está esperando recuerdos</h3>
                        <p>Sumá fotografías para empezar a guardar recuerdos en este álbum.</p>
                    </div>

                    <div id="guest-personal-media-list" class="guest-personal-media-list" aria-live="polite"></div>
                    <div id="guest-personal-pagination" class="guest-pagination" ${showPersonalPagination ? "" : "hidden"}>
                        <button class="guest-pagination-btn" type="button" data-guest-action="personal-page-prev" aria-label="Página anterior">Anterior</button>
                        <span class="guest-pagination-label" data-guest-role="page-indicator">${personalPagination.currentPage} de ${personalPagination.totalPages}</span>
                        <button class="guest-pagination-btn" type="button" data-guest-action="personal-page-next" aria-label="Página siguiente">Siguiente</button>
                    </div>
                </div>
            </article>

            <aside class="guest-albums">
                <div class="guest-albums-header">
                    <i class="fa-solid fa-folder-open guest-albums-heading-icon" aria-hidden="true"></i>
                    <h3>Explorar álbumes</h3>
                    <div class="guest-albums-toolbar">
                        <label class="guest-search-field" for="guest-album-search">
                            <span>Buscar por nombre</span>
                            <input id="guest-album-search" type="search" autocomplete="off" placeholder="Escribí un nombre para explorar" value="${escapeHTML(guestCenterState.searchQuery)}">
                        </label>

                        <div class="guest-albums-summary" id="guest-albums-summary">${escapeHTML(albumSummary)}</div>
                    </div>
                </div>

                <div id="guest-albums-grid" class="guest-albums-grid" aria-live="polite">
                    ${albumsPagination.items.map((album, index) => {
                        const accentClass = album.accentClass || albumAccentClasses[index % albumAccentClasses.length];
                        return `
                            <button class="guest-album-item ${escapeHTML(accentClass)}" type="button" data-guest-album-id="${escapeHTML(album.id)}">
                                <span class="guest-album-initials" aria-hidden="true">
                                    <i class="fa-solid fa-folder-open" aria-hidden="true"></i>
                                </span>
                                <span class="guest-album-name">${escapeHTML(album.ownerName)}</span>
                            </button>
                        `;
                    }).join("")}
                </div>

                <div id="guest-albums-pagination" class="guest-pagination" ${albumsPagination.totalPages > 1 ? "" : "hidden"}>
                    <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-prev" aria-label="Página anterior">Anterior</button>
                    <span class="guest-pagination-label" data-guest-role="page-indicator">${albumsPagination.currentPage} de ${albumsPagination.totalPages}</span>
                    <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-next" aria-label="Página siguiente">Siguiente</button>
                </div>
            </aside>
        </div>

        ${renderGuestViewer()}
    `;
}

function renderOfficialPhotosSection() {
    const section = document.getElementById("photos-section");

    if (!section) {
        return;
    }

    const profile = getStoredAccessProfile();
    const isAdmin = profile && profile.type === "admin";
    const officialAlbumState = recuerdosAppState.officialAlbum;
    const items = getOfficialAlbumVisibleItems(profile);
    const activeIndex = getOfficialAlbumActiveIndex(profile);
    const hasOfficialPhotos = items.length > 0;
    if (!isAdmin && !hasOfficialPhotos && !officialAlbumState.firebaseLoading && !officialAlbumState.guestRefreshAttempted) {
        officialAlbumState.guestRefreshAttempted = true;
        void loadOfficialAlbumFromFirebase(true);
    }

    const uploadProgress = officialAlbumState.uploadProgress || {
        active: false,
        completed: 0,
        total: 0,
        label: "",
        fileName: ""
    };
    const uploadPercent = uploadProgress.active && uploadProgress.total > 0
        ? Math.min(100, Math.max(0, Math.round((uploadProgress.completed / uploadProgress.total) * 100)))
        : 0;

    section.className = "section bg-lavanda";

    section.innerHTML = `
        <i class="fa-solid fa-camera icon-evento" aria-hidden="true"></i>
        <h2>Álbum Oficial</h2>
        ${hasOfficialPhotos
            ? `<p class="official-photos-lead">La galería oficial reúne fotografías oficiales del evento.</p>
               <p class="official-photos-note">Seleccioná una miniatura o abrí la fotografía principal para verla en detalle.</p>`
            : (isAdmin ? `<p class="official-photos-lead">Pronto se subirán las fotografías oficiales.</p>` : "")}

        <div class="official-photos-actions"${isAdmin ? "" : " hidden"}>
            <button class="btn-rectangular" type="button" data-official-action="upload">Subir fotografías</button>
            <button class="btn-rectangular btn-secundario" type="button" data-official-action="manage">${officialAlbumState.adminPanelOpen ? "Cerrar administración" : "Administrar fotografías"}</button>
        </div>

        <input id="official-photos-input" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple hidden>

        ${uploadProgress.active ? `
            <div class="media-upload-progress official-upload-progress" aria-live="polite">
                <div class="media-upload-progress-head">
                    <span class="media-upload-progress-label">${escapeHTML(uploadProgress.label || "Subiendo fotografías")}</span>
                    <span class="media-upload-progress-meta">${uploadProgress.completed} / ${uploadProgress.total}</span>
                </div>
                <div class="media-upload-progress-track">
                    <span class="media-upload-progress-bar" style="width: ${uploadPercent}%"></span>
                </div>
                ${uploadProgress.fileName ? `<div class="media-upload-progress-file">${escapeHTML(uploadProgress.fileName)}</div>` : ""}
            </div>
        ` : ""}

        <div class="official-album-shell">
            ${hasOfficialPhotos
                ? renderOfficialAlbumGallery(items, activeIndex)
                : renderOfficialAlbumEmptyState(profile)}
        </div>

        ${isAdmin ? renderOfficialAlbumAdminPanel(items, officialAlbumState.adminPanelOpen) : ""}
        ${officialAlbumState.lightboxIndex !== null ? renderOfficialAlbumLightbox(items, officialAlbumState.lightboxIndex) : ""}
    `;

    initializeOfficialAlbumInteractions();
    applyOfficialAlbumImageFallbacks(section);
    syncOfficialAlbumBodyLock();
}

function addOfficialAlbumFiles(files) {
    const imageFiles = Array.from(files || []).filter((file) => file && isSupportedGuestImageFile(file));
    const rejectedFiles = Array.from(files || []).filter((file) => file && !isSupportedGuestImageFile(file));

    if (!imageFiles.length) {
        showToast(rejectedFiles.length ? "Solo se permiten fotografías JPG, JPEG, PNG y WEBP." : "Seleccioná al menos una imagen.", "default");
        return;
    }

    if (rejectedFiles.length) {
        showToast("Solo se permiten fotografías JPG, JPEG, PNG y WEBP.", "default");
    }

    initializeOfficialAlbumState();

    const officialAlbumState = recuerdosAppState.officialAlbum;
    const nextItems = imageFiles.map((file) => createOfficialAlbumUploadItem(file));
    officialAlbumState.items = officialAlbumState.items.concat(nextItems);
    officialAlbumState.uploadedItems = officialAlbumState.uploadedItems.concat(nextItems);
    renderOfficialPhotosSection();
    void persistOfficialAlbumUploads(nextItems, imageFiles);
}

async function persistOfficialAlbumUploads(nextItems, files) {
    const firebaseApi = await getFirebaseOfficialAlbumApi();

    if (!firebaseApi) {
        showToast("No se pudo guardar la fotografía en Firebase. Se mantiene solo en esta sesión.", "error");
        return;
    }

    const officialAlbumState = recuerdosAppState.officialAlbum;
    const paths = getOfficialAlbumFirestorePath();
    const albumRef = firebaseApi.doc(firebaseApi.firestore, ...paths.albumDocPath);
    const createdBy = (getStoredAccessProfile() && getStoredAccessProfile().type) || "admin";
    const persistedItems = [];

    setOfficialAlbumUploadProgress({
        active: true,
        completed: 0,
        total: nextItems.length,
        label: "Subiendo fotografías oficiales",
        fileName: ""
    });
    renderOfficialPhotosSection();

    try {
        for (let index = 0; index < nextItems.length; index += 1) {
            const item = nextItems[index];
            const file = files[index];
            const existingIndex = officialAlbumState.items.findIndex((entry) => entry.id === item.id);

            if (!file) {
                setOfficialAlbumUploadProgress({
                    completed: index + 1,
                    total: nextItems.length,
                    fileName: ""
                });
                renderOfficialPhotosSection();
                continue;
            }

            setOfficialAlbumUploadProgress({
                completed: index,
                total: nextItems.length,
                fileName: file.name
            });
            renderOfficialPhotosSection();

            const compressed = await compressGuestImageFile(file);
            const storagePath = `events/${recuerdosEventId}/albums/official/photos/${item.id}.jpg`;
            const storageRef = firebaseApi.ref(firebaseApi.storage, storagePath);
            const uploadTask = firebaseApi.uploadBytesResumable(storageRef, compressed.blob, {
                contentType: compressed.mimeType || "image/jpeg"
            });

            const uploadSnapshot = await new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const totalBytes = snapshot.totalBytes || compressed.blob.size || 1;
                        const fileProgress = totalBytes > 0 ? snapshot.bytesTransferred / totalBytes : 0;
                        setOfficialAlbumUploadProgress({
                            completed: index + fileProgress,
                            total: nextItems.length,
                            fileName: file.name
                        });
                        renderOfficialPhotosSection();
                    },
                    (error) => reject(error),
                    () => resolve(uploadTask.snapshot)
                );
            });

            const downloadUrl = await firebaseApi.getDownloadURL(uploadSnapshot.ref);

            if (!officialAlbumState.items.find((entry) => entry.id === item.id)) {
                await firebaseApi.deleteObject(storageRef);
                setOfficialAlbumUploadProgress({
                    completed: index + 1,
                    total: nextItems.length,
                    fileName: ""
                });
                renderOfficialPhotosSection();
                continue;
            }

            const record = buildOfficialAlbumFirestoreRecord({
                ...item,
                src: downloadUrl,
                fallbackSrc: downloadUrl,
                storagePath,
                downloadUrl,
                mimeType: compressed.mimeType,
                width: compressed.width,
                height: compressed.height,
                createdBy,
                order: typeof item.order === "number" ? item.order : officialAlbumState.items.length + index
            }, {
                createdBy,
                order: typeof item.order === "number" ? item.order : officialAlbumState.items.length + index
            });

            await firebaseApi.setDoc(firebaseApi.doc(firebaseApi.firestore, ...paths.photosCollectionPath, item.id), record, { merge: true });

            const normalizedItem = normalizeOfficialAlbumFromRecord(
                record,
                item.id,
                typeof item.order === "number" ? item.order : existingIndex >= 0 ? existingIndex : index
            );

            if (existingIndex >= 0) {
                const currentItem = officialAlbumState.items[existingIndex];
                if (currentItem && currentItem.objectUrl && currentItem.objectUrl !== normalizedItem.objectUrl) {
                    window.URL.revokeObjectURL(currentItem.objectUrl);
                }
                officialAlbumState.items[existingIndex] = normalizedItem;
            } else {
                officialAlbumState.items.push(normalizedItem);
            }

            persistedItems.push(normalizedItem);
            setOfficialAlbumUploadProgress({
                completed: index + 1,
                total: nextItems.length,
                fileName: file.name
            });
            renderOfficialPhotosSection();
        }

        const metadata = updateOfficialAlbumMetadata(officialAlbumState.items);
        await firebaseApi.setDoc(albumRef, {
            albumId: "official",
            albumType: "official",
            title: "Álbum Oficial",
            ...metadata
        }, { merge: true });

        resetOfficialAlbumUploadProgress();
        renderOfficialPhotosSection();
        showToast(`${persistedItems.length} fotografía${persistedItems.length === 1 ? "" : "s"} guardada${persistedItems.length === 1 ? "" : "s"} en Firebase.`, "success");
    } catch (error) {
        resetOfficialAlbumUploadProgress();
        const issue = classifyFirebaseStorageError(error);
        console.error(`[Recuerdos] No se pudo guardar una fotografía del Álbum Oficial en Firebase. Motivo: ${issue.category}. ${issue.detail}`, error);
        showToast(`No se pudo subir la fotografía. ${issue.detail}`, "error");
        renderOfficialPhotosSection();
    }
}
async function deleteGuestPhotoRemote(targetPhoto, album, profile) {
    const firebaseApi = await getFirebaseGuestAlbumApi();

    if (!firebaseApi) {
        showToast("No se pudo sincronizar la eliminación con Firebase. El cambio quedó en este dispositivo.", "error");
        return;
    }

    const paths = getGuestAlbumFirestorePath(album.id);

    try {
        if (targetPhoto.storagePath) {
            await firebaseApi.deleteObject(firebaseApi.ref(firebaseApi.storage, targetPhoto.storagePath));
        }

        await firebaseApi.deleteDoc(firebaseApi.doc(firebaseApi.firestore, ...paths.photosCollectionPath, targetPhoto.id));

        const updatedAlbum = updateGuestAlbumPreviewMetadata(album);
        Object.assign(album, updatedAlbum);
        const storedAlbums = getStoredGuestAlbums();
        const nextAlbums = storedAlbums.some((item) => item.id === album.id)
            ? storedAlbums.map((item) => (item.id === album.id ? album : item))
            : storedAlbums.concat(album);
        saveStoredGuestAlbums(nextAlbums);

        await firebaseApi.setDoc(firebaseApi.doc(firebaseApi.firestore, ...paths.albumDocPath), buildGuestAlbumFirestoreRecord(album, profile), { merge: true });
    } catch (error) {
        console.error("[Recuerdos] No se pudo eliminar una fotografï¿½a de Mi Álbum en Firebase.", error);
        showToast("No se pudo sincronizar la eliminación con Firebase. La galería se mantiene visible en este dispositivo.", "error");
    }
}

function addGuestPhotos(files) {
    const selectedFiles = Array.from(files || []);
    const imageFiles = selectedFiles.filter((file) => isSupportedGuestImageFile(file));
    const rejectedFiles = selectedFiles.filter((file) => file && !isSupportedGuestImageFile(file));

    if (!imageFiles.length) {
        showToast(rejectedFiles.length ? "Solo se permiten fotografías JPG, JPEG, PNG y WEBP." : "Seleccioná al menos una imagen.", "default");
        return;
    }

    if (rejectedFiles.length) {
        showToast("Solo se permiten fotografías JPG, JPEG, PNG y WEBP.", "default");
    }

    if (imageFiles.length > 20) {
        showToast("Podés subir hasta 20 fotografías por carga. Hacé otra carga para seguir agregando.", "default");
        return;
    }

    const album = getOrCreateCurrentGuestAlbum();

    if (!album) {
        return;
    }

    const currentPhotos = Array.isArray(album.photos) ? album.photos.slice() : [];
    const currentPhotoCount = currentPhotos.length;

    if (currentPhotoCount >= 50 || currentPhotoCount + imageFiles.length > 50) {
        showToast("Tu álbum ya alcanzó el máximo permitido de 50 fotografías.", "default");
        renderAlbumsSection();
        return;
    }

    const appendedPhotos = imageFiles.map((file, index) => createGuestAlbumUploadItem(file, currentPhotoCount + index));
    album.photos = currentPhotos.concat(appendedPhotos);
    Object.assign(album, updateGuestAlbumPreviewMetadata(album));

    const storedAlbums = getStoredGuestAlbums();
    const nextAlbums = storedAlbums.some((item) => item.id === album.id)
        ? storedAlbums.map((item) => (item.id === album.id ? album : item))
        : storedAlbums.concat(album);

    saveStoredGuestAlbums(nextAlbums);
    renderAlbumsSection();
    void persistGuestPhotosUploads(appendedPhotos, imageFiles);
}

async function persistGuestPhotosUploads(nextItems, files) {
    const firebaseApi = await getFirebaseGuestAlbumApi();
    const profile = getStoredAccessProfile();
    const album = getOrCreateCurrentGuestAlbum();

    if (!firebaseApi || !profile || !album) {
        showToast("No se pudo guardar la subida en Firebase. Las fotografías siguen visibles en este dispositivo.", "error");
        return;
    }

    const paths = getGuestAlbumFirestorePath(album.id);
    const albumRef = firebaseApi.doc(firebaseApi.firestore, ...paths.albumDocPath);
    const successCount = { value: 0 };
    const failureCount = { value: 0 };

    setGuestUploadProgress({
        active: true,
        completed: 0,
        total: nextItems.length,
        label: "Subiendo fotografías",
        fileName: ""
    });
    renderAlbumsSection();

    try {
        await firebaseApi.setDoc(albumRef, buildGuestAlbumFirestoreRecord(album, profile), { merge: true });
    } catch (error) {
        console.error("[Recuerdos] No se pudo preparar el documento del álbum en Firebase.", error);
    }

    for (let index = 0; index < nextItems.length; index += 1) {
        const item = nextItems[index];
        const file = files[index];

        if (!file) {
            setGuestUploadProgress({
                completed: index + 1,
                total: nextItems.length,
                fileName: ""
            });
            renderAlbumsSection();
            continue;
        }

        setGuestUploadProgress({
            completed: index,
            total: nextItems.length,
            fileName: file.name
        });
        renderAlbumsSection();

        try {
            const compressed = await compressGuestImageFile(file);
            const storagePath = `events/${recuerdosEventId}/albums/${album.id}/photos/${item.id}.jpg`;
            const storageRef = firebaseApi.ref(firebaseApi.storage, storagePath);
            const uploadTask = firebaseApi.uploadBytesResumable(storageRef, compressed.blob, {
                contentType: compressed.mimeType || "image/jpeg"
            });

            const uploadSnapshot = await new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const totalBytes = snapshot.totalBytes || compressed.blob.size || 1;
                        const fileProgress = totalBytes > 0 ? snapshot.bytesTransferred / totalBytes : 0;
                        setGuestUploadProgress({
                            completed: index + fileProgress,
                            total: nextItems.length,
                            fileName: file.name
                        });
                        renderAlbumsSection();
                    },
                    (error) => reject(error),
                    () => resolve(uploadTask.snapshot)
                );
            });

            const downloadUrl = await firebaseApi.getDownloadURL(uploadSnapshot.ref);

            if (!album.photos || !album.photos.some((photo) => photo.id === item.id)) {
                await firebaseApi.deleteObject(storageRef);
                continue;
            }

            const record = buildGuestPhotoFirestoreRecord({
                ...item,
                src: downloadUrl,
                downloadUrl,
                storagePath,
                albumId: album.id,
                albumType: "guest",
                ownerUserId: profile.userId,
                createdBy: profile.type || profile.role || "guest",
                mimeType: compressed.mimeType,
                width: compressed.width,
                height: compressed.height
            }, profile, {
                albumId: album.id,
                ownerName: profile.displayName || profile.name,
                ownerUserId: profile.userId,
                createdBy: profile.type || profile.role || "guest",
                order: item.order
            });

            await firebaseApi.setDoc(firebaseApi.doc(firebaseApi.firestore, ...paths.photosCollectionPath, item.id), record, { merge: true });

            const normalizedItem = normalizeGuestMediaItem({
                ...record,
                id: item.id,
                src: record.downloadUrl,
                downloadUrl: record.downloadUrl,
                objectUrl: null
            }, "photo");

            const existingIndex = album.photos.findIndex((photo) => photo.id === item.id);

            if (existingIndex >= 0) {
                const currentItem = album.photos[existingIndex];
                if (currentItem && currentItem.objectUrl && currentItem.objectUrl !== normalizedItem.objectUrl) {
                    window.URL.revokeObjectURL(currentItem.objectUrl);
                }
                album.photos[existingIndex] = normalizedItem;
            } else {
                album.photos.push(normalizedItem);
            }

            Object.assign(album, updateGuestAlbumPreviewMetadata(album));
            const storedAlbums = getStoredGuestAlbums();
            const nextAlbums = storedAlbums.some((entry) => entry.id === album.id)
                ? storedAlbums.map((entry) => (entry.id === album.id ? album : entry))
                : storedAlbums.concat(album);
            saveStoredGuestAlbums(nextAlbums);
            successCount.value += 1;
        } catch (error) {
            failureCount.value += 1;
            const issue = classifyFirebaseStorageError(error);
            console.error(`[Recuerdos] No se pudo guardar una fotografía de Mi Álbum en Firebase. Motivo: ${issue.category}. ${issue.detail}`, error);
            showToast(`No se pudo subir una fotografía. ${issue.detail}`, "error");
        }

        setGuestUploadProgress({
            completed: index + 1,
            total: nextItems.length,
            fileName: file.name
        });
        renderAlbumsSection();
    }

    try {
        await firebaseApi.setDoc(albumRef, buildGuestAlbumFirestoreRecord(album, profile), { merge: true });
    } catch (error) {
        failureCount.value += 1;
        console.error("[Recuerdos] No se pudo actualizar el documento del álbum en Firebase.", error);
    }

    resetGuestUploadProgress();
    renderAlbumsSection();

    if (successCount.value > 0) {
        showToast(`${successCount.value} fotografía${successCount.value === 1 ? "" : "s"} guardada${successCount.value === 1 ? "" : "s"} en Firebase.`, "success");
    }

    if (failureCount.value > 0) {
        showToast("No se pudieron guardar algunas fotografías en Firebase. Se mantuvieron visibles en este dispositivo.", "error");
    }
}

function addGuestVideo(file) {
    if (!file || !file.type || !file.type.startsWith("video/")) {
        return;
    }

    const maxVideoSizeBytes = 50 * 1024 * 1024;

    if (file.size > maxVideoSizeBytes) {
        showToast("El video no puede superar los 50 MB.", "error");
        return;
    }

    const album = getOrCreateCurrentGuestAlbum();

    if (!album) {
        return;
    }

    if (album.video && (album.video.objectUrl || album.video.src)) {
        window.URL.revokeObjectURL(album.video.objectUrl || album.video.src);
    }

    album.video = {
        id: generateGuestId("guest-video"),
        kind: "video",
        name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Video",
        src: window.URL.createObjectURL(file),
        createdAt: new Date().toISOString(),
        fileName: file.name,
        mimeType: file.type,
        objectUrl: null
    };

    const storedAlbums = getStoredGuestAlbums();
    const nextAlbums = storedAlbums.some((item) => item.id === album.id)
        ? storedAlbums.map((item) => (item.id === album.id ? album : item))
        : storedAlbums.concat(album);

    saveStoredGuestAlbums(nextAlbums);
    renderAlbumsSection();
    showToast("Tu video quedó agregado al álbum.", "success");

    void persistGuestVideoUpload(album.video, file);
}

async function deleteGuestPhotoRemote(targetPhoto, album, profile) {
    const firebaseApi = await getFirebaseGuestAlbumApi();

    if (!firebaseApi) {
        showToast("No se pudo sincronizar la eliminación con Firebase. El cambio quedó en este dispositivo.", "error");
        return;
    }

    const paths = getGuestAlbumFirestorePath(album.id);

    try {
        if (targetPhoto.storagePath) {
            await firebaseApi.deleteObject(firebaseApi.ref(firebaseApi.storage, targetPhoto.storagePath));
        }

        await firebaseApi.deleteDoc(firebaseApi.doc(firebaseApi.firestore, ...paths.photosCollectionPath, targetPhoto.id));

        const updatedAlbum = updateGuestAlbumPreviewMetadata(album);
        Object.assign(album, updatedAlbum);
        const storedAlbums = getStoredGuestAlbums();
        const nextAlbums = storedAlbums.some((item) => item.id === album.id)
            ? storedAlbums.map((item) => (item.id === album.id ? album : item))
            : storedAlbums.concat(album);
        saveStoredGuestAlbums(nextAlbums);

        await firebaseApi.setDoc(firebaseApi.doc(firebaseApi.firestore, ...paths.albumDocPath), buildGuestAlbumFirestoreRecord(album, profile), { merge: true });
    } catch (error) {
        console.error("[Recuerdos] No se pudo eliminar una fotografï¿½a de Mi Álbum en Firebase.", error);
        showToast("No se pudo sincronizar la eliminación con Firebase. La galería se mantiene visible en este dispositivo.", "error");
    }
}

function removeGuestMedia(mediaId) {
      const album = getOrCreateCurrentGuestAlbum();
      const profile = getStoredAccessProfile();
      let targetPhoto = null;
      let targetVideo = null;

    if (!album || !mediaId) {
        return;
    }

    const isPhoto = Array.isArray(album.photos) && album.photos.some((photo) => photo.id === mediaId);
    const isVideo = album.video && album.video.id === mediaId;

    if (!isPhoto && !isVideo) {
        return;
    }

    if (isPhoto) {
        targetPhoto = album.photos.find((photo) => photo.id === mediaId) || null;
        if (targetPhoto && (targetPhoto.objectUrl || targetPhoto.src)) {
            window.URL.revokeObjectURL(targetPhoto.objectUrl || targetPhoto.src);
        }
        album.photos = album.photos.filter((photo) => photo.id !== mediaId);
    }

    if (isVideo && album.video) {
        targetVideo = album.video;
        if (targetVideo.objectUrl || targetVideo.src) {
            window.URL.revokeObjectURL(targetVideo.objectUrl || targetVideo.src);
        }
        album.video = null;
    }

    Object.assign(album, updateGuestAlbumPreviewMetadata(album));

    const storedAlbums = getStoredGuestAlbums();
    const nextAlbums = storedAlbums.some((item) => item.id === album.id)
        ? storedAlbums.map((item) => (item.id === album.id ? album : item))
        : storedAlbums.concat(album);

    saveStoredGuestAlbums(nextAlbums);
    renderAlbumsSection();

      if (isPhoto && targetPhoto) {
          void deleteGuestPhotoRemote(targetPhoto, album, profile);
      }

      if (isVideo && targetVideo) {
          void deleteGuestVideoRemote(targetVideo, album, profile);
      }
  }

function clearGuestViewerIfAlbumMatches(albumId) {
      if (!guestCenterState.viewer.open || !Array.isArray(guestCenterState.viewer.items)) {
          return;
      }

      const matchesAlbum = guestCenterState.viewer.items.some((item) => item && item.albumId === albumId);

      if (!matchesAlbum) {
          return;
      }

      guestCenterState.viewer = {
          open: false,
          items: [],
          index: 0,
          title: ""
      };

      document.removeEventListener("keydown", handleGuestViewerKeydown);
}

function removeGuestAlbum(albumId) {
      const storedAlbums = getStoredGuestAlbums();
      const targetAlbum = storedAlbums.find((album) => album.id === albumId);

      if (!targetAlbum) {
          return null;
      }

      (targetAlbum.photos || []).forEach((photo) => {
          if (photo && (photo.objectUrl || photo.src)) {
              window.URL.revokeObjectURL(photo.objectUrl || photo.src);
          }
      });

      if (targetAlbum.video && (targetAlbum.video.objectUrl || targetAlbum.video.src)) {
          window.URL.revokeObjectURL(targetAlbum.video.objectUrl || targetAlbum.video.src);
      }

      clearGuestViewerIfAlbumMatches(albumId);

      const nextAlbums = storedAlbums.filter((album) => album.id !== albumId);
      saveStoredGuestAlbums(nextAlbums);
      renderAlbumsSection();

      return targetAlbum;
}

async function deleteGuestAlbumRemote(targetAlbum, profile) {
      const firebaseApi = await getFirebaseGuestAlbumApi();

      if (!firebaseApi) {
          showToast("No se pudo sincronizar la eliminaciÃ³n con Firebase. El cambio quedÃ³ en este dispositivo.", "error");
          return;
      }

      if (!targetAlbum || !targetAlbum.id) {
          return;
      }

      try {
          const paths = getGuestAlbumFirestorePath(targetAlbum.id);
          const albumRef = firebaseApi.doc(firebaseApi.firestore, ...paths.albumDocPath);
          const photosCollectionRef = firebaseApi.collection(firebaseApi.firestore, ...paths.photosCollectionPath);
          const snapshot = await firebaseApi.getDocs(photosCollectionRef);

          if (!snapshot.empty) {
              for (const docSnapshot of snapshot.docs) {
                  const photoRecord = docSnapshot.data() || {};
                  const storagePath = photoRecord.storagePath || `events/${recuerdosEventId}/albums/${targetAlbum.id}/photos/${docSnapshot.id}.jpg`;

                  if (storagePath) {
                      try {
                          await firebaseApi.deleteObject(firebaseApi.ref(firebaseApi.storage, storagePath));
                      } catch (storageError) {
                          console.warn("[Recuerdos] No se pudo eliminar una fotografÃ­a de un Ã¡lbum de invitados en Storage.", storageError);
                      }
                  }

                  try {
                      await firebaseApi.deleteDoc(firebaseApi.doc(firebaseApi.firestore, ...paths.photosCollectionPath, docSnapshot.id));
                  } catch (docError) {
                      console.warn("[Recuerdos] No se pudo eliminar una fotografÃ­a de un Ã¡lbum de invitados en Firestore.", docError);
                  }
              }
          }

          if (targetAlbum.video && targetAlbum.video.storagePath) {
              try {
                  await firebaseApi.deleteObject(firebaseApi.ref(firebaseApi.storage, targetAlbum.video.storagePath));
              } catch (videoStorageError) {
                  console.warn("[Recuerdos] No se pudo eliminar el video de un Ã¡lbum de invitados en Storage.", videoStorageError);
              }
          }

          await firebaseApi.deleteDoc(albumRef);
      } catch (error) {
          console.error("[Recuerdos] No se pudo eliminar un Ã¡lbum de invitados en Firebase.", error);
          showToast("No se pudo sincronizar la eliminaciÃ³n con Firebase. El Ã¡lbum se mantuvo visible en este dispositivo.", "error");
      }
}

  function renderAdminCenterSection() {
      const catalog = getAdminFilteredAlbums(adminCenterState.searchQuery);
      const albumsPagination = getGuestPaginationWindow(catalog, adminCenterState.albumsPage, 10);
      adminCenterState.albumsPage = albumsPagination.currentPage;
    const albumSummary = catalog.length ? `${albumsPagination.currentPage} de ${albumsPagination.totalPages}` : "0 de 0";
    const albumAccentClasses = ["accent-rose", "accent-lavender", "accent-sand", "accent-plum"];

    return `
        <div class="guest-albums">
            <div class="guest-albums-header">
                <i class="fa-solid fa-folder-open guest-albums-heading-icon" aria-hidden="true"></i>
                <h3>Explorar álbumes</h3>
                <div class="guest-albums-toolbar">
                    <label class="guest-search-field" for="guest-album-search">
                        <span>Buscar por nombre</span>
                        <input id="guest-album-search" type="search" autocomplete="off" placeholder="Escribí un nombre para explorar" value="${escapeHTML(adminCenterState.searchQuery)}">
                    </label>

                    <div class="guest-albums-summary" id="guest-albums-summary">${escapeHTML(albumSummary)}</div>
                </div>
            </div>

              <div id="guest-albums-grid" class="guest-albums-grid" aria-live="polite">
                  ${albumsPagination.items.map((album, index) => {
                      const accentClass = album.accentClass || albumAccentClasses[index % albumAccentClasses.length];
                      return `
                          <div style="position: relative;">
                              <button class="guest-album-item ${escapeHTML(accentClass)}" type="button" data-guest-album-id="${escapeHTML(album.id)}">
                                  <span class="guest-album-initials" aria-hidden="true">
                                      <i class="fa-solid fa-folder-open" aria-hidden="true"></i>
                                  </span>
                                  <span class="guest-album-name">${escapeHTML(album.ownerName)}</span>
                              </button>
                              <button class="guest-personal-delete-btn" type="button" data-guest-action="delete-guest-album" data-guest-target-album-id="${escapeHTML(album.id)}" aria-label="Eliminar álbum de ${escapeHTML(album.ownerName)}">
                                  <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                              </button>
                          </div>
                      `;
                  }).join("")}
              </div>

            <div id="guest-albums-pagination" class="guest-pagination" ${albumsPagination.totalPages > 1 ? "" : "hidden"}>
                <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-prev" aria-label="Página anterior">Anterior</button>
                <span class="guest-pagination-label" data-guest-role="page-indicator">${albumsPagination.currentPage} de ${albumsPagination.totalPages}</span>
                <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-next" aria-label="Página siguiente">Siguiente</button>
            </div>
        </div>

        ${renderGuestViewer()}
    `;
}

  function bindAdminAlbumInteractions() {
      const searchInput = document.getElementById("guest-album-search");
      const grid = document.getElementById("guest-albums-grid");
      const albumsPagination = document.getElementById("guest-albums-pagination");
      const viewer = document.getElementById("guest-media-viewer");
      const profile = getStoredAccessProfile();
      const isAdmin = profile && profile.type === "admin";

      if (searchInput) {
          searchInput.oninput = (event) => {
              adminCenterState.searchQuery = event.target.value;
              adminCenterState.albumsPage = 1;
            renderAlbumsSection();
        };
    }

    if (albumsPagination) {
        const prevButton = albumsPagination.querySelector("[data-guest-action=\"albums-page-prev\"]");
        const nextButton = albumsPagination.querySelector("[data-guest-action=\"albums-page-next\"]");

        if (prevButton) {
            prevButton.onclick = () => {
                if (adminCenterState.albumsPage > 1) {
                    adminCenterState.albumsPage -= 1;
                    renderAlbumsSection();
                }
            };
        }

        if (nextButton) {
            nextButton.onclick = () => {
                const totalAlbums = getAdminFilteredAlbums(adminCenterState.searchQuery).length;
                const totalPages = Math.max(1, Math.ceil(totalAlbums / 10));

                if (adminCenterState.albumsPage < totalPages) {
                    adminCenterState.albumsPage += 1;
                    renderAlbumsSection();
                }
            };
        }
    }

      if (grid) {
          grid.querySelectorAll("[data-guest-album-id]").forEach((card) => {
              card.addEventListener("click", () => {
                  const albumId = card.dataset.guestAlbumId;
                  if (albumId) {
                      openGuestMediaFromAlbum(albumId, 0);
                  }
              });
          });

          grid.querySelectorAll('[data-guest-action="delete-guest-album"]').forEach((button) => {
              button.addEventListener("click", (event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  if (!isAdmin) {
                      showToast("No tenés permisos para eliminar este álbum.", "error");
                      return;
                  }

                  const albumId = button.dataset.guestTargetAlbumId;
                  if (!albumId) {
                      return;
                  }

                  const targetAlbum = getStoredGuestAlbums().find((album) => album.id === albumId) || null;
                  const albumName = targetAlbum ? targetAlbum.ownerName : "este álbum";

                  if (!window.confirm(`¿Querés eliminar el álbum de ${albumName}?`)) {
                      return;
                  }

                  const removedAlbum = removeGuestAlbum(albumId);
                  if (removedAlbum) {
                      void deleteGuestAlbumRemote(removedAlbum, profile);
                  }
              });
          });
      }

      if (viewer) {
          let touchStartX = 0;
          let touchStartY = 0;

        viewer.querySelectorAll("[data-guest-action]").forEach((button) => {
            button.addEventListener("click", () => {
                const action = button.dataset.guestAction;

                if (action === "close-viewer") {
                    closeGuestViewer();
                } else if (action === "previous") {
                    moveGuestViewer(-1);
                } else if (action === "next") {
                    moveGuestViewer(1);
                } else if (action === "select-viewer-item") {
                    const mediaIndex = Number(button.dataset.guestMediaIndex);
                    if (!Number.isNaN(mediaIndex)) {
                        guestCenterState.viewer.index = mediaIndex;
                        renderAlbumsSection();
                    }
                }
            });
        });

        viewer.addEventListener("touchstart", (event) => {
            const touch = event.touches[0];
            if (!touch) {
                return;
            }
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });

        viewer.addEventListener("touchend", (event) => {
            const touch = event.changedTouches[0];
            if (!touch) {
                return;
            }

            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;

            if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY)) {
                moveGuestViewer(deltaX < 0 ? 1 : -1);
            }
        }, { passive: true });
    }
}

function renderAlbumsSection() {
    const section = document.getElementById("albums-section");
    const activeElement = document.activeElement;
    const shouldRestoreSearchFocus = Boolean(activeElement && activeElement.id === "guest-album-search");
    const searchSelection = shouldRestoreSearchFocus
        ? {
            value: activeElement.value,
            start: activeElement.selectionStart,
            end: activeElement.selectionEnd,
            direction: activeElement.selectionDirection
        }
        : null;
    const previousScrollY = window.scrollY;

    if (!section) {
        return;
    }

    const profile = getStoredAccessProfile();
    const isGuest = profile && profile.type === "guest" && profile.name;

    section.className = "section bg-lavanda recuerdos-center-section";

    if (isGuest) {
        section.innerHTML = renderGuestCenterSection(profile);
        renderGuestPersonalAlbumPreview();
        bindGuestAlbumInteractions();

        if (shouldRestoreSearchFocus) {
            const nextSearchInput = document.getElementById("guest-album-search");

            if (nextSearchInput) {
                nextSearchInput.focus({ preventScroll: true });

                if (searchSelection) {
                    const selectionStart = typeof searchSelection.start === "number" ? searchSelection.start : searchSelection.value.length;
                    const selectionEnd = typeof searchSelection.end === "number" ? searchSelection.end : searchSelection.value.length;

                    try {
                        nextSearchInput.setSelectionRange(selectionStart, selectionEnd, searchSelection.direction || "none");
                    } catch (error) {
                        nextSearchInput.setSelectionRange(selectionStart, selectionEnd);
                    }
                }
            }

            window.scrollTo({ top: previousScrollY, left: 0, behavior: "auto" });
        }
        return;
    }

    section.innerHTML = renderAdminCenterSection();
    bindAdminAlbumInteractions();

    if (shouldRestoreSearchFocus) {
        const nextSearchInput = document.getElementById("guest-album-search");

        if (nextSearchInput) {
            nextSearchInput.focus({ preventScroll: true });

            if (searchSelection) {
                const selectionStart = typeof searchSelection.start === "number" ? searchSelection.start : searchSelection.value.length;
                const selectionEnd = typeof searchSelection.end === "number" ? searchSelection.end : searchSelection.value.length;

                try {
                    nextSearchInput.setSelectionRange(selectionStart, selectionEnd, searchSelection.direction || "none");
                } catch (error) {
                    nextSearchInput.setSelectionRange(selectionStart, selectionEnd);
                }
            }
        }

        window.scrollTo({ top: previousScrollY, left: 0, behavior: "auto" });
    }
}

function renderAlbumsSection() {
    const section = document.getElementById("albums-section");
    const activeElement = document.activeElement;
    const shouldRestoreSearchFocus = Boolean(activeElement && activeElement.id === "guest-album-search");
    const searchSelection = shouldRestoreSearchFocus
        ? {
            value: activeElement.value,
            start: activeElement.selectionStart,
            end: activeElement.selectionEnd,
            direction: activeElement.selectionDirection
        }
        : null;
    const previousScrollY = window.scrollY;

    if (!section) {
        return;
    }

    const profile = getStoredAccessProfile();
    const isGuest = profile && profile.type === "guest" && profile.name;

    if (isGuest && !guestCenterState.personalAlbumLoaded && !guestCenterState.personalAlbumLoading) {
        guestCenterState.personalAlbumLoading = true;
        resolvePersonalAlbumForSession(profile).then(() => {
            guestCenterState.personalAlbumLoading = false;
            renderAlbumsSection();
        });
        return;
    }

    if (!guestCenterState.firebaseLoaded && !guestCenterState.firebaseLoading) {
        void loadGuestAlbumsFromFirebase();
    }

    section.className = "section bg-lavanda recuerdos-center-section";

    if (isGuest) {
        section.innerHTML = renderGuestCenterSection(profile);
        renderGuestPersonalAlbumPreview();
        bindGuestAlbumInteractions();

        if (shouldRestoreSearchFocus) {
            const nextSearchInput = document.getElementById("guest-album-search");

            if (nextSearchInput) {
                nextSearchInput.focus({ preventScroll: true });

                if (searchSelection) {
                    const selectionStart = typeof searchSelection.start === "number" ? searchSelection.start : searchSelection.value.length;
                    const selectionEnd = typeof searchSelection.end === "number" ? searchSelection.end : searchSelection.value.length;

                    try {
                        nextSearchInput.setSelectionRange(selectionStart, selectionEnd, searchSelection.direction || "none");
                    } catch (error) {
                        nextSearchInput.setSelectionRange(selectionStart, selectionEnd);
                    }
                }
            }

            window.scrollTo({ top: previousScrollY, left: 0, behavior: "auto" });
        }
        return;
    }

    section.innerHTML = renderAdminCenterSection();
    bindAdminAlbumInteractions();
    return;
    
    section.innerHTML = `
        <i class="fa-solid fa-folder-open icon-evento" aria-hidden="true"></i>
        <h2>Centro de Recuerdos</h2>
        <p class="center-section-intro">Desde aquí podés administrar el contenido compartido por los invitados y revisar todos los álbumes.</p>

        <article class="center-my-album-card">
            <i class="fa-solid fa-folder-open center-my-album-icon" aria-hidden="true"></i>
            <h3 id="personal-album-title">Mi Álbum - ${escapeHTML(guestName)}</h3>
            <div class="center-my-album-actions" aria-label="Acciones del álbum personal">
                <button id="personal-upload-photos-btn" class="btn-rectangular" type="button">Subir fotografías</button>
                <button id="personal-upload-video-btn" class="btn-rectangular btn-secundario" type="button">Subir video</button>
            </div>
        </article>

        <div class="center-explore">
            <h3>Explorar Álbumes</h3>

            <div class="center-explore-tools">
                <label class="center-search-field" for="guest-album-search">
                    <span>Buscar por nombre</span>
                    <input id="guest-album-search" type="search" autocomplete="off" placeholder="Escribí un nombre">
                </label>

                <button class="btn-rectangular btn-secundario center-presentation-btn" type="button">Presentación</button>
            </div>

            <div id="guest-albums-grid" class="center-albums-grid" aria-live="polite"></div>

            <button class="btn-rectangular center-more-btn" type="button">Ver más álbumes</button>
        </div>
    `;

    const searchInput = document.getElementById("guest-album-search");
    const gridElement = document.getElementById("guest-albums-grid");

    const renderDirectory = (query) => {
        if (!gridElement) {
            return;
        }

        const normalizedQuery = query.trim().toLowerCase();
        const filteredAlbums = getGuestFilteredAlbums(normalizedQuery, profile);

        gridElement.innerHTML = filteredAlbums.map((ownerName) => `
            <article class="center-album-item">
                <i class="fa-solid fa-folder-open center-album-icon" aria-hidden="true"></i>
                <h4 class="center-album-name">${escapeHTML(ownerName)}</h4>
            </article>
        `).join("");
    };

    if (searchInput) {
        searchInput.oninput = (event) => renderDirectory(event.target.value);
        renderDirectory(searchInput.value);
    }
}

function initializeToastInteractions() {
    const guestPhotosButton = document.getElementById("guest-upload-photos-btn");
    const guestVideoButton = document.getElementById("guest-upload-video-btn");
    const adminPhotosButton = document.getElementById("personal-upload-photos-btn");
    const adminVideoButton = document.getElementById("personal-upload-video-btn");
    const presentationButton = document.getElementById("guest-presentation-btn");

    if (presentationButton) {
        presentationButton.addEventListener("click", openGuestPresentation);
    }

    if (guestPhotosButton) {
        guestPhotosButton.addEventListener("click", () => {
            const input = document.getElementById("guest-photos-input");
            if (input) {
                input.click();
            }
        });
    }

    if (guestVideoButton) {
        guestVideoButton.addEventListener("click", () => {
            const input = document.getElementById("guest-video-input");
            if (input) {
                input.click();
            }
        });
    }

    if (adminPhotosButton) {
        adminPhotosButton.addEventListener("click", () => {
            simulatePersonalUpload("Fotos");
        });
    }

    if (adminVideoButton) {
        adminVideoButton.addEventListener("click", () => {
            simulatePersonalUpload("Video");
        });
    }
}

function renderGuestPersonalAlbumPreview() {
    const titleElement = document.getElementById("personal-album-title");
    const descriptionElement = document.getElementById("personal-album-description");
    const listElement = document.getElementById("guest-personal-media-list");
    const emptyStateElement = document.getElementById("guest-personal-empty-state");
    const loadMoreButton = document.getElementById("guest-personal-load-more-btn");
    const profile = getStoredAccessProfile();
    const album = getOrCreateCurrentGuestAlbum();

    if (!titleElement || !descriptionElement || !listElement || !emptyStateElement) {
        return;
    }

    const isGuest = profile && profile.type === "guest" && profile.name;
    const photoCount = album ? (album.photos || []).length : 0;
    const hasVideo = Boolean(album && album.video);
    const hasContent = Boolean(photoCount || hasVideo);

    titleElement.textContent = isGuest ? `Mi Álbum - ${profile.name}` : "Mi Álbum";
    descriptionElement.textContent = hasContent
        ? "Tus recuerdos ya están guardados en este álbum."
        : "Sumá fotografías y un video para armar tu álbum personal.";
    descriptionElement.hidden = !hasContent;

    const items = [
        ...(album && album.photos ? album.photos.map((photo, index) => ({
            ...normalizeGuestMediaItem(photo, "photo"),
            displayName: photo.name || `Foto ${index + 1}`
        })) : []),
        ...(album && album.video ? [{
            ...normalizeGuestMediaItem(album.video, "video"),
            displayName: album.video.name || "Video"
        }] : [])
    ];

    const pagination = getGuestPaginationWindow(items, guestCenterState.personalPage, 10);
    guestCenterState.personalPage = pagination.currentPage;
    const visibleItems = pagination.items;
    const showPagination = hasContent && pagination.totalItems > 10;

    listElement.innerHTML = hasContent ? visibleItems.map((item, index) => `
        <article class="guest-personal-media-item ${item.kind === "video" ? "is-video" : "is-photo"}">
            <button class="guest-personal-media-visual" type="button" data-guest-action="open-personal-media" data-guest-media-index="${pagination.startIndex + index}" aria-label="Abrir contenido">
                ${item.kind === "video" ? `
                    <video class="guest-personal-media-thumb" src="${escapeHTML(item.src)}" muted playsinline preload="metadata" aria-hidden="true"></video>
                    <span class="guest-personal-media-play" aria-hidden="true"><i class="fa-solid fa-play"></i></span>
                ` : `
                    <img class="guest-personal-media-thumb" src="${escapeHTML(item.src)}" alt="">
                `}
            </button>
            <button class="guest-personal-delete-btn" type="button" data-guest-action="delete-personal-media" data-guest-media-id="${escapeHTML(item.id)}" aria-label="Eliminar contenido">
                <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
            </button>
        </article>
    `).join("") : "";

    emptyStateElement.hidden = hasContent;
    listElement.hidden = !hasContent;

    const paginationElement = document.getElementById("guest-personal-pagination");
    if (paginationElement) {
        paginationElement.hidden = !showPagination;

        const pageIndicator = paginationElement.querySelector("[data-guest-role=\"page-indicator\"]");
        const prevButton = paginationElement.querySelector("[data-guest-action=\"personal-page-prev\"]");
        const nextButton = paginationElement.querySelector("[data-guest-action=\"personal-page-next\"]");

        if (pageIndicator) {
            pageIndicator.textContent = `${pagination.currentPage} de ${pagination.totalPages}`;
        }

        if (prevButton) {
            prevButton.disabled = pagination.currentPage <= 1;
        }

        if (nextButton) {
            nextButton.disabled = pagination.currentPage >= pagination.totalPages;
        }
    }
}

function openGuestPresentation() {
    const profile = getStoredAccessProfile();
    const catalog = getGuestPublicAlbums(profile);
    const items = catalog.flatMap((album) => getGuestAlbumMediaItems(album));

    if (!items.length) {
        return;
    }

    openGuestViewer(items, 0, "Presentación");
}

function bindGuestAlbumInteractions() {
    const photosButton = document.getElementById("guest-upload-photos-btn");
    const videoButton = document.getElementById("guest-upload-video-btn");
    const photosInput = document.getElementById("guest-photos-input");
    const videoInput = document.getElementById("guest-video-input");
    const searchInput = document.getElementById("guest-album-search");
    const loadMoreButton = document.getElementById("guest-load-more-btn");
    const presentationButton = document.getElementById("guest-presentation-btn");
    const grid = document.getElementById("guest-albums-grid");
    const personalList = document.getElementById("guest-personal-media-list");
    const viewer = document.getElementById("guest-media-viewer");

    if (photosButton && photosInput) {
        photosButton.onclick = () => photosInput.click();
    }

    if (videoButton && videoInput) {
        videoButton.onclick = () => videoInput.click();
    }

    if (photosInput) {
        photosInput.onchange = (event) => {
            addGuestPhotos(event.target.files);
            event.target.value = "";
        };
    }

    if (videoInput) {
        videoInput.onchange = (event) => {
            const file = event.target.files && event.target.files[0];
            addGuestVideo(file);
            event.target.value = "";
        };
    }

    if (searchInput) {
        searchInput.oninput = (event) => {
            guestCenterState.searchQuery = event.target.value;
            guestCenterState.visibleCount = 5;
            renderAlbumsSection();
        };
    }

    if (loadMoreButton) {
        loadMoreButton.onclick = () => {
            const profile = getStoredAccessProfile();
            const totalAlbums = getGuestFilteredAlbums(guestCenterState.searchQuery, profile).length;

            if (totalAlbums > 5 && guestCenterState.visibleCount >= totalAlbums) {
                guestCenterState.visibleCount = 5;
            } else {
                guestCenterState.visibleCount += 5;
            }

            renderAlbumsSection();
        };
    }

    if (personalLoadMoreButton) {
        personalLoadMoreButton.onclick = () => {
            const album = getOrCreateCurrentGuestAlbum();
            const totalItems = getGuestAlbumMediaItems(album).length;

            if (totalItems > 8 && guestCenterState.personalVisibleCount >= totalItems) {
                guestCenterState.personalVisibleCount = 8;
            } else {
                guestCenterState.personalVisibleCount += 8;
            }

            renderAlbumsSection();
        };
    }

    if (presentationButton) {
        presentationButton.onclick = openGuestPresentation;
    }

    if (grid) {
        grid.querySelectorAll("[data-guest-album-id]").forEach((card) => {
            card.addEventListener("click", () => {
                const albumId = card.dataset.guestAlbumId;
                if (albumId) {
                    openGuestMediaFromAlbum(albumId, 0);
                }
            });
        });
    }

    if (personalList) {
        personalList.querySelectorAll("[data-guest-action=\"open-personal-media\"]").forEach((button) => {
            button.addEventListener("click", () => {
                const mediaIndex = Number(button.dataset.guestMediaIndex);
                const album = getOrCreateCurrentGuestAlbum();
                const mediaItems = getGuestAlbumMediaItems(album);
                if (!Number.isNaN(mediaIndex) && mediaItems[mediaIndex]) {
                    openGuestViewer(mediaItems, mediaIndex, "Mi Álbum");
                }
            });
        });

        personalList.querySelectorAll("[data-guest-action=\"delete-personal-media\"]").forEach((button) => {
            button.addEventListener("click", () => {
                const mediaId = button.dataset.guestMediaId;
                if (mediaId) {
                    removeGuestMedia(mediaId);
                }
            });
        });
    }

    if (viewer) {
        let touchStartX = 0;
        let touchStartY = 0;

        viewer.querySelectorAll("[data-guest-action]").forEach((button) => {
            button.addEventListener("click", () => {
                const action = button.dataset.guestAction;

                if (action === "close-viewer") {
                    closeGuestViewer();
                } else if (action === "previous") {
                    moveGuestViewer(-1);
                } else if (action === "next") {
                    moveGuestViewer(1);
                } else if (action === "select-viewer-item") {
                    const mediaIndex = Number(button.dataset.guestMediaIndex);
                    if (!Number.isNaN(mediaIndex)) {
                        guestCenterState.viewer.index = mediaIndex;
                        renderAlbumsSection();
                    }
                }
            });
        });

        viewer.addEventListener("touchstart", (event) => {
            const touch = event.touches[0];
            if (!touch) {
                return;
            }
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });

        viewer.addEventListener("touchend", (event) => {
            const touch = event.changedTouches[0];
            if (!touch) {
                return;
            }

            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;

            if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY)) {
                moveGuestViewer(deltaX < 0 ? 1 : -1);
            }
        }, { passive: true });
    }
}

function renderGuestCenterSection(profile) {
    const currentAlbum = getOrCreateCurrentGuestAlbum();
    const hasContent = Boolean(currentAlbum && ((currentAlbum.photos || []).length > 0 || currentAlbum.video));
    const albumTitle = profile && profile.type === "guest" && profile.name ? `Mi Álbum - ${profile.name}` : "Mi Álbum";
    const albumDescription = hasContent
        ? "Tus recuerdos ya están guardados en este álbum."
        : "Sumá fotografías y un video para armar tu álbum personal.";
    const personalItems = currentAlbum ? getGuestAlbumMediaItems(currentAlbum) : [];
    const showPersonalLoadMore = hasContent && personalItems.length > 8;
    const personalLoadMoreLabel = guestCenterState.personalVisibleCount >= personalItems.length ? "Ver menos" : "Ver más";
    const catalog = getGuestFilteredAlbums(guestCenterState.searchQuery, profile);
    const visibleCatalog = catalog.slice(0, guestCenterState.visibleCount);
    const shouldShowLoadMore = catalog.length > 5 && visibleCatalog.length > 0;
    const loadMoreLabel = guestCenterState.visibleCount >= catalog.length ? "Ver menos" : "Ver más";
    const albumSummary = catalog.length ? `${visibleCatalog.length} de ${catalog.length}` : "0 de 0";
    const albumAccentClasses = ["accent-rose", "accent-lavender", "accent-sand", "accent-plum"];

    return `
        <div class="recuerdos-section-copy">
            <p class="recuerdos-section-kicker">Álbumes</p>
            <h2>Centro de Recuerdos</h2>
            <p>Tu álbum personal convive con otros álbumes guardados en este dispositivo.</p>
        </div>

        <div class="albums-layout">
            <article class="center-my-album-card guest-my-album-card">
                <i class="fa-solid fa-folder-open center-my-album-icon" aria-hidden="true"></i>
                <h3 id="personal-album-title">${escapeHTML(albumTitle)}</h3>
                <p id="personal-album-description" class="personal-album-description">${escapeHTML(albumDescription)}</p>

                <div class="center-my-album-actions" aria-label="Acciones del álbum personal">
                    <button id="guest-upload-photos-btn" class="btn-rectangular" type="button">Subir fotografías</button>
                    <button id="guest-upload-video-btn" class="btn-rectangular btn-secundario" type="button">Subir video</button>
                </div>

                <input id="guest-photos-input" type="file" accept="image/*" multiple hidden>
                <input id="guest-video-input" type="file" accept="video/*" hidden>

                <div class="guest-personal-album-media">
                    <div id="guest-personal-empty-state" class="album-empty-state" ${hasContent ? "hidden" : ""}>
                        <i class="fa-solid fa-photo-film album-empty-icon" aria-hidden="true"></i>
                        <h3>Tu álbum está esperando recuerdos</h3>
                        <p>Sumá fotografías y un video para verlo completo.</p>
                    </div>

                    <div id="guest-personal-media-list" class="guest-personal-media-list" aria-live="polite"></div>
                    <button id="guest-personal-load-more-btn" class="btn-rectangular center-more-btn" type="button"${showPersonalLoadMore ? "" : " hidden"}>${personalLoadMoreLabel}</button>
                </div>
            </article>

            <aside class="guest-albums">
                <div class="guest-albums-header">
                    <div class="guest-albums-heading">
                        <i class="fa-solid fa-folder-open guest-albums-heading-icon" aria-hidden="true"></i>
                        <h3>Explorar álbumes</h3>
                    </div>
                    <div class="guest-albums-toolbar">
                        <label class="guest-search-field" for="guest-album-search">
                            <span>Buscar por nombre</span>
                            <input id="guest-album-search" type="search" autocomplete="off" placeholder="Escribí un nombre para explorar" value="${escapeHTML(guestCenterState.searchQuery)}">
                        </label>

                        <div class="guest-albums-summary" id="guest-albums-summary">${escapeHTML(albumSummary)}</div>
                    </div>
                </div>

                <div id="guest-albums-grid" class="guest-albums-grid" aria-live="polite">
                    ${visibleCatalog.map((album, index) => {
                        const accentClass = album.accentClass || albumAccentClasses[index % albumAccentClasses.length];
                        return `
                            <button class="guest-album-item ${escapeHTML(accentClass)}" type="button" data-guest-album-id="${escapeHTML(album.id)}">
                                <span class="guest-album-initials" aria-hidden="true">
                                    <i class="fa-solid fa-folder-open" aria-hidden="true"></i>
                                </span>
                                <span class="guest-album-name">${escapeHTML(album.ownerName)}</span>
                            </button>
                        `;
                    }).join("")}
                </div>

                <button id="guest-load-more-btn" class="btn-rectangular center-more-btn" type="button"${shouldShowLoadMore ? "" : " hidden"}>${loadMoreLabel}</button>
            </aside>
        </div>

        ${renderGuestViewer()}
    `;
}

renderRecuerdosAppShell();
renderAccessModalShell();
initializeAccessFlow();
initializeToastInteractions();
renderAll();

function renderGuestPersonalAlbumPreview() {
    const titleElement = document.getElementById("personal-album-title");
    const descriptionElement = document.getElementById("personal-album-description");
    const listElement = document.getElementById("guest-personal-media-list");
    const emptyStateElement = document.getElementById("guest-personal-empty-state");
    const profile = getStoredAccessProfile();
    const album = getOrCreateCurrentGuestAlbum();

    if (!titleElement || !descriptionElement || !listElement || !emptyStateElement) {
        return;
    }

    const isGuest = profile && profile.type === "guest" && profile.name;
    const photoCount = album ? (album.photos || []).length : 0;
    const hasVideo = Boolean(album && album.video);
    const hasContent = Boolean(photoCount || hasVideo);

    titleElement.textContent = isGuest ? `Mi Álbum - ${profile.name}` : "Mi Álbum";
    descriptionElement.textContent = hasContent
        ? "Tus recuerdos ya están guardados en este álbum."
        : "Sumá fotografías y un video para armar tu álbum personal.";
    descriptionElement.hidden = !hasContent;

    const items = [
        ...(album && album.photos ? album.photos.map((photo, index) => ({
            ...normalizeGuestMediaItem(photo, "photo"),
            displayName: photo.name || `Foto ${index + 1}`
        })) : []),
        ...(album && album.video ? [{
            ...normalizeGuestMediaItem(album.video, "video"),
            displayName: album.video.name || "Video"
        }] : [])
    ];

    const pagination = getGuestPaginationWindow(items, guestCenterState.personalPage, 10);
    guestCenterState.personalPage = pagination.currentPage;
    const visibleItems = pagination.items;
    const showPagination = hasContent && pagination.totalItems > 10;

    listElement.innerHTML = hasContent ? visibleItems.map((item, index) => `
        <article class="guest-personal-media-item ${item.kind === "video" ? "is-video" : "is-photo"}">
            <button class="guest-personal-media-visual" type="button" data-guest-action="open-personal-media" data-guest-media-index="${pagination.startIndex + index}" aria-label="Abrir contenido">
                ${item.kind === "video" ? `
                    <video class="guest-personal-media-thumb" src="${escapeHTML(item.src)}" muted playsinline preload="metadata" aria-hidden="true"></video>
                    <span class="guest-personal-media-play" aria-hidden="true"><i class="fa-solid fa-play"></i></span>
                ` : `
                    <img class="guest-personal-media-thumb" src="${escapeHTML(item.src)}" alt="">
                `}
            </button>
            <button class="guest-personal-delete-btn" type="button" data-guest-action="delete-personal-media" data-guest-media-id="${escapeHTML(item.id)}" aria-label="Eliminar contenido">
                <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
            </button>
        </article>
    `).join("") : "";

    emptyStateElement.hidden = hasContent;
    listElement.hidden = !hasContent;

    const paginationElement = document.getElementById("guest-personal-pagination");
    if (paginationElement) {
        paginationElement.hidden = !showPagination;

        const pageIndicator = paginationElement.querySelector("[data-guest-role=\"page-indicator\"]");
        const prevButton = paginationElement.querySelector("[data-guest-action=\"personal-page-prev\"]");
        const nextButton = paginationElement.querySelector("[data-guest-action=\"personal-page-next\"]");

        if (pageIndicator) {
            pageIndicator.textContent = `${pagination.currentPage} de ${pagination.totalPages}`;
        }

        if (prevButton) {
            prevButton.disabled = pagination.currentPage <= 1;
        }

        if (nextButton) {
            nextButton.disabled = pagination.currentPage >= pagination.totalPages;
        }
    }
}

async function openGuestPresentation() {
    const profile = getStoredAccessProfile();
    const currentAlbum = getOrCreateCurrentGuestAlbum();
    const catalog = [currentAlbum, ...getGuestPublicAlbums(profile)].filter(Boolean);

    const promises = catalog.map((album) => loadGuestAlbumPhotosIfNeeded(album.id));
    await Promise.all(promises);

    const items = catalog.flatMap((album) => getGuestAlbumMediaItems(album));

    if (!items.length) {
        return;
    }

    openGuestViewer(items, 0, "Presentación");
}

function bindGuestAlbumInteractions() {
    const photosButton = document.getElementById("guest-upload-photos-btn");
    const videoButton = document.getElementById("guest-upload-video-btn");
    const photosInput = document.getElementById("guest-photos-input");
    const videoInput = document.getElementById("guest-video-input");
    const searchInput = document.getElementById("guest-album-search");
    const tooltipButtons = document.querySelectorAll("[data-guest-action=\"toggle-upload-info\"]");
    const presentationButton = document.getElementById("guest-presentation-btn");
    const grid = document.getElementById("guest-albums-grid");
    const personalList = document.getElementById("guest-personal-media-list");
    const viewer = document.getElementById("guest-media-viewer");
    const albumsPagination = document.getElementById("guest-albums-pagination");
    const personalPagination = document.getElementById("guest-personal-pagination");

    if (photosButton && photosInput) {
        photosButton.onclick = () => photosInput.click();
    }

    if (videoButton && videoInput) {
        videoButton.onclick = () => videoInput.click();
    }

    if (photosInput) {
        photosInput.onchange = (event) => {
            addGuestPhotos(event.target.files);
            event.target.value = "";
        };
    }

    if (videoInput) {
        videoInput.onchange = (event) => {
            const file = event.target.files && event.target.files[0];
            addGuestVideo(file);
            event.target.value = "";
        };
    }

    if (tooltipButtons.length) {
        tooltipButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();

                const host = button.closest(".guest-upload-action");

                tooltipButtons.forEach((otherButton) => {
                    const otherHost = otherButton.closest(".guest-upload-action");
                    if (otherHost && otherHost !== host) {
                        otherHost.classList.remove("is-tooltip-open");
                        otherButton.setAttribute("aria-expanded", "false");
                    }
                });

                if (host) {
                    const isOpen = host.classList.toggle("is-tooltip-open");
                    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
                }
            });
        });
    }

    if (searchInput) {
        searchInput.oninput = (event) => {
            guestCenterState.searchQuery = event.target.value;
            guestCenterState.albumsPage = 1;
            renderAlbumsSection();
        };
    }

    if (albumsPagination) {
        const prevButton = albumsPagination.querySelector("[data-guest-action=\"albums-page-prev\"]");
        const nextButton = albumsPagination.querySelector("[data-guest-action=\"albums-page-next\"]");

        if (prevButton) {
            prevButton.onclick = () => {
                if (guestCenterState.albumsPage > 1) {
                    guestCenterState.albumsPage -= 1;
                    renderAlbumsSection();
                }
            };
        }

        if (nextButton) {
            nextButton.onclick = () => {
                const totalAlbums = getGuestFilteredAlbums(guestCenterState.searchQuery, getStoredAccessProfile()).length;
                const totalPages = Math.max(1, Math.ceil(totalAlbums / 10));

                if (guestCenterState.albumsPage < totalPages) {
                    guestCenterState.albumsPage += 1;
                    renderAlbumsSection();
                }
            };
        }
    }

    if (personalPagination) {
        const prevButton = personalPagination.querySelector("[data-guest-action=\"personal-page-prev\"]");
        const nextButton = personalPagination.querySelector("[data-guest-action=\"personal-page-next\"]");

        if (prevButton) {
            prevButton.onclick = () => {
                if (guestCenterState.personalPage > 1) {
                    guestCenterState.personalPage -= 1;
                    renderAlbumsSection();
                }
            };
        }

        if (nextButton) {
            nextButton.onclick = () => {
                const album = getOrCreateCurrentGuestAlbum();
                const totalItems = getGuestAlbumMediaItems(album).length;
                const totalPages = Math.max(1, Math.ceil(totalItems / 10));

                if (guestCenterState.personalPage < totalPages) {
                    guestCenterState.personalPage += 1;
                    renderAlbumsSection();
                }
            };
        }
    }

    if (presentationButton) {
        presentationButton.onclick = openGuestPresentation;
    }

    if (grid) {
        grid.querySelectorAll("[data-guest-album-id]").forEach((card) => {
            card.addEventListener("click", () => {
                const albumId = card.dataset.guestAlbumId;
                if (albumId) {
                    openGuestMediaFromAlbum(albumId, 0);
                }
            });
        });
    }

    if (personalList) {
        personalList.querySelectorAll("[data-guest-action=\"open-personal-media\"]").forEach((button) => {
            button.addEventListener("click", () => {
                const mediaIndex = Number(button.dataset.guestMediaIndex);
                const album = getOrCreateCurrentGuestAlbum();
                const mediaItems = getGuestAlbumMediaItems(album);
                if (!Number.isNaN(mediaIndex) && mediaItems[mediaIndex]) {
                    openGuestViewer(mediaItems, mediaIndex, "Mi Álbum");
                }
            });
        });

        personalList.querySelectorAll("[data-guest-action=\"delete-personal-media\"]").forEach((button) => {
            button.addEventListener("click", () => {
                const mediaId = button.dataset.guestMediaId;
                if (mediaId) {
                    removeGuestMedia(mediaId);
                }
            });
        });
    }

    if (viewer) {
        let touchStartX = 0;
        let touchStartY = 0;

        viewer.querySelectorAll("[data-guest-action]").forEach((button) => {
            button.addEventListener("click", () => {
                const action = button.dataset.guestAction;

                if (action === "close-viewer") {
                    closeGuestViewer();
                } else if (action === "previous") {
                    moveGuestViewer(-1);
                } else if (action === "next") {
                    moveGuestViewer(1);
                } else if (action === "select-viewer-item") {
                    const mediaIndex = Number(button.dataset.guestMediaIndex);
                    if (!Number.isNaN(mediaIndex)) {
                        guestCenterState.viewer.index = mediaIndex;
                        renderAlbumsSection();
                    }
                }
            });
        });

        viewer.addEventListener("touchstart", (event) => {
            const touch = event.touches[0];
            if (!touch) {
                return;
            }
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });

        viewer.addEventListener("touchend", (event) => {
            const touch = event.changedTouches[0];
            if (!touch) {
                return;
            }

            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;

            if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY)) {
                moveGuestViewer(deltaX < 0 ? 1 : -1);
            }
        }, { passive: true });
    }
}

function renderGuestCenterSection(profile) {
    const currentAlbum = getOrCreateCurrentGuestAlbum();
    const hasContent = Boolean(currentAlbum && ((currentAlbum.photos || []).length > 0 || currentAlbum.video));
    const albumTitle = profile && profile.type === "guest" && profile.name ? `Mi Álbum - ${profile.name}` : "Mi Álbum";
    const albumDescription = hasContent
        ? "Tus recuerdos ya están guardados en este álbum."
        : "Sumá fotografías y un video para armar tu álbum personal.";
    const personalItems = currentAlbum ? getGuestAlbumMediaItems(currentAlbum) : [];
    const personalPagination = getGuestPaginationWindow(personalItems, guestCenterState.personalPage, 10);
    guestCenterState.personalPage = personalPagination.currentPage;
    const showPersonalPagination = hasContent && personalPagination.totalItems > 10;
    const catalog = getGuestFilteredAlbums(guestCenterState.searchQuery, profile);
    const albumsPagination = getGuestPaginationWindow(catalog, guestCenterState.albumsPage, 10);
    guestCenterState.albumsPage = albumsPagination.currentPage;
    const albumSummary = catalog.length ? `${albumsPagination.currentPage} de ${albumsPagination.totalPages}` : "0 de 0";
    const albumAccentClasses = ["accent-rose", "accent-lavender", "accent-sand", "accent-plum"];

    return `
        <div class="recuerdos-section-copy">
            <p class="recuerdos-section-kicker">Álbumes</p>
            <h2>Centro de Recuerdos</h2>
            <p>Tu álbum personal convive con otros álbumes guardados en este dispositivo.</p>
        </div>

        <div class="albums-layout">
            <article class="center-my-album-card guest-my-album-card">
                <i class="fa-solid fa-folder-open center-my-album-icon" aria-hidden="true"></i>
                <h3 id="personal-album-title">${escapeHTML(albumTitle)}</h3>
                <p id="personal-album-description" class="personal-album-description">${escapeHTML(albumDescription)}</p>

                <div class="center-my-album-actions guest-upload-actions" aria-label="Acciones del álbum personal">
                    <div class="guest-upload-action">
                        <button id="guest-upload-photos-btn" class="btn-rectangular" type="button">Subir fotografías</button>
                        <button class="guest-upload-info-btn" type="button" data-guest-action="toggle-upload-info" data-guest-info="photos" aria-label="Información sobre fotografías" aria-expanded="false">
                            <span aria-hidden="true">ⓘ</span>
                        </button>
                        <span class="guest-upload-tooltip" role="tooltip">Podés seleccionar hasta 20 fotografías por carga.</span>
                    </div>
                    <div class="guest-upload-action">
                        <button id="guest-upload-video-btn" class="btn-rectangular btn-secundario" type="button">Subir video</button>
                        <button class="guest-upload-info-btn" type="button" data-guest-action="toggle-upload-info" data-guest-info="video" aria-label="Información sobre video" aria-expanded="false">
                            <span aria-hidden="true">ⓘ</span>
                        </button>
                        <span class="guest-upload-tooltip" role="tooltip">Podï¿½s subir un video por vez. Tamaño mï¿½ximo: 100 MB.</span>
                    </div>
                </div>

                <input id="guest-photos-input" type="file" accept="image/*" multiple hidden>
                <input id="guest-video-input" type="file" accept="video/*" hidden>

                <div class="guest-personal-album-media">
                    <div id="guest-personal-empty-state" class="album-empty-state guest-empty-album-card" ${hasContent ? "hidden" : ""}>
                        <i class="fa-solid fa-photo-film guest-empty-album-icon" aria-hidden="true"></i>
                        <h3>Tu álbum está esperando recuerdos</h3>
                        <p>Sumá fotografías para empezar a guardar recuerdos en este álbum.</p>
                    </div>

                    <div id="guest-personal-media-list" class="guest-personal-media-list" aria-live="polite"></div>
                    <div id="guest-personal-pagination" class="guest-pagination" ${showPersonalPagination ? "" : "hidden"}>
                        <button class="guest-pagination-btn" type="button" data-guest-action="personal-page-prev" aria-label="Página anterior">Anterior</button>
                        <span class="guest-pagination-label" data-guest-role="page-indicator">${personalPagination.currentPage} de ${personalPagination.totalPages}</span>
                        <button class="guest-pagination-btn" type="button" data-guest-action="personal-page-next" aria-label="Página siguiente">Siguiente</button>
                    </div>
                </div>
            </article>

            <aside class="guest-albums">
                <div class="guest-albums-header">
                    <i class="fa-solid fa-folder-open guest-albums-heading-icon" aria-hidden="true"></i>
                    <h3>Explorar álbumes</h3>
                    <div class="guest-albums-toolbar">
                        <label class="guest-search-field" for="guest-album-search">
                            <span>Buscar por nombre</span>
                            <input id="guest-album-search" type="search" autocomplete="off" placeholder="Escribí un nombre para explorar" value="${escapeHTML(guestCenterState.searchQuery)}">
                        </label>

                        <div class="guest-albums-summary" id="guest-albums-summary">${escapeHTML(albumSummary)}</div>
                    </div>
                </div>

                <div id="guest-albums-grid" class="guest-albums-grid" aria-live="polite">
                    ${albumsPagination.items.map((album, index) => {
                        const accentClass = album.accentClass || albumAccentClasses[index % albumAccentClasses.length];
                        return `
                            <button class="guest-album-item ${escapeHTML(accentClass)}" type="button" data-guest-album-id="${escapeHTML(album.id)}">
                                <span class="guest-album-initials" aria-hidden="true">
                                    <i class="fa-solid fa-folder-open" aria-hidden="true"></i>
                                </span>
                                <span class="guest-album-name">${escapeHTML(album.ownerName)}</span>
                            </button>
                        `;
                    }).join("")}
                </div>

                <div id="guest-albums-pagination" class="guest-pagination" ${albumsPagination.totalPages > 1 ? "" : "hidden"}>
                    <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-prev" aria-label="Página anterior">Anterior</button>
                    <span class="guest-pagination-label" data-guest-role="page-indicator">${albumsPagination.currentPage} de ${albumsPagination.totalPages}</span>
                    <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-next" aria-label="Página siguiente">Siguiente</button>
                </div>
            </aside>
        </div>

        ${renderGuestViewer()}
    `;
}

function renderGuestCenterSection(profile) {
    const currentAlbum = getOrCreateCurrentGuestAlbum();
    const hasContent = Boolean(currentAlbum && ((currentAlbum.photos || []).length > 0 || currentAlbum.video));
    const personalPhotoCount = Array.isArray(currentAlbum && currentAlbum.photos) ? currentAlbum.photos.length : 0;
    const albumTitle = profile && profile.type === "guest" && profile.name ? `Mi Álbum - ${profile.name}` : "Mi Álbum";
    const albumDescription = hasContent
        ? "Tus recuerdos ya están guardados en este álbum."
        : "Sumá fotografías y un video para armar tu álbum personal.";
    const personalItems = currentAlbum ? getGuestAlbumMediaItems(currentAlbum) : [];
    const personalPagination = getGuestPaginationWindow(personalItems, guestCenterState.personalPage, 10);
    guestCenterState.personalPage = personalPagination.currentPage;
    const showPersonalPagination = hasContent && personalPagination.totalItems > 10;
    const uploadProgress = guestCenterState.uploadProgress || {
        active: false,
        completed: 0,
        total: 0,
        label: "",
        fileName: ""
    };
    const showUploadProgress = Boolean(uploadProgress.active);
    const uploadPercent = uploadProgress.active && uploadProgress.total > 0
        ? Math.min(100, Math.max(0, Math.round((uploadProgress.completed / uploadProgress.total) * 100)))
        : 0;
    const hasReachedPhotoLimit = personalPhotoCount >= 50;
    const catalog = getGuestFilteredAlbums(guestCenterState.searchQuery, profile);
    const albumsPagination = getGuestPaginationWindow(catalog, guestCenterState.albumsPage, 10);
    guestCenterState.albumsPage = albumsPagination.currentPage;
    const albumSummary = catalog.length ? `${albumsPagination.currentPage} de ${albumsPagination.totalPages}` : "0 de 0";
    const albumAccentClasses = ["accent-rose", "accent-lavender", "accent-sand", "accent-plum"];

    return `
        <div class="recuerdos-section-copy">
            <p class="recuerdos-section-kicker">Álbumes</p>
            <h2>Centro de Recuerdos</h2>
            <p>Tu álbum personal convive con otros álbumes guardados en este dispositivo.</p>
        </div>

        <div class="albums-layout">
            <article class="center-my-album-card guest-my-album-card">
                <i class="fa-solid fa-folder-open center-my-album-icon" aria-hidden="true"></i>
                <h3 id="personal-album-title">${escapeHTML(albumTitle)}</h3>
                <p id="personal-album-description" class="personal-album-description">${escapeHTML(albumDescription)}</p>

                <div class="center-my-album-actions guest-upload-actions" aria-label="Acciones del álbum personal">
                    <div class="guest-upload-action">
                        <button id="guest-upload-photos-btn" class="btn-rectangular" type="button" ${hasReachedPhotoLimit ? "disabled" : ""}>Subir fotografías</button>
                        <button class="guest-upload-info-btn" type="button" data-guest-action="toggle-upload-info" data-guest-info="photos" aria-label="Información sobre fotografías" aria-expanded="false">
                            <span aria-hidden="true">ⓘ</span>
                        </button>
                        <span class="guest-upload-tooltip" role="tooltip">Podés seleccionar hasta 20 fotografías por carga.</span>
                    </div>
                    <div class="guest-upload-action">
                        <button id="guest-upload-video-btn" class="btn-rectangular btn-secundario" type="button">Subir video</button>
                        <button class="guest-upload-info-btn" type="button" data-guest-action="toggle-upload-info" data-guest-info="video" aria-label="Información sobre video" aria-expanded="false">
                            <span aria-hidden="true">ⓘ</span>
                        </button>
                        <span class="guest-upload-tooltip" role="tooltip">Podï¿½s subir un video por vez. Tamaño mï¿½ximo: 100 MB.</span>
                    </div>
                </div>

                ${hasReachedPhotoLimit ? `
                    <p class="guest-album-limit-note">Ya alcanzaste el máximo permitido de 50 fotografías.</p>
                ` : ""}

                ${showUploadProgress ? `
                    <div class="media-upload-progress guest-upload-progress" aria-live="polite">
                        <div class="media-upload-progress-head">
                            <span class="media-upload-progress-label">${escapeHTML(uploadProgress.label || "Subiendo fotografías")}</span>
                            <span class="media-upload-progress-meta">${uploadProgress.completed} / ${uploadProgress.total}</span>
                        </div>
                        <div class="media-upload-progress-track">
                            <span class="media-upload-progress-bar" style="width: ${uploadPercent}%"></span>
                        </div>
                        ${uploadProgress.fileName ? `<div class="media-upload-progress-file">${escapeHTML(uploadProgress.fileName)}</div>` : ""}
                    </div>
                ` : ""}

                <input id="guest-photos-input" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple hidden>
                <input id="guest-video-input" type="file" accept="video/*" hidden>

                <div class="guest-personal-album-media">
                    <div id="guest-personal-empty-state" class="album-empty-state guest-empty-album-card" ${hasContent ? "hidden" : ""}>
                        <i class="fa-solid fa-photo-film guest-empty-album-icon" aria-hidden="true"></i>
                        <h3>Tu álbum está esperando recuerdos</h3>
                        <p>Sumá fotografías para empezar a guardar recuerdos en este álbum.</p>
                    </div>

                    <div id="guest-personal-media-list" class="guest-personal-media-list" aria-live="polite"></div>
                    <div id="guest-personal-pagination" class="guest-pagination" ${showPersonalPagination ? "" : "hidden"}>
                        <button class="guest-pagination-btn" type="button" data-guest-action="personal-page-prev" aria-label="Página anterior">Anterior</button>
                        <span class="guest-pagination-label" data-guest-role="page-indicator">${personalPagination.currentPage} de ${personalPagination.totalPages}</span>
                        <button class="guest-pagination-btn" type="button" data-guest-action="personal-page-next" aria-label="Página siguiente">Siguiente</button>
                    </div>
                </div>
            </article>

            <aside class="guest-albums">
                <div class="guest-albums-header">
                    <i class="fa-solid fa-folder-open guest-albums-heading-icon" aria-hidden="true"></i>
                    <h3>Explorar álbumes</h3>
                    <div class="guest-albums-toolbar">
                        <label class="guest-search-field" for="guest-album-search">
                            <span>Buscar por nombre</span>
                            <input id="guest-album-search" type="search" autocomplete="off" placeholder="Escribí un nombre para explorar" value="${escapeHTML(guestCenterState.searchQuery)}">
                        </label>

                        <div class="guest-albums-summary" id="guest-albums-summary">${escapeHTML(albumSummary)}</div>
                    </div>
                </div>

                <div id="guest-albums-grid" class="guest-albums-grid" aria-live="polite">
                    ${albumsPagination.items.map((album, index) => {
                        const accentClass = album.accentClass || albumAccentClasses[index % albumAccentClasses.length];
                        return `
                            <button class="guest-album-item ${escapeHTML(accentClass)}" type="button" data-guest-album-id="${escapeHTML(album.id)}">
                                <span class="guest-album-initials" aria-hidden="true">
                                    <i class="fa-solid fa-folder-open" aria-hidden="true"></i>
                                </span>
                                <span class="guest-album-name">${escapeHTML(album.ownerName)}</span>
                            </button>
                        `;
                    }).join("")}
                </div>

                <div id="guest-albums-pagination" class="guest-pagination" ${albumsPagination.totalPages > 1 ? "" : "hidden"}>
                    <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-prev" aria-label="Página anterior">Anterior</button>
                    <span class="guest-pagination-label" data-guest-role="page-indicator">${albumsPagination.currentPage} de ${albumsPagination.totalPages}</span>
                    <button class="guest-pagination-btn" type="button" data-guest-action="albums-page-next" aria-label="Página siguiente">Siguiente</button>
                </div>
            </aside>
        </div>

        ${renderGuestViewer()}
    `;
}
