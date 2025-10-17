// Array de usuarios (se cargará desde Firebase)
let usuarios = [];

// Variables globales
let usuariosFiltrados = [...usuarios];
let usuarioSeleccionado = null;
let filtroActual = 'all'; // 'all', 'contacted', 'pending'

// Elementos del DOM
const usersGrid = document.getElementById('usersGrid');
const searchInput = document.getElementById('searchInput');
const totalUsers = document.getElementById('totalUsers');
const filteredUsers = document.getElementById('filteredUsers');
const noResults = document.getElementById('noResults');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');

// Elementos de las pestañas
const tabAll = document.getElementById('tabAll');
const tabContacted = document.getElementById('tabContacted');
const tabPending = document.getElementById('tabPending');
const countAll = document.getElementById('countAll');
const countContacted = document.getElementById('countContacted');
const countPending = document.getElementById('countPending');

// Elementos del modal de edición
const editModal = document.getElementById('editModal');
const closeModal = document.getElementById('closeModal');
const phoneInput = document.getElementById('phoneInput');
const modalUserName = document.getElementById('modalUserName');
const modalUserEmail = document.getElementById('modalUserEmail');
const cancelBtn = document.getElementById('cancelBtn');
const confirmBtn = document.getElementById('confirmBtn');

// Elementos del modal de confirmación
const confirmModal = document.getElementById('confirmModal');
const confirmUserName = document.getElementById('confirmUserName');
const confirmPhoneNumber = document.getElementById('confirmPhoneNumber');
const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
const finalConfirmBtn = document.getElementById('finalConfirmBtn');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
});

function inicializarApp() {
    configurarEventListeners();
    setTimeout(() => {
        if (window.firebaseDb) {
            cargarUsuariosDesdeFirebase();
        } else {
            mostrarError('Firebase no está disponible. Recargando...');
            setTimeout(() => location.reload(), 2000);
        }
    }, 1000);
}

// ====================== FIREBASE ======================

async function cargarUsuariosDesdeFirebase() {
    try {
        mostrarCarga();
        const coleccionUsers = 'users';
        let usuariosCargados = [];

        try {
            console.log(`Cargando usuarios desde colección: ${coleccionUsers}`);
            const usuariosSnapshot = await window.firebaseGetDocs(
                window.firebaseCollection(window.firebaseDb, coleccionUsers)
            );

            if (!usuariosSnapshot.empty) {
                usuariosSnapshot.forEach((doc) => {
                    const datos = doc.data();
                    usuariosCargados.push({
                        id: doc.id,
                        nombre: datos.name || 'Usuario sin nombre',
                        email: datos.phoneNumber || 'Sin email',
                        telefono: datos.phoneNumber || '+000000000',
                        pais: datos.country || 'No especificado',
                        fechaRegistro: datos.createdAt ? new Date(datos.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        estado: datos.abfblock ? 'Bloqueado' : 'Activo',
                        deviceId: datos.deviceId || doc.id,
                        uid: datos.uid || '',
                        referralCode: datos.referralCode || '',
                        referredBy: datos.referredBy || null,
                        isNewUser: datos.isNewUser || false,
                        referralsCount: datos.referralsCount || 0,
                        usedDays: datos.usedDays || 0,
                        subscriptionDays: datos.subscriptionDays || 0,
                        razon: datos.razon || null,
                        contacted: datos.contacted || false,
                        contactedAt: datos.contactedAt || null
                    });
                });
            } else {
                console.log('No se encontraron usuarios en la colección users');
            }
        } catch (error) {
            console.error(`Error al cargar desde ${coleccionUsers}:`, error.message);
            throw error;
        }

        if (usuariosCargados.length === 0) {
            console.log('No se encontraron usuarios en Firebase, usando datos de ejemplo');
            usuariosCargados = obtenerUsuariosEjemplo();
        }

        usuarios = usuariosCargados;
        usuariosFiltrados = [...usuarios];

        mostrarUsuarios(usuariosFiltrados);
        actualizarEstadisticas();
        ocultarCarga();

        console.log('Usuarios cargados exitosamente:', usuarios.length);

    } catch (error) {
        console.error('Error al cargar usuarios desde Firebase:', error);
        mostrarError(`Error al conectar con Firebase: ${error.message}`);
    }
}

function obtenerUsuariosEjemplo() {
    return [
        {
            id: 'ejemplo-1',
            nombre: "Juan Pérez",
            email: "juan.perez@email.com",
            telefono: "+34 612 345 678",
            pais: "España",
            fechaRegistro: "2024-01-15",
            estado: "Activo"
        },
        {
            id: 'ejemplo-2',
            nombre: "María García",
            email: "maria.garcia@email.com",
            telefono: "+34 678 901 234",
            pais: "España",
            fechaRegistro: "2024-02-20",
            estado: "Activo"
        },
        {
            id: 'ejemplo-3',
            nombre: "Carlos López",
            email: "carlos.lopez@email.com",
            telefono: "+1 555 123 4567",
            pais: "Estados Unidos",
            fechaRegistro: "2024-03-10",
            estado: "Activo"
        }
    ];
}

async function actualizarTelefonoEnFirebase(usuarioId, nuevoTelefono) {
    try {
        const usuarioRef = window.firebaseDoc(window.firebaseDb, 'users', usuarioId);
        await window.firebaseUpdateDoc(usuarioRef, {
            phoneNumber: nuevoTelefono,
            lastUpdated: new Date().toISOString()
        });
        console.log(`Teléfono actualizado en users para usuario ${usuarioId}`);
        return true;
    } catch (error) {
        console.error('Error al actualizar teléfono en Firebase:', error);
        return false;
    }
}

// ====================== INTERFAZ ======================

function mostrarCarga() {
    usersGrid.style.display = 'none';
    noResults.style.display = 'none';
    error.style.display = 'none';
    loading.style.display = 'block';
}

function ocultarCarga() {
    loading.style.display = 'none';
}

function mostrarError(mensaje) {
    usersGrid.style.display = 'none';
    noResults.style.display = 'none';
    loading.style.display = 'none';
    error.style.display = 'block';
    errorMessage.textContent = mensaje;
}

// ====================== CONTACTO ======================

async function marcarComoContactado(usuarioId) {
    try {
        const usuario = usuarios.find(u => u.id === usuarioId);
        if (!usuario) return console.error('Usuario no encontrado');

        const usuarioRef = window.firebaseDoc(window.firebaseDb, 'users', usuarioId);
        await window.firebaseUpdateDoc(usuarioRef, {
            contacted: true,
            contactedAt: new Date().toISOString()
        });

        usuario.contacted = true;
        usuario.contactedAt = new Date().toISOString();
        filtrarUsuarios();
        actualizarEstadisticas();

        mostrarNotificacion(`${usuario.nombre} marcado como contactado`, 'success');
    } catch (error) {
        console.error('Error al marcar como contactado:', error);
        mostrarNotificacion('Error al marcar como contactado', 'error');
    }
}

async function desmarcarContactado(usuarioId) {
    try {
        const usuario = usuarios.find(u => u.id === usuarioId);
        if (!usuario) return console.error('Usuario no encontrado');

        const usuarioRef = window.firebaseDoc(window.firebaseDb, 'users', usuarioId);
        await window.firebaseUpdateDoc(usuarioRef, {
            contacted: false,
            contactedAt: null
        });

        usuario.contacted = false;
        usuario.contactedAt = null;
        filtrarUsuarios();
        actualizarEstadisticas();

        mostrarNotificacion(`${usuario.nombre} desmarcado como contactado`, 'success');
    } catch (error) {
        console.error('Error al desmarcar:', error);
        mostrarNotificacion('Error al desmarcar usuario', 'error');
    }
}

// ====================== EVENTOS ======================

function configurarEventListeners() {
    searchInput.addEventListener('input', filtrarUsuarios);
    closeModal.addEventListener('click', cerrarModalEdicion);
    cancelBtn.addEventListener('click', cerrarModalEdicion);
    confirmBtn.addEventListener('click', mostrarModalConfirmacion);
    cancelConfirmBtn.addEventListener('click', cerrarModalConfirmacion);
    finalConfirmBtn.addEventListener('click', abrirWhatsApp);

    editModal.addEventListener('click', e => { if (e.target === editModal) cerrarModalEdicion(); });
    confirmModal.addEventListener('click', e => { if (e.target === confirmModal) cerrarModalConfirmacion(); });

    phoneInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') mostrarModalConfirmacion();
    });
}

// ====================== MODALES ======================

function abrirModalEdicion(usuarioId) {
    usuarioSeleccionado = usuarios.find(u => u.id === usuarioId);
    if (!usuarioSeleccionado) return console.error('Usuario no encontrado');

    modalUserName.textContent = usuarioSeleccionado.nombre;
    modalUserEmail.textContent = usuarioSeleccionado.email;
    phoneInput.value = usuarioSeleccionado.telefono;

    editModal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        phoneInput.focus();
        phoneInput.select();
    }, 100);
}

function cerrarModalEdicion() {
    editModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    // usuarioSeleccionado = null; // 🔧 NO lo borramos para evitar error
}

async function mostrarModalConfirmacion() {
    const numeroTelefono = phoneInput.value.trim();
    if (!numeroTelefono) {
        alert('Por favor, ingresa un número de teléfono válido');
        phoneInput.focus();
        return;
    }
    if (!validarNumeroTelefono(numeroTelefono)) {
        alert('Por favor, ingresa un número de teléfono válido con código de país');
        phoneInput.focus();
        return;
    }

    usuarioSeleccionado.telefono = numeroTelefono;

    if (window.firebaseDb && usuarioSeleccionado.id && !usuarioSeleccionado.id.startsWith('ejemplo-')) {
        try {
            await actualizarTelefonoEnFirebase(usuarioSeleccionado.id, numeroTelefono);
        } catch {
            console.log('No se pudo actualizar en Firebase');
        }
    }

    confirmUserName.textContent = usuarioSeleccionado.nombre;
    confirmPhoneNumber.textContent = numeroTelefono;
    cerrarModalEdicion();
    confirmModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function cerrarModalConfirmacion() {
    confirmModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ====================== WHATSAPP ======================

function abrirWhatsApp() {
    if (!usuarioSeleccionado) {
        console.error("Error: usuarioSeleccionado es null.");
        mostrarNotificacion('Error: No se seleccionó ningún usuario', 'error');
        return;
    }

    const numeroTelefono = usuarioSeleccionado.telefono?.replace(/\s/g, '');
    if (!numeroTelefono) {
        mostrarNotificacion('Número de teléfono no válido', 'error');
        return;
    }

    const mensaje = encodeURIComponent(`Hola ${usuarioSeleccionado.nombre}, te contacto desde nuestro sistema de gestión.`);
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensaje}`;
    window.open(urlWhatsApp, '_blank');
    cerrarModalConfirmacion();
    mostrarNotificacion('WhatsApp abierto correctamente', 'success');
}

// ====================== UTILIDADES ======================

function validarNumeroTelefono(numero) {
    const regex = /^\+[1-9]\d{1,14}$/;
    return regex.test(numero.replace(/\s/g, ''));
}

function formatearFecha(fecha) {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    let backgroundColor = '#17a2b8';
    let iconClass = 'info-circle';
    if (tipo === 'success') { backgroundColor = '#28a745'; iconClass = 'check-circle'; }
    else if (tipo === 'error') { backgroundColor = '#dc3545'; iconClass = 'exclamation-circle'; }

    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `<i class="fas fa-${iconClass}"></i><span>${mensaje}</span>`;
    notificacion.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: ${backgroundColor}; color: white;
        padding: 15px 20px; border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000; display: flex; align-items: center; gap: 10px;
        animation: slideInRight 0.3s ease;
    `;

    const style = document.createElement('style');
    style.textContent = `@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
    document.head.appendChild(style);

    document.body.appendChild(notificacion);
    setTimeout(() => {
        notificacion.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => document.body.removeChild(notificacion), 300);
    }, 3000);
}

function mostrarUsuarios(usuarios) {
    if (usuarios.length === 0) {
        usersGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    usersGrid.style.display = 'grid';
    noResults.style.display = 'none';

    usersGrid.innerHTML = usuarios.map(usuario => `
        <div class="user-card ${usuario.contacted ? 'contacted' : ''}">
            <div class="user-header">
                <div class="user-avatar"><i class="fas fa-user"></i></div>
                <div class="user-info">
                    <h3>${usuario.nombre}</h3>
                    <p>${usuario.email}</p>
                </div>
            </div>
            <div class="user-details">
                <div class="detail-item"><i class="fas fa-phone"></i><span>${usuario.telefono}</span></div>
                <div class="detail-item"><i class="fas fa-map-marker-alt"></i><span>${usuario.pais}</span></div>
                <div class="detail-item"><i class="fas fa-calendar"></i><span>Registrado: ${formatearFecha(usuario.fechaRegistro)}</span></div>
                <div class="detail-item"><i class="fas fa-circle" style="color: ${usuario.estado === 'Activo' ? '#28a745' : '#dc3545'}"></i><span>${usuario.estado}</span></div>
                ${usuario.referralCode ? `<div class="detail-item"><i class="fas fa-gift"></i><span>Código: ${usuario.referralCode}</span></div>` : ''}
                ${usuario.subscriptionDays > 0 ? `<div class="detail-item"><i class="fas fa-crown"></i><span>Días suscripción: ${usuario.subscriptionDays}</span></div>` : ''}
                ${usuario.razon ? `<div class="detail-item"><i class="fas fa-exclamation-triangle" style="color: #dc3545;"></i><span>Razón: ${usuario.razon}</span></div>` : ''}
                ${usuario.contacted && usuario.contactedAt ? `<div class="detail-item"><i class="fas fa-check-circle" style="color: #28a745;"></i><span>Contactado: ${formatearFecha(usuario.contactedAt)}</span></div>` : ''}
            </div>
            <div class="action-buttons">
                <button class="contact-btn ${usuario.contacted ? 'contacted' : ''}" onclick="abrirModalEdicion('${usuario.id}')">
                    <i class="fab fa-whatsapp"></i>
                    ${usuario.contacted ? 'Recontactar' : 'Contactar por WhatsApp'}
                </button>
                ${!usuario.contacted ? `
                <button class="marked-btn" onclick="marcarComoContactado('${usuario.id}')">
                    <i class="fas fa-check"></i> Marcar como Contactado
                </button>` : `
                <button class="marked-btn" onclick="desmarcarContactado('${usuario.id}')" style="background: linear-gradient(135deg, #dc3545, #c82333);">
                    <i class="fas fa-times"></i> Desmarcar
                </button>`}
            </div>
        </div>
    `).join('');
}

function filtrarUsuarios() {
    const termino = searchInput.value.toLowerCase().trim();
    let usuariosFiltradosPorBusqueda = [...usuarios];
    if (termino !== '') {
        usuariosFiltradosPorBusqueda = usuarios.filter(usuario =>
            usuario.nombre.toLowerCase().includes(termino) ||
            usuario.email.toLowerCase().includes(termino) ||
            usuario.telefono.includes(termino) ||
            usuario.pais.toLowerCase().includes(termino)
        );
    }

    switch (filtroActual) {
        case 'contacted': usuariosFiltrados = usuariosFiltradosPorBusqueda.filter(u => u.contacted); break;
        case 'pending': usuariosFiltrados = usuariosFiltradosPorBusqueda.filter(u => !u.contacted); break;
        default: usuariosFiltrados = usuariosFiltradosPorBusqueda;
    }

    mostrarUsuarios(usuariosFiltrados);
    actualizarEstadisticas();
}

function cambiarTab(tipo) {
    document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`).classList.add('active');
    filtroActual = tipo;
    filtrarUsuarios();
}

function actualizarEstadisticas() {
    const totalContactados = usuarios.filter(u => u.contacted).length;
    const totalPendientes = usuarios.filter(u => !u.contacted).length;

    totalUsers.textContent = `Total: ${usuarios.length} usuarios`;
    filteredUsers.textContent = `Mostrando: ${usuariosFiltrados.length} usuarios`;

    countAll.textContent = usuarios.length;
    countContacted.textContent = totalContactados;
    countPending.textContent = totalPendientes;
}

// ====================== DEBUG ======================

console.log('Sistema de contacto WhatsApp con Firebase cargado correctamente');
console.log('Firebase disponible:', !!window.firebaseDb);
console.log('Funciones disponibles: cargarUsuariosDesdeFirebase(), agregarUsuario(), exportarUsuarios()');

window.cargarUsuariosDesdeFirebase = cargarUsuariosDesdeFirebase;
window.cambiarTab = cambiarTab;
window.marcarComoContactado = marcarComoContactado;
window.desmarcarContactado = desmarcarContactado;
