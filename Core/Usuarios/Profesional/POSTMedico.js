import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales.js';
import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion.js';

// funcion para Validar campos del formulario Nuevo Medico
export const validarYEnviarNuevoMedico = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const storeMedicos = useMedicosStore();
    const medicos = await storeMedicos.listMedicos();

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
        id_profesion: profesional.id_profesion,
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

    // 🔁 Validar si ya existe el médico
    const medico = medicos.find(
        p => parseInt(p.No_document) === parseInt(info.No_document)
    );

    if (medico) {
        notificacionesStore.options.icono = 'warning';
        notificacionesStore.options.titulo = 'Profesional ya existe';
        notificacionesStore.options.texto = '¿Deseas registrar otro?';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple();
        return false;
    }


    return await enviarFormularioProfesional(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioProfesional = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

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
            let options = {
                metodo: 'POST',
                url: config.public.profesionals,
                token: token,
                body: {
                    name: datos.InformacionUser.name,
                    No_document: datos.InformacionUser.No_document,
                    type_doc: datos.InformacionUser.type_doc,
                    celular: datos.InformacionUser.celular,
                    telefono: datos.InformacionUser.telefono || null,
                    nacimiento: datos.InformacionUser.nacimiento,
                    direccion: datos.InformacionUser.direccion,
                    municipio: datos.InformacionUser.municipio,
                    departamento: datos.InformacionUser.departamento,
                    barrio: datos.InformacionUser.barrio,
                    zona: datos.InformacionUser.zona,

                    id_profesion: datos.Profesional.id_profesion,
                    departamento_laboral: datos.Profesional.departamento_laboral,
                    municipio_laboral: datos.Profesional.municipio_laboral,
                    zona_laboral: datos.Profesional.zona_laboral,

                    correo: datos.User.correo,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                const datosActualizadosLocal = {
                    InformacionUser: {
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
                        sincronizado: 1,
                        id: respuesta.profesional.id,
                        id_infoUsuario: respuesta.profesional.id_infoUsuario,
                        id_profesion: respuesta.profesional.id_profesion,
                        profesion: mapaProfesion[respuesta.profesional.id_profesion],
                        zona_laboral: respuesta.profesional.zona_laboral,
                        departamento_laboral: respuesta.profesional.departamento_laboral,
                        municipio_laboral: respuesta.profesional.municipio_laboral,
                        estado: 1,
                    },
                }
                await guardarEnDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                return true
            }

        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
            notificacionesStore.options.texto = 'No se pudo enviar formulario, datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            notificacionesStore.simple()
            return true
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