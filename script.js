// === CONFIGURACIÓN DE FIREBASE (¡TU CÓDIGO!) ===
const firebaseConfig = {
    apiKey: "AIzaSyC6IrYM2eMdLCR-zGm5WjCGHBTgrTpWAyg",
    authDomain: "control-de-prestamos-8c967.firebaseapp.com",
    databaseURL: "https://control-de-prestamos-8c967-default-rtdb.firebaseio.com",
    projectId: "control-de-prestamos-8c967",
    storageBucket: "control-de-prestamos-8c967.firebasestorage.app",
    messagingSenderId: "812227966868",
    appId: "1:812227966868:web:34e19a163dc5031aafc181",
    measurementId: "G-ZSQB6HV4RH"
};

// === INICIALIZACIÓN DE FIREBASE ===
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const equiposRef = database.ref('equipos');
// NUEVO: Referencia para el historial de préstamos
const historialPrestamosRef = database.ref('historial-prestamos');

// === VARIABLES DEL PROGRAMA ===
let equipos = [];
let equipoSeleccionado = null;
// Columnas solicitadas para el selector de préstamo
const lugarColumns = [
    [
        "Auditorio A", "Auditorio B", "Auditorio C", "Pre-Clínica", "Microscopia"
    ],
    [
        "Sala de Profesores Decanato", "Sala de Profesores Clinicas", "Salon Posgrado Decanato", "WorkShop", "Consejo"
    ],
    [
        "Aula A", "Aula B", "Aula C", "Aula D"
    ]
];
// Etiquetas de visualización (abreviadas) manteniendo el valor real al guardar
const lugarDisplay = {
    "Sala de Profesores Decanato": "SProf. Decanato",
    "Sala de Profesores Clinicas": "SProf. Clínicas",
    "Salon Posgrado Decanato": "Salón Posgrado",
    "Microscopia": "Microscopía"
};
let historialPrestamos = [];

// === FUNCIONES PRINCIPALES ===

equiposRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        equipos = data;
    } else {
        equipos = [
            { id: 'presentador-1', nombre: 'Presentador 1', estado: 'disponible', lugar: null },
            { id: 'presentador-2', nombre: 'Presentador 2', estado: 'disponible', lugar: null },
            { id: 'presentador-3', nombre: 'Presentador 3', estado: 'disponible', lugar: null },
            { id: 'presentador-4', nombre: 'Presentador 4', estado: 'disponible', lugar: null },
            { id: 'presentador-5', nombre: 'Presentador 5', estado: 'disponible', lugar: null },
            { id: 'presentador-6', nombre: 'Presentador 6', estado: 'disponible', lugar: null },
            { id: 'webcam-carlos', nombre: 'WebCam Carlos', estado: 'disponible', lugar: null },
            { id: 'webcam-ricar', nombre: 'WebCam Ricar', estado: 'disponible', lugar: null },
            { id: 'webcam-roxy', nombre: 'WebCam Roxy', estado: 'disponible', lugar: null },
            { id: 'webcam-ale', nombre: 'WebCam Ale', estado: 'disponible', lugar: null },
            { id: 'teclado-mause-inalambrico', nombre: 'Teclado&Mause Inalambrico', estado: 'disponible', lugar: null },
            { id: 'cañon_01', nombre: 'Cañón 01', estado: 'disponible', lugar: null },
            { id: 'cañon_02', nombre: 'Cañón 02', estado: 'disponible', lugar: null },
        ];
        equiposRef.set(equipos);
    }
    renderizarEquipos();
});

// NUEVO: Escucha los cambios en el historial de préstamos
historialPrestamosRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        historialPrestamos = Object.values(data);
        historialPrestamos.reverse();
    } else {
        historialPrestamos = [];
    }
    renderizarHistorial(historialPrestamos, 'log-list');
});

function renderizarEquipos() {
    const equiposList = document.getElementById('equipos-list');
    equiposList.innerHTML = '';
    equipos.forEach(equipo => {
        const fila = document.createElement('tr');
        const estadoClase = equipo.estado === 'prestado' ? 'status-prestado' : 'status-disponible';
        const lugarTexto = equipo.lugar || 'N/A';
        let accionesHtml = '';
        if (equipo.estado === 'disponible') {
            accionesHtml = `<button class=\"btn btn-primary\" onclick=\"mostrarLugares('${equipo.id}')\">Prestar</button>`;
        } else {
            accionesHtml = `<button class=\"btn btn-danger\" onclick=\"devolver('${equipo.id}')\">Devolver</button>`;
        }
        fila.innerHTML = `
            <td data-label="Artículo">${equipo.nombre}</td>
            <td data-label="Estado"><span class="status-badge ${estadoClase}">${equipo.estado === 'disponible' ? 'Disponible' : 'Prestado'}</span></td>
            <td data-label="Lugar">${lugarTexto}</td>
            <td data-label="Acciones">${accionesHtml}</td>
        `;
        equiposList.appendChild(fila);
    });
}

function renderizarHistorial(historialData, elementId) {
    const logList = document.getElementById(elementId);
    logList.innerHTML = '';
    historialData.slice(0, 20).forEach(log => {
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
    // Crear 3 columnas
    const columnas = [document.createElement('div'), document.createElement('div'), document.createElement('div')];
    columnas.forEach(col => { col.className = 'lugar-col'; lugaresList.appendChild(col); });
    // Rellenar cada columna con botones en el orden solicitado
    lugarColumns.forEach((colData, idx) => {
        colData.forEach(lugar => {
            const botonLugar = document.createElement('button');
            botonLugar.innerText = lugarDisplay[lugar] || lugar;
            botonLugar.onclick = () => prestar(lugar);
            columnas[idx].appendChild(botonLugar);
        });
    });
    modal.style.display = 'block';
}

function ocultarLugares() {
    const modal = document.getElementById('lugar-modal');
    modal.style.display = 'none';
}

function prestar(lugar) {
    const equipoIndex = equipos.findIndex(eq => eq.id === equipoSeleccionado);
    if (equipoIndex !== -1 && equipos[equipoIndex].estado === 'disponible') {
        equipos[equipoIndex].estado = 'prestado';
        equipos[equipoIndex].lugar = lugar;
        equiposRef.set(equipos);
        const mensaje = `[${new Date().toLocaleString()}] Se prestó ${equipos[equipoIndex].nombre} a ${lugar}.`;
        historialPrestamosRef.push(mensaje); // Guarda en el historial de préstamos
        ocultarLugares();
    }
}

function devolver(equipoId) {
    const equipoIndex = equipos.findIndex(eq => eq.id === equipoId);
    if (equipoIndex !== -1 && equipos[equipoIndex].estado === 'prestado') {
        const lugarAnterior = equipos[equipoIndex].lugar;
        equipos[equipoIndex].estado = 'disponible';
        equipos[equipoIndex].lugar = null;
        equiposRef.set(equipos);
        const mensaje = `[${new Date().toLocaleString()}] Se devolvió ${equipos[equipoIndex].nombre} (prestado en ${lugarAnterior}).`;
        historialPrestamosRef.push(mensaje); // Guarda en el historial de préstamos
    }
}