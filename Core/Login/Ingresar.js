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
    // dato guardado Temporal por indexedDB
    sessionStorage.setItem('Nombre', correo.name)
    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const online = navigator.onLine;
    if (online) {
        try {
            console.log(datos)
            sessionStorage.setItem('Usuario', datos.correo)
            // sessionStorage.setItem('Nombre', datos.name)
            return true
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};