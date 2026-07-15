// --- 1. CONFIGURACIÓN CENTRAL DEL EVENTO ---
const eventConfig = {
    couple: {
        names: "Marcela y Jorge",
        pageTitle: "Marcela y Jorge - ¡Nos casamos!"
    },
    event: {
        title: "Fiesta",
        dateTime: "June 27, 2026 20:40:00",
        displayDate: "27 . 06 . 2026",
        eventDate: "27 de junio",
        eventTime: "20:40 hs.",
        venue: "New Palace Eventos"
    },
    links: {
        maps: "https://maps.app.goo.gl/K9eTUre2XknShAeo7",
        rsvp: "https://docs.google.com/forms/d/e/1FAIpQLSecEPbrfnRB-UrCt4vSvN3sTsqWSDOY8Ww58fOYRZjwCuLNAA/viewform?usp=publish-editor",
        calendar: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Casamiento+Marcela+y+Jorge&dates=20260627T204000/20260628T050000&details=¡Te+esperamos+para+celebrar+nuestra+boda!&location=New+Palace+Eventos",
        spotify: "https://open.spotify.com/playlist/2vW8MZfzzfk0heseMr7LKu?si=ff52de9f1c2c46f3&pt=5571456815580f3776fecae7ad71fd17"
    },
    texts: {
        intro: "Queremos celebrar junto a vos este momento tan especial para nosotros...",
        directions: "Clickeá en el botón y recibí las indicaciones para llegar.",
        punctuality: "Por favor, se puntual, Te esperamos!",
        dressCode: "\"Nos encantaría verte con tus mejores galas para esta noche tan especial\"",
        dressCodeValue: "FORMAL ELEGANTE",
        rsvp: "Esperamos que seas parte de esta gran celebración. ¡Confirmanos tu asistencia!",
        gifts: "El mejor regalo es tu presencia. Pero si deseas hacernos un presente, podés colaborar con nuestra luna de miel:",
        musicTitle: "¿Qué canciones no pueden faltar?",
        music: "¡Ayudanos agregando las canciones que pensás que no pueden faltar en la fiesta a nuestra lista!",
        footer: "Gracias por acompañarnos y compartir nuestra felicidad..."
    },
    labels: {
        mapsButton: "CÓMO LLEGAR",
        dressCodeTitle: "Dress Code",
        rsvpTitle: "Confirmación de Asistencia",
        rsvpButton: "CONFIRMAR ASISTENCIA",
        calendarButton: "AGENDAR EVENTO",
        giftsTitle: "Mesa de Regalos",
        spotifyButton: "AGREGAR A SPOTIFY"
    },
    bank: {
        cbu: "0070234030004025989626",
        alias: "COLOR.COATI.YERBA",
        holder: "Jorge A. Claros"
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
    personalAlbumPreviewSeed: [
        {
            id: "local-photo-1",
            kind: "photo",
            title: "Entrada al salón",
            meta: "Foto guardada en tu álbum",
            iconClass: "fa-solid fa-image"
        },
        {
            id: "local-photo-2",
            kind: "photo",
            title: "Brindis",
            meta: "Foto guardada en tu álbum",
            iconClass: "fa-solid fa-camera-retro"
        },
        {
            id: "local-video-1",
            kind: "video",
            title: "Video único",
            meta: "Tu único video permitido",
            iconClass: "fa-solid fa-video"
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
    musicPlaylist: [
        {
            title: "Unchained Melody",
            artist: "The Righteous Brothers",
            duration: "03:36",
            file: "assets/audio/unchained-melody.mp3"
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
    ],
    albumTemplates: {
        guestAlbumType: "guest",
        officialAlbumType: "official"
    }
};

// --- 2. APLICACIÓN DE LA CONFIGURACIÓN EN LA PÁGINA ---
function setText(id, value) {
    document.getElementById(id).textContent = value;
}

function setHref(id, value) {
    document.getElementById(id).href = value;
}

function applyEventConfig() {
    document.title = eventConfig.couple.pageTitle;

    setText("couple-names", eventConfig.couple.names);
    setText("footer-names", eventConfig.couple.names);
    setText("hero-date", eventConfig.event.displayDate);
    setText("intro-text", eventConfig.texts.intro);

    setText("event-title", eventConfig.event.title);
    setText("event-date", eventConfig.event.eventDate);
    setText("event-time", eventConfig.event.eventTime);
    setText("event-venue", eventConfig.event.venue);
    setText("event-directions-text", eventConfig.texts.directions);
    setText("event-punctuality-text", eventConfig.texts.punctuality);

    setText("dress-code-title", eventConfig.labels.dressCodeTitle);
    setText("dress-code-text", eventConfig.texts.dressCode);
    setText("dress-code-value", eventConfig.texts.dressCodeValue);

    setText("rsvp-title", eventConfig.labels.rsvpTitle);
    setText("rsvp-text", eventConfig.texts.rsvp);
    setText("gifts-title", eventConfig.labels.giftsTitle);
    setText("gift-text", eventConfig.texts.gifts);
    setText("bank-cbu", eventConfig.bank.cbu);
    setText("bank-alias", eventConfig.bank.alias);
    setText("bank-holder", eventConfig.bank.holder);

    setText("music-title", eventConfig.texts.musicTitle);
    setText("music-text", eventConfig.texts.music);
    setText("footer-text", eventConfig.texts.footer);
    setText("maps-link", eventConfig.labels.mapsButton);
    setText("rsvp-link", eventConfig.labels.rsvpButton);
    setText("calendar-link", eventConfig.labels.calendarButton);
    setText("spotify-link", eventConfig.labels.spotifyButton);

    setHref("maps-link", eventConfig.links.maps);
    setHref("rsvp-link", eventConfig.links.rsvp);
    setHref("calendar-link", eventConfig.links.calendar);
    setHref("spotify-link", eventConfig.links.spotify);
}

applyEventConfig();

// --- 3. FLUJO LOCAL DE INGRESO AL CENTRO DE RECUERDOS ---
const accessStorageKey = "centroRecuerdosAccess";
const recuerdosSections = [
    { id: "albumes-invitados", title: "Fotos de los Invitados" },
    { id: "album-oficial", title: "Fotos Profesionales" },
    { id: "libro-mensajes", title: "Muro de Comentarios y Saludos" },
    { id: "presentacion", title: "Presentación" }
];

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

function saveAccessProfile(profile) {
    localStorage.setItem(accessStorageKey, JSON.stringify(profile));
}

const albumStorageKey = "centroRecuerdosAlbums";

function getStoredAlbums() {
    const storedAlbums = localStorage.getItem(albumStorageKey);
    return storedAlbums ? JSON.parse(storedAlbums) : [];
}

function saveAlbums(albums) {
    localStorage.setItem(albumStorageKey, JSON.stringify(albums));
}

function getGuestAlbumPreviewItems() {
    const storedAlbums = getStoredAlbums().filter((album) => album.type === eventConfig.albumTemplates.guestAlbumType);
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

    return eventConfig.guestAlbumPreviewSeed.map((album, index) => ({
        ...album,
        accentClass: album.accentClass || ["accent-rose", "accent-lavender", "accent-sand", "accent-plum"][index % 4]
    }));
}

function getActiveGuestAlbum() {
    const profile = getStoredAccessProfile();
    const storedAlbums = getStoredAlbums().filter((album) => album.type === eventConfig.albumTemplates.guestAlbumType);

    if (!profile || profile.type !== "guest" || !profile.name) {
        return null;
    }

    return storedAlbums.find((album) => album.ownerName === profile.name) || null;
}

function getPersonalAlbumPreviewItems() {
    const profile = getStoredAccessProfile();
    const guestName = profile && profile.type === "guest" && profile.name ? profile.name : "Mi álbum";
    const activeAlbum = getActiveGuestAlbum();

    if (!activeAlbum) {
        return {
            guestName,
            items: [],
            hasContent: false
        };
    }

    const photoItems = (activeAlbum.photos || []).map((photo, index) => ({
        id: activeAlbum.id + "-photo-" + index,
        kind: "photo",
        title: photo.title || ("Foto " + (index + 1)),
        meta: "Guardada en tu álbum",
        iconClass: "fa-solid fa-image"
    }));

    const videoItems = activeAlbum.video ? [{
        id: activeAlbum.id + "-video",
        kind: "video",
        title: activeAlbum.video.title || "Video único",
        meta: "Guardado en tu álbum",
        iconClass: "fa-solid fa-video"
    }] : [];

    return {
        guestName,
        items: [...photoItems, ...videoItems],
        hasContent: photoItems.length > 0 || videoItems.length > 0
    };
}

function renderGuestAlbumsGrid() {
    const gridElement = document.getElementById("guest-albums-grid");
    const summaryElement = document.getElementById("guest-albums-summary");
    const guestAlbums = getGuestAlbumPreviewItems();

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
    const personalAlbum = getPersonalAlbumPreviewItems();

    if (!titleElement || !descriptionElement || !listElement || !emptyStateElement || !progressElement || !progressBarElement || !progressTextElement) {
        return;
    }

    titleElement.textContent = personalAlbum.guestName === "Mi álbum"
        ? "Mi álbum"
        : "Mi álbum, " + personalAlbum.guestName;

    descriptionElement.textContent = personalAlbum.hasContent
        ? "Así se verán tus fotos y tu único video organizados en tu álbum propio."
        : "Subí tus fotos y tu único video para mantenerlos ordenados en tu álbum propio.";

    listElement.innerHTML = personalAlbum.items.map((item, index) => `
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

    emptyStateElement.hidden = personalAlbum.hasContent;
    listElement.hidden = !personalAlbum.hasContent;
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

    listElement.innerHTML = eventConfig.officialAlbumPreviewSeed.map((item, index) => `
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

    boardElement.innerHTML = eventConfig.messageBoardSeed.map((message, index) => `
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

    thumbsElement.innerHTML = eventConfig.presentationSlides.map((slide, index) => `
        <span class="presentation-thumb ${index === 0 ? "is-active" : ""}"></span>
    `).join("");

    const applySlide = (index) => {
        const slide = eventConfig.presentationSlides[index];

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

    if (window.presentationRotationTimer) {
        window.clearInterval(window.presentationRotationTimer);
    }

    let currentSlideIndex = 0;
    window.presentationRotationTimer = window.setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % eventConfig.presentationSlides.length;
        applySlide(currentSlideIndex);
    }, 4500);
}

function updateAlbumEmptyStates() {
    const guestEmptyState = document.getElementById("guest-albums-empty-state");
    const officialEmptyState = document.getElementById("official-album-empty-state");

    if (!guestEmptyState || !officialEmptyState) {
        return;
    }

    const guestHasContent = getGuestAlbumPreviewItems().some((album) => album.photoCount > 0);
    const officialHasContent = eventConfig.officialAlbumPreviewSeed.length > 0;

    guestEmptyState.hidden = guestHasContent;
    officialEmptyState.hidden = officialHasContent;
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

function createPersonalAlbum(guestName) {
    const normalizedName = guestName.trim();
    const albums = getStoredAlbums();
    const albumTitle = "Fotos de " + normalizedName;
    const existingAlbum = albums.find((album) => album.ownerName === normalizedName && album.type === eventConfig.albumTemplates.guestAlbumType);

    if (existingAlbum) {
        return existingAlbum;
    }

    const newAlbum = {
        id: "guest-" + Date.now(),
        type: eventConfig.albumTemplates.guestAlbumType,
        title: albumTitle,
        ownerName: normalizedName,
        visible: false,
        photos: [],
        video: null,
        createdAt: new Date().toISOString()
    };

    albums.push(newAlbum);
    saveAlbums(albums);
    renderGuestAlbumsGrid();
    renderPersonalAlbumPreview();
    return newAlbum;
}

function updateGuestGreeting() {
    const profile = getStoredAccessProfile();
    const greetingElement = document.getElementById("guest-greeting");
    if (!greetingElement) {
        return;
    }

    if (profile && profile.type === "guest" && profile.name) {
        greetingElement.textContent = `Hola, ${profile.name} ❤️`;
        greetingElement.hidden = false;
    } else {
        greetingElement.hidden = true;
    }
}

function renderMemoriesPreview() {
    updateCenterHeader();
    updateGuestGreeting();
    renderGuestAlbumsGrid();
    renderPersonalAlbumPreview();
    renderOfficialAlbumPreview();
    renderMessageBoard();
    renderPresentation();
    updateAlbumEmptyStates();
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
    let album = albums.find((item) => item.ownerName === profile.name && item.type === eventConfig.albumTemplates.guestAlbumType);

    if (!album) {
        album = createPersonalAlbum(profile.name);
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

function clearAccessProfile() {
    localStorage.removeItem(accessStorageKey);
}

function openAccessModal() {
    document.getElementById("access-modal").hidden = false;
    document.body.classList.add("modal-open");
}

function closeAccessModal() {
    document.getElementById("access-modal").hidden = true;
    document.body.classList.remove("modal-open");
}

function showAccessFeedback(message) {
    document.getElementById("access-feedback").textContent = message;
}

function getCurrentAccessView() {
    const successState = document.getElementById("access-modal-success");

    if (successState && !successState.hidden) {
        return "success";
    }

    return document.getElementById("access-modal-welcome").hidden ? "returning" : "welcome";
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

        returningName.textContent = isGuest
            ? "Tu sesión guardada es para " + profile.name + "."
            : "Tu sesión de administrador sigue disponible en este dispositivo.";

        continueBtn.textContent = isGuest ? "Continuar como " + profile.name : "Continuar como administrador";
        switchUserBtn.textContent = isGuest ? "Cambiar de usuario" : "Cerrar sesión";
        openAdminFormBtn.hidden = false;
        openAdminFormBtn.textContent = "Ingresar como administrador";
        continueBtn.dataset.sessionType = isGuest ? "guest" : "admin";
        switchUserBtn.dataset.sessionType = isGuest ? "guest" : "admin";
        openAdminFormBtn.dataset.sessionType = "admin";
        returningState.dataset.sessionType = displayName;
        return;
    }

    if (view === "success") {
        const displayName = profile && profile.name ? profile.name : "administrador";

        successName.textContent = profile && profile.type === "guest"
            ? "Hola, " + profile.name
            : "Bienvenido";
        successState.dataset.sessionType = displayName;
        openAdminFormBtn.hidden = true;
        return;
    }

    if (view !== "returning") {
        openAdminFormBtn.hidden = true;
    }

    if (view === "welcome") {
        guestOption.classList.add("active");
        adminOption.classList.remove("active");
    }

    if (view === "guest-form") {
        document.getElementById("guest-name").focus();
    }

    if (view === "admin-form") {
        document.getElementById("admin-code").focus();
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

function updateCenterHeader(profile = getStoredAccessProfile()) {
    const greetingElement = document.getElementById("guest-greeting");
    const sessionSwitchBtn = document.getElementById("session-switch-btn");

    if (profile && profile.type === "guest" && profile.name) {
        greetingElement.textContent = "Hola, " + profile.name + " ❤️";
        greetingElement.hidden = false;
        sessionSwitchBtn.hidden = false;
        sessionSwitchBtn.textContent = "Cambiar de usuario";
        return;
    }

    if (profile && profile.type === "admin") {
        greetingElement.textContent = "Centro de Recuerdos ❤️";
        greetingElement.hidden = false;
        sessionSwitchBtn.hidden = false;
        sessionSwitchBtn.textContent = "Cerrar sesión";
        return;
    }

    greetingElement.hidden = true;
    sessionSwitchBtn.hidden = true;
}

function scrollToRecuerdosSection(sectionId) {
    const targetSection = document.getElementById(sectionId);

    if (!targetSection) {
        return;
    }

    recuerdosSections.forEach((section) => {
        const sectionElement = document.getElementById(section.id);
        if (sectionElement && sectionElement.id !== sectionId) {
            sectionElement.hidden = true;
        }
    });

    targetSection.hidden = false;
    targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindRecuerdosNavigation() {
    const recuerdosGrid = document.getElementById("recuerdos-grid");
    if (recuerdosGrid) {
        recuerdosGrid.addEventListener("click", (event) => {
            const button = event.target.closest("[data-target]");

            if (!button) {
                return;
            }

            scrollToRecuerdosSection(button.dataset.target);
        });
    }

    document.querySelectorAll("[data-back-to]").forEach((button) => {
        button.addEventListener("click", () => {
            scrollToRecuerdosSection(button.dataset.backTo);
        });
    });

    const sessionSwitchBtn = document.getElementById("session-switch-btn");
    if (sessionSwitchBtn) {
        sessionSwitchBtn.addEventListener("click", () => {
            clearAccessProfile();
            updateCenterHeader(null);
            showAccessWelcome(null);
            openAccessModal();
        });
    }

    const switchUserBtn = document.getElementById("switch-user-btn");
    if (switchUserBtn) {
        switchUserBtn.addEventListener("click", () => {
            clearAccessProfile();
            updateCenterHeader(null);
            showAccessWelcome(null);
            openAccessModal();
        });
    }

    const openAdminFormBtn = document.getElementById("open-admin-form-btn");
    if (openAdminFormBtn) {
        openAdminFormBtn.addEventListener("click", () => {
            setAccessView("admin-form");
        });
    }

    const closeAccessSuccessBtn = document.getElementById("close-access-success-btn");
    if (closeAccessSuccessBtn) {
        closeAccessSuccessBtn.addEventListener("click", closeAccessModal);
    }
}

function handleGuestAccess(event) {
    event.preventDefault();

    const guestName = document.getElementById("guest-name").value.trim();
    const eventCode = document.getElementById("event-code").value.trim();

    if (!guestName || eventCode !== eventConfig.access.eventCode) {
        showAccessFeedback("Revisá tu nombre y el código del evento para ingresar.");
        return;
    }

    const profile = {
        name: guestName,
        type: "guest",
        enteredAt: new Date().toISOString()
    };

    saveAccessProfile(profile);
    showAccessSuccess(profile);
}

function handleAdminAccess(event) {
    event.preventDefault();

    const adminCode = document.getElementById("admin-code").value.trim();

    if (adminCode !== eventConfig.access.adminCode) {
        showAccessFeedback("Revisá el código administrador para ingresar.");
        return;
    }

    const profile = {
        type: "admin",
        enteredAt: new Date().toISOString()
    };

    saveAccessProfile(profile);
    closeAccessModal();
}

function initializeAccessFlow() {
    const storedProfile = getStoredAccessProfile();

    document.getElementById("guest-access-option").addEventListener("click", () => setAccessView("guest-form"));
    document.getElementById("admin-access-option").addEventListener("click", () => setAccessView("admin-form"));
    document.getElementById("guest-access-form").addEventListener("submit", handleGuestAccess);
    document.getElementById("admin-access-form").addEventListener("submit", handleAdminAccess);
    document.getElementById("guest-back-btn").addEventListener("click", () => showAccessWelcome(getStoredAccessProfile()));
    document.getElementById("admin-back-btn").addEventListener("click", () => showAccessWelcome(getStoredAccessProfile()));
    const continueSessionBtn = document.getElementById("continue-session-btn");
    if (continueSessionBtn) {
        continueSessionBtn.addEventListener("click", () => {
            closeAccessModal();
        });
    }

    showAccessWelcome(storedProfile);
    updateCenterHeader(storedProfile);
    openAccessModal();
}

initializeAccessFlow();

// --- 4. LÓGICA DE LA CUENTA REGRESIVA ---
const fechaBoda = new Date(eventConfig.event.dateTime).getTime();
let intervalo;

function formatTime(value) {
    return value < 10 ? "0" + value : value;
}

function showPostEventContent() {
    document.getElementById("post-event-message").hidden = false;
    const previewSection = document.getElementById("centro-recuerdos-preview");
    previewSection.hidden = false;
    previewSection.classList.add("fade-in");
}

function updateCountdown() {
    const ahora = new Date().getTime();
    const distancia = fechaBoda - ahora;
    const tiempoRestante = Math.max(distancia, 0);

    const dias = Math.floor(tiempoRestante / (1000 * 60 * 60 * 24));
    const horas = Math.floor((tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);

    document.getElementById("dias").innerText = formatTime(dias);
    document.getElementById("horas").innerText = formatTime(horas);
    document.getElementById("minutos").innerText = formatTime(minutos);
    document.getElementById("segundos").innerText = formatTime(segundos);

    if (distancia <= 0) {
        showPostEventContent();
        clearInterval(intervalo);
        return false;
    }

    return true;
}

if (updateCountdown()) {
    intervalo = setInterval(updateCountdown, 1000);
}

// --- 5. LÓGICA DEL REPRODUCTOR DE MÚSICA (CON PLAYLIST Y CONTROLES) ---
const audio = document.getElementById("bg-music");
const playBtn = document.getElementById("play-music-btn");
const prevBtn = document.getElementById("player-prev-btn");
const nextBtn = document.getElementById("player-next-btn");
const volumeSlider = document.getElementById("player-volume-slider");
const volumeIcon = document.getElementById("player-volume-icon");
const trackTitle = document.getElementById("player-track-title");
const trackArtist = document.getElementById("player-track-artist");

let currentTrackIndex = 0;
let isPlaying = false;

function loadTrack(index) {
    const track = eventConfig.musicPlaylist[index];
    audio.src = track.file;
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
}

function playTrack() {
    audio.play().then(() => {
        isPlaying = true;
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }).catch(error => console.log("Error al reproducir:", error));
}

function pauseTrack() {
    audio.pause();
    isPlaying = false;
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % eventConfig.musicPlaylist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) playTrack();
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + eventConfig.musicPlaylist.length) % eventConfig.musicPlaylist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) playTrack();
}

// Event Listeners
playBtn.addEventListener("click", () => {
    if (isPlaying) pauseTrack();
    else playTrack();
});

prevBtn.addEventListener("click", prevTrack);
nextBtn.addEventListener("click", nextTrack);

volumeSlider.addEventListener("input", (e) => {
    audio.volume = e.target.value;
    updateVolumeIcon(e.target.value);
});

volumeIcon.addEventListener("click", () => {
    if (audio.muted) {
        audio.muted = false;
        updateVolumeIcon(audio.volume);
    } else {
        audio.muted = true;
        volumeIcon.className = "fa-solid fa-volume-xmark";
    }
});

function updateVolumeIcon(volume) {
    if (volume == 0) {
        volumeIcon.className = "fa-solid fa-volume-off";
    } else if (volume < 0.5) {
        volumeIcon.className = "fa-solid fa-volume-low";
    } else {
        volumeIcon.className = "fa-solid fa-volume-high";
    }
}

// Autoplay al primer toque
document.body.addEventListener("click", () => {
    if (!isPlaying) {
        playTrack();
    }
}, { once: true });

// Inicializar primer track
loadTrack(currentTrackIndex);
audio.volume = volumeSlider.value;
