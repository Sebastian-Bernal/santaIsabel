import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useAdministrativosStore } from '~/stores/Formularios/administrativo/Administrativo.js';
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico.js';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import emailjs from '@emailjs/browser';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarRecuperarContraseña = async (datos) => {
    const notificacionesStore = useNotificacionesStore();

    const administrativosStore = useAdministrativosStore();
    const administradores = await administrativosStore.listAdministrativos

    const profesionalesStore = useMedicosStore();
    const medicos = await profesionalesStore.listMedicos

    const pacientesStore = usePacientesStore();
    const pacientes = await pacientesStore.listPacientes

    const usuarios = [...administradores, ...medicos, ...pacientes]

    const correo = usuarios.find(
        p => p.correo.toLowerCase() === datos.correo.toLowerCase()
    )

    if (!correo) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'El correo ingresado no esta enlazado a ningun usuario';
        notificacionesStore.options.texto = '';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple()
        return;
    };

    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            datos.codigoRecuperacion = generarCodigo()
            const response = await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,     // service_id
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,    // template_id
            datos,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY      // public_key
        )
        console.log('Correo enviado con éxito:', response.status, response.text)
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
        return true
    }
};

function generarCodigo () {
    const codigo =  Math.floor(100000 + Math.random() * 900000).toString()
    sessionStorage.setItem('codigo', codigo)
    return codigo
}