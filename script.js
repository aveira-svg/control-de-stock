// Artículos únicos a prestar
const equipos = [
    { id: 'presentador-1', nombre: 'Presentador 1', estado: 'disponible', lugar: null },
    { id: 'presentador-2', nombre: 'Presentador 2', estado: 'disponible', lugar: null },
    { id: 'presentador-3', nombre: 'Presentador 3', estado: 'disponible', lugar: null },
    { id: 'presentador-4', nombre: 'Presentador 4', estado: 'disponible', lugar: null },
    { id: 'presentador-5', nombre: 'Presentador 5', estado: 'disponible', lugar: null },
    { id: 'webcam-carlos', nombre: 'WebCam Carlos', estado: 'disponible', lugar: null },
    { id: 'webcam-ricar', nombre: 'WebCam Ricar', estado: 'disponible', lugar: null },
    { id: 'webcam-roxy', nombre: 'WebCam Roxy', estado: 'disponible', lugar: null },
];

// Lugares de préstamo
const lugares = [
    "Aula A", "Aula B", "Aula C", "Aula D",
    "Auditorio A", "Auditorio B", "Auditorio C", "Auditorio D",
    "Sala de Profesores Clinicas", "Sala de Profesores Decanato",
    "WorkShop", "Salon Posgrado Decanato", "Pre-Clínica", "Microscopia"
];

let equipoSeleccionado = null; // Para guardar el ID del equipo que se va a prestar

// Función para inicializar la tabla de equipos al cargar la página
function renderizarEquipos() {
    const equiposList = document.getElementById('equipos-list');
    equiposList.innerHTML = ''; // Limpiar la lista

    equipos.forEach(equipo => {
        const fila = document.createElement('tr');
        
        let estadoClase = equipo.estado === 'prestado' ? 'prestado' : 'disponible';
        let lugarTexto = equipo.lugar || 'N/A';
        let accionesHtml = '';

        if (equipo.estado === 'disponible') {
            accionesHtml = `<button class="prestar-btn" onclick="mostrarLugares('${equipo.id}')">Prestar</button>`;
        } else {
            accionesHtml = `<button class="devolver-btn" onclick="devolver('${equipo.id}')">Devolver</button>`;
        }

        fila.innerHTML = `
            <td data-label="Artículo">${equipo.nombre}</td>
            <td data-label="Estado" class="${estadoClase}">${equipo.estado === 'disponible' ? 'Disponible' : 'Prestado'}</td>
            <td data-label="Lugar">${lugarTexto}</td>
            <td data-label="Acciones">${accionesHtml}</td>
        `;
        equiposList.appendChild(fila);
    });
}

// Función para mostrar el modal de lugares
function mostrarLugares(equipoId) {
    equipoSeleccionado = equipoId;
    const modal = document.getElementById('lugar-modal');
    const lugaresList = document.getElementById('lugares-list');
    lugaresList.innerHTML = ''; // Limpiar la lista anterior

    lugares.forEach(lugar => {
        const botonLugar = document.createElement('button');
        botonLugar.innerText = lugar;
        botonLugar.onclick = () => prestar(lugar);
        lugaresList.appendChild(botonLugar);
    });

    modal.style.display = 'block';
}

// Función para ocultar el modal de lugares
function ocultarLugares() {
    const modal = document.getElementById('lugar-modal');
    modal.style.display = 'none';
}

// Función para prestar un equipo
function prestar(lugar) {
    const equipo = equipos.find(eq => eq.id === equipoSeleccionado);
    if (equipo && equipo.estado === 'disponible') {
        equipo.estado = 'prestado';
        equipo.lugar = lugar;
        agregarRegistro(`Se prestó ${equipo.nombre} a ${lugar}.`);
        renderizarEquipos(); // Volver a dibujar la tabla
        ocultarLugares();
    }
}

// Función para devolver un equipo
function devolver(equipoId) {
    const equipo = equipos.find(eq => eq.id === equipoId);
    if (equipo && equipo.estado === 'prestado') {
        const lugarAnterior = equipo.lugar;
        equipo.estado = 'disponible';
        equipo.lugar = null;
        agregarRegistro(`Se devolvió ${equipo.nombre} (prestado en ${lugarAnterior}).`);
        renderizarEquipos(); // Volver a dibujar la tabla
    }
}

// Función para agregar un registro en la lista
function agregarRegistro(mensaje) {
    const logList = document.getElementById('log-list');
    const nuevoLog = document.createElement('li');
    const fecha = new Date().toLocaleString();
    nuevoLog.innerText = `[${fecha}] ${mensaje}`;
    logList.prepend(nuevoLog);
}

// Llama a esta función al cargar la página para mostrar los equipos
document.addEventListener('DOMContentLoaded', renderizarEquipos);