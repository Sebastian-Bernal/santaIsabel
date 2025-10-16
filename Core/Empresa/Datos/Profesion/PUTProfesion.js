import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarActualizarProfesion = async (datos) => {
    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')
    
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.professions + '/' + datos.Profesion.id,
                token: token,
                body: {
                    codigo: datos.Profesion.codigo,
                    nombre: datos.Profesion.nombre,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            // await guardarEnDB(JSON.parse(JSON.stringify(datos)));
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.texto = 'en desarrollo'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};