import { guardarEnDB, actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../../stores/notificaciones.js'
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nueva Nota
export const validarYEnviarNuevoMovimiento = async (datos) => {
    const notificacionesStore = useNotificacionesStore()

    const Movimiento = datos?.Movimiento;

    // Validar que todos los campos estén presentes y no vacíos
    if (
        !Movimiento?.cantidadMovimiento ||
        !Movimiento?.fechaMovimiento ||
        !Movimiento?.tipoMovimiento ||
        !Movimiento?.id_medico ||
        !Movimiento?.id_insumo
    ) {
        const msg = 'Todos los campos son obligatorios. Verifica que no haya ninguno vacío.';
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Información inválida.';
        notificacionesStore.options.texto = msg;
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
        return;
    }

    if (
        Movimiento.cantidadMovimiento > datos.Insumos.stock && Movimiento.tipoMovimiento === 'Egreso'
    ) {
        const msg = 'Cantidad de movimiento mayor al stock actual.';
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Información inválida.';
        notificacionesStore.options.texto = msg;
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
        return;
    }

    return await enviarFormularioInsumos(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioInsumos = async (datos, reintento= false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))
    const varView = useVarView();

    varView.showPDFInsumo = true
    varView.propiedadesPDF = {
        ...datos.Insumos,
        ...datos.Movimiento,
        id_medico: 1,
        nombreInsumo: datos.Insumos.nombre,
        codigoInsumo: 'INS-001',
        unidad: datos.Insumos.unidad,
        areaDestino: 'Bodega Central',
    }

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.movimientos,
                token: token,
                body: {
                    id_insumo: datos.Movimiento.id_insumo,
                    id_medico: datos.Movimiento.id_medico,
                    cantidadMovimiento: datos.Movimiento.cantidadMovimiento,
                    fechaMovimiento: datos.Movimiento.fechaMovimiento,
                    tipoMovimiento: datos.Movimiento.tipoMovimiento,
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