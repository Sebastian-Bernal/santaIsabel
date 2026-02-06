import { decryptData } from '~/composables/Formulario/crypto';

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const eliminarInsumo = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    // Guardar local

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'DELETE',
                url: config.public.insumos + '/' + datos.id,
                token: token,
                body: {
                    id: datos.id,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {

                // Actualizar local

                return true
            }
        } catch (error) {
            // notificacionesStore.options.icono = 'warning'
            // notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
            // notificacionesStore.options.texto = 'No se pudo enviar formulario, datos guardados localmente'
            // notificacionesStore.options.tiempo = 3000
            // notificacionesStore.simple()
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