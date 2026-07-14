// --- 1. CONFIGURACIÓN DE LA FECHA DE LA BODA ---
const fechaBoda = new Date("June 27, 2026 21:00:00").getTime();

// --- 2. LÓGICA DE LA CUENTA REGRESIVA ---
const intervalo = setInterval(function() {
    const ahora = new Date().getTime();
    const distancia = fechaBoda - ahora;

    const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

    document.getElementById("dias").innerText = dias < 10 ? "0" + dias : dias;
    document.getElementById("horas").innerText = horas < 10 ? "0" + horas : horas;
    document.getElementById("minutos").innerText = minutos < 10 ? "0" + minutos : minutos;
    document.getElementById("segundos").innerText = segundos < 10 ? "0" + segundos : segundos;

    if (distancia < 0) {
        clearInterval(intervalo);
        document.getElementById("countdown-timer").innerHTML = "<h3 style='font-size: 2rem; color: var(--color-dorado);'>¡Llegó el gran día!</h3>";
    }
}, 1000);

// --- 3. LÓGICA DEL REPRODUCTOR DE MÚSICA (CON AUTOPLAY) ---
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