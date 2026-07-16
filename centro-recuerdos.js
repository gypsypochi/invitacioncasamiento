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
const wallStorageKey = "centroRecuerdosWallMessages";

const officialAlbumSeed = [
    {
        id: "official-seed-1",
        title: "Ceremonia",
        alt: "Marcela y Jorge durante la ceremonia",
        src: "assets/album-oficial/official-1.jpg",
        fallbackSrc: "assets/img-1.png"
    },
    {
        id: "official-seed-2",
        title: "Miradas",
        alt: "Un momento emotivo compartido por los novios",
        src: "assets/album-oficial/official-2.jpg",
        fallbackSrc: "assets/img-2.png"
    },
    {
        id: "official-seed-3",
        title: "Celebración",
        alt: "La celebración del casamiento",
        src: "assets/album-oficial/official-3.jpg",
        fallbackSrc: "assets/img-3.png"
    },
    {
        id: "official-seed-4",
        title: "Fiesta",
        alt: "Una imagen de la fiesta y el baile",
        src: "assets/album-oficial/official-4.jpg",
        fallbackSrc: "assets/img-4.png"
    }
];

const recuerdosAppState = {
    messageColor: "rose",
    officialAlbum: {
        initialized: false,
        seedItems: [],
        uploadedItems: [],
        activeIndex: 0,
        lightboxIndex: null,
        adminPanelOpen: false
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
        createdAt: source.createdAt || new Date().toISOString()
    };
}

function initializeOfficialAlbumState() {
    const officialAlbumState = recuerdosAppState.officialAlbum;

    if (officialAlbumState.initialized) {
        return;
    }

    officialAlbumState.seedItems = officialAlbumSeed.map((item) => createOfficialAlbumItem(item, "seed"));
    officialAlbumState.uploadedItems = [];
    officialAlbumState.initialized = true;
}

function getOfficialAlbumVisibleItems(profile = getStoredAccessProfile()) {
    initializeOfficialAlbumState();

    const officialAlbumState = recuerdosAppState.officialAlbum;
    const isAdmin = profile && profile.type === "admin";

    return isAdmin
        ? officialAlbumState.seedItems.concat(officialAlbumState.uploadedItems)
        : officialAlbumState.uploadedItems.slice();
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

function renderOfficialAlbumEmptyState() {
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
        createdAt: new Date().toISOString()
    };
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
    const nextItems = imageFiles.map(createOfficialAlbumUploadItem);

    officialAlbumState.uploadedItems = officialAlbumState.uploadedItems.concat(nextItems);

    renderOfficialPhotosSection();
    showToast(`${imageFiles.length} fotografía${imageFiles.length === 1 ? "" : "s"} agregada${imageFiles.length === 1 ? "" : "s"} a la galería.`, "success");
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

    if (targetItem.origin === "upload" && targetItem.objectUrl) {
        window.URL.revokeObjectURL(targetItem.objectUrl);
    }

    if (targetItem.origin === "seed") {
        officialAlbumState.seedItems = officialAlbumState.seedItems.filter((item) => item.id !== targetItem.id);
    } else {
        officialAlbumState.uploadedItems = officialAlbumState.uploadedItems.filter((item) => item.id !== targetItem.id);
    }

    const nextItems = getOfficialAlbumVisibleItems(profile);

    if (!nextItems.length) {
        officialAlbumState.activeIndex = 0;
        officialAlbumState.lightboxIndex = null;
        officialAlbumState.adminPanelOpen = false;
        document.removeEventListener("keydown", handleOfficialAlbumKeydown);
        renderOfficialPhotosSection();
        syncOfficialAlbumBodyLock();
        return;
    }

    if (officialAlbumState.activeIndex >= nextItems.length) {
        officialAlbumState.activeIndex = nextItems.length - 1;
    }

    if (officialAlbumState.lightboxIndex !== null) {
        if (officialAlbumState.lightboxIndex === index) {
            officialAlbumState.lightboxIndex = Math.min(index, nextItems.length - 1);
        } else if (officialAlbumState.lightboxIndex > index) {
            officialAlbumState.lightboxIndex -= 1;
        }
    }

    renderOfficialPhotosSection();
    syncOfficialAlbumBodyLock();
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
    return {
        id: message.id || "wall-" + Date.now() + "-" + index,
        author: message.author || "Invitado",
        ownerKey: message.ownerKey || "visitor",
        createdAt: message.createdAt || new Date().toISOString(),
        text: message.text || "",
        color: message.color || palette[index % palette.length].key
    };
}

function getStoredWallMessages() {
    const storedMessages = localStorage.getItem(wallStorageKey);

    if (storedMessages) {
        try {
            return JSON.parse(storedMessages).map((message, index) => normalizeWallMessage(message, index));
        } catch (error) {
            return [];
        }
    }

    return recuerdosDemoData.messageBoardSeed.map((message, index) => normalizeWallMessage({
        id: "seed-" + index,
        author: message.author,
        ownerKey: "seed-" + index,
        createdAt: new Date(Date.now() - ((index + 1) * 3600 * 1000)).toISOString(),
        text: message.message,
        color: getWallColorPalette()[index % getWallColorPalette().length].key
    }, index));
}

function saveWallMessages(messages) {
    localStorage.setItem(wallStorageKey, JSON.stringify(messages.map((message, index) => normalizeWallMessage(message, index))));
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
    const normalizedName = guestName.trim();
    const profile = getStoredAccessProfile();
    const albums = getStoredAlbums().map((album) => normalizeGuestAlbumRecord(album));
    let existingAlbum = null;

    if (profile && profile.type === "guest" && profile.albumId) {
        existingAlbum = albums.find((album) => album.id === profile.albumId) || null;
    }

    if (!existingAlbum) {
        existingAlbum = albums.find((album) => album.ownerType === "guest" && album.ownerName === normalizedName) || null;
    }

    if (existingAlbum) {
        if (profile && profile.type === "guest" && profile.albumId !== existingAlbum.id) {
            const nextProfile = {
                ...profile,
                albumId: existingAlbum.id
            };
            localStorage.setItem(accessStorageKey, JSON.stringify(nextProfile));
        }

        saveAlbums(albums.map((album) => normalizeGuestAlbumRecord(album)));
        return existingAlbum;
    }

    const newAlbum = normalizeGuestAlbumRecord({
        id: generateGuestAlbumId(),
        ownerName: normalizedName,
        ownerType: "guest",
        createdAt: new Date().toISOString(),
        photos: [],
        video: null
    });

    albums.push(newAlbum);
    saveAlbums(albums);

    if (profile && profile.type === "guest") {
        const nextProfile = {
            ...profile,
            albumId: newAlbum.id
        };
        localStorage.setItem(accessStorageKey, JSON.stringify(nextProfile));
    }

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

    section.className = "section bg-lavanda";

    section.innerHTML = `
        <i class="fa-solid fa-camera icon-evento" aria-hidden="true"></i>
        <h2>Álbum Oficial</h2>
        <p class="official-photos-lead">${hasOfficialPhotos
            ? "La galería oficial reúne fotografías locales de prueba para validar la experiencia del frontend."
            : "Pronto se subirán las fotografías oficiales."}</p>
        ${hasOfficialPhotos ? `
            <p class="official-photos-note">Seleccioná una miniatura o abrí la fotografía principal para verla en detalle.</p>
        ` : ""}

        <div class="official-photos-actions"${isAdmin ? "" : " hidden"}>
            <button class="btn-rectangular" type="button" data-official-action="upload">Subir fotografías</button>
            <button class="btn-rectangular btn-secundario" type="button" data-official-action="manage">${officialAlbumState.adminPanelOpen ? "Cerrar administración" : "Administrar fotografías"}</button>
        </div>

        <input id="official-photos-input" type="file" accept="image/*" multiple hidden>

        <div class="official-album-shell">
            ${hasOfficialPhotos
                ? renderOfficialAlbumGallery(items, activeIndex)
                : renderOfficialAlbumEmptyState()}
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
    const messages = getStoredWallMessages();

    boardElement.innerHTML = messages.map((message) => {
        const canManageMessage = message.ownerKey === currentOwnerKey && currentOwnerKey !== "visitor";

        return `
            <article class="message-note accent-${escapeHTML(message.color)}">
                <div class="message-note-head">
                    <strong class="message-note-author">${escapeHTML(message.author)}</strong>
                    <span class="message-note-meta">${escapeHTML(formatWallTimestamp(message.createdAt))}</span>
                </div>
                <p class="message-note-text">${escapeHTML(message.text)}</p>
                ${canManageMessage ? `
                    <div class="message-note-actions">
                        <button type="button" class="message-note-action" data-action="edit" data-message-id="${escapeHTML(message.id)}">Editar</button>
                        <button type="button" class="message-note-action" data-action="delete" data-message-id="${escapeHTML(message.id)}">Eliminar</button>
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
    const messages = getStoredWallMessages();
    const messageIndex = messages.findIndex((message) => message.id === messageId);

    if (messageIndex === -1) {
        return;
    }

    const message = messages[messageIndex];

    if (message.ownerKey !== currentOwnerKey || currentOwnerKey === "visitor") {
        return;
    }

    if (action === "delete") {
        if (!window.confirm("¿Querés eliminar este mensaje?")) {
            return;
        }

        messages.splice(messageIndex, 1);
        saveWallMessages(messages);
        renderMessageBoardCards();
        return;
    }

    if (action === "edit") {
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
        composerButton.addEventListener("click", () => {
            const text = composerInput ? composerInput.value.trim() : "";

            if (!text) {
                showToast("Escribí un mensaje para dejar tu saludo.", "default");
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
    const messages = getStoredWallMessages();

    boardElement.innerHTML = messages.map((message) => {
        const canManageMessage = message.ownerKey === currentOwnerKey && currentOwnerKey !== "visitor";

        return `
            <article class="message-note accent-${escapeHTML(message.color)}">
                <div class="message-note-head">
                    <strong class="message-note-author">${escapeHTML(message.author)}</strong>
                    <span class="message-note-meta">${escapeHTML(formatWallTimestamp(message.createdAt))}</span>
                </div>
                <p class="message-note-text">${escapeHTML(message.text)}</p>
                ${canManageMessage ? `
                    <div class="message-note-actions">
                        <button type="button" class="message-note-action" data-action="edit" data-message-id="${escapeHTML(message.id)}">Editar</button>
                        <button type="button" class="message-note-action" data-action="delete" data-message-id="${escapeHTML(message.id)}">Eliminar</button>
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
    const messages = getStoredWallMessages();
    const messageIndex = messages.findIndex((message) => message.id === messageId);

    if (messageIndex === -1) {
        return;
    }

    const message = messages[messageIndex];

    if (message.ownerKey !== currentOwnerKey || currentOwnerKey === "visitor") {
        return;
    }

    if (action === "delete") {
        if (!window.confirm("¿Querés eliminar este mensaje?")) {
            return;
        }

        messages.splice(messageIndex, 1);
        saveWallMessages(messages);
        renderMessageBoardCards();
        return;
    }

    if (action === "edit") {
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
    const demoAlbums = [
        { ownerName: "Julieta" },
        { ownerName: "Sofía" },
        { ownerName: "Nicolás" },
        { ownerName: "Camila" },
        { ownerName: "Laura" }
    ];

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
        const filteredAlbums = demoAlbums.filter((album) => album.ownerName.toLowerCase().includes(normalizedQuery));

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
    const demoAlbums = ["Julieta", "Sofía", "Nicolás", "Camila", "Laura"];

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
        const filteredAlbums = demoAlbums.filter((ownerName) => ownerName.toLowerCase().includes(normalizedQuery));

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

const guestAlbumSeedCatalog = [
    {
        id: "seed-familia",
        ownerName: "Familia",
        ownerType: "guest",
        createdAt: "2026-07-16T00:00:00.000Z",
        photos: [
            { id: "seed-familia-1", name: "Familia 1", src: "assets/img-1.png", createdAt: "2026-07-16T00:00:00.000Z" },
            { id: "seed-familia-2", name: "Familia 2", src: "assets/img-2.png", createdAt: "2026-07-16T00:01:00.000Z" }
        ],
        video: null
    },
    {
        id: "seed-amigos",
        ownerName: "Amigos",
        ownerType: "guest",
        createdAt: "2026-07-16T00:02:00.000Z",
        photos: [
            { id: "seed-amigos-1", name: "Amigos 1", src: "assets/img-3.png", createdAt: "2026-07-16T00:02:00.000Z" },
            { id: "seed-amigos-2", name: "Amigos 2", src: "assets/img-4.png", createdAt: "2026-07-16T00:03:00.000Z" }
        ],
        video: null
    },
    {
        id: "seed-bailando",
        ownerName: "Bailando",
        ownerType: "guest",
        createdAt: "2026-07-16T00:04:00.000Z",
        photos: [
            { id: "seed-bailando-1", name: "Baile 1", src: "assets/img-4.png", createdAt: "2026-07-16T00:04:00.000Z" }
        ],
        video: null
    },
    {
        id: "seed-mesa",
        ownerName: "Mesa",
        ownerType: "guest",
        createdAt: "2026-07-16T00:05:00.000Z",
        photos: [
            { id: "seed-mesa-1", name: "Mesa 1", src: "assets/img-2.png", createdAt: "2026-07-16T00:05:00.000Z" },
            { id: "seed-mesa-2", name: "Mesa 2", src: "assets/img-1.png", createdAt: "2026-07-16T00:06:00.000Z" }
        ],
        video: null
    },
    {
        id: "seed-celebracion",
        ownerName: "Celebración",
        ownerType: "guest",
        createdAt: "2026-07-16T00:07:00.000Z",
        photos: [
            { id: "seed-celebracion-1", name: "Celebración 1", src: "assets/img-3.png", createdAt: "2026-07-16T00:07:00.000Z" }
        ],
        video: null
    },
    {
        id: "seed-brindis",
        ownerName: "Brindis",
        ownerType: "guest",
        createdAt: "2026-07-16T00:08:00.000Z",
        photos: [
            { id: "seed-brindis-1", name: "Brindis 1", src: "assets/img-1.png", createdAt: "2026-07-16T00:08:00.000Z" }
        ],
        video: null
    },
    {
        id: "seed-detalles",
        ownerName: "Detalles",
        ownerType: "guest",
        createdAt: "2026-07-16T00:09:00.000Z",
        photos: [
            { id: "seed-detalles-1", name: "Detalles 1", src: "assets/img-2.png", createdAt: "2026-07-16T00:09:00.000Z" }
        ],
        video: null
    },
    {
        id: "seed-entradas",
        ownerName: "Entradas",
        ownerType: "guest",
        createdAt: "2026-07-16T00:10:00.000Z",
        photos: [
            { id: "seed-entradas-1", name: "Entrada 1", src: "assets/img-3.png", createdAt: "2026-07-16T00:10:00.000Z" },
            { id: "seed-entradas-2", name: "Entrada 2", src: "assets/img-4.png", createdAt: "2026-07-16T00:11:00.000Z" }
        ],
        video: null
    },
    {
        id: "seed-sonrisas",
        ownerName: "Sonrisas",
        ownerType: "guest",
        createdAt: "2026-07-16T00:12:00.000Z",
        photos: [
            { id: "seed-sonrisas-1", name: "Sonrisa 1", src: "assets/img-4.png", createdAt: "2026-07-16T00:12:00.000Z" }
        ],
        video: null
    },
    {
        id: "seed-recuerdos",
        ownerName: "Recuerdos",
        ownerType: "guest",
        createdAt: "2026-07-16T00:13:00.000Z",
        photos: [
            { id: "seed-recuerdos-1", name: "Recuerdo 1", src: "assets/img-1.png", createdAt: "2026-07-16T00:13:00.000Z" },
            { id: "seed-recuerdos-2", name: "Recuerdo 2", src: "assets/img-2.png", createdAt: "2026-07-16T00:14:00.000Z" }
        ],
        video: null
    }
];

const guestCenterState = {
    visibleCount: 5,
    personalVisibleCount: 8,
    albumsPage: 1,
    personalPage: 1,
    searchQuery: "",
    viewer: {
        open: false,
        items: [],
        index: 0,
        title: ""
    }
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
        objectUrl: item.objectUrl || item.src || null
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
        createdAt: album.createdAt || new Date().toISOString(),
        photos,
        video: album.video ? normalizeGuestMediaItem(album.video, "video") : null
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
    const rawAlbums = localStorage.getItem(guestAlbumsStorageKey);

    if (!rawAlbums) {
        return [];
    }

    try {
        return JSON.parse(rawAlbums).map((album) => normalizeGuestAlbumRecord(album)).filter(Boolean);
    } catch (error) {
        return [];
    }
}

function saveStoredGuestAlbums(albums) {
    localStorage.setItem(guestAlbumsStorageKey, JSON.stringify(albums.map((album) => normalizeGuestAlbumRecord(album)).filter(Boolean)));
}

function getGuestSeedAlbums() {
    return guestAlbumSeedCatalog.map((album) => normalizeGuestAlbumRecord(album)).filter(Boolean);
}

function getCurrentGuestAlbum(profile = getStoredAccessProfile()) {
    if (!profile || profile.type !== "guest" || !profile.name) {
        return null;
    }

    const storedAlbums = getStoredGuestAlbums();
    const byId = profile.albumId ? storedAlbums.find((album) => album.id === profile.albumId) : null;

    if (byId) {
        return byId;
    }

    const byName = storedAlbums.find((album) => album.ownerName === profile.name && album.ownerType === "guest");

    if (byName) {
        return byName;
    }

    return normalizeGuestAlbumRecord({
        id: generateGuestId("guest-album"),
        ownerName: profile.name,
        ownerType: "guest",
        createdAt: new Date().toISOString(),
        photos: [],
        video: null
    });
}

function getGuestPublicAlbums(profile = getStoredAccessProfile()) {
    const currentAlbum = getCurrentGuestAlbum(profile);
    const hasCurrentContent = Boolean(currentAlbum && ((currentAlbum.photos || []).length > 0 || currentAlbum.video));
    const storedPublicAlbums = getStoredGuestAlbums()
        .filter((album) => album.photos.length > 0 || album.video)
        .filter((album) => !currentAlbum || album.id !== currentAlbum.id);

    return [
        ...(hasCurrentContent ? [currentAlbum] : []),
        ...storedPublicAlbums,
        ...getGuestSeedAlbums()
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

    localStorage.setItem(accessStorageKey, JSON.stringify(nextProfile));
}

function getOrCreateCurrentGuestAlbum() {
    const profile = getStoredAccessProfile();

    if (!profile || profile.type !== "guest" || !profile.name) {
        return null;
    }

    const storedAlbums = getStoredGuestAlbums();
    let album = getCurrentGuestAlbum(profile);

    if (album && storedAlbums.find((item) => item.id === album.id)) {
        return album;
    }

    if (album && !storedAlbums.find((item) => item.id === album.id)) {
        storedAlbums.push(album);
        saveStoredGuestAlbums(storedAlbums);
        updateGuestProfileAlbumId(album);
        return album;
    }

    album = normalizeGuestAlbumRecord({
        id: generateGuestId("guest-album"),
        ownerName: profile.name,
        ownerType: "guest",
        createdAt: new Date().toISOString(),
        photos: [],
        video: null
    });

    storedAlbums.push(album);
    saveStoredGuestAlbums(storedAlbums);
    updateGuestProfileAlbumId(album);
    return album;
}

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

    listElement.innerHTML = hasContent ? items.map((item, index) => `
        <article class="guest-personal-media-item ${item.kind === "video" ? "is-video" : "is-photo"}">
            <button class="guest-personal-media-visual" type="button" data-guest-action="open-personal-media" data-guest-media-index="${index}" aria-label="Abrir ${escapeHTML(item.displayName)}">
                ${item.kind === "video" ? `
                    <span class="guest-personal-media-play"><i class="fa-solid fa-play" aria-hidden="true"></i></span>
                ` : `
                    <img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.displayName)}">
                `}
            </button>
            <div class="guest-personal-media-copy">
                <p class="personal-media-kind">${item.kind === "video" ? "Video" : "Foto"}</p>
                <h4 class="personal-media-title">${escapeHTML(item.displayName)}</h4>
                <p class="personal-media-meta">${item.kind === "video" ? "Guardado en tu álbum" : "Guardada en tu álbum"}</p>
            </div>
            <button class="guest-personal-delete-btn" type="button" data-guest-action="delete-personal-media" data-guest-media-id="${escapeHTML(item.id)}" aria-label="Eliminar ${escapeHTML(item.displayName)}">
                <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
            </button>
        </article>
    `).join("") : "";

    emptyStateElement.hidden = hasContent;
    listElement.hidden = !hasContent;
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

    if (isPhoto) {
        const targetPhoto = album.photos.find((photo) => photo.id === mediaId);
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

function openGuestMediaFromAlbum(albumId, startIndex = 0) {
    const profile = getStoredAccessProfile();
    const album = albumId === (profile && profile.albumId)
        ? getOrCreateCurrentGuestAlbum()
        : [...getGuestPublicAlbums(profile), getOrCreateCurrentGuestAlbum()].find((item) => item && item.id === albumId);

    if (!album) {
        return;
    }

    const items = getGuestAlbumMediaItems(album);
    openGuestViewer(items, startIndex, album.ownerName);
}

function openGuestPresentation() {
    const profile = getStoredAccessProfile();
    const currentAlbum = getOrCreateCurrentGuestAlbum();
    const catalog = [currentAlbum, ...getGuestPublicAlbums(profile)].filter(Boolean);
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
        </div>

        ${renderGuestViewer()}
    `;
}

function bindAdminAlbumInteractions() {
    const searchInput = document.getElementById("guest-album-search");
    const grid = document.getElementById("guest-albums-grid");
    const albumsPagination = document.getElementById("guest-albums-pagination");
    const viewer = document.getElementById("guest-media-viewer");

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
    const demoAlbums = ["Julieta", "Sofía", "Nicolás", "Camila", "Laura"];

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
        const filteredAlbums = demoAlbums.filter((ownerName) => ownerName.toLowerCase().includes(normalizedQuery));

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
                        <span class="guest-upload-tooltip" role="tooltip">Podés subir un video por vez. Tamaño máximo: 100 MB.</span>
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
