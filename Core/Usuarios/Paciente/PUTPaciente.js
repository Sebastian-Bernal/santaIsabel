import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'

// funcion para Validar campos del formulario Modificar Paciente
export const validarYEnviarModificarPaciente = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const storePacientes = usePacientesStore();
    const pacientes = await storePacientes.listPacientes;

    // 🔍 Validar campos obligatorios
    const camposObligatorios = [
        'name', 'No_document', 'type_doc', 'celular',
        'nacimiento', 'direccion', 'municipio', 'departamento',
        'barrio', 'zona', 'sexo', 'genero', 'Eps', 'Regimen', 'poblacionVulnerable'
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
    
    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    // Guardar local
    await actualizarEnIndexedDB(JSON.stringify(
        {
            InformacionUser: {
                ...datos.InformacionUser,
                sincronizado: 0
            },
            Paciente: {
                ...datos.Paciente,
                id_usuario: datos.InformacionUser.id,
                id_eps: datos.Paciente.Eps,
                sincronizado: 0
            }
        }
    ))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.pacientes + '/' + datos.Paciente.id,
                token: token,
                body: {
                    id_infoUsuario: datos.InformacionUser.id,
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

                    id: datos.Paciente.id,
                    sexo: datos.Paciente.sexo,
                    genero: datos.Paciente.genero,
                    id_eps: datos.Paciente.Eps,
                    Regimen: datos.Paciente.Regimen,
                    vulnerabilidad: datos.Paciente.poblacionVulnerable,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {

                // Actualizar local
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(
                    {
                        InformacionUser: {
                            ...datos.InformacionUser,
                            sincronizado: 1
                        },
                        Paciente: {
                            ...datos.Paciente,
                            id_usuario: datos.InformacionUser.id,
                            id_eps: datos.Paciente.Eps,
                            sincronizado: 1
                        }
                    }
                )));
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            // await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
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