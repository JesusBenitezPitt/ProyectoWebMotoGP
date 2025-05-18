document.addEventListener('DOMContentLoaded', function() {
    cargarDatosPiloto();
});

async function cargarDatosPiloto() {
    try {
        // Obtener la ruta y limpiarla
        const path = window.location.pathname;
        // Eliminar las barras del final y dividir la ruta
        const segments = path.replace(/\/+$/, '').split('/');
        // Obtener el último segmento que será el nombre del piloto
        const currentPage = segments[segments.length - 1];
        
        console.log("Ruta completa:", path);
        console.log("Segmentos:", segments);
        console.log("Página del piloto:", currentPage);
        
        const response = await fetch('https://motogp-datos.duckdns.org/data');
        const data = await response.json();
        const pilotos = data.classification;
        console.log(pilotos);
        
        const pilotosMap = {
            'jmartin': 'JORGE MARTIN',
            'lmarini': 'LUCA MARINI',
            'mmarquez': 'MARC MARQUEZ',
            'mvinales': 'MAVERICK VIÑALES',
            'pacosta': 'PEDRO ACOSTA',
            'jzarco': 'JOHANN ZARCO',
            'fbagnaia': 'FRANCESCO BAGNAIA',
            'amarquez': 'ALEX MARQUEZ'
        };
        
        const pilotoId = pilotosMap[currentPage];
        console.log("ID del piloto:", pilotoId);
        
        if (pilotoId) {
            const piloto = pilotos.find(p => p.rider.full_name.toLowerCase() === pilotoId.toLowerCase());
            console.log("Datos del piloto:", piloto);
            
            if (piloto) {
                const puntosPiloto = piloto.points || '0';
                const posicionPiloto = piloto.position || '-';
                const victoriasPiloto = piloto.race_wins || '0';

                const lugarPuntos = document.getElementById('puntos');
                const lugarPosicion = document.getElementById('posicion');
                const lugarVictorias = document.getElementById('victorias');

                if (lugarPuntos) lugarPuntos.textContent = puntosPiloto;
                if (lugarPosicion) lugarPosicion.textContent = posicionPiloto;
                if (lugarVictorias) lugarVictorias.textContent = victoriasPiloto;
            }
        }

    } catch (error) {
        console.error("Error:", error);
        
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
            text: 'Hubo un problema al cargar los datos del piloto: ' + error
        });
    }
}