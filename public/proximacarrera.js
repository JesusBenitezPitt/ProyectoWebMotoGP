document.addEventListener('DOMContentLoaded', function() {
    mostrarProximaCarrera();
});

async function mostrarProximaCarrera() {
    try {
        const response = await fetch('https://motogp-datos.duckdns.org/calendario');
        const eventos = await response.json();
        
        const eventosFiltrados = eventos.filter(evento => {
            return evento?.legacy_id?.some(id => id.categoryId === 1) && 
                   !evento.additional_name?.toLowerCase().includes('test') && 
                   !evento.sponsored_name?.toLowerCase().includes('test');
        });

        // Encontrar el próximo evento (primer evento no FINISHED)
        const proximoEvento = eventosFiltrados.find(evento => evento.status !== 'FINISHED');
        
        if (proximoEvento) {
            // Formatear la fecha
            const fechaInicio = new Date(proximoEvento.date_start);
            const fechaFormateada = fechaInicio.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            // Actualizar el contenido en el HTML
            const parrafoCarrera = document.querySelector('.parrafo-carrera');
            if (parrafoCarrera) {
                parrafoCarrera.innerHTML = `
                    <b>GP:</b> ${proximoEvento.sponsored_name}
                    <br>
                    <b>Ubicación:</b> ${proximoEvento.additional_name || proximoEvento.country.name}
                    <br>
                    <b>Fecha:</b> ${fechaFormateada}
                    <br>
                    <b>Circuito:</b> ${proximoEvento.circuit?.name || ''}
                `;
            }

            // Actualizar la imagen del circuito
            const imagenCircuito = document.querySelector('.circuito img');
            if (imagenCircuito && proximoEvento.additional_name) {
                const imagenes = {
                    'THAILAND': 'images/circuitos/tha.svg',
                    'ARGENTINA': 'images/circuitos/arg.svg',
                    'USA': 'images/circuitos/ame.svg',
                    'QATAR': 'images/circuitos/qat.svg',
                    'SPAIN': 'images/circuitos/esp.svg',
                    'FRANCE': 'images/circuitos/fra.svg',
                    'UNITED KINGDOM': 'images/circuitos/gbr.svg',
                    'ARAGON': 'images/circuitos/ara.svg',
                    'ITALY': 'images/circuitos/ita.svg',
                    'NETHERLANDS': 'images/circuitos/ned.svg',
                    'GERMANY': 'images/circuitos/ger.svg',
                    'CZECHIA': 'images/circuitos/cze.png',
                    'AUSTRIA': 'images/circuitos/aut.svg',
                    'HUNGARY': 'images/circuitos/hun.png',
                    'CATALONIA': 'images/circuitos/cat.svg',
                    'SAN MARINO': 'images/circuitos/rsm.svg',
                    'JAPAN': 'images/circuitos/jpn.svg',
                    'INDONESIA': 'images/circuitos/idn.svg',
                    'AUSTRALIA': 'images/circuitos/aus.svg',
                    'MALAYSIA': 'images/circuitos/mal.svg',
                    'PORTUGAL': 'images/circuitos/por.svg',
                    'VALENCIA': 'images/circuitos/val.svg'
                };
                
                imagenCircuito.src = imagenes[proximoEvento.additional_name] || imagenCircuito.src;
            }
        }
    } catch (error) {
        console.error('Error al cargar la próxima carrera:', error);
        mostrarError('Hubo un problema al cargar la información de la próxima carrera');
    }
}

const formatearFecha = (fecha) => {
    try {
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = fecha.toLocaleDateString('es-ES', { month: 'short' })
            .toUpperCase();
        return `${dia} ${mes}`;
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return '';
    }
}

function mostrarError(mensaje) {
    if (typeof Swal === 'undefined') {
        console.error('SweetAlert2 no está definido');
        alert(mensaje);
        return;
    }

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
        text: mensaje
    });
}
