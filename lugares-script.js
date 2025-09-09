// === CONFIGURACIÓN DE FIREBASE (TU CÓDIGO) ===
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
const lugaresRef = database.ref('lugares');
const historialLugaresRef = database.ref('historial-lugares');

// === VARIABLES DEL PROGRAMA ===
let lugaresData = {};
let historialLugares = [];

const lugaresList = [
    "Auditorio A", "Auditorio B", "Auditorio C",
    "WorkShop", "Salon Posgrado Decanato", "Pre-Clínica", "Microscopia",
    "Aula A", "Aula B", "Aula C", "Aula D",
    "Sala de Profesores Clinicas", "Sala de Profesores Decanato", "Consejo"
];

// === FUNCIONES PRINCIPALES ===

lugaresRef.on('value', (snapshot) => {
    lugaresData = snapshot.val() || {};
    renderizarLugares();
});

historialLugaresRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        historialLugares = Object.values(data);
        historialLugares.reverse();
    } else {
        historialLugares = [];
    }
    renderizarHistorial(historialLugares, 'log-list');
});

/**
 * Dibuja la tabla de lugares con el botón único.
 */
function renderizarLugares() {
    const lugaresContainer = document.getElementById('lugares-container');
    lugaresContainer.innerHTML = '';
    lugaresList.forEach(lugar => {
        const estadoActual = lugaresData[lugar] || 'apagado';
        const button = document.createElement('button');
        button.classList.add('state-button', estadoActual);
        button.textContent = lugar;
        button.onclick = () => cambiarEstado(lugar, estadoActual === 'apagado' ? 'encendido' : 'apagado');
        lugaresContainer.appendChild(button);
    });
}

/**
 * Dibuja el historial de movimientos en la página.
 */
function renderizarHistorial(historialData, elementId) {
    const logList = document.getElementById(elementId);
    logList.innerHTML = '';
    historialData.slice(0, 20).forEach(log => {
        const nuevoLog = document.createElement('li');
        nuevoLog.innerText = log;
        logList.appendChild(nuevoLog);
    });
}

function cambiarEstado(lugar, nuevoEstado) {
    lugaresRef.child(lugar).set(nuevoEstado)
        .then(() => {
            const mensaje = `[${new Date().toLocaleString()}] Se cambió el estado de ${lugar} a ${nuevoEstado}.`;
            historialLugaresRef.push(mensaje);
        })
        .catch(function(){});
}