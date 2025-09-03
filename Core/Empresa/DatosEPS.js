import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarDatosEPS = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    
    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.eps,
                token: token,
                body: {
                    eps_code: datos.EPS.codigo,
                    eps_name: datos.EPS.nombre,
                    eps_address: datos.EPS.direccion,
                    eps_phone: datos.EPS.telefono,
                    eps_email: datos.EPS.email,
                    eps_website: datos.EPS.website,
                }
            }
            const respuesta = await api.functionCall(options)
            console.log(respuesta)
            if(respuesta.success){
                await guardarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            // await guardarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.texto = 'en desarrollo'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};

// function traerdatos () {
//     const notificacionesStore = useNotificacionesStore();
//     const api = useApiRest();
//     const config = useRuntimeConfig()

//     const online = navigator.onLine;
//     if (online) {
//         try {
//             // mandar a api
//             let options = {
//                 metodo: 'GET',
//                 url: config.public.eps,
//                 body: {
//                     eps_code: datos.EPS.codigo,
//                     eps_name: datos.EPS.nombre
//                 }
//             }
//             const respuesta = api.functionCall(options)
//             console.log(respuesta)
//             await guardarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
//         return true
//         } catch (error) {
//             console.error('Fallo al enviar. Guardando localmente', error);
//             // await guardarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
//         }
//     } else {
//         notificacionesStore.options.icono = 'warning'
//         notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
//         notificacionesStore.options.texto = 'en desarrollo'
//         notificacionesStore.options.tiempo = 3000
//         await notificacionesStore.simple()
//         return true
//     }
// }