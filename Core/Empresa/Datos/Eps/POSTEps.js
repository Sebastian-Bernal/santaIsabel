import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarDatosEPS = async (datos) => {
    
    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    const id_temporal = await guardarEnDB(JSON.parse(JSON.stringify({EPS: {...datos.EPS, sincronizado: 0}})));

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.eps,
                token: token,
                body: {
                    nombre: datos.EPS.nombre,
                    codigo: datos.EPS.codigo,
                    direccion: datos.EPS.direccion,
                    telefono: datos.EPS.telefono,
                    email: datos.EPS.email,
                    website: datos.EPS.website,
                }
            }
            const respuesta = await api.functionCall(options)

            if(respuesta.success){
                const datosActualizadosLocal = {
                    EPS: {
                        id_temporal: id_temporal.data,
                        sincronizado: 1,
                        id: respuesta.data.id,
                        nombre: respuesta.data.nombre,
                        codigo: respuesta.data.codigo,
                        direccion: respuesta.data.direccion,
                        telefono: respuesta.data.telefono,
                        email: respuesta.data.email,
                        website: respuesta.data.website,
                    }
                }
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                console.log('datos actualizados')
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            await guardarEnDB(JSON.parse(JSON.stringify(datos)));
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