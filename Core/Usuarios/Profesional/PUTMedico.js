import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'

// funcion para Validar campos del formulario Modificar Paciente
export const validarYEnviarModificarMedico = async (datos) => {
    const notificacionesStore = useNotificacionesStore();

    const info = datos.InformacionUser;
    const profesional = datos.Profesional;
    const usuario = datos.User;

    // 🔍 Campos obligatorios
    const camposObligatorios = [
        'name', 'No_document', 'type_doc', 'celular', 'nacimiento',
        'direccion', 'municipio', 'departamento', 'barrio', 'zona',
        'id_profesion', 'departamento_laboral', 'municipio_laboral', 'zona_laboral',
        'correo'
    ];

    const cuerpo = {
        name: info.name,
        No_document: info.No_document,
        type_doc: info.type_doc,
        celular: info.celular,
        nacimiento: info.nacimiento,
        direccion: info.direccion,
        municipio: info.municipio,
        departamento: info.departamento,
        barrio: info.barrio,
        zona: info.zona,
        id_profesion: profesional.profesion,
        departamento_laboral: profesional.departamentoLaboral,
        municipio_laboral: profesional.municipioLaboral,
        zona_laboral: profesional.zonaLaboral,
        correo: usuario.correo
    };

    const camposFaltantes = camposObligatorios.filter(campo => {
        const valor = cuerpo[campo];
        return valor === undefined || valor === null || valor === '';
    });

    if (camposFaltantes.length > 0) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Datos incompletos';
        notificacionesStore.options.texto = `Faltan los siguientes campos: ${camposFaltantes.join(', ')}`;
        notificacionesStore.options.tiempo = 6000;
        await notificacionesStore.simple();
        return false;
    }

    // 📅 Validar formato de fecha
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(info.nacimiento)) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Fecha inválida';
        notificacionesStore.options.texto = 'La fecha de nacimiento debe tener el formato YYYY-MM-DD';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple();
        return false;
    }

    // 📞 Validar número de celular
    const celularRegex = /^\d{10}$/;
    if (!celularRegex.test(info.celular)) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Celular inválido';
        notificacionesStore.options.texto = 'El número de celular debe tener 10 dígitos';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple();
        return false;
    }

    // 📧 Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuario.correo)) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Correo inválido';
        notificacionesStore.options.texto = 'El correo electrónico no tiene un formato válido';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple();
        return false;
    }

    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    await actualizarEnIndexedDB(JSON.stringify({
        InformacionUser: {
            ...datos.InformacionUser,
            sincronizado: 0
        },
        Profesional: {
            ...datos.Profesional,
            id_usuario: datos.InformacionUser.id,
            id_profesional: datos.Profesional.profesion,
            sincronizado: 0
        }
    }))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.profesionals + '/' + datos.Profesional.id,
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
                console.log(respuesta)
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify({
                    InformacionUser: {
                        ...datos.InformacionUser,
                        sincronizado: 1
                    },
                    Profesional: {
                        ...datos.Profesional,
                        id_usuario: datos.InformacionUser.id,
                        id_profesional: datos.Profesional.profesion,
                        sincronizado: 1
                    }
                })));
                return true
            }
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