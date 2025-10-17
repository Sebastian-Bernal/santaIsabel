import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '~/stores/notificaciones.js'

// funcion para Validar campos del formulario Nueva Cita
export const validarYEnviarNuevaCita = async (datos) => {
    const notificacionesStore = useNotificacionesStore();

    return await enviarFormulario({...datos});
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    const id_temporal = await guardarEnDB(JSON.parse(JSON.stringify({Cita: {...datos.Cita, estado: 'inactiva', sincronizado: 0}})));

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.citas,
                token: token,
                body: {
                    id_paciente: datos.Cita.id_paciente,
                    id_medico: datos.Cita.id_medico,
                    name_paciente: datos.Cita.name_paciente,
                    name_medico: datos.Cita.name_medico,
                    servicio: datos.Cita.servicio,
                    motivo: datos.Cita.motivo,
                    fecha: datos.Cita.fecha,
                    hora: datos.Cita.hora
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
                        estado: respuesta.data.estado
                    }
                }
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                console.log('datos actualizados')
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            // await guardarEnDB(JSON.parse(JSON.stringify(datos)));
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        // await guardarEnDB(JSON.parse(JSON.stringify(datos)));
        return true
    }
};