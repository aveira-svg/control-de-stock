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
// avergas
// === INICIALIZACIÓN DE FIREBASE ===
try {
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase no está disponible');
    }
    firebase.initializeApp(firebaseConfig);
} catch (err) {
    const logList = document.getElementById('log-list');
    if (logList) {
        const li = document.createElement('li');
        li.textContent = 'Error inicializando Firebase: ' + (err && err.message ? err.message : err);
        logList.prepend(li);
    }
}
const database = firebase && firebase.database ? firebase.database() : null;
const lugaresRef = database ? database.ref('lugares') : null;
const historialLugaresRef = database ? database.ref('historial-lugares') : null;

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

if (lugaresRef) lugaresRef.on('value', (snapshot) => {
    lugaresData = snapshot.val() || {};
    renderizarLugares();
}, function(error){
    const logList = document.getElementById('log-list');
    if (logList) {
        const li = document.createElement('li');
        li.textContent = 'Error leyendo lugares: ' + error.message;
        logList.prepend(li);
    }
});

if (historialLugaresRef) historialLugaresRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        historialLugares = Object.values(data);
        historialLugares.reverse();
    } else {
        historialLugares = [];
    }
    renderizarHistorial(historialLugares, 'log-list');
}, function(error){
    const logList = document.getElementById('log-list');
    if (logList) {
        const li = document.createElement('li');
        li.textContent = 'Error leyendo historial: ' + error.message;
        logList.prepend(li);
    }
});

/**
 * Dibuja la tabla de lugares con el botón único.
 */
function renderizarLugares() {
    const placesList = document.getElementById('places-list');
    placesList.innerHTML = '';
    lugaresList.forEach(lugar => {
        const estadoActual = lugaresData[lugar] || 'apagado';
        const fila = document.createElement('tr');
        const estadoClase = estadoActual === 'apagado' ? 'apagado' : 'encendido';
        
        fila.innerHTML = `
            <td data-label="Lugar">${lugar}</td>
            <td data-label="Estado" class="${estadoClase}">${estadoActual.charAt(0).toUpperCase() + estadoActual.slice(1)}</td>
            <td data-label="Acciones">
                <button 
                    class="state-button ${estadoClase}" 
                    onclick="cambiarEstado('${lugar}', '${estadoActual === 'apagado' ? 'encendido' : 'apagado'}')">
                    ${estadoActual === 'apagado' ? 'Encender' : 'Apagar'}
                </button>
            </td>
        `;
        placesList.appendChild(fila);
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
    if (!lugaresRef) return;
    lugaresRef.child(lugar).set(nuevoEstado)
        .then(() => {
            const mensaje = `[${new Date().toLocaleString()}] Se cambió el estado de ${lugar} a ${nuevoEstado}.`;
            if (historialLugaresRef) historialLugaresRef.push(mensaje).catch(function(error){
                const logList = document.getElementById('log-list');
                if (logList) {
                    const li = document.createElement('li');
                    li.textContent = 'Error escribiendo historial: ' + error.message;
                    logList.prepend(li);
                }
            });
        })
        .catch(function(error){
            const logList = document.getElementById('log-list');
            if (logList) {
                const li = document.createElement('li');
                li.textContent = 'Error al actualizar el estado: ' + error.message;
                logList.prepend(li);
            }
        });
}
