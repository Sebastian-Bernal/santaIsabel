import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarEliminarProfesion = async (datos) => {

    return await enviarFormularioDeleteProfesion(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioDeleteProfesion = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'DELETE',
                url: config.public.professions + '/' + datos.id,
                token: token,
                body: {
                    id: datos.id,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify({
                    Profesion: {
                        codigo: respuesta.data.codigo,
                        nombre: respuesta.data.nombre,
                        permisos: respuesta.data.permisos,
                        id: respuesta.data.id,
                        id_temporal: datos.Profesion.id_temporal,
                        sincronizado: 1,
                        estado: 0
                    }
                })));
                return true
            }

        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {

        try {
            if (!reintento) {
                // Actualizar local
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify({
                    Profesion: {
                        codigo: datos.Profesion.codigo,
                        nombre: datos.Profesion.nombre,
                        permisos: datos.Profesion.permisos,
                        id: datos.Profesion.id,
                        id_temporal: datos.Profesion.id_temporal,
                        sincronizado: 1,
                        estado: 0
                    }
                })));
            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
            notificacionesStore.options.texto = 'en desarrollo'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        }
    }
};