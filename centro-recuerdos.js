const recuerdosConfig = {
    couple: {
        names: "Marcela y Jorge"
    },
    access: {
        eventCode: "MARCELA-JORGE-2026",
        adminCode: "NOVIOS-2026"
    },
    guestAlbumPreviewSeed: [
        {
            id: "demo-1",
            title: "Familia",
            ownerName: "Cami",
            photoCount: 14,
            accentClass: "accent-rose",
            initials: "FC"
        },
        {
            id: "demo-2",
            title: "Amigos",
            ownerName: "Sofi",
            photoCount: 9,
            accentClass: "accent-lavender",
            initials: "AS"
        },
        {
            id: "demo-3",
            title: "Mesa de fotos",
            ownerName: "Nico",
            photoCount: 11,
            accentClass: "accent-sand",
            initials: "MN"
        },
        {
            id: "demo-4",
            title: "Fiesta",
            ownerName: "Lau",
            photoCount: 7,
            accentClass: "accent-plum",
            initials: "LF"
        }
    ],
    officialAlbumPreviewSeed: [
        {
            id: "official-1",
            image: "assets/img-1.png",
            title: "Entrada soñada",
            meta: "Fotografía oficial seleccionada"
        },
        {
            id: "official-2",
            image: "assets/img-2.png",
            title: "La noche",
            meta: "Momento destacado del casamiento"
        },
        {
            id: "official-3",
            image: "assets/img-3.png",
            title: "Recuerdo ilustrado",
            meta: "Detalle visual del evento"
        }
    ],
    messageBoardSeed: [
        {
            initials: "MC",
            author: "Mica",
            message: "Gracias por acompañarnos en este momento tan especial y por dejar un recuerdo para siempre.",
            meta: "Hace unos minutos"
        },
        {
            initials: "JR",
            author: "Juli",
            message: "Les deseo una vida llena de amor, música y momentos inolvidables.",
            meta: "Hace 1 hora"
        },
        {
            initials: "FA",
            author: "Familia",
            message: "Qué lindo poder dejar saludos en un muro que guarda todo con tanta elegancia.",
            meta: "Hoy"
        }
    ],
    presentationSlides: [
        {
            image: "assets/img-1.png",
            title: "Primer recuerdo",
            text: "Imágenes elegidas para iniciar la presentación automática."
        },
        {
            image: "assets/img-2.png",
            title: "Momento especial",
            text: "La galería irá alternando fotos con transición suave."
        },
        {
            image: "assets/img-3.png",
            title: "Recuerdo compartido",
            text: "Las fotos disponibles se irán mezclando en secuencia."
        }
    ]
};

const accessStorageKey = "centroRecuerdosAccess";
const albumStorageKey = "centroRecuerdosAlbums";

function getStoredAccessProfile() {
    const storedProfile = localStorage.getItem(accessStorageKey);

    if (!storedProfile) {
        return null;
    }

    try {
        return JSON.parse(storedProfile);
    } catch (error) {
        return null;
    }
}

function clearAccessProfile() {
    localStorage.removeItem(accessStorageKey);
}

function getStoredAlbums() {
    const storedAlbums = localStorage.getItem(albumStorageKey);
    return storedAlbums ? JSON.parse(storedAlbums) : [];
}

function saveAlbums(albums) {
    localStorage.setItem(albumStorageKey, JSON.stringify(albums));
}

function ensurePersonalAlbum(guestName) {
    const normalizedName = guestName.trim();
    const albums = getStoredAlbums();
    const existingAlbum = albums.find((album) => album.ownerName === normalizedName && album.type === "guest");

    if (existingAlbum) {
        return existingAlbum;
    }

    const newAlbum = {
        id: "guest-" + Date.now(),
        type: "guest",
        title: "Fotos de " + normalizedName,
        ownerName: normalizedName,
        visible: false,
        photos: [],
        video: null,
        createdAt: new Date().toISOString()
    };

    albums.push(newAlbum);
    saveAlbums(albums);
    return newAlbum;
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
}

function showAccessFeedback(message) {
    const feedbackElement = document.getElementById("access-feedback");
    if (feedbackElement) {
        feedbackElement.textContent = message;
    }
}

function getCurrentAccessView() {
    const successState = document.getElementById("access-modal-success");
    if (successState && !successState.hidden) {
        return "success";
    }

    const returningState = document.getElementById("access-modal-returning");
    if (returningState && !returningState.hidden) {
        return "returning";
    }

    return "welcome";
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
            successName.textContent = profile && profile.type === "guest" && profile.name
                ? "Hola, " + profile.name
                : "Bienvenido";
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
        <span class="toast-message">${message}</span>
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

function getVisibleGuestAlbums() {
    const storedAlbums = getStoredAlbums().filter((album) => album.type === "guest");
    const albumsWithContent = storedAlbums.filter((album) => album.visible && ((album.photos && album.photos.length > 0) || album.video));

    if (albumsWithContent.length > 0) {
        return albumsWithContent.map((album, index) => ({
            id: album.id,
            title: album.title || ("Fotos de " + album.ownerName),
            ownerName: album.ownerName,
            photoCount: (album.photos ? album.photos.length : 0) + (album.video ? 1 : 0),
            accentClass: ["accent-rose", "accent-lavender", "accent-sand", "accent-plum"][index % 4],
            initials: album.ownerName
                .split(" ")
                .map((word) => word.charAt(0))
                .slice(0, 2)
                .join("")
                .toUpperCase()
        }));
    }

    return recuerdosConfig.guestAlbumPreviewSeed;
}

function getActiveGuestAlbum() {
    const profile = getStoredAccessProfile();

    if (!profile || profile.type !== "guest" || !profile.name) {
        return null;
    }

    const storedAlbums = getStoredAlbums().filter((album) => album.type === "guest");
    return storedAlbums.find((album) => album.ownerName === profile.name) || null;
}

function renderGuestAlbumsGrid() {
    const gridElement = document.getElementById("guest-albums-grid");
    const summaryElement = document.getElementById("guest-albums-summary");
    const guestAlbums = getVisibleGuestAlbums();

    if (!gridElement || !summaryElement) {
        return;
    }

    gridElement.innerHTML = guestAlbums.map((album) => `
        <article class="guest-album-card ${album.accentClass}">
            <div class="guest-album-cover" aria-hidden="true">
                <span class="guest-album-initials">${album.initials}</span>
            </div>
            <div class="guest-album-body">
                <p class="guest-album-owner">${album.ownerName}</p>
                <h3 class="guest-album-title">${album.title}</h3>
                <p class="guest-album-meta">${album.photoCount} recuerdo${album.photoCount === 1 ? "" : "s"} compartido${album.photoCount === 1 ? "" : "s"}</p>
            </div>
        </article>
    `).join("");

    summaryElement.textContent = `${guestAlbums.length} álbumes visibles para recorrer en esta sección.`;
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
        ? "Así se verán tus fotos y tu único video organizados en tu álbum propio."
        : "Subí tus fotos y tu único video para mantenerlos ordenados en tu álbum propio.";

    const items = hasContent
        ? [
            ...(activeAlbum.photos || []).map((photo, index) => ({
                kind: "photo",
                title: photo.title || ("Foto " + (index + 1)),
                meta: "Guardada localmente como vista previa",
                iconClass: "fa-solid fa-image"
            })),
            ...(activeAlbum.video ? [{
                kind: "video",
                title: activeAlbum.video.title || "Video único",
                meta: "Guardado localmente como vista previa",
                iconClass: "fa-solid fa-video"
            }] : [])
        ]
        : [];

    listElement.innerHTML = items.map((item, index) => `
        <article class="personal-media-card ${item.kind === "video" ? "is-video" : "is-photo"}">
            <div class="personal-media-thumb personal-media-thumb-${(index % 4) + 1}">
                <i class="${item.iconClass}" aria-hidden="true"></i>
            </div>
            <div class="personal-media-body">
                <p class="personal-media-kind">${item.kind === "video" ? "Video" : "Foto"}</p>
                <h4 class="personal-media-title">${item.title}</h4>
                <p class="personal-media-meta">${item.meta}</p>
            </div>
        </article>
    `).join("");

    emptyStateElement.hidden = hasContent;
    listElement.hidden = !hasContent;
    progressElement.hidden = true;
    progressBarElement.style.width = "0%";
    progressTextElement.textContent = "0%";
}

function renderOfficialAlbumPreview() {
    const listElement = document.getElementById("official-album-grid");
    const modeElement = document.getElementById("official-view-mode");
    const descriptionElement = document.getElementById("official-album-description");
    const titleElement = document.getElementById("official-album-title");
    const actionsElement = document.getElementById("official-album-actions");
    const profile = getStoredAccessProfile();
    const isAdmin = profile && profile.type === "admin";

    if (!listElement || !modeElement || !descriptionElement || !titleElement || !actionsElement) {
        return;
    }

    titleElement.textContent = isAdmin ? "Galería oficial en modo administrador" : "Galería oficial en modo invitado";
    descriptionElement.textContent = isAdmin
        ? "Como administrador, esta vista deja preparada la curaduría del álbum oficial."
        : "Como invitado, solo podés contemplar la selección oficial de los novios.";

    modeElement.innerHTML = `
        <div class="official-mode-badge ${isAdmin ? "is-admin" : "is-guest"}">
            <span class="official-mode-label">${isAdmin ? "Modo administrador" : "Modo invitado"}</span>
            <span class="official-mode-text">${isAdmin ? "Herramientas listas para curar fotos oficiales." : "Vista de solo lectura para invitados."}</span>
        </div>
    `;

    actionsElement.innerHTML = isAdmin ? `
        <div class="official-album-toolbar" aria-label="Herramientas del álbum oficial">
            <span class="official-tool-pill">Subir</span>
            <span class="official-tool-pill">Editar</span>
            <span class="official-tool-pill">Eliminar</span>
            <span class="official-tool-pill">Organizar</span>
        </div>
    ` : `
        <div class="official-readonly-note">
            <p>El álbum oficial pertenece a los novios. Los invitados solo pueden visualizarlo.</p>
        </div>
    `;

    listElement.innerHTML = recuerdosConfig.officialAlbumPreviewSeed.map((item, index) => `
        <article class="official-album-card ${index === 0 ? "is-featured" : ""}">
            <div class="official-album-cover">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
            </div>
            <div class="official-album-body">
                <p class="official-album-kind">Álbum oficial</p>
                <h4 class="official-album-title">${item.title}</h4>
                <p class="official-album-meta">${item.meta}</p>
            </div>
        </article>
    `).join("");
}

function renderMessageBoard() {
    const boardElement = document.getElementById("message-board-grid");

    if (!boardElement) {
        return;
    }

    boardElement.innerHTML = recuerdosConfig.messageBoardSeed.map((message, index) => `
        <article class="message-card message-card-${(index % 3) + 1}">
            <div class="message-card-header">
                <span class="message-avatar">${message.initials}</span>
                <div>
                    <p class="message-author">${message.author}</p>
                    <p class="message-meta">${message.meta}</p>
                </div>
            </div>
            <p class="message-text">${message.message}</p>
        </article>
    `).join("");
}

function renderPresentation() {
    const slideImage = document.getElementById("presentation-slide-image");
    const slideKicker = document.getElementById("presentation-slide-kicker");
    const slideTitle = document.getElementById("presentation-slide-title");
    const slideText = document.getElementById("presentation-slide-text");
    const thumbsElement = document.getElementById("presentation-thumbs");

    if (!slideImage || !slideKicker || !slideTitle || !slideText || !thumbsElement) {
        return;
    }

    thumbsElement.innerHTML = recuerdosConfig.presentationSlides.map((slide, index) => `
        <span class="presentation-thumb ${index === 0 ? "is-active" : ""}"></span>
    `).join("");

    const applySlide = (index) => {
        const slide = recuerdosConfig.presentationSlides[index];

        slideImage.src = slide.image;
        slideImage.alt = slide.title;
        slideKicker.textContent = "Centro de Recuerdos";
        slideTitle.textContent = slide.title;
        slideText.textContent = slide.text;

        thumbsElement.querySelectorAll(".presentation-thumb").forEach((thumb, thumbIndex) => {
            thumb.classList.toggle("is-active", thumbIndex === index);
        });
    };

    applySlide(0);

    if (window.recuerdosPresentationTimer) {
        window.clearInterval(window.recuerdosPresentationTimer);
    }

    let currentSlideIndex = 0;
    window.recuerdosPresentationTimer = window.setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % recuerdosConfig.presentationSlides.length;
        applySlide(currentSlideIndex);
    }, 4500);
}

function renderAll() {
    updateLandingContent();
    renderGuestAlbumsGrid();
    renderPersonalAlbumPreview();
    renderOfficialAlbumPreview();
    renderMessageBoard();
    renderPresentation();
}

function initializeToastInteractions() {
    const photosButton = document.getElementById("personal-upload-photos-btn");
    const videoButton = document.getElementById("personal-upload-video-btn");

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
                    ? "Video listo: el flujo de carga quedó preparado."
                    : "Fotos listas: la carga simulada quedó completa.", "success");
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
            meta: "Guardado localmente como vista previa"
        };
    } else {
        const photoIndex = (album.photos ? album.photos.length : 0) + 1;
        album.photos = album.photos || [];
        album.photos.push({
            title: "Foto " + photoIndex,
            meta: "Guardada localmente como vista previa"
        });
        album.visible = true;
    }

    const updatedAlbums = albums.map((item) => item.id === album.id ? album : item);
    saveAlbums(updatedAlbums);
    renderGuestAlbumsGrid();
    renderPersonalAlbumPreview();
}

function handleChangeUser() {
    clearAccessProfile();
    showAccessWelcome(null);
    openAccessModal();
}

function handleGuestAccess(event) {
    event.preventDefault();

    const guestName = document.getElementById("guest-name");
    const eventCode = document.getElementById("event-code");
    const guestNameValue = guestName ? guestName.value.trim() : "";
    const eventCodeValue = eventCode ? eventCode.value.trim() : "";

    if (!guestNameValue || eventCodeValue !== recuerdosConfig.access.eventCode) {
        showAccessFeedback("Revisá tu nombre y el código del evento para ingresar.");
        return;
    }

    const profile = {
        name: guestNameValue,
        type: "guest",
        enteredAt: new Date().toISOString()
    };

    localStorage.setItem(accessStorageKey, JSON.stringify(profile));
    ensurePersonalAlbum(profile.name);
    updateLandingContent();
    showAccessSuccess(profile);
}

function handleAdminAccess(event) {
    event.preventDefault();

    const adminCode = document.getElementById("admin-code");
    const adminCodeValue = adminCode ? adminCode.value.trim() : "";

    if (adminCodeValue !== recuerdosConfig.access.adminCode) {
        showAccessFeedback("Revisá el código administrador para ingresar.");
        return;
    }

    const profile = {
        type: "admin",
        enteredAt: new Date().toISOString()
    };

    localStorage.setItem(accessStorageKey, JSON.stringify(profile));
    updateLandingContent();
    closeAccessModal();
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
}

function syncHashNavigation() {
    if (!location.hash) {
        return;
    }

    const target = document.querySelector(location.hash);

    if (target) {
        window.requestAnimationFrame(() => {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }
}

const changeUserBtn = document.getElementById("change-user-btn");
if (changeUserBtn) {
    changeUserBtn.addEventListener("click", handleChangeUser);
}

initializeAccessFlow();
initializeToastInteractions();
renderAll();
syncHashNavigation();

window.addEventListener("hashchange", syncHashNavigation);
