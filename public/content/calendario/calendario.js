document.addEventListener('DOMContentLoaded', function() {
    cargarCalendario();
});

async function cargarCalendario() {
    try {
        const response = await fetch('https://motogp-datos.duckdns.org/calendario');
        const eventos = await response.json();
        
        const contenedor = document.getElementById('races-grid');
        if (!contenedor) {
            console.error('No se encontró el elemento races-grid');
            return;
        }

        const fragment = document.createDocumentFragment();

        const eventosFiltrados = eventos.filter(evento => {

            return evento?.legacy_id?.some(id => id.categoryId === 1) &&
                   !evento.additional_name?.toLowerCase().includes('test') && 
                   !evento.sponsored_name?.toLowerCase().includes('test');
        });

        const lastFinishedIndex = eventosFiltrados.findLastIndex(evento => evento.status === 'FINISHED');
        
        const imagenes = {
            'THAILAND': '../../images/circuitos/tha.svg',
            'ARGENTINA': '../../images/circuitos/arg.svg',
            'USA': '../../images/circuitos/ame.svg',
            'QATAR': '../../images/circuitos/qat.svg',
            'SPAIN': '../../images/circuitos/esp.svg',
            'FRANCE': '../../images/circuitos/fra.svg',
            'UNITED KINGDOM': '../../images/circuitos/gbr.svg',
            'ARAGON': '../../images/circuitos/ara.svg',
            'ITALY': '../../images/circuitos/ita.svg',
            'NETHERLANDS': '../../images/circuitos/ned.svg',
            'GERMANY': '../../images/circuitos/ger.svg',
            'CZECHIA': '../../images/circuitos/cze.png',
            'AUSTRIA': '../../images/circuitos/aut.svg',
            'HUNGARY': '../../images/circuitos/hun.png',
            'CATALONIA': '../../images/circuitos/cat.svg',
            'SAN MARINO': '../../images/circuitos/rsm.svg',
            'JAPAN': '../../images/circuitos/jpn.svg',
            'INDONESIA': '../../images/circuitos/idn.svg',
            'AUSTRALIA': '../../images/circuitos/aus.svg',
            'MALAYSIA': '../../images/circuitos/mal.svg',
            'PORTUGAL': '../../images/circuitos/por.svg',
            'VALENCIA': '../../images/circuitos/val.svg'
        }

        eventosFiltrados.forEach((evento, index) => {
            if (!evento) {
                console.warn('Evento inválido encontrado');
                return;
            }

            const tarjeta = document.createElement('div');
            tarjeta.className = 'race-card';

            if (evento.additional_name) {
                tarjeta.style.backgroundImage = `url('${imagenes[evento.additional_name]}')`;
            }

            try {
                let estado = null;
                if (index <= lastFinishedIndex) {
                    estado = 'ACABADA';
                } else if (index === lastFinishedIndex + 1) {
                    estado = 'PRÓXIMA';
                }

                const fechaInicio = new Date(evento.date_start);
                const fechaFin = new Date(evento.date_end);
                const diaInicio = fechaInicio.getDate().toString().padStart(2, '0');
                const mesInicio = fechaInicio.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
                const diaFin = fechaFin.getDate().toString().padStart(2, '0');
                const mesFin = fechaFin.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
                const fechaFormateada = `${diaInicio} ${mesInicio} - ${diaFin} ${mesFin}`;

                const numeroCarrera = evento.legacy_id?.find(id => id.categoryId === 1)?.eventId || '';

                tarjeta.innerHTML = `
                    ${estado ? `<div class="race-status ${estado === 'ACABADA' ? 'status-finished' : 'status-not-started'}">${estado}</div>` : ''}
                    <div class="race-header">
                        <div class="race-number">${numeroCarrera}</div>
                        <div class="race-date">${fechaFormateada}</div>
                        <div class="race-country">
                            <img src="https://static-files.motogp.pulselive.com/assets/flags/${evento.country?.iso.toLowerCase()}.svg" 
                                 alt="${evento.country?.name}" 
                                 class="country-flag">
                            <span class="country-name">${evento.additional_name}</span>
                        </div>
                        <div class="race-title">${evento.sponsored_name || ''}</div>
                        <div class="race-circuit">${evento.circuit?.name || ''}</div>
                    </div>
                `;

                fragment.appendChild(tarjeta);
            } catch (err) {
                console.error('Error al procesar evento:', err, evento);
            }
        });

        contenedor.innerHTML = '';
        contenedor.appendChild(fragment);

    } catch (error) {
        console.error('Error al cargar el calendario:', error);
        mostrarError('Hubo un problema al cargar el calendario');
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
