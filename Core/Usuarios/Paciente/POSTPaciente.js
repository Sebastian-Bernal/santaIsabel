import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';
import { useDatosEPSStore } from '~/stores/Formularios/empresa/EPS.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarNuevoPaciente = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const storePacientes = usePacientesStore();
    const pacientes = await storePacientes.listPacientes;

    // 🔍 Validar campos obligatorios
    const camposObligatorios = [
        'name', 'No_document', 'type_doc', 'celular',
        'nacimiento', 'direccion', 'municipio', 'departamento',
        'barrio', 'zona', 'sexo', 'genero', 'id_eps', 'Regimen', 'poblacionVulnerable'
    ];

    const cuerpo = {
        ...datos.InformacionUser,
        ...datos.Paciente
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
        return false
    }

    // 📅 Validar formato de fecha
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(datos.InformacionUser.nacimiento)) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Fecha inválida';
        notificacionesStore.options.texto = 'La fecha de nacimiento debe tener el formato YYYY-MM-DD';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple();
        return false;
    }

    // 📞 Validar número de celular
    const celularRegex = /^\d{10}$/;
    if (!celularRegex.test(datos.InformacionUser.celular)) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Celular inválido';
        notificacionesStore.options.texto = 'El número de celular debe tener 10 dígitos';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple();
        return false;
    }

    // 🔁 Validación si ya existe el paciente
    const paciente = pacientes.find(
        p => parseInt(p.No_document) === parseInt(datos.Paciente.No_document)
    );

    if (paciente) {
        notificacionesStore.options.icono = 'warning';
        notificacionesStore.options.titulo = 'Paciente ya existe';
        notificacionesStore.options.texto = '¿Desea registrar otro?';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple();
        return false
    }

    return await enviarFormularioPaciente(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioPaciente = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const epsStore = useDatosEPSStore()
    const EPSList = await epsStore.listEPS
    const mapaEPS = EPSList.reduce((acc, eps) => {
        acc[eps.id] = eps.nombre;
        return acc;
    }, {});

    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    let id_temporal = {}
    if (!reintento) {
        // Guardar local
        const datosLocal = {
            InformacionUser: {
                ...datos.InformacionUser,
                sincronizado: 0
            },
            Paciente: {
                ...datos.Paciente,
                Eps: mapaEPS[datos.Paciente.id_eps],
                sincronizado: 0
            }
        }

        id_temporal = await guardarEnDB(JSON.parse(JSON.stringify(datosLocal)), "Paciente")
    } else {
        id_temporal = { User: datos.InformacionUser.id_temporal, Paciente: datos.Paciente.id_temporal }
    }

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
                    telefono: datos.InformacionUser.telefono || null,
                    nacimiento: datos.InformacionUser.nacimiento,
                    direccion: datos.InformacionUser.direccion,
                    municipio: datos.InformacionUser.municipio,
                    departamento: datos.InformacionUser.departamento,
                    barrio: datos.InformacionUser.barrio,
                    zona: datos.InformacionUser.zona,

                    sexo: datos.Paciente.sexo,
                    genero: datos.Paciente.genero,
                    id_eps: datos.Paciente.id_eps,
                    Regimen: datos.Paciente.Regimen,
                    vulnerabilidad: datos.Paciente.poblacionVulnerable,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {

                // Actualizar local
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
                        Eps: mapaEPS[respuesta.paciente.id_eps],
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
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
            notificacionesStore.options.texto = 'No se pudo enviar formulario, datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            notificacionesStore.simple()
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

