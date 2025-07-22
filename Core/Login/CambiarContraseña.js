import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useAdministrativosStore } from '~/stores/Formularios/administrativo/Administrativo.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarCambiarContraseña = async (datos, correo) => {
    const notificacionesStore = useNotificacionesStore();
    console.log(datos, correo)
    const administrativosStore = useAdministrativosStore();
    const administradores = await administrativosStore.listAdministrativos

    const admin = administradores.find(
        p => p.correo.toLowerCase() === correo.toLowerCase()
    )

    const datosEnviar = { Administrativo: admin };
    datosEnviar.Administrativo.contraseña = datos.nuevacontraseña;

    return await enviarFormulario(datosEnviar);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        return true
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            // await guardarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.texto = 'Recuperar contraseña cuando halla internet'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        return true
    }
};