import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { guardarUsuarioEnIndexedDBID } from '~/composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarNuevoUsuario = async (datos) => {
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
                metodo: 'POST',
                url: config.public.user,
                head: {
                    'X-Company': 'store_two'
                },
                token: token,
                body: {
                    user_name: datos.InformacionUser.name,
                    user_email: datos.User.correo,
                    user_password: datos.User.contraseña,
                    user_password_confirmation: datos.User.contraseña,
                }
            }

            const respuesta = await api.functionCall(options)

            if (!respuesta.success) {
                return false
            }

            const id_user = respuesta.data.id
            let optionsUser_profile = {
                metodo: 'POST',
                url: config.public.userProfile,
                head: {
                    'X-Company': 'store_two'
                },
                token: token,
                body: {
                    user_id: id_user,
                    user_document_number: datos.InformacionUser.No_document,
                    user_document_type: datos.InformacionUser.type_doc,
                    user_date_of_birth: datos.InformacionUser.nacimiento,
                    user_gender: 'Genero',
                    user_role: datos.User.rol,
                    user_is_active: datos.User.estado,
                    user_phone: datos.InformacionUser.celular,
                    user_landline: datos.InformacionUser.telefono,
                    user_address: datos.InformacionUser.direccion,
                    user_municipality: datos.InformacionUser.municipio,
                    user_department: datos.InformacionUser.departamento,
                    user_neighborhood:datos.InformacionUser.barrio,
                    user_zone: datos.InformacionUser.zona
                }
            }

            const respuestaProfile = await api.functionCall(optionsUser_profile)

            if (!respuestaProfile.success) {
                return false
            }

            await guardarUsuarioEnIndexedDBID(JSON.parse(JSON.stringify(datos)));
            return true
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            const respuesta = await guardarUsuarioEnIndexedDBID(JSON.parse(JSON.stringify(datos)));
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await guardarUsuarioEnIndexedDBID(JSON.parse(JSON.stringify(datos)));
        return true
    }
};