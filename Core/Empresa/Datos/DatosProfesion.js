import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB } from '~/composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarDatosProfesion = async (datos) => {
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
                metodo: 'POST',
                url: config.public.professions,
                token: token,
                body: {
                    profession_code: datos.Profesion.codigo,
                    profession_name: datos.Profesion.nombre,
                }
            }
            const respuesta = await api.functionCall(options)
            console.log(respuesta)
            if (respuesta.success) {
                await guardarEnDB(JSON.parse(JSON.stringify(datos)));
                return true
            }
            await guardarEnDB(JSON.parse(JSON.stringify(datos)));
            return true
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

export async function traerdatos () {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'GET',
                url: config.public.professions,
                head: {
                    'X-Company': 'store_two'
                },
                token: token
            }
            const respuesta = await api.functionCall(options)

            if(respuesta.success){
                return respuesta.data
            }
        } catch (error) {
            console.error('Fallo al traer datos', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.texto = 'en desarrollo'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return false
    }
}