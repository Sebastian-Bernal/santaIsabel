import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'

// funcion para Validar campos del formulario Modificar Paciente
export const validarYEnviarModificarMedico = async (datos) => {
    const notificacionesStore = useNotificacionesStore();


    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.profesionals,
                token: token,
                body: {
                        name: datos.InformacionUser.name,
                        No_document: datos.InformacionUser.No_document,
                        type_doc: datos.InformacionUser.type_doc,
                        celular: datos.InformacionUser.celular,
                        telefono: datos.InformacionUser.telefono,
                        nacimiento: datos.InformacionUser.nacimiento,
                        direccion: datos.InformacionUser.direccion,
                        municipio: datos.InformacionUser.municipio,
                        departamento: datos.InformacionUser.departamento,
                        barrio: datos.InformacionUser.barrio,
                        zona: datos.InformacionUser.zona,

                        id_profesion: datos.Profesional.profesion,
                        departamento_laboral: datos.Profesional.departamentoLaboral,
                        municipio_laboral: datos.Profesional.municipioLaboral,
                        zona_laboral: datos.Profesional.zonaLaboral,

                        correo: datos.User.correo,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.status == 200) {
                // await guardarEnDB(JSON.parse(JSON.stringify(datos)), "Paciente");
                console.log(respuesta.paciente)
                return true
            }
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