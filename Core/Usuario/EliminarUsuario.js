import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales.js';


export const validarYEnviarEliminarUsuario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const pacientesStore = usePacientesStore();
    const pacientes = await pacientesStore.tablaPacientes;

    const medicosStore = useMedicosStore();
    const medicos = await medicosStore.tablaMedicos;

    // validar si existe usuario en pacientes y profesionales y desactivarlos
    const existePaciente = pacientes.find(paciente => paciente.id_usuario === datos.User.id);
    const existeProfesional = medicos.find(medico => medico.id_usuario === datos.User.id);

    const datosAEnviar = {
        User: {
            ...datos.User,
            estado: 'inactivo'
        },
        ...(existePaciente ? {
            Paciente: {
                ...existePaciente,
                estado: 'inactivo'
            }
        } : {}),
        ...(existeProfesional ? {
            Medico: {
                ...existeProfesional,
                estado: 'inactivo'
            }
        } : {})
    };

    return await enviarFormulario(datosAEnviar);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
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