import { pacientes } from '~/data/pacientes';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { guardarPacienteEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarNuevoPaciente = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    // const pacientes = usePacientesStore();
    // const { Pacientes } = pacientes;
    // console.log(Pacientes)
    // Validacion si ya existe Paciente
    const paciente = pacientes.value.find(
        p => p.nombre.toLowerCase() === datos.Paciente.name.toLowerCase()
    )

    if (paciente) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Paciente ya existe';
        notificacionesStore.options.texto = 'Desear registrar otro?';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple()
        return;
    }

    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const pacientesStore = usePacientesStore();
    const notificacionesStore = useNotificacionesStore();

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            await guardarPacienteEnIndexedDB(JSON.parse(JSON.stringify(datos)));
            return true
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            await guardarPacienteEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await guardarPacienteEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        return true
    }

    await pacientesStore.setPacientes()
};