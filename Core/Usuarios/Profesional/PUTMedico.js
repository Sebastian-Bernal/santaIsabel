import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion.js';

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
        departamento_laboral: profesional.departamento_laboral,
        municipio_laboral: profesional.municipio_laboral,
        zona_laboral: profesional.zona_laboral,
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

    return await enviarFormularioPutMedico(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioPutMedico = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const profesionesStore = useDatosProfesionStore()
    const profesiones = await profesionesStore.listProfesion
    const mapaProfesion = profesiones.reduce((acc, profesion) => {
        acc[profesion.id] = profesion.nombre;
        return acc;
    }, {});

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            const formData = new FormData();

            // Campos de texto
            formData.append("id_infoUsuario", datos.InformacionUser.id);
            formData.append("name", datos.InformacionUser.name);
            formData.append("No_document", datos.InformacionUser.No_document);
            formData.append("type_doc", datos.InformacionUser.type_doc);
            formData.append("celular", datos.InformacionUser.celular);
            formData.append("telefono", datos.InformacionUser.telefono || "");
            formData.append("nacimiento", datos.InformacionUser.nacimiento);
            formData.append("direccion", datos.InformacionUser.direccion);
            formData.append("municipio", datos.InformacionUser.municipio);
            formData.append("departamento", datos.InformacionUser.departamento);
            formData.append("barrio", datos.InformacionUser.barrio);
            formData.append("zona", datos.InformacionUser.zona);

            formData.append("id", datos.Profesional.id);
            formData.append("id_profesion", datos.Profesional.id_profesion);
            formData.append("departamento_laboral", datos.Profesional.departamento_laboral);
            formData.append("municipio_laboral", datos.Profesional.municipio_laboral);
            formData.append("zona_laboral", datos.Profesional.zona_laboral);

            formData.append("correo", datos.User.correo);

            // Imagen reducida (Blob)
            if (datos.Profesional.sello) {
                formData.append("selloFile", datos.Profesional.sello, "sello.jpg");
            }

            formData.append("_method", "PUT");

            // let options = {
            //     metodo: 'POST',
            //     url: config.public.profesionals + '/' + datos.Profesional.id,
            //     token: token,
            //     formData: true,
            //     body: formData,
            // }
            // const respuesta = await api.functionCall(options)
            const res = await fetch(`${config.public.api}/${config.public.profesionals}/${datos.Profesional.id}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const respuesta = await res.json();

            if (respuesta.success) {
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify({
                    InformacionUser: {
                        ...datos.InformacionUser,
                        sincronizado: 1
                    },
                    Profesional: {
                        ...datos.Profesional,
                        id_infoUsuario: datos.InformacionUser.id,
                        id_profesion: datos.Profesional.id_profesion,
                        profesion: mapaProfesion[datos.Profesional.id_profesion],
                        estado: 1,
                        sincronizado: 1
                    }
                })));
                return true
            } else {
                notificacionesStore.options.icono = 'warning'
                notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
                notificacionesStore.options.texto = respuesta.message
                notificacionesStore.options.tiempo = 3000
                notificacionesStore.simple()
                return false
            }
        } catch (error) {
            // notificacionesStore.options.icono = 'warning'
            // notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
            // notificacionesStore.options.texto = 'No se pudo enviar formulario, datos guardados localmente'
            // notificacionesStore.options.tiempo = 3000
            // notificacionesStore.simple()
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