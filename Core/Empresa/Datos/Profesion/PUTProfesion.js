import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarActualizarProfesion = async (datos) => {
    const notificacionesStore = useNotificacionesStore()
    const profesion = datos.Profesion;

    // 🔍 Verificar campos obligatorios
    const camposObligatorios = ['nombre'];
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

    return await enviarFormularioPutProfesion(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioPutProfesion = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    if (datos.Profesion.ListaPacientes === true) {
        datos.Profesion.permisos.push("ListaPacientes")
    } else {
        datos.Profesion.permisos = datos.Profesion.permisos.filter(permiso => permiso !== "ListaPacientes")
    }

    if (datos.Profesion.Diagnosticos_view === true) {
        datos.Profesion.permisos.push("Diagnosticos_view")
    } else {
        datos.Profesion.permisos = datos.Profesion.permisos.filter(permiso => permiso !== "Diagnosticos_view")
    }

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.professions + '/' + datos.Profesion.id,
                token: token,
                body: {
                    id: datos.Profesion.id,
                    codigo: datos.Profesion.codigo,
                    nombre: datos.Profesion.nombre,
                    permisos: datos.Profesion.permisos,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify({
                    Profesion: {
                        codigo: respuesta.data.codigo,
                        nombre: respuesta.data.nombre,
                        permisos: respuesta.data.permisos,
                        id: respuesta.data.id,
                        id_temporal: datos.Profesion.id_temporal,
                        sincronizado: 1
                    }
                })));
                return true
            }

        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {

        try {
            if (!reintento) {
                // Actualizar local
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify({
                    Profesion: {
                        codigo: datos.Profesion.codigo,
                        nombre: datos.Profesion.nombre,
                        permisos: datos.Profesion.permisos,
                        id: datos.Profesion.id,
                        id_temporal: datos.Profesion.id_temporal,
                        sincronizado: 1
                    }
                })));
            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
            notificacionesStore.options.texto = 'en desarrollo'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        }
    }
};