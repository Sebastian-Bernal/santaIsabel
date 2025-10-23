import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarDatosEPS = async (datos) => {
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
export const enviarFormulario = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    // guardar local
    let id_temporal = {}
    if(!reintento){
        id_temporal = await guardarEnDB(JSON.parse(JSON.stringify({EPS: {...datos.EPS, sincronizado: 0}})));
    } else {
        id_temporal.data = datos.EPS.id_temporal
    }
    
    const online = navigator.onLine;
    if (online) {
        try {
            console.log('enviando:', datos.EPS)
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.eps,
                token: token,
                body: {
                    nombre: datos.EPS.nombre,
                    codigo: datos.EPS.codigo,
                    direccion: datos.EPS.direccion,
                    telefono: datos.EPS.telefono,
                    email: datos.EPS.email,
                    website: datos.EPS.website,
                }
            }
            const respuesta = await api.functionCall(options)

            if(respuesta.success){
                // Actualizar local
                const datosActualizadosLocal = {
                    EPS: {
                        id_temporal: id_temporal.data,
                        sincronizado: 1,
                        id: respuesta.data.id,
                        nombre: respuesta.data.nombre,
                        codigo: respuesta.data.codigo,
                        direccion: respuesta.data.direccion,
                        telefono: respuesta.data.telefono,
                        email: respuesta.data.email,
                        website: respuesta.data.website,
                    }
                }
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                console.log('datos actualizados')
                return true
            }
        } catch (error) {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
            notificacionesStore.options.texto = 'No se pudo enviar formulario, datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            notificacionesStore.simple()
            console.error('Fallo al enviar. Guardado localmente', error);
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