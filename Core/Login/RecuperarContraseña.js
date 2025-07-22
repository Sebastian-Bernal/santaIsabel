import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useAdministrativosStore } from '~/stores/Formularios/administrativo/Administrativo.js';
import emailjs from '@emailjs/browser';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarRecuperarContraseña = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const administrativosStore = useAdministrativosStore();
    const administradores = await administrativosStore.listAdministrativos

    const correo = administradores.find(
        p => p.correo.toLowerCase() === datos.correo.toLowerCase()
    )

    if (!correo) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'El correo ingresado no esta enlazado a ningun usuario';
        notificacionesStore.options.texto = '';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple()
        return;
    }

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
            'service_a553hki',     // Reemplaza con tu service_id
            'template_j2ii3f6',    // Reemplaza con tu template_id
            datos,
            'vpeXqDF4WYaSSpC1H'      // Reemplaza con tu public_key
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