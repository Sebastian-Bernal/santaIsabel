import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nueva Nota
export const validarYEnviarActualizarNota = async (datos) => {
    const notificacionesStore = useNotificacionesStore()

    const nota = datos?.Nota;

    // Validar que todos los campos estén presentes y no vacíos
    if (
        !nota?.id_paciente ||
        !nota?.direccion ||
        !nota?.fecha_nota ||
        !nota?.hora_nota ||
        !nota?.nota ||
        !nota?.tipoAnalisis
    ) {
        const msg = 'Todos los campos son obligatorios. Verifica que no haya ninguno vacío.';
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Información inválida.';
        notificacionesStore.options.texto = msg;
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
        return;
    }

    return await enviarFormularioPutNota(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioPutNota = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    if(!reintento){
        await actualizarEnIndexedDB(JSON.parse(JSON.stringify({Nota: {...datos.Nota, sincronizado: 0}})));
    }

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.notas + '/' + datos.Nota.id,
                token: token,
                body: {
                    id: datos.Nota.id,
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
                        id_temporal: datos.Nota.id_temporal,
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