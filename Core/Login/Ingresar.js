import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { useApiRest } from '~/stores/apiRest.js';
import { encryptData } from '~/composables/Formulario/crypto.js';

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
                const tokenEncrypt = encryptData(respuesta.access_token);
                const userEncrypt = encryptData(respuesta.user.usuario);
                const rolEncrypt = encryptData(respuesta.user.rol);
                const permisosEncrypt = encryptData(respuesta.user.permisos);

                sessionStorage.setItem('token', tokenEncrypt);
                sessionStorage.setItem('user', userEncrypt);
                sessionStorage.setItem('Rol', rolEncrypt);
                sessionStorage.setItem('Permisos', permisosEncrypt);
                return true
            } else {
                return false
            }
        } catch (error) {
            notificacionesStore.options.icono = 'error'
            notificacionesStore.options.titulo = '¡No se pudo iniciar Sesion!'
            notificacionesStore.options.texto = 'Informacion invalida'
            notificacionesStore.options.tiempo = 3000
            notificacionesStore.simple()
            notificacionesStore.options.icono = ''
            notificacionesStore.options.titulo = ''
            notificacionesStore.options.texto = ''
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
