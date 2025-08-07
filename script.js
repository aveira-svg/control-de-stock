// === CONFIGURACIÓN DE FIREBASE (¡TU CÓDIGO!) ===
const firebaseConfig = {
    apiKey: "AIzaSyAljDO9kRa3QRWdA1BCuce6gmHzDS1_gOM",
    authDomain: "control-de-prestamos-c10a3.firebaseapp.com",
    databaseURL: "https://control-de-prestamos-c10a3-default-rtdb.firebaseio.com",
    projectId: "control-de-prestamos-c10a3",
    storageBucket: "control-de-prestamos-c10a3.firebasestorage.app",
    messagingSenderId: "960767851590",
    appId: "1:960767851590:web:9acf5ff042cd54707a9e47",
    measurementId: "G-Y64R9QXZ4Z"
};

// === INICIALIZACIÓN DE FIREBASE ===
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const equiposRef = database.ref('equipos');
// NUEVO: Referencia a la rama del historial
const historialRef = database.ref('historial');

// === VARIABLES DEL PROGRAMA ===
let equipos = [];
let equipoSeleccionado = null;
const lugares = [
    "Aula A", "Aula B", "Aula C", "Aula D",
    "Auditorio A", "Auditorio B", "Auditorio C", "Auditorio D",
    "Sala de Profesores Clinicas", "Sala de Profesores Decanato",
    "WorkShop", "Salon Posgrado Decanato", "Pre-Clínica", "Microscopia"
];
// Variable local para el historial (se llena desde Firebase)
let historial = [];

// === FUNCIONES PRINCIPALES ===

/**
 * Escucha los cambios en la base de datos de equipos y actualiza la interfaz.
 */
equiposRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        equipos = data;
    } else {
        // Inicializa la base de datos la primera vez
        equipos = [
            { id: 'presentador-1', nombre: 'Presentador 1', estado: 'disponible', lugar: null },
            { id: 'presentador-2', nombre: 'Presentador 2', estado: 'disponible', lugar: null },
            { id: 'presentador-3', nombre: 'Presentador 3', estado: 'disponible', lugar: null },
            { id: 'presentador-4', nombre: 'Presentador 4', estado: 'disponible', lugar: null },
            { id: 'presentador-5', nombre: 'Presentador 5', estado: 'disponible', lugar: null },
            { id: 'webcam-carlos', nombre: 'WebCam Carlos', estado: 'disponible', lugar: null },
            { id: 'webcam-ricar', nombre: 'WebCam Ricar', estado: 'disponible', lugar: null },
            { id: 'webcam-roxy', nombre: 'WebCam Roxy', estado: 'disponible', lugar: null },
        ];
        equiposRef.set(equipos);
    }
    renderizarEquipos();
});

/**
 * NUEVO: Escucha los cambios en la base de datos del historial y lo dibuja.
 */
historialRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        // Los registros en Firebase vienen en un objeto, los convertimos a un array
        historial = Object.values(data);
        historial.reverse(); // Para que los más recientes salgan primero
    } else {
        historial = [];
    }
    renderizarHistorial();
});

/**
 * Dibuja la tabla de equipos en la página.
 */
function renderizarEquipos() {
    const equiposList = document.getElementById('equipos-list');
    equiposList.innerHTML = '';

    equipos.forEach(equipo => {
        const fila = document.createElement('tr');
        
        const estadoClase = equipo.estado === 'prestado' ? 'prestado' : 'disponible';
        const lugarTexto = equipo.lugar || 'N/A';
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

/**
 * NUEVO: Dibuja el historial de movimientos en la página.
 */
function renderizarHistorial() {
    const logList = document.getElementById('log-list');
    logList.innerHTML = '';

    historial.slice(0, 20).forEach(log => { // Muestra solo los 20 más recientes
        const nuevoLog = document.createElement('li');
        nuevoLog.innerText = log;
        logList.appendChild(nuevoLog);
    });
}

function mostrarLugares(equipoId) {
    equipoSeleccionado = equipoId;
    const modal = document.getElementById('lugar-modal');
    const lugaresList = document.getElementById('lugares-list');
    lugaresList.innerHTML = '';

    lugares.forEach(lugar => {
        const botonLugar = document.createElement('button');
        botonLugar.innerText = lugar;
        botonLugar.onclick = () => prestar(lugar);
        lugaresList.appendChild(botonLugar);
    });

    modal.style.display = 'block';
}

function ocultarLugares() {
    const modal = document.getElementById('lugar-modal');
    modal.style.display = 'none';
}

/**
 * Presta un equipo, actualiza la base de datos y agrega un registro.
 */
function prestar(lugar) {
    const equipoIndex = equipos.findIndex(eq => eq.id === equipoSeleccionado);
    if (equipoIndex !== -1 && equipos[equipoIndex].estado === 'disponible') {
        equipos[equipoIndex].estado = 'prestado';
        equipos[equipoIndex].lugar = lugar;

        // Guarda el cambio de estado en la base de datos
        equiposRef.set(equipos);
        
        // NUEVO: Agrega un registro al historial de la base de datos
        const mensaje = `[${new Date().toLocaleString()}] Se prestó ${equipos[equipoIndex].nombre} a ${lugar}.`;
        historialRef.push(mensaje);

        ocultarLugares();
    }
}

/**
 * Devuelve un equipo, actualiza la base de datos y agrega un registro.
 */
function devolver(equipoId) {
    const equipoIndex = equipos.findIndex(eq => eq.id === equipoId);
    if (equipoIndex !== -1 && equipos[equipoIndex].estado === 'prestado') {
        const lugarAnterior = equipos[equipoIndex].lugar;
        equipos[equipoIndex].estado = 'disponible';
        equipos[equipoIndex].lugar = null;

        // Guarda el cambio de estado en la base de datos
        equiposRef.set(equipos);

        // NUEVO: Agrega un registro al historial de la base de datos
        const mensaje = `[${new Date().toLocaleString()}] Se devolvió ${equipos[equipoIndex].nombre} (prestado en ${lugarAnterior}).`;
        historialRef.push(mensaje);
    }
}
