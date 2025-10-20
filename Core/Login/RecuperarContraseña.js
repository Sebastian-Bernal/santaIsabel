import { useNotificacionesStore } from '../../stores/notificaciones.js'
import emailjs from '@emailjs/browser';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarRecuperarContraseña = async (datos) => {
    const notificacionesStore = useNotificacionesStore();

    return await enviarFormulario(datos.Usuario);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const varView = useVarView();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
        let options = {
                metodo: 'POST',
                url: config.public.cambiarContraseña,
                body: {
                    correo: datos.correo,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {

                console.log('correo enviado')
                return true
            }

            // datos.codigoRecuperacion = generarCodigo()
            // const response = await emailjs.send(
            //     import.meta.env.VITE_EMAILJS_SERVICE_ID,     // service_id
            //     import.meta.env.VITE_EMAILJS_TEMPLATE_ID,    // template_id
            //     datos,
            //     import.meta.env.VITE_EMAILJS_PUBLIC_KEY      // public_key
            // )
            // console.log('Correo enviado con éxito:', response.status, response.text)
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

function generarCodigo() {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    sessionStorage.setItem('codigo', codigo)
    return codigo
}