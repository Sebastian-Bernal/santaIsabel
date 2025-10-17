import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarActualizarEps = async (datos) => {
const notificacionesStore = useNotificacionesStore();
    const eps = datos.EPS;

    // 🔍 Validar campos obligatorios
    const camposObligatorios = ['nombre', 'codigo', 'direccion', 'telefono', 'email', 'website'];
    const camposFaltantes = camposObligatorios.filter(campo => {
        const valor = eps[campo];
        return valor === undefined || valor === null || valor === '';
    });

    if (camposFaltantes.length > 0) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Datos incompletos';
        notificacionesStore.options.texto = `Faltan los siguientes campos: ${camposFaltantes.join(', ')}`;
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple();
        return false;
    }

    // 📧 Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(eps.email)) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Correo inválido';
        notificacionesStore.options.texto = 'El correo electrónico no tiene un formato válido';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple();
        return false;
    }

    // 🌐 Validar formato de website
    const websiteRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
    if (!websiteRegex.test(eps.website)) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Sitio web inválido';
        notificacionesStore.options.texto = 'La URL del sitio web no tiene un formato válido';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple();
        return false;
    }


    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')
    
    await actualizarEnIndexedDB(JSON.stringify({
        EPS: {
            ...datos.EPS,
            sincronizado: 0
        }
    }))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.eps + '/' + datos.EPS.id,
                token: token,
                body: {
                    id: datos.EPS.id,
                    nombre: datos.EPS.nombre,
                    codigo: datos.EPS.codigo,
                    direccion: datos.EPS.direccion,
                    telefono: datos.EPS.telefono,
                    email: datos.EPS.email,
                    website: datos.EPS.website,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify({
                    EPS: {
                        ...datos.EPS,
                        sincronizado: 1
                    }
                })));
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            // await guardarEnDB(JSON.parse(JSON.stringify(datos)));
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