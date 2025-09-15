import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'

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
    const pacientesStore = usePacientesStore();
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.patients,
                head: {
                    'X-Company': 'store_two'
                },
                token: token,
                body: {
                    patient_eps_id: datos.Paciente.Eps,
                    patient_gender: datos.Paciente.sexo,
                    patient_gender_identity: datos.Paciente.genero,
                    patient_vulnerability: datos.Paciente.poblacionVulnerable,
                    user_profile: {
                        user_first_name: datos.InformacionUser.name,
                        user_last_name: datos.InformacionUser.name,
                        user_document_number: datos.InformacionUser.No_document,
                        user_document_type: datos.InformacionUser.type_doc,
                        user_birth_date: datos.InformacionUser.nacimiento,
                        user_phone: datos.InformacionUser.celular,
                        user_landline: datos.InformacionUser.telefono,
                        user_address: datos.InformacionUser.direccion,
                        user_municipality: datos.InformacionUser.municipio,
                        user_department: datos.InformacionUser.departamento,
                        user_neighborhood: datos.InformacionUser.barrio,
                        user_zone: datos.InformacionUser.zona,
                    },
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta) {
                await guardarEnDB(JSON.parse(JSON.stringify(datos)), "Paciente");
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            await guardarEnDB(JSON.parse(JSON.stringify(datos)), "Paciente");
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await guardarEnDB(JSON.parse(JSON.stringify(datos)), "Paciente");
        return true
    }

    // await pacientesStore.setPacientes()
};