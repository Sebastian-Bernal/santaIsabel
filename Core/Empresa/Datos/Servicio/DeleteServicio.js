import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario
export const validarYEnviarDeleteServicio = async (datos) => {

    return await enviarFormularioDeleteServicio(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API y IndexedDB
export const enviarFormularioDeleteServicio = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // Mandar a API
            let options = {
                metodo: 'DELETE',
                url: config.public.servicios+ '/' + datos.id,
                token: token,
                body: {
                    id: datos.id,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // actualizar datos local
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar.', error);
        }
    } else {

        try {

            if(!reintento){
                const datosLocal = {
                    Servicio: {
                        sincronizado: 0,
                        id: datos.Servicio.id,
                        name: datos.Servicio.name,
                        plantilla: datos.Servicio.plantilla,
                    }
                }
                await guardarEnDB(JSON.parse(JSON.stringify(datosLocal)));
            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true

        } catch (error) {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
};