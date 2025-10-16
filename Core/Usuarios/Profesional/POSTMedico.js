import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales.js';
import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario Nuevo Medico
export const validarYEnviarNuevoMedico = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const storeMedicos = useMedicosStore();
    const medicos = await storeMedicos.listMedicos

    // Validar si ya existe el medico registrado
    const medico = await medicos.find(
        p => parseInt(p.No_document) === parseInt(datos.Profesional.No_document)
    )

    if (medico) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Profesional ya existe';
        notificacionesStore.options.texto = 'Deseas registrar otro?';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple()
        return;
    }

    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    const datosLocal = {
        InformacionUser : {
            ...datos.InformacionUser,
            sincronizado: 0
        },
        Profesional : {
            ...datos.Profesional,
            sincronizado: 0
        }
    }

    const id_temporal = await guardarEnDB(JSON.parse(JSON.stringify(datosLocal)), "Profesional")
    console.log('Profesional Local:', id_temporal)

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
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

            if (respuesta.success) {
                const datosActualizadosLocal = {
                    InformacionUser: {
                        id_temporal: id_temporal.User,
                        sincronizado: 1,
                        id: respuesta.informacion.id,
                        name: respuesta.informacion.name,
                        No_document: respuesta.informacion.No_document,
                        type_doc: respuesta.informacion.type_doc,
                        celular: respuesta.informacion.celular,
                        telefono: respuesta.informacion.telefono,
                        nacimiento: respuesta.informacion.nacimiento,
                        direccion: respuesta.informacion.direccion,
                        municipio: respuesta.informacion.municipio,
                        departamento: respuesta.informacion.departamento,
                        barrio: respuesta.informacion.barrio,
                        zona: respuesta.informacion.zona,
                        estado: respuesta.informacion.estado,
                    },
                    Profesional: {
                        id_temporal: id_temporal.Profesional,
                        sincronizado: 1,
                        id: respuesta.profesional.id,
                        id_usuario: respuesta.profesional.id_infoUsuario,
                        id_profesion: respuesta.profesional.id_profesion,
                        zonaLaboral: respuesta.profesional.zona_laboral,
                        departamentoLaboral: respuesta.profesional.departamento_laboral,
                        municipioLaboral: respuesta.profesional.municipio_laboral,
                        estado: respuesta.profesional.estado,
                    },
                }
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                return true
            }

        } catch (error) {
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