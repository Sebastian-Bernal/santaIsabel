import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioDeleteEPS = async (datos, reintento=false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))
    console.log(datos)
    if(!reintento){
        await actualizarEnIndexedDB({
            EPS: {
                ...datos,
                id_temporal: datos.id_temporal,
                id: datos.id,
                estado: 0,
                sincronizado: 0
            }
        })
    }

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'DELETE',
                url: config.public.eps + '/' + datos.id,
                token: token,
                body: {
                    id: datos.id,
                }
            }
            const respuesta = await api.functionCall(options)
            console.log(respuesta)
            if (respuesta.success) {
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify({
                    EPS: {
                        ...datos.EPS,
                        id: respuesta.data.id,
                        id_temporal: datos.id_temporal,
                        estado: 0,
                        sincronizado: 1
                    }
                })));
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
            notificacionesStore.options.texto = 'No se pudo enviar formulario, datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            notificacionesStore.simple()
            return true
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