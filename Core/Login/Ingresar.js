import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { secciones } from '~/data/Buttons.js';
import { useApiRest } from '~/stores/apiRest.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarLogin = async (datos) => {
    const notificacionesStore = useNotificacionesStore();

    const estado = await enviarFormulario(datos.Usuario)
    return {
        estado,
    };
};

// Funcion para validar conexion a internet y enviar fomulario a API
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()

    sessionStorage.setItem('Empresa', datos.empresa)
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.login,
                body: {
                    correo: datos.correo,
                    contraseña: datos.contraseña
                },
            }
            const respuesta = await api.functionCall(options)
            if (respuesta) {
                sessionStorage.setItem('token', respuesta.access_token)
                sessionStorage.setItem('name', respuesta.user)
                sessionStorage.setItem('Usuario', datos.correo)
                sessionStorage.setItem('Permisos', JSON.stringify(secciones));
                sessionStorage.setItem('Rol', 'Admin');
                return true
            } else {
                return false
            }
                // sessionStorage.setItem('Usuario', datos.correo)
                // sessionStorage.setItem('Permisos', JSON.stringify(secciones));
                // sessionStorage.setItem('Rol', 'Admin');
            return true
        } catch (error) {
            console.error('Fallo al enviar. Intenta en otro momento', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};
