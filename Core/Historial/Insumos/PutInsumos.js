import { guardarEnDB, actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../../stores/notificaciones.js'
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nueva Nota
export const validarYEnviarActualizarInusmo = async (datos) => {
    const notificacionesStore = useNotificacionesStore()

    const insumo = datos?.Insumos;

    // Validar que todos los campos estén presentes y no vacíos
    if (
        !insumo?.nombre ||
        !insumo?.categoria ||
        !insumo?.activoL ||
        insumo?.receta === undefined ||
        !insumo?.unidad ||
        insumo?.stock === undefined ||
        !insumo?.lote ||
        !insumo?.vencimiento ||
        !insumo?.ubicacion

    ) {
        const msg = 'Todos los campos son obligatorios. Verifica que no haya ninguno vacío.';
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Información inválida.';
        notificacionesStore.options.texto = msg;
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
        return;
    }

    return await enviarFormularioActualizarInsumo(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioActualizarInsumo = async (datos, reintento= false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))
    const varView = useVarView();

    if(datos.Insumos.receta === ''){
        datos.Insumos.receta === false
    }

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.insumos + '/' + datos.Insumos.id,
                token: token,
                body: {
                    id: datos.Insumos.id,
                    nombre: datos.Insumos.nombre,
                    categoria: datos.Insumos.categoria,
                    activo: datos.Insumos.activoL,
                    receta: datos.Insumos.receta,
                    unidad: datos.Insumos.unidad,
                    stock: datos.Insumos.stock,
                    lote: datos.Insumos.lote,
                    vencimiento: datos.Insumos.vencimiento,
                    ubicacion: datos.Insumos.ubicacion,
                }

            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                return true
            }

        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        try {
            // if(!reintento){
            //     await guardarEnDB(JSON.parse(JSON.stringify({Nota: {...datos.Nota, sincronizado: 0}})));
            // }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
};