// Creacion de botones del Navbar
export const submenuNotificaciones = [
    { id: 1, nombre: 'Notificaciones', icon: 'fa-bell', link: '#' },
    { id: 2, nombre: 'Alertas', icon: 'fa-bell-concierge', link: '#' }
];

export const submenuSesion = [
    { id: 1, nombre: 'Iniciar Sesión', icon: 'fa-user', link: '/' },
    { id: 2, nombre: 'Cerrar Sesión', icon: 'fa-right-from-bracket', link: '/', accion: () => { localStorage.removeItem('seccion')} },
]