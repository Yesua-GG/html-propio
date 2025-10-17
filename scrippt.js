// Array de usuarios (se cargará desde Firebase)
let usuarios = [];

// Variables globales
let usuariosFiltrados = [...usuarios];
let usuarioSeleccionado = null;
let usuarioParaConfirmar = null; // mantiene una copia del usuario cuando se cierra el modal de edición
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
    // Esperar a que Firebase esté disponible
    setTimeout(() => {
        if (window.firebaseDb) {
            cargarUsuariosDesdeFirebase();
        } else {
            mostrarError('Firebase no está disponible. Recargando...');
            setTimeout(() => location.reload(), 2000);
        }
    }, 1000);
}

// Funciones de Firebase
async function cargarUsuariosDesdeFirebase() {
    try {
        mostrarCarga();
        
        // Cargar desde la colección 'users' (según FirestoreManager.kt)
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
                    // Mapear según la estructura real de UserData.kt
                    usuariosCargados.push({
                        id: doc.id, // ID del documento (deviceId)
                        nombre: datos.name || 'Usuario sin nombre',
                        email: datos.phoneNumber || 'Sin email', // En tu proyecto phoneNumber es el email
                        telefono: datos.phoneNumber || '+000000000', // Campo real del teléfono
                        pais: datos.country || 'No especificado',
                        fechaRegistro: datos.createdAt ? new Date(datos.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        estado: datos.abfblock ? 'Bloqueado' : 'Activo', // Usar campo real de bloqueo
                        deviceId: datos.deviceId || doc.id,
                        uid: datos.uid || '',
                        referralCode: datos.referralCode || '',
                        referredBy: datos.referredBy || null,
                        isNewUser: datos.isNewUser || false,
                        referralsCount: datos.referralsCount || 0,
                        usedDays: datos.usedDays || 0,
                        subscriptionDays: datos.subscriptionDays || 0,
                        razon: datos.razon || null,
                        contacted: datos.contacted || false, // Campo para marcar como contactado
                        contactedAt: datos.contactedAt || null // Fecha de contacto
                    });
                });
                console.log(`Usuarios cargados desde ${coleccionUsers}:`, usuariosCargados.length);
            } else {
                console.log('No se encontraron usuarios en la colección users');
            }
        } catch (error) {
            console.error(`Error al cargar desde ${coleccionUsers}:`, error.message);
            throw error;
        }
        
        if (usuariosCargados.length === 0) {
            // Si no se encontraron usuarios en ninguna colección, usar datos de ejemplo
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
        // Actualizar en la colección 'users' con la estructura real
        const usuarioRef = window.firebaseDoc(window.firebaseDb, 'users', usuarioId);
        await window.firebaseUpdateDoc(usuarioRef, {
            phoneNumber: nuevoTelefono, // Campo real según UserData.kt
            lastUpdated: new Date().toISOString()
        });
        console.log(`Teléfono actualizado en users para usuario ${usuarioId}`);
        return true;
        
    } catch (error) {
        console.error('Error al actualizar teléfono en Firebase:', error);
        return false;
    }
}

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

async function marcarComoContactado(usuarioId) {
    try {
        const usuario = usuarios.find(u => u.id === usuarioId);
        if (!usuario) {
            console.error('Usuario no encontrado');
            return;
        }
        
        // Actualizar en Firebase
        const usuarioRef = window.firebaseDoc(window.firebaseDb, 'users', usuarioId);
        await window.firebaseUpdateDoc(usuarioRef, {
            contacted: true,
            contactedAt: new Date().toISOString()
        });
        
        // Actualizar en el array local
        usuario.contacted = true;
        usuario.contactedAt = new Date().toISOString();
        
        // Refrescar la vista
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
        if (!usuario) {
            console.error('Usuario no encontrado');
            return;
        }
        
        // Actualizar en Firebase
        const usuarioRef = window.firebaseDoc(window.firebaseDb, 'users', usuarioId);
        await window.firebaseUpdateDoc(usuarioRef, {
            contacted: false,
            contactedAt: null
        });
        
        // Actualizar en el array local
        usuario.contacted = false;
        usuario.contactedAt = null;
        
        // Refrescar la vista
        filtrarUsuarios();
        actualizarEstadisticas();
        
        mostrarNotificacion(`${usuario.nombre} desmarcado como contactado`, 'success');
        
    } catch (error) {
        console.error('Error al desmarcar:', error);
        mostrarNotificacion('Error al desmarcar usuario', 'error');
    }
}

function configurarEventListeners() {
    // Búsqueda
    searchInput.addEventListener('input', filtrarUsuarios);
    
    // Modal de edición
    closeModal.addEventListener('click', cerrarModalEdicion);
    cancelBtn.addEventListener('click', cerrarModalEdicion);
    confirmBtn.addEventListener('click', mostrarModalConfirmacion);
    
    // Modal de confirmación
    cancelConfirmBtn.addEventListener('click', cerrarModalConfirmacion);
    finalConfirmBtn.addEventListener('click', abrirWhatsApp);
    
    // Cerrar modales al hacer clic fuera
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            cerrarModalEdicion();
        }
    });
    
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            cerrarModalConfirmacion();
        }
    });
    
    // Enter en el input de teléfono
    phoneInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            mostrarModalConfirmacion();
        }
    });
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
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-info">
                    <h3>${usuario.nombre}</h3>
                    <p>${usuario.email}</p>
                </div>
            </div>
            <div class="user-details">
                <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <span>${usuario.telefono}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${usuario.pais}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>Registrado: ${formatearFecha(usuario.fechaRegistro)}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-circle" style="color: ${usuario.estado === 'Activo' ? '#28a745' : '#dc3545'}"></i>
                    <span>${usuario.estado}</span>
                </div>
                ${usuario.referralCode ? `
                <div class="detail-item">
                    <i class="fas fa-gift"></i>
                    <span>Código: ${usuario.referralCode}</span>
                </div>
                ` : ''}
                ${usuario.subscriptionDays > 0 ? `
                <div class="detail-item">
                    <i class="fas fa-crown"></i>
                    <span>Días suscripción: ${usuario.subscriptionDays}</span>
                </div>
                ` : ''}
                ${usuario.razon ? `
                <div class="detail-item">
                    <i class="fas fa-exclamation-triangle" style="color: #dc3545;"></i>
                    <span>Razón: ${usuario.razon}</span>
                </div>
                ` : ''}
                ${usuario.contacted && usuario.contactedAt ? `
                <div class="detail-item">
                    <i class="fas fa-check-circle" style="color: #28a745;"></i>
                    <span>Contactado: ${formatearFecha(usuario.contactedAt)}</span>
                </div>
                ` : ''}
            </div>
            <div class="action-buttons">
                <button class="contact-btn ${usuario.contacted ? 'contacted' : ''}" onclick="abrirModalEdicion('${usuario.id}')">
                    <i class="fab fa-whatsapp"></i>
                    ${usuario.contacted ? 'Recontactar' : 'Contactar por WhatsApp'}
                </button>
                ${!usuario.contacted ? `
                <button class="marked-btn" onclick="marcarComoContactado('${usuario.id}')">
                    <i class="fas fa-check"></i>
                    Marcar como Contactado
                </button>
                ` : `
                <button class="marked-btn" onclick="desmarcarContactado('${usuario.id}')" style="background: linear-gradient(135deg, #dc3545, #c82333);">
                    <i class="fas fa-times"></i>
                    Desmarcar
                </button>
                `}
            </div>
        </div>
    `).join('');
}

function filtrarUsuarios() {
    const termino = searchInput.value.toLowerCase().trim();
    let usuariosFiltradosPorBusqueda = [...usuarios];
    
    // Filtrar por término de búsqueda
    if (termino !== '') {
        usuariosFiltradosPorBusqueda = usuarios.filter(usuario => 
            usuario.nombre.toLowerCase().includes(termino) ||
            usuario.email.toLowerCase().includes(termino) ||
            usuario.telefono.includes(termino) ||
            usuario.pais.toLowerCase().includes(termino)
        );
    }
    
    // Aplicar filtro de pestaña
    switch (filtroActual) {
        case 'contacted':
            usuariosFiltrados = usuariosFiltradosPorBusqueda.filter(usuario => usuario.contacted);
            break;
        case 'pending':
            usuariosFiltrados = usuariosFiltradosPorBusqueda.filter(usuario => !usuario.contacted);
            break;
        default:
            usuariosFiltrados = usuariosFiltradosPorBusqueda;
    }
    
    mostrarUsuarios(usuariosFiltrados);
    actualizarEstadisticas();
}

function cambiarTab(tipo) {
    // Actualizar pestañas activas
    document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`).classList.add('active');
    
    // Cambiar filtro
    filtroActual = tipo;
    
    // Re-filtrar usuarios
    filtrarUsuarios();
}

function actualizarEstadisticas() {
    const totalContactados = usuarios.filter(u => u.contacted).length;
    const totalPendientes = usuarios.filter(u => !u.contacted).length;
    
    totalUsers.textContent = `Total: ${usuarios.length} usuarios`;
    filteredUsers.textContent = `Mostrando: ${usuariosFiltrados.length} usuarios`;
    
    // Actualizar contadores de pestañas
    countAll.textContent = usuarios.length;
    countContacted.textContent = totalContactados;
    countPending.textContent = totalPendientes;
}

function abrirModalEdicion(usuarioId) {
    usuarioSeleccionado = usuarios.find(u => u.id === usuarioId);
    
    if (!usuarioSeleccionado) {
        console.error('Usuario no encontrado');
        return;
    }
    
    // Llenar el modal con los datos del usuario
    modalUserName.textContent = usuarioSeleccionado.nombre;
    modalUserEmail.textContent = usuarioSeleccionado.email;
    phoneInput.value = usuarioSeleccionado.telefono;
    
    // Mostrar el modal
    editModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Enfocar el input después de un breve delay
    setTimeout(() => {
        phoneInput.focus();
        phoneInput.select();
    }, 100);
}

function cerrarModalEdicion() {
    editModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    usuarioSeleccionado = null;
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
    
    // Actualizar el número en el usuario seleccionado
    usuarioSeleccionado.telefono = numeroTelefono;
    
    // Intentar actualizar en Firebase si es posible
    if (window.firebaseDb && usuarioSeleccionado.id && !usuarioSeleccionado.id.startsWith('ejemplo-')) {
        try {
            const actualizado = await actualizarTelefonoEnFirebase(usuarioSeleccionado.id, numeroTelefono);
            if (actualizado) {
                console.log('Teléfono actualizado en Firebase');
            }
        } catch (error) {
            console.log('No se pudo actualizar en Firebase, pero continuando...');
        }
    }
    
    // Guardar una copia del usuario para usarla en la confirmación (no depender de usuarioSeleccionado que se limpia al cerrar)
    usuarioParaConfirmar = Object.assign({}, usuarioSeleccionado);

    // Llenar el modal de confirmación con la copia
    confirmUserName.textContent = usuarioParaConfirmar.nombre;
    confirmPhoneNumber.textContent = usuarioParaConfirmar.telefono;

    // Cerrar modal de edición y abrir modal de confirmación
    cerrarModalEdicion();
    confirmModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function cerrarModalConfirmacion() {
    confirmModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    // Limpiar la copia de confirmación
    usuarioParaConfirmar = null;
}

function validarNumeroTelefono(numero) {
    // Expresión regular para validar números de teléfono internacionales
    const regex = /^\+[1-9]\d{1,14}$/;
    return regex.test(numero.replace(/\s/g, ''));
}

function abrirWhatsApp() {
    // Usar la copia guardada para evitar null si usuarioSeleccionado fue limpiado
    const user = usuarioParaConfirmar || usuarioSeleccionado;
    if (!user) {
        mostrarNotificacion('No se encontró el usuario a contactar', 'error');
        return;
    }

    const numeroTelefono = user.telefono.replace(/\s/g, '');
    const mensaje = encodeURIComponent(`Hola ${user.nombre}, te contacto desde nuestro sistema de gestión.`);
    
    // Crear URL de WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensaje}`;
    
    // Abrir WhatsApp en una nueva ventana
    window.open(urlWhatsApp, '_blank');
    
    // Cerrar el modal
    cerrarModalConfirmacion();
    
    // Mostrar mensaje de éxito
    mostrarNotificacion('WhatsApp abierto correctamente', 'success');
}

function formatearFecha(fecha) {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    // Estilos para la notificación
    let backgroundColor = '#17a2b8';
    let iconClass = 'info-circle';
    
    if (tipo === 'success') {
        backgroundColor = '#28a745';
        iconClass = 'check-circle';
    } else if (tipo === 'error') {
        backgroundColor = '#dc3545';
        iconClass = 'exclamation-circle';
    }
    
    notificacion.innerHTML = `
        <i class="fas fa-${iconClass}"></i>
        <span>${mensaje}</span>
    `;
    
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Añadir animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Añadir al DOM
    document.body.appendChild(notificacion);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 3000);
}

// Función para agregar nuevos usuarios (útil para testing)
function agregarUsuario(nuevoUsuario) {
    const id = Math.max(...usuarios.map(u => u.id)) + 1;
    usuarios.push({ id, ...nuevoUsuario });
    usuariosFiltrados = [...usuarios];
    mostrarUsuarios(usuariosFiltrados);
    actualizarEstadisticas();
}

// Función para exportar datos de usuarios (útil para debugging)
function exportarUsuarios() {
    const dataStr = JSON.stringify(usuarios, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'usuarios.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Funciones de utilidad para desarrollo
console.log('Sistema de contacto WhatsApp con Firebase cargado correctamente');
console.log('Firebase disponible:', !!window.firebaseDb);
console.log('Funciones disponibles: cargarUsuariosDesdeFirebase(), agregarUsuario(), exportarUsuarios()');

// Funciones globales disponibles desde el HTML
window.cargarUsuariosDesdeFirebase = cargarUsuariosDesdeFirebase;
window.cambiarTab = cambiarTab;
window.marcarComoContactado = marcarComoContactado;
window.desmarcarContactado = desmarcarContactado;
