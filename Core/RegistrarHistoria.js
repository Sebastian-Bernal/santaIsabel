import { guardarHistoriaEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useCalendarioCitas } from '~/stores/Calendario.js';
import { useVarView } from '~/stores/varview.js';

// funcion para Validar campos del formulario Historia Clinica
export const validarYEnviarRegistrarHistoria = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas();
    const varView = useVarView();
    datos.HistoriaClinica.fecha_historia = calendarioStore.fechaActual;
    // Validacion si no se registran medicamentos
    if (datos.Plan_manejo_medicamentos?.length < 1) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.title = 'Historia sin plan de medicamentos'
        notificacionesStore.options.html = '¿Deseas registrar <strong>medicamentos</strong>?'
        notificacionesStore.options.confirmtext = 'Si'
        notificacionesStore.options.canceltext = 'No, continuar'
        let res = await notificacionesStore.alertRespuesta();
        if (res === 'confirmado') {
            varView.showMedicinas = true;
            return false
        };
    }

    // Validacion si no se registran procedimientos
    if (datos.Plan_manejo_procedimientos?.length < 1) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.title = 'Historia sin plan de procedimientos'
        notificacionesStore.options.html = '¿Deseas registrar <strong>Procedimiento</strong>?'
        notificacionesStore.options.confirmtext = 'Si'
        notificacionesStore.options.canceltext = 'No, continuar'
        let resp = await notificacionesStore.alertRespuesta();
        if (resp === 'confirmado') {
            varView.showProcedimientos = true;
            return false
        }
    }
    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            await guardarHistoriaEnIndexedDB(JSON.parse(JSON.stringify(datos)));
            return true
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await guardarHistoriaEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        return true
    }
};