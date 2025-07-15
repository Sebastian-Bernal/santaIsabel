import { useMedicosStore } from '~/stores/Formularios/medicos/Medico.js';
import { guardarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'

// funcion para Validar campos del formulario Nuevo Medico
export const validarYEnviarNuevoMedico = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const storeMedicos = useMedicosStore();
    const medicos = await storeMedicos.listMedicos

    // Validar si ya existe el medico registrado
    const medico = await medicos.find(
        p => parseInt(p.No_document) === parseInt(datos.Medico.No_document)
    )

    if (medico) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Medico ya existe';
        notificacionesStore.options.texto = 'Deseas registrar otro?';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple()
        return;
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
            await guardarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
            return true
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            await guardarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await guardarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        return true
    }
};