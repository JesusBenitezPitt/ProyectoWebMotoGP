document.addEventListener('DOMContentLoaded', function() {
    cargarClasificacion();
});
async function cargarClasificacion() {
    try {
        const response = await fetch('https://motogp-datos.duckdns.org/data');
        const data = await response.json();
        const standings = data.classification;
        
        const tbody = document.getElementById('standings-body');
        
        const fragment = document.createDocumentFragment();
        
        standings.forEach((rider, index) => {
            const row = document.createElement('tr');
            if (index < 3) {
                row.classList.add(`position-${index + 1}`);
            }

            row.innerHTML = `
                <td class="text-center">${rider.position}</td>
                <td>
                    <div class="d-flex align-items-center justify-content-center">
                        <span class="rider-number">#${rider.rider.number}</span>
                        <span class="ms-2">${rider.rider.full_name}</span>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center justify-content-center">
                        <img src="https://static-files.motogp.pulselive.com/assets/flags/${rider.rider.country.iso.toLowerCase()}.svg" 
                             alt="${rider.rider.country.name}" 
                             class="flag-icon">
                    </div>
                </td>
                <td class="text-center">${rider.team.name}</td>
                <td class="fw-bold text-center">${rider.points}</td>
            `;

            fragment.appendChild(row);
        });

        tbody.innerHTML = '';
        tbody.appendChild(fragment);

        actualizarTimestamp();
        mostrarIndicadorActualizacion();

    } catch (error) {
        
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

function actualizarTimestamp() {
    const ahora = new Date();
    const opciones = { 
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
    };
    const fechaFormateada = ahora.toLocaleDateString('es-ES', opciones);
    
    document.getElementById('ultima-actualizacion').innerHTML = 
        `<div class="ultima-actualizacion">Última actualización: ${fechaFormateada}</div>`;
}

function mostrarIndicadorActualizacion() {
    const indicator = document.createElement('div');
    indicator.className = 'update-indicator';
    document.body.appendChild(indicator);

    setTimeout(() => {
        indicator.remove();
    }, 1000);
}