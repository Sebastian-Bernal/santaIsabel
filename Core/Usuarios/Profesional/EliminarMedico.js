import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';

// funcion para Validar campos del formulario Modificar Paciente
export const validarYEnviarEliminarMedico = async (datos) => {
    const pacientesStore = usePacientesStore();
    const pacientes = await pacientesStore.listPacientes;
    const existePaciente = pacientes.some(paciente => paciente.id_usuario === datos.User.id);

    const datosAEnviar = {
        Medico: {
            ...datos.Medico,
            estado: 'inactivo'
        },
        ...(existePaciente && {
            User: {
                ...datos.User,
                rol: 'Paciente'
            }
        })
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