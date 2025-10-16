import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import emailjs from '@emailjs/browser';

// funcion para Validar campos del formulario cancelar cita
export const validarYEnviarCancelarCita = async (cita, motivo) => {
    const notificacionesStore = useNotificacionesStore();
    cita.estado = 'cancelada'
    const datos = { Cita: { ...cita, motivoCancelacion: motivo } }

    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const pacientesStore = usePacientesStore();
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datos)));


            
            const pacientes = await pacientesStore.listPacientes
            const paciente = pacientes.filter((paciente) => {
                return paciente.id === datos.Cita.id_paciente
            })
            const pacienteYCita = {...datos.Cita, ...paciente[0]};
            console.log(pacienteYCita)
            const response = await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,     // service_id
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CancelacionCita,    // template_id
                pacienteYCita,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY      // public_key
            )
            console.log('Correo enviado con éxito:', response.status, response.text)
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