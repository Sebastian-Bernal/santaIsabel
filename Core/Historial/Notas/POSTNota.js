import { guardarEnDB, actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../../stores/notificaciones.js'
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nueva Nota
export const validarYEnviarNuevaNota = async (datos) => {
    const notificacionesStore = useNotificacionesStore()

    const nota = datos?.Nota;

    // Validar que todos los campos estén presentes y no vacíos
    if (
        !nota?.id_paciente ||
        !nota?.direccion ||
        !nota?.fecha_nota ||
        !nota?.hora_nota ||
        !nota?.subjetivo ||
        !nota?.objetivo ||
        !nota?.actividades ||
        !nota?.plan ||
        !nota?.intervencion ||
        !nota?.evaluacion ||
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

    return await enviarFormularioNota(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioNota = async (datos, reintento= false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    datos.Nota.nota = `
    Subjetivo: ${datos.Nota.subjetivo} 
    Objetivo: ${datos.Nota.objetivo} 
    Actividades: ${datos.Nota.actividades}
    Plan: ${datos.Nota.plan}
    Intervencion: ${datos.Nota.intervencion}
    Evaluacion: ${datos.Nota.evaluacion}
    `
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
            return true
        }
    } else {
        try {
            if(!reintento){
                await guardarEnDB(JSON.parse(JSON.stringify({Nota: {...datos.Nota, sincronizado: 0}})));
            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
};