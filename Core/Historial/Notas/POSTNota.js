import { guardarEnDB, actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../../stores/notificaciones.js'
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nueva Nota
export const validarYEnviarNuevaNota = async (datos) => {
    console.log(datos)
    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    const id_temporal = await guardarEnDB(JSON.parse(JSON.stringify({Nota: {...datos.Nota, sincronizado: 0}})));

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.notas,
                token: token,
                body: {
                    id_paciente: datos.Nota.id_paciente,
                    id_profesional: datos.Nota.id_profesional,
                    direccion: datos.Nota.direccion,
                    fecha_nota: datos.Nota.fecha_nota,
                    hora_nota: datos.Nota.hora_nota,
                    nota: datos.Nota.nota,
                    tipoAnalisis: datos.Nota.tipoAnalisis,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                const datosActualizadosLocal = {
                    Nota: {
                        id_temporal: id_temporal.data,
                        sincronizado: 1,
                        id: respuesta.data.id,
                        id_paciente: respuesta.data.id_paciente,
                        id_profesional: respuesta.data.id_profesional,
                        direccion: respuesta.data.direccion,
                        fecha_nota: respuesta.data.fecha_nota,
                        hora_nota: respuesta.data.hora_nota,
                        nota: respuesta.data.nota,
                        tipoAnalisis: respuesta.data.tipoAnalisis,
                    }
                }
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                console.log('datos actualizados')
                return true
            }

        } catch (error) {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
            notificacionesStore.options.texto = 'No se pudo enviar formulario, datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            notificacionesStore.simple()
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};