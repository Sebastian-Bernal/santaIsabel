import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'


export const validarYEnviarEliminarUsuario = async (datos) => {
    return await enviarFormulario(datosAEnviar);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'DELETE',
                url: config.public.users,
                token: token,
                body: {
                    id: datos.Software.id,
                    pin: datos.Software.pin,
                    testID: datos.Software.testID
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                await guardarEnDB(JSON.parse(JSON.stringify(datos)));
                return true
            }
            await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
            return true
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        return true
    }
};