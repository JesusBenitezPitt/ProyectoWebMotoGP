document.addEventListener('DOMContentLoaded', function() {
    cargarClasificacion();
});

// Mapeo de códigos de país del XML a códigos ISO de dos letras
const codigosPais = {
    'SPA': 'es',
    'ITA': 'it',
    'FRA': 'fr',
    'USA': 'us',
    'GER': 'de',
    'AUS': 'au',
    'JPN': 'jp',
    'GBR': 'gb',
    'RSA': 'za',
    'POR': 'pt',
    'ARG': 'ar',
    'THA': 'th',
    'MAL': 'my',
    'QAT': 'qa',
    'IDN': 'id',
    'NED': 'nl',
    'CZE': 'cz',
    'AUT': 'at',
    'SMR': 'sm',
    'CAT': 'es'  // Cataluña usa la bandera de España para la API
};

async function cargarClasificacion() {
    try {
        const response = await fetch('https://motogp-datos.duckdns.org/clasificacion');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        const esMovil = window.matchMedia("(max-width: 768px)").matches;
        
        const pilotos = xmlDoc.getElementsByTagName('worldstanding_rider');
        const tbody = document.getElementById('standings-body');
        const fragment = document.createDocumentFragment();
        
        Array.from(pilotos).forEach((piloto, index) => {
            const row = document.createElement('tr');
            if (index < 3) {
                row.classList.add(`position-${index + 1}`);
            }

            const posicion = piloto.getAttribute('pos');
            const numero = piloto.getAttribute('rider_number');
            const nombreCompleto = `${piloto.getAttribute('rider_name')} ${piloto.getAttribute('rider_surname')}`;
            const pais = piloto.getAttribute('country_name');
            const codigoPaisXML = piloto.getAttribute('country_shortname');
            const codigoPaisISO = codigosPais[codigoPaisXML] || codigoPaisXML.toLowerCase();
            const equipo = piloto.getAttribute('team_name');
            const puntos = piloto.getAttribute('total_points') / 10;

            if (esMovil) {
                // Formato compacto y visualmente atractivo para móvil
                row.innerHTML = `
                    <td class="align-middle text-center fw-bold p-3">${posicion}</td>
                    <td class="align-middle">
                        <div class="d-flex gap-2">
                            <span class="rider-number">#${numero}</span>
                            <span class="fw-bold">${nombreCompleto} <img src="https://static-files.motogp.pulselive.com/assets/flags/${codigoPaisISO}.svg" 
                                 alt="${pais}" class="ms-2" style="width: 20px; height: 16px;"></span>
                        </div>
                        <div class="text-muted small mt-1">${equipo}</div>
                    </td>
                    <td class="align-middle fw-bold text-center">${puntos}</td>
                `;

            } else {
                // Formato normal para escritorio
                row.innerHTML = `
                    <td class="text-center align-middle">${posicion}</td>
                    <td class="align-middle">
                        <div class="d-flex align-items-center justify-content-center gap-2">
                            <span class="rider-number">#${numero}</span>
                            <span class="fw-semibold">${nombreCompleto}</span>
                        </div>
                    </td>
                    <td class="align-middle">
                        <div class="d-flex align-items-center justify-content-center">
                            <img src="https://static-files.motogp.pulselive.com/assets/flags/${codigoPaisISO}.svg" 
                                 alt="${pais}" style="width: 22px; height: 16px;">
                        </div>
                    </td>
                    <td class="align-middle text-center">${equipo}</td>
                    <td class="align-middle fw-bold text-center">${puntos}</td>
                `;
            }

            fragment.appendChild(row);
        });

        tbody.innerHTML = '';
        tbody.appendChild(fragment);

        actualizarTimestamp();
        mostrarIndicadorActualizacion();

    } catch (error) {
        console.error('Error al cargar la clasificación:', error);
        
        // Toast de error
        const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            showCloseButton: true,
            timer: 3000,
            timerProgressBar: true,
            background: '#f44336',
            color: '#fff',
            customClass: {
                closeButton: 'swal2-close-white',
                popup: 'swal2-toast-slide',
                timerProgressBar: 'swal2-timer-custom',
                container: 'swal2-container-custom'
            },
            willClose: (toast) => {
                toast.classList.add('swal2-toast-slide-out');
            }
        });

        Toast.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al cargar la clasificación ' + error
        });
    }
}

const actualizarTimestamp = () => {
    const ahora = new Date();
    const opciones = { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const timestamp = ahora.toLocaleDateString('es-ES', opciones);
    document.getElementById('ultima-actualizacion').textContent = `Última actualización: ${timestamp}`;
}

function mostrarIndicadorActualizacion() {
    const indicador = document.createElement('div');
    indicador.className = 'update-indicator';
    document.body.appendChild(indicador);
    
    setTimeout(() => {
        indicador.remove();
    }, 1000);
}