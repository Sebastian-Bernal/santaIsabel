import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import emailjs from '@emailjs/browser';

// funcion para Validar campos del formulario cancelar cita
export const validarYEnviarCancelarCita = async (cita, motivo) => {
    const notificacionesStore = useNotificacionesStore();
    cita.estado = 'cancelada'
    const datos = { Cita: { ...cita, motivo_cancelacion: motivo } }

    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const pacientesStore = usePacientesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            await actualizarEnIndexedDB(JSON.parse(JSON.stringify({
                Cita: {
                    ...datos.Cita,
                    sincronizado: 0
                }
            })));

            let options = {
                metodo: 'DELETE',
                url: config.public.citas + '/' + datos.Cita.id,
                token: token,
                body: {
                    id: datos.Cita.id,
                    id_paciente: datos.Cita.id_paciente,
                    id_medico: datos.Cita.id_medico,
                    name_paciente: datos.Cita.name_paciente,
                    name_medico: datos.Cita.name_medico,
                    servicio: datos.Cita.servicio,
                    motivo: datos.Cita.motivo,
                    fecha: datos.Cita.fecha,
                    hora: datos.Cita.hora,
                    motivo_cancelacion: datos.Cita.motivo_cancelacion,
                    estado: datos.Cita.estado
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                const datosActualizadosLocal = {
                    Cita: {
                        id_temporal: id_temporal.data,
                        sincronizado: 1,
                        id: respuesta.data.id,
                        id_paciente: respuesta.data.id_paciente,
                        id_medico: respuesta.data.id_medico,
                        name_paciente: respuesta.data.name_paciente,
                        name_medico: respuesta.data.name_medico,
                        servicio: respuesta.data.servicio,
                        motivo: respuesta.data.motivo,
                        fecha: respuesta.data.fecha,
                        hora: respuesta.data.hora,
                        motivo_cancelacion: datos.Cita.motivo_cancelacion,
                        estado: datos.Cita.estado,
                        sincronizado: 1,
                    }
                }
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                console.log('datos actualizados')
                return true
            }

            
            // const pacientes = await pacientesStore.listPacientes
            // const paciente = pacientes.filter((paciente) => {
            //     return paciente.id === datos.Cita.id_paciente
            // })
            // const pacienteYCita = {...datos.Cita, ...paciente[0]};
            // console.log(pacienteYCita)
            // const response = await emailjs.send(
            //     import.meta.env.VITE_EMAILJS_SERVICE_ID,     // service_id
            //     import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CancelacionCita,    // template_id
            //     pacienteYCita,
            //     import.meta.env.VITE_EMAILJS_PUBLIC_KEY      // public_key
            // )
            // console.log('Correo enviado con éxito:', response.status, response.text)
            // return true
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