function formatearNombre(nombre, apellido) {
    return `${nombre[0]}. ${apellido}`;
}

async function obtenerClasificacion() {
    try {
        const response = await fetch('https://motogp-datos.duckdns.org/clasificacion');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        const pilotos = Array.from(xmlDoc.getElementsByTagName('worldstanding_rider'))
            .map(piloto => ({
                rider: {
                    full_name: `${piloto.getAttribute('rider_name')} ${piloto.getAttribute('rider_surname')}`
                },
                points: parseInt(piloto.getAttribute('total_points') / 10)
            }));

        actualizarTablaClasificacion(pilotos);
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
            
            const nombreFormateado = formatearNombre(
                piloto.rider.full_name.split(' ')[0],
                piloto.rider.full_name.split(' ')[1]
            );
            
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