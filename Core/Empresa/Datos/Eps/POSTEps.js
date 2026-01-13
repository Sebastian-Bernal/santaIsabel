import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarDatosEPS = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const eps = datos.EPS;

    // 🔍 Validar campos obligatorios
    const camposObligatorios = ['nombre', 'codigo', 'nit'];
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

    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormulario = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            console.log('enviando:', datos.EPS)
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.eps,
                token: token,
                body: {
                    nombre: datos.EPS.nombre,
                    codigo: datos.EPS.codigo,
                    nit: datos.EPS.nit,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                const datosActualizadosLocal = {
                    EPS: {
                        sincronizado: 1,
                        id: respuesta.data.id,
                        nombre: respuesta.data.nombre,
                        codigo: respuesta.data.codigo,
                        nit: respuesta.data.nit,
                        estado: 1,
                    }
                }
                await guardarEnDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                console.log('datos guardados')
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardado localmente', error);
        }
    } else {
        try {
            if(!reintento){
                const datosActualizadosLocal = {
                    EPS: {
                        sincronizado: 1,
                        id: datos.EPS.id,
                        nombre: datos.EPS.nombre,
                        codigo: datos.EPS.codigo,
                        nit: datos.EPS.nit,
                        estado: 1,
                    }
                }
                await guardarEnDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
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