import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Modificar Paciente
export const validarYEnviarEliminarMedico = async (datos) => {
console.log('eliminando', datos)
    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    // Guardar local
    await actualizarEnIndexedDB(JSON.parse(JSON.stringify(
        {
            Profesional: {
                ...datos.Profesional,
                id_usuario: datos.InformacionUser.id,
                sincronizado: 0,
                estado: 0
            }
        }
    )))


    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'DELETE',
                url: config.public.profesionals + '/' + datos.Profesional.id,
                token: token,
                body: {
                    id: datos.Profesional.id,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {

                // Actualizar local
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(
                    {
                        Profesional: {
                            ...datos.Profesional,
                            id_usuario: datos.InformacionUser.id,
                            estado: 0,
                            sincronizado: 1
                        }
                    }
                )));
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};