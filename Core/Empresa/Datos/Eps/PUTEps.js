import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarActualizarEps = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const eps = datos.EPS;

    // 🔍 Validar campos obligatorios
    const camposObligatorios = ['nombre', 'codigo', 'nit',];
    const camposFaltantes = camposObligatorios.filter(campo => {
        const valor = eps[campo];
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

    return await enviarFormularioPutEPS(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioPutEPS = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.eps + '/' + datos.EPS.id,
                token: token,
                body: {
                    id: datos.EPS.id,
                    nombre: datos.EPS.nombre,
                    codigo: datos.EPS.codigo,
                    nit: datos.EPS.nit,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify({
                    EPS: {
                        ...datos.EPS,
                        id: respuesta.data.id,
                        nombre: respuesta.data.nombre,
                        codigo: respuesta.data.codigo,
                        nit: respuesta.data.nit,
                        estado: respuesta.data.estado,
                        sincronizado: 1
                    }
                })));
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {

        try {
            if(!reintento){
                await actualizarEnIndexedDB({
                    EPS: {
                        ...datos.EPS,
                        id_temporal: datos.EPS.id_temporal,
                        id: datos.EPS.id,
                        estado: 1,
                        sincronizado: 0
                    }
                })
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