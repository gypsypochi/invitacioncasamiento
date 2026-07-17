// --- REPRODUCTOR DE MÚSICA COMPARTIDO ---

const musicPlaylist = [
    {
        title: "Unchained Melody",
        artist: "The Righteous Brothers",
        duration: "03:36",
        file: "assets/unchained melody.mp3"
    },
    {
        title: "A Thousand Years",
        artist: "Christina Perri",
        duration: "04:45",
        file: "assets/A Thousand Years  - Christina Perri.mp3"
    },
    {
        title: "All Of Me",
        artist: "John Legend",
        duration: "04:29",
        file: "assets/All Of Me - John Legend.mp3"
    },
    {
        title: "Can't Help Falling In Love",
        artist: "Elvis Presley",
        duration: "02:59",
        file: "assets/Can't Help Falling In Love - Elvis Presley.mp3"
    }
];

let audio = null;
let currentTrackIndex = 0;
let isPlaying = false;

// Variables de UI
let playBtn = null;
let prevBtn = null;
let nextBtn = null;
let volumeSlider = null;
let volumeIcon = null;
let trackTitle = null;
let trackArtist = null;

// 1. Inicialización de Audio
function initAudio() {
    audio = document.getElementById("bg-music");
    
    if (!audio) {
        audio = document.createElement("audio");
        audio.id = "bg-music";
        document.body.appendChild(audio);
    }
    
    audio.loop = false; // Importante para que dispare el evento 'ended'

    // Cargar estado persistido localmente para este usuario
    currentTrackIndex = parseInt(localStorage.getItem("centroRecuerdosMusicTrackIndex") || "0", 10);
    const savedTime = parseFloat(localStorage.getItem("centroRecuerdosMusicTime") || "0");
    const savedVolume = localStorage.getItem("centroRecuerdosMusicVolume");
    const savedMuted = localStorage.getItem("centroRecuerdosMusicMuted") === "true";
    const savedIsPlaying = localStorage.getItem("centroRecuerdosMusicIsPlaying") === "true";

    if (currentTrackIndex < 0 || currentTrackIndex >= musicPlaylist.length) {
        currentTrackIndex = 0;
    }

    loadTrack(currentTrackIndex);
    audio.currentTime = savedTime;

    if (savedVolume !== null) {
        audio.volume = parseFloat(savedVolume);
    } else {
        audio.volume = 1.0;
    }
    audio.muted = savedMuted;

    // Registrar eventos del audio
    audio.addEventListener("ended", () => {
        nextTrack();
    });

    audio.addEventListener("error", (e) => {
        console.error("[MusicPlayer] Error en la reproducción de audio:", e);
    });

    // Intentar reanudar si estaba reproduciendo
    if (savedIsPlaying) {
        audio.play().then(() => {
            isPlaying = true;
            updatePlayButtonUI();
        }).catch((err) => {
            console.log("[MusicPlayer] Autoplay bloqueado. Esperando interacción del usuario.");
            isPlaying = false;
            updatePlayButtonUI();

            // Escuchar el primer clic en la página para iniciar
            const startPlayOnInteraction = () => {
                playTrack();
                document.removeEventListener("click", startPlayOnInteraction);
                document.removeEventListener("touchstart", startPlayOnInteraction);
            };
            document.addEventListener("click", startPlayOnInteraction);
            document.addEventListener("touchstart", startPlayOnInteraction);
        });
    }

    // Registrar guardado periódico de tiempo para evitar desajustes grandes
    setInterval(() => {
        if (audio && isPlaying) {
            localStorage.setItem("centroRecuerdosMusicTime", audio.currentTime);
        }
    }, 1500);
}

// 2. Guardar estado antes de salir de la página
function savePlayerState() {
    if (audio) {
        localStorage.setItem("centroRecuerdosMusicTrackIndex", currentTrackIndex);
        localStorage.setItem("centroRecuerdosMusicTime", audio.currentTime);
        localStorage.setItem("centroRecuerdosMusicIsPlaying", isPlaying ? "true" : "false");
        localStorage.setItem("centroRecuerdosMusicVolume", audio.volume);
        localStorage.setItem("centroRecuerdosMusicMuted", audio.muted ? "true" : "false");
    }
}

window.addEventListener("beforeunload", savePlayerState);
window.addEventListener("pagehide", savePlayerState);

// 3. Funciones de reproducción
function loadTrack(index) {
    const track = musicPlaylist[index];
    if (audio && track) {
        audio.src = track.file;
        updateTrackInfoUI();
    }
}

function playTrack() {
    if (!audio) return;

    audio.play().then(() => {
        isPlaying = true;
        updatePlayButtonUI();
        savePlayerState();
    }).catch((error) => console.log("[MusicPlayer] Error al reproducir:", error));
}

function pauseTrack() {
    if (!audio) return;

    audio.pause();
    isPlaying = false;
    updatePlayButtonUI();
    savePlayerState();
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length;
    loadTrack(currentTrackIndex);
    audio.currentTime = 0;
    playTrack();
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
    loadTrack(currentTrackIndex);
    audio.currentTime = 0;
    playTrack();
}

// 4. Actualización de Interfaz Gráfica
function updatePlayButtonUI() {
    if (playBtn) {
        playBtn.innerHTML = isPlaying 
            ? '<i class="fa-solid fa-pause"></i>' 
            : '<i class="fa-solid fa-play"></i>';
    }
}

// Asegurar que si la página tarda en cargar, los controles se actualicen al cambiar la pista
function updateTrackInfoUI() {
    const track = musicPlaylist[currentTrackIndex];
    if (track) {
        if (trackTitle) trackTitle.textContent = track.title;
        if (trackArtist) trackArtist.textContent = track.artist;
    }
}

function updateVolumeIconUI(volume) {
    if (!volumeIcon) return;

    if (volume == 0 || audio.muted) {
        volumeIcon.className = "fa-solid fa-volume-xmark";
    } else if (volume < 0.5) {
        volumeIcon.className = "fa-solid fa-volume-low";
    } else {
        volumeIcon.className = "fa-solid fa-volume-high";
    }
}

// 5. Inicialización de los elementos UI
function initMusicPlayerUI() {
    playBtn = document.getElementById("play-music-btn");
    prevBtn = document.getElementById("player-prev-btn");
    nextBtn = document.getElementById("player-next-btn");
    volumeSlider = document.getElementById("player-volume-slider");
    volumeIcon = document.getElementById("player-volume-icon");
    trackTitle = document.getElementById("player-track-title");
    trackArtist = document.getElementById("player-track-artist");

    if (playBtn) {
        playBtn.onclick = () => {
            if (isPlaying) {
                pauseTrack();
            } else {
                playTrack();
            }
        };
    }

    if (prevBtn) {
        prevBtn.onclick = prevTrack;
    }

    if (nextBtn) {
        nextBtn.onclick = nextTrack;
    }

    if (volumeSlider && audio) {
        volumeSlider.value = audio.volume;
        volumeSlider.oninput = (event) => {
            audio.volume = event.target.value;
            updateVolumeIconUI(event.target.value);
            savePlayerState();
        };
    }

    if (volumeIcon && audio) {
        updateVolumeIconUI(audio.volume);
        volumeIcon.onclick = () => {
            if (audio.muted) {
                audio.muted = false;
                updateVolumeIconUI(audio.volume);
            } else {
                audio.muted = true;
                volumeIcon.className = "fa-solid fa-volume-xmark";
            }
            savePlayerState();
        };
    }

    // Clic inicial de interacción del body por si está parado
    const playOnceOnBodyClick = () => {
        if (!isPlaying) {
            playTrack();
        }
        document.body.removeEventListener("click", playOnceOnBodyClick);
    };
    document.body.addEventListener("click", playOnceOnBodyClick, { once: true });

    updateTrackInfoUI();
    updatePlayButtonUI();
}

// 6. Carga automática inicial
if (document.readyState !== "loading") {
    initAudio();
    initMusicPlayerUI();
} else {
    window.addEventListener("DOMContentLoaded", () => {
        initAudio();
        initMusicPlayerUI();
    });
}

// Exponer funciones globales
window.initMusicPlayerUI = initMusicPlayerUI;
window.musicPlayerPlaylist = musicPlaylist;
