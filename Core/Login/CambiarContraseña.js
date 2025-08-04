import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useAdministrativosStore } from '~/stores/Formularios/administrativo/Administrativo.js';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarCambiarContraseña = async (datos, correo) => {
    const notificacionesStore = useNotificacionesStore();

    const administrativosStore = useAdministrativosStore();
    const administradores = await administrativosStore.listAdministrativos

    const profesionalesStore = useMedicosStore();
    const medicos = await profesionalesStore.listMedicos

    const pacientesStore = usePacientesStore();
    const pacientes = await pacientesStore.listPacientes

    const admin = administradores.find(
        p => p.correo.toLowerCase() === correo.toLowerCase()
    )

    const medico = medicos.find(
        p => p.correo.toLowerCase() === correo.toLowerCase()
    )

    const paciente = pacientes.find(
        p => p.correo.toLowerCase() === correo.toLowerCase()
    )

    let datosEnviar = {};
    if(admin){
        datosEnviar.Administrativo = { ...admin, contraseña: datos.nuevacontraseña };
    } else if(medico){
        datosEnviar.Medico = { ...medico, contraseña: datos.nuevacontraseña };
    } else if(paciente) {
        datosEnviar.Paciente = { ...paciente, contraseña: datos.nuevacontraseña };
    }

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