let pilotos = [];
let pilotoObjetivo;
let intentos = [];
const maxIntentos = 8;

const searchInput = document.getElementById('searchInput');
const suggestionsContainer = document.getElementById('suggestions');
const guessesContainer = document.getElementById('guesses');

// Función para obtener la fecha actual en formato YYYY-MM-DD
const obtenerFechaActual = () => {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

// Función para calcular el tiempo restante hasta la medianoche
const obtenerTiempoRestante = () => {
    const ahora = new Date();
    const medianoche = new Date(ahora);
    medianoche.setHours(24, 0, 0, 0);
    const diferencia = medianoche - ahora;
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${String(horas).padStart(2)} horas y ${String(minutos).padStart(2)} minutos.`;
}

// Función para generar una semilla basada en la fecha
function generarSemillaDiaria() {
    const fecha = obtenerFechaActual();
    let semilla = 0;
    for (let i = 0; i < fecha.length; i++) {
        semilla += fecha.charCodeAt(i);
    }
    return semilla;
}

// Función para obtener un piloto aleatorio basado en la fecha
function obtenerPilotoDiario(pilotos) {
    const semilla = generarSemillaDiaria();
    return pilotos[semilla % pilotos.length];
}

// Función para cargar el estado del juego
function cargarEstadoJuego() {
    const estadoGuardado = localStorage.getItem('motogpdle');
    if (estadoGuardado) {
        const estado = JSON.parse(estadoGuardado);
        if (estado.fecha === obtenerFechaActual()) {
            return estado;
        }
    }
    return null;
}

// Función para guardar el estado del juego
function guardarEstadoJuego() {
    if (modoExtra) return;
    const estado = {
        fecha: obtenerFechaActual(),
        intentos: intentos,
        completado: searchInput.disabled,
        pilotoObjetivo: pilotoObjetivo
    };
    localStorage.setItem('motogpdle', JSON.stringify(estado));
}

async function cargarPilotos() {
    try {
        const response = await fetch('https://motogp-datos.duckdns.org/clasificacion');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        const pilotosXML = xmlDoc.getElementsByTagName('worldstanding_rider');

        pilotos = Array.from(pilotosXML).map(pilotoXML => {
            const nombre = pilotoXML.getAttribute('rider_name');
            const apellidoMayus = pilotoXML.getAttribute('rider_surname');
            
            const apellido = apellidoMayus.charAt(0) + apellidoMayus.slice(1).toLowerCase();
            const nacionalidad = pilotoXML.getAttribute('country_shortname');
            const equipo = pilotoXML.getAttribute('team_name');
            const numero = parseInt(pilotoXML.getAttribute('rider_number'));

            return {
                nombre: `${nombre} ${apellido}`,
                nacionalidad: nacionalidad,
                equipo: equipo,
                numero: numero,
            };
        });

        // Cargar estado guardado o iniciar nuevo juego
        const estadoGuardado = cargarEstadoJuego();
        if (estadoGuardado) {
            intentos = estadoGuardado.intentos;
            pilotoObjetivo = estadoGuardado.pilotoObjetivo;
            searchInput.disabled = estadoGuardado.completado;

            document.getElementById('intentos-actuales').textContent = intentos.length;
            document.getElementById('intentos-maximos').textContent = maxIntentos;
            
            // Mostrar intentos anteriores
            intentos.forEach(intento => mostrarIntento(intento));
            
            // Mostrar mensaje si el juego estaba completado
            if (estadoGuardado.completado) {
                if (intentos[intentos.length - 1].nombre === pilotoObjetivo.nombre) {
                    mostrarMensajeFinal('¡Victoria!', '¡Felicidades! Has encontrado al piloto correcto.', 'success');
                } else {
                    mostrarMensajeFinal('¡Fin del juego!', `Se acabaron los intentos. <br>El piloto era <b>${pilotoObjetivo.nombre}</b>`, 'error');
                }
            }
        } else {
            pilotoObjetivo = obtenerPilotoDiario(pilotos);
        }
    } catch (error) {
        mostrarMensaje('Error', 'No se pudieron cargar los datos de los pilotos', 'error');
    }
}

document.addEventListener('DOMContentLoaded', cargarPilotos);

searchInput.addEventListener('input', (e) => {
    const valor = e.target.value.toLowerCase();
    if (valor.length < 2) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    const sugerencias = pilotos
        .filter(piloto => 
            piloto.nombre.toLowerCase().includes(valor) &&
            !intentos.some(intento => intento.nombre === piloto.nombre)
        )
        .slice(0, 5);

    if (sugerencias.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    suggestionsContainer.innerHTML = '';
    sugerencias.forEach(piloto => {
        const div = document.createElement('div');
        div.className = 'suggestion';
        div.textContent = piloto.nombre;
        div.addEventListener('click', () => seleccionarPiloto(piloto));
        suggestionsContainer.appendChild(div);
    });
    suggestionsContainer.style.display = 'block';
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        suggestionsContainer.style.display = 'none';
    }
});

function seleccionarPiloto(piloto) {
    intentos.push(piloto);
    searchInput.value = '';
    suggestionsContainer.style.display = 'none';
    mostrarIntento(piloto);

    if (piloto.nombre === pilotoObjetivo.nombre) {
        mostrarMensajeFinal('¡Victoria!', '¡Felicidades! Has encontrado al piloto correcto.', 'success');
        searchInput.disabled = true;
    } else if (intentos.length >= maxIntentos) {
        mostrarMensajeFinal('¡Fin del juego!', `Se acabaron los intentos. <br>El piloto era <b>${pilotoObjetivo.nombre}</b>`, 'error');
        searchInput.disabled = true;
    }

    if (!modoExtra) guardarEstadoJuego();
}

function mostrarIntento(piloto) {
    const row = document.createElement('div');
    document.getElementById('intentos-actuales').textContent = intentos.length;
    row.className = 'guess-row';

    const nombreDiv = crearColumna(piloto.nombre, piloto.nombre === pilotoObjetivo.nombre);
    const nacDiv = crearColumna(piloto.nacionalidad, piloto.nacionalidad === pilotoObjetivo.nacionalidad);
    const equipoDiv = crearColumna(piloto.equipo, piloto.equipo === pilotoObjetivo.equipo);
    const numeroDiv = crearColumna(piloto.numero, piloto.numero === pilotoObjetivo.numero, 
        piloto.numero < pilotoObjetivo.numero ? '↑' : piloto.numero > pilotoObjetivo.numero ? '↓' : '');

    row.appendChild(nombreDiv);
    row.appendChild(nacDiv);
    row.appendChild(equipoDiv);
    row.appendChild(numeroDiv);

    guessesContainer.insertBefore(row, guessesContainer.firstChild);
}

function crearColumna(valor, esCorrecta, indicador = '') {
    const div = document.createElement('div');
    div.className = `column ${esCorrecta ? 'correct' : 'wrong'}`;
    div.textContent = `${valor}${indicador ? ' ' + indicador : ''}`;
    return div;
}

function mostrarMensaje(titulo, texto, tipo) {
    const config = {
        title: titulo,
        text: texto,
        icon: tipo,
        position: 'top',
        showCloseButton: true,
        showConfirmButton: false,
        background: '#1b2733',
        color: '#ffffff',
        timer: 2000,
        timerProgressBar: true,
        customClass: {
            closeButton: 'swal2-close-button',
            icon: 'swal2-icon-small'
        }
    };

    Swal.fire(config);
}

let modoExtra = false;

function reiniciarJuego() {
    modoExtra = true;
    pilotoObjetivo = pilotos[Math.floor(Math.random() * pilotos.length)];
    intentos = [];
    document.getElementById('guesses').innerHTML = '';
    document.getElementById('intentos-actuales').textContent = '0';
    document.getElementById('message').textContent = '';
    searchInput.disabled = false;
    searchInput.value = '';
    Swal.close();
}

function mostrarMensajeFinal(titulo, texto, tipo) {
    const tiempoRestante = obtenerTiempoRestante();
    
    const config = {
        title: titulo,
        html: `
            ${texto}<br><br>
            <div style="margin-top: 10px; font-size: 0.9em; opacity: 0.8;">
                Próximo juego en: <b>${tiempoRestante}</b>
            </div>
            <br>
            <div class="text-end">
                <button class="btn btn-primary" id="btn-jugar">Jugar otra vez</button>
                <button class="btn btn-secondary" id="btn-cerrar">Cerrar</button>
            </div>
        `,
        icon: tipo,
        position: 'center',
        showCloseButton: true,
        showConfirmButton: false,
        background: '#1b2733',
        color: '#ffffff',
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
            closeButton: 'swal2-close-button',
            icon: 'swal2-icon-small'
        },
        didOpen: () => {
            document.getElementById('btn-jugar').addEventListener('click', reiniciarJuego);
            document.getElementById('btn-cerrar').addEventListener('click', () => Swal.close());
        }
    };

    Swal.fire(config);
} 