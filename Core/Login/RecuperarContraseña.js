import { useNotificacionesStore } from '../../stores/notificaciones.js'

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarRecuperarContraseña = async (datos) => {
    const notificacionesStore = useNotificacionesStore();

    return await enviarFormulario(datos.Usuario);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
        let options = {
                metodo: 'POST',
                url: config.public.recuperarContraseña,
                body: {
                    correo: datos.correo,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                console.log('correo enviado')
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar.', error);
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