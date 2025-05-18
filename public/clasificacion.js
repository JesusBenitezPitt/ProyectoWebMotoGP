function formatearNombre(nombreCompleto) {

    const palabras = nombreCompleto.split(' ');
    if (palabras.length === 1) return palabras[0];
    const inicial = palabras[0][0];
    const apellido = palabras[palabras.length - 1];
    return `${inicial}. ${apellido}`;
}

async function obtenerClasificacion() {
    try {
        const response = await fetch('https://motogp-datos.duckdns.org/data');
        const datos = await response.json();
        const standings = datos.classification;

        actualizarTablaClasificacion(datos.classification);
    } catch (error) {
        console.error('Error al obtener la clasificación:', error);
    }
}

function actualizarTablaClasificacion(standings) {
    const tbody = document.querySelector('.podio tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const medallas = ['🥇', '🥈', '🥉'];
    const clases = ['primero', 'segundo', 'tercero'];

    standings.forEach((piloto, index) => {
        if (index < 3) {
            const fila = document.createElement('tr');
            fila.className = clases[index];
            
            const nombreFormateado = formatearNombre(piloto.rider.full_name);
            
            fila.innerHTML = `
                <td><span>${medallas[index]}</span></td>
                <td><span>${nombreFormateado}</span></td>
                <td><span>${piloto.points}</span></td>
            `;
            
            tbody.appendChild(fila);
        }
    });
}

// Cargar la clasificación cuando se carga la página
document.addEventListener('DOMContentLoaded', obtenerClasificacion); 