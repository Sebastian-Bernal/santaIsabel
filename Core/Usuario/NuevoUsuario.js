import { guardarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { guardarEnIndexedDBID } from '~/composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarNuevoUsuario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();

    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            const respuesta = await guardarEnIndexedDBID(JSON.parse(JSON.stringify(datos)));
            return respuesta
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            const respuesta = await guardarEnIndexedDBID(JSON.parse(JSON.stringify(datos)));
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await guardarEnIndexedDBID(JSON.parse(JSON.stringify(datos)));
        return true
    }
};