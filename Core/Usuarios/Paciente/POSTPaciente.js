import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarNuevoPaciente = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const storePacientes = usePacientesStore();
    const pacientes = await storePacientes.listPacientes
    // Validacion si ya existe Paciente
    const paciente = await pacientes.find(
        p => parseInt(p.No_document) === parseInt(datos.Paciente.No_document)
    )

    if (paciente) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Paciente ya existe';
        notificacionesStore.options.texto = 'Desear registrar otro?';
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
        Paciente : {
            ...datos.Paciente,
            sincronizado: 0
        }
    }

    const id_temporal = await guardarEnDB(JSON.parse(JSON.stringify(datosLocal)), "Paciente")

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.pacientes,
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

                        sexo: datos.Paciente.sexo,
                        genero: datos.Paciente.genero,
                        id_eps: 1,
                        Regimen: datos.Paciente.Regimen,
                        vulnerabilidad: datos.Paciente.poblacionVulnerable,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                console.log('paciente enviado a api')

                const datosActualizadosLocal = {
                    InformacionUser: {
                        id_temporal: id_temporal.User,
                        ...respuesta.informacion,
                        sincronizado: 1
                    },
                    Paciente: {
                        id_temporal: id_temporal.Paciente,
                        id: respuesta.paciente.id,
                        id_eps: respuesta.paciente.id_eps,
                        id_usuario: respuesta.paciente.id_infoUsuario,
                        genero: respuesta.paciente.genero,
                        sexo: respuesta.paciente.sexo,
                        Regimen: respuesta.paciente.regimen,
                        poblacionVulnerable: respuesta.paciente.vulnerabilidad,
                        estado: respuesta.paciente.estado,
                        sincronizado: 1,
                    },
                }
                
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            // await guardarEnDB(JSON.parse(JSON.stringify(datos)), "Paciente");
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        // await guardarEnDB(JSON.parse(JSON.stringify(datos)), "Paciente");
        return true
    }
};

