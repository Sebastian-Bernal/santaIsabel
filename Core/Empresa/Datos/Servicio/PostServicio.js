import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario
export const validarYEnviarDatosServicio = async (datos) => {
    const notificacionesStore = useNotificacionesStore()
    const servicio = datos.Servicio;

    // 🔍 Verificar campos obligatorios
    const camposObligatorios = ['name', 'plantilla'];
    const camposFaltantes = camposObligatorios.filter(campo => {
        const valor = servicio[campo];
        return valor === undefined || valor === null || valor === '';
    });

    if (camposFaltantes.length > 0) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Datos incompletos';
        notificacionesStore.options.texto = `Faltan los siguientes campos: ${camposFaltantes.join(', ')}`;
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple();
        return false;
    }

    return await enviarFormularioServicio(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API y IndexedDB
export const enviarFormularioServicio = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // Mandar a API
            let options = {
                metodo: 'POST',
                url: config.public.servicios,
                token: token,
                body: {
                    plantilla: datos.Servicio.plantilla,
                    name: datos.Servicio.name,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // actualizar datos local
                const datosActualizadosLocal = {
                    Servicio: {
                        sincronizado: 1,
                        id: respuesta.data.id,
                        name: respuesta.data.name,
                        plantilla: respuesta.data.plantilla,
                    }
                }
                await guardarEnDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
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