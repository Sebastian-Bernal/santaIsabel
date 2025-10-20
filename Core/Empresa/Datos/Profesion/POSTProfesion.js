import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario
export const validarYEnviarDatosProfesion = async (datos) => {
    const notificacionesStore = useNotificacionesStore()
    const profesion = datos.Profesion;

    // 🔍 Verificar campos obligatorios
    const camposObligatorios = ['codigo', 'nombre'];
    const camposFaltantes = camposObligatorios.filter(campo => {
        const valor = profesion[campo];
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

    console.log(datos)
    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API y IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    
    const online = navigator.onLine;
    if (online) {
        try {
            // Guardar local
            const id_temporal = await guardarEnDB(JSON.parse(JSON.stringify({Profesion: {...datos.Profesion, sincronizado: 0}})));
            // Mandar a API
            let options = {
                metodo: 'POST',
                url: config.public.professions,
                token: token,
                body: {
                    codigo: datos.Profesion.codigo,
                    nombre: datos.Profesion.nombre,

                    permisos: datos.Profesion.permisos,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // actualizar datos local
                const datosActualizadosLocal = {
                    Profesion: {
                        id_temporal: id_temporal.data,
                        sincronizado: 1,
                        id: respuesta.data.id,
                        nombre: respuesta.data.nombre,
                        codigo: respuesta.data.codigo,
                    }
                }
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                console.log('datos actualizados')
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
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