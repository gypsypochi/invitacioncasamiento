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
    musicPlaylist: [
        {
            title: "Unchained Melody",
            artist: "The Righteous Brothers",
            duration: "03:36",
            file: "assets/audio/unchained-melody.mp3"
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
const albumStorageKey = "centroRecuerdosAlbums";

function getStoredAccessProfile() {
    const storedProfile = localStorage.getItem(accessStorageKey);
    return storedProfile ? JSON.parse(storedProfile) : null;
}

function saveAccessProfile(profile) {
    localStorage.setItem(accessStorageKey, JSON.stringify(profile));
}

function getStoredAlbums() {
    const storedAlbums = localStorage.getItem(albumStorageKey);
    return storedAlbums ? JSON.parse(storedAlbums) : [];
}

function saveAlbums(albums) {
    localStorage.setItem(albumStorageKey, JSON.stringify(albums));
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
    return newAlbum;
}

function closeAccessModal() {
    document.getElementById("access-modal").hidden = true;
    document.body.classList.remove("modal-open");
}

function showAccessFeedback(message) {
    document.getElementById("access-feedback").textContent = message;
}

function setAccessMode(mode) {
    const isGuestMode = mode === "guest";

    document.getElementById("guest-access-option").classList.toggle("active", isGuestMode);
    document.getElementById("admin-access-option").classList.toggle("active", !isGuestMode);
    document.getElementById("guest-access-form").hidden = !isGuestMode;
    document.getElementById("admin-access-form").hidden = isGuestMode;
    showAccessFeedback("");
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
    createPersonalAlbum(guestName);
    closeAccessModal();
}

function handleAdminAccess(event) {
    event.preventDefault();

    const adminCode = document.getElementById("admin-code").value.trim();

    if (adminCode !== eventConfig.access.adminCode) {
        showAccessFeedback("Revisá el código administrador para ingresar.");
        return;
    }

    saveAccessProfile({
        type: "admin",
        enteredAt: new Date().toISOString()
    });
    closeAccessModal();
}

function initializeAccessFlow() {
    if (getStoredAccessProfile()) {
        closeAccessModal();
        return;
    }

    document.body.classList.add("modal-open");
    document.getElementById("guest-access-option").addEventListener("click", () => setAccessMode("guest"));
    document.getElementById("admin-access-option").addEventListener("click", () => setAccessMode("admin"));
    document.getElementById("guest-access-form").addEventListener("submit", handleGuestAccess);
    document.getElementById("admin-access-form").addEventListener("submit", handleAdminAccess);
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
    document.getElementById("centro-recuerdos-preview").hidden = false;
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

// --- 5. LÓGICA DEL REPRODUCTOR DE MÚSICA (CON AUTOPLAY) ---
const audio = document.getElementById("bg-music");
const playBtn = document.getElementById("play-music-btn");
let isPlaying = false;

// Función para alternar el botón de la música
function toggleMusic() {
    if (isPlaying) {
        audio.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Reproducir Música';
    } else {
        audio.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar Música';
    }
    isPlaying = !isPlaying;
}

// Escuchar el clic en el botón
playBtn.addEventListener("click", toggleMusic);

// Truco para el Autoplay: Arranca la música al primer clic o toque en la pantalla
document.body.addEventListener("click", function() {
    if (!isPlaying) {
        audio.play().then(() => {
            isPlaying = true;
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar Música';
        }).catch((error) => {
            console.log("El navegador bloqueó el autoplay", error);
        });
    }
}, { once: true });
