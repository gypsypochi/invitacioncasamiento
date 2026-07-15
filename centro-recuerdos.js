const recuerdosConfig = {
    couple: {
        names: "Marcela y Jorge"
    },
    access: {
        eventCode: "MARCELA-JORGE-2026",
        adminCode: "NOVIOS-2026"
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
            label: "Muro"
        },
        {
            target: "albums-section",
            label: "Centro de Recuerdos"
        }
    ],
    messageBoardSeed: [
        {
            initials: "MC",
            author: "Mica",
            message: "Gracias por acompañarnos en este momento tan especial.",
            meta: "Hace unos minutos"
        },
        {
            initials: "JR",
            author: "Juli",
            message: "Les deseo una vida llena de amor y momentos inolvidables.",
            meta: "Hace 1 hora"
        },
        {
            initials: "FA",
            author: "Familia",
            message: "Qué lindo poder dejar saludos en un espacio tan cuidado.",
            meta: "Hoy"
        },
        {
            initials: "AM",
            author: "Amigos",
            message: "Cada mensaje suma un recuerdo más a esta historia compartida.",
            meta: "Hoy"
        }
    ],
    albumDirectory: [
        {
            initials: "FC",
            ownerName: "Cami",
            title: "Familia",
            photoCount: 14,
            note: "Álbum compartido con recuerdos familiares.",
            accent: "accent-rose"
        },
        {
            initials: "AS",
            ownerName: "Sofi",
            title: "Amigos",
            photoCount: 9,
            note: "Momentos de pista y mesa.",
            accent: "accent-lavender"
        },
        {
            initials: "MN",
            ownerName: "Nico",
            title: "Mesa de fotos",
            photoCount: 11,
            note: "Recuerdos de la celebración.",
            accent: "accent-sand"
        },
        {
            initials: "LF",
            ownerName: "Lau",
            title: "Fiesta",
            photoCount: 7,
            note: "Fotos espontáneas para volver a mirar.",
            accent: "accent-plum"
        }
    ],
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
    ]
};

const accessStorageKey = "centroRecuerdosAccess";
const albumStorageKey = "centroRecuerdosAlbums";

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
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

    if (!storedAlbums) {
        return [];
    }

    try {
        return JSON.parse(storedAlbums);
    } catch (error) {
        return [];
    }
}

function saveAlbums(albums) {
    localStorage.setItem(albumStorageKey, JSON.stringify(albums));
}

function ensurePersonalAlbum(guestName) {
    const normalizedName = guestName.trim();
    const albums = getStoredAlbums();
    const existingAlbum = albums.find((album) => album.type === "guest" && album.ownerName === normalizedName);

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
        <section id="presentation-section" class="section recuerdos-section recuerdos-section-presentation bg-lavanda" data-section="presentation-section"></section>
        <section id="albums-section" class="section recuerdos-section recuerdos-section-albums" data-section="albums-section"></section>
    `;

    const changeUserBtn = document.getElementById("change-user-btn");
    if (changeUserBtn) {
        changeUserBtn.addEventListener("click", handleChangeUser);
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

    section.className = "section bg-lavanda";

    section.innerHTML = `
        <i class="fa-solid fa-camera icon-evento" aria-hidden="true"></i>
        <h2>Álbum Oficial</h2>
        <p class="official-photos-lead">Las fotografías oficiales del casamiento estarán disponibles muy pronto.</p>
        <p class="official-photos-note">Los novios las publicarán cuando finalice el evento.</p>

        <div class="official-photos-actions"${isAdmin ? "" : " hidden"}>
            <button class="btn-rectangular" type="button">Subir fotografías</button>
            <button class="btn-rectangular btn-secundario" type="button">Administrar fotografías</button>
        </div>
    `;
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

    boardElement.innerHTML = recuerdosDemoData.messageBoardSeed.map((message) => `
        <article class="message-card">
            <span class="message-avatar">${escapeHTML(message.initials)}</span>
            <div class="message-body">
                <div class="message-body-head">
                    <strong class="message-author">${escapeHTML(message.author)}</strong>
                    <span class="message-meta">${escapeHTML(message.meta)}</span>
                </div>
                <p class="message-text">${escapeHTML(message.message)}</p>
            </div>
        </article>
    `).join("");
}

function renderPresentationSection() {
    const section = document.getElementById("presentation-section");

    if (!section) {
        return;
    }

    section.innerHTML = `
        <div class="recuerdos-section-copy">
            <p class="recuerdos-section-kicker">Presentación</p>
            <h2>Presentación</h2>
            <p>Una presentación simple para revivir el evento.</p>
        </div>

        <div class="presentation-simple">
            <button id="presentation-fullscreen-btn" class="btn-rectangular" type="button">Iniciar presentación</button>
        </div>
    `;

    const button = document.getElementById("presentation-fullscreen-btn");
    if (button) {
        button.addEventListener("click", () => {
            const target = document.getElementById("presentation-section");

            if (target && target.requestFullscreen) {
                target.requestFullscreen().catch(() => {
            showToast("La presentación se abrirá cuando el navegador lo permita.", "default");
                });
                return;
            }

            showToast("La presentación está lista.", "default");
        });
    }
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

    return recuerdosDemoData.guestAlbumPreviewSeed;
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

function renderAlbumsSection() {
    const section = document.getElementById("albums-section");
    const searchInput = document.getElementById("guest-album-search");
    const summaryElement = document.getElementById("guest-albums-summary");
    const gridElement = document.getElementById("guest-albums-grid");

    if (!section) {
        return;
    }

    section.innerHTML = `
        <div class="recuerdos-section-copy">
            <p class="recuerdos-section-kicker">Álbumes</p>
            <h2>Mis Recuerdos y álbumes de invitados</h2>
            <p>El espacio reúne tu álbum personal, el buscador y la lista de álbumes visibles para recorrer.</p>
        </div>

        <div class="albums-layout">
            <article class="personal-album">
                <div class="personal-album-header">
                    <p class="recuerdos-section-kicker">Mis Recuerdos</p>
                    <h3 id="personal-album-title">Mi álbum</h3>
                    <p id="personal-album-description" class="personal-album-description">Tu espacio personal se completa con fotos y video cuando se conecta la persistencia.</p>
                </div>

                <div class="personal-album-actions" aria-label="Acciones del álbum personal">
                    <button id="personal-upload-photos-btn" class="btn-rectangular" type="button"><i class="fa-solid fa-camera" aria-hidden="true" style="margin-right: 0.45rem;"></i>Subir fotografías</button>
                    <button id="personal-upload-video-btn" class="btn-rectangular btn-secundario" type="button"><i class="fa-solid fa-video" aria-hidden="true" style="margin-right: 0.45rem;"></i>Subir video</button>
                </div>

                <div id="personal-upload-progress" class="personal-upload-progress" hidden aria-live="polite">
                    <div class="personal-upload-progress-label">
                        <span>Organizando tu recuerdo</span>
                        <span id="personal-upload-progress-text">0%</span>
                    </div>
                    <div class="personal-upload-progress-track">
                        <div id="personal-upload-progress-bar" class="personal-upload-progress-bar"></div>
                    </div>
                </div>

                <div id="personal-album-empty-state" class="album-empty-state" hidden>
                    <i class="fa-solid fa-photo-film album-empty-icon" aria-hidden="true"></i>
                    <h3>Tu álbum está esperando recuerdos</h3>
                    <p>Cuando haya contenido real, este bloque mostrará el material de tu sesión.</p>
                </div>

                <div id="personal-album-media-list" class="personal-album-media-list" aria-live="polite"></div>
            </article>

            <aside class="guest-albums">
                <div class="guest-albums-header">
                    <p class="recuerdos-section-kicker">Buscar invitados</p>
                    <h3>Explorar álbumes</h3>
                    <p>El listado se mantiene simple y ordenado.</p>
                </div>

                <label class="guest-search-field" for="guest-album-search">
                    <span>Buscar por nombre</span>
                    <input id="guest-album-search" type="search" autocomplete="off" placeholder="Escribí un nombre para explorar">
                </label>

                <div class="guest-albums-summary" id="guest-albums-summary">Todavía no se están mostrando álbumes de invitados.</div>
                <div id="guest-albums-grid" class="guest-albums-grid" aria-live="polite"></div>
            </aside>
        </div>
    `;

    const refreshedSearchInput = document.getElementById("guest-album-search");
    const refreshedSummaryElement = document.getElementById("guest-albums-summary");
    const refreshedGridElement = document.getElementById("guest-albums-grid");
    const profile = getStoredAccessProfile();

    renderPersonalAlbumPreview();

    const renderDirectory = (query) => {
        if (!refreshedSummaryElement || !refreshedGridElement) {
            return;
        }

        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            const defaults = recuerdosDemoData.guestAlbumPreviewSeed;
            refreshedSummaryElement.textContent = `${defaults.length} álbumes visibles para recorrer en esta sección.`;
            refreshedGridElement.innerHTML = defaults.map((album) => `
                <article class="guest-album-item ${album.accentClass}">
                    <span class="guest-album-initials" aria-hidden="true">${escapeHTML(album.initials)}</span>
                    <div class="guest-album-copy">
                        <p class="guest-album-owner">${escapeHTML(album.ownerName)}</p>
                        <h4 class="guest-album-title">${escapeHTML(album.title)}</h4>
                    <p class="guest-album-meta">${album.photoCount} recuerdo${album.photoCount === 1 ? "" : "s"} compartido${album.photoCount === 1 ? "" : "s"}</p>
                </div>
            </article>
        `).join("");
            return;
        }

        const matches = recuerdosDemoData.albumDirectory.filter((album) =>
            `${album.ownerName} ${album.title} ${album.note}`.toLowerCase().includes(normalizedQuery)
        );

        refreshedSummaryElement.textContent = matches.length
            ? `${matches.length} álbum${matches.length === 1 ? "" : "es"} encontrado${matches.length === 1 ? "" : "s"}`
            : "No hay resultados para esa búsqueda.";

        refreshedGridElement.innerHTML = matches.map((album) => `
            <article class="guest-album-item ${album.accent}">
                <span class="guest-album-initials" aria-hidden="true">${escapeHTML(album.initials)}</span>
                <div class="guest-album-copy">
                    <p class="guest-album-owner">${escapeHTML(album.ownerName)}</p>
                    <h4 class="guest-album-title">${escapeHTML(album.title)}</h4>
                    <p class="guest-album-meta">${album.photoCount} recuerdo${album.photoCount === 1 ? "" : "s"} disponibles</p>
                    <p class="guest-album-note">${escapeHTML(album.note)}</p>
                </div>
            </article>
        `).join("");
    };

    if (refreshedSearchInput) {
        refreshedSearchInput.oninput = (event) => renderDirectory(event.target.value);
        renderDirectory(refreshedSearchInput.value);
    }

    if (profile && profile.type === "guest" && profile.name) {
        ensurePersonalAlbum(profile.name);
    }
}

function renderAll() {
    updateLandingContent();
    renderOfficialPhotosSection();
    renderMessageBoardSection();
    renderPresentationSection();
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
    renderAll();
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
    renderAll();
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

renderRecuerdosAppShell();
renderAccessModalShell();
initializeAccessFlow();
initializeToastInteractions();
renderAll();
