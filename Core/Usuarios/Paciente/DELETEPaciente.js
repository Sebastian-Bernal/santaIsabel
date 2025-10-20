import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'

// funcion para Validar campos del formulario Modificar Paciente
export const validarYEnviarEliminarPaciente = async (datos) => {
    const notificacionesStore = useNotificacionesStore();

    return await enviarFormulario(datosAEnviar);
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
            Paciente: {
                ...datos.Paciente,
                id_usuario: datos.InformacionUser.id,
                id_eps: datos.Paciente.Eps,
                sincronizado: 0,
                estado: 0
            }
        }
    ))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'DELETE',
                url: config.public.pacientes + '/' + datos.Paciente.id,
                token: token,
                body: {
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
                        Paciente: {
                            ...datos.Paciente,
                            id_usuario: datos.InformacionUser.id,
                            id_eps: datos.Paciente.Eps,
                            estado: 0,
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