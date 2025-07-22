import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useAdministrativosStore } from '~/stores/Formularios/administrativo/Administrativo.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarLogin = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const administrativosStore = useAdministrativosStore();
    const administradores = await administrativosStore.listAdministrativos

    const correo = administradores.find(
        p => p.correo.toLowerCase() === datos.correo.toLowerCase()
    )

    const contraseña = administradores.find(
        p => p.contraseña.toLowerCase() === datos.contraseña.toLowerCase()
    )

    if (!correo || !contraseña) {
        notificacionesStore.options.icono = 'error'
        notificacionesStore.options.titulo = 'Error de ingreso';
        notificacionesStore.options.texto = 'El correo ingresado y la contraseña no son Correctos';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple()
        return;
    }

    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const online = navigator.onLine;
    if (online) {
        try {
            sessionStorage.setItem('Usuario', datos.correo)
            return true
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.texto = 'Recuperar contraseña cuando halla internet'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};