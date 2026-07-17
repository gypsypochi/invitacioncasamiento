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
    musicPlaylist: [
        {
            title: "Unchained Melody",
            artist: "The Righteous Brothers",
            duration: "03:36",
            file: "assets/audio/unchained-melody.mp3"
        }
    ]
};

// --- 2. APLICACIÓN DE LA CONFIGURACIÓN EN LA PÁGINA ---
function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function setHref(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.href = value;
    }
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

// --- 3. CUENTA REGRESIVA ---
const fechaBoda = new Date(eventConfig.event.dateTime).getTime();
let intervalo;

function formatTime(value) {
    return value < 10 ? "0" + value : value;
}

function showPostEventContent() {
    const postEventMessage = document.getElementById("post-event-message");
    const previewSection = document.getElementById("centro-recuerdos-preview");

    if (postEventMessage) {
        postEventMessage.hidden = false;
    }

    if (previewSection) {
        previewSection.hidden = false;
        previewSection.classList.add("fade-in");
    }
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

// --- 4. REPRODUCTOR DE MÚSICA ---
// Delegado al archivo compartido music-player.js para habilitar
// reproducción continua y sincronización con el Centro de Recuerdos.
