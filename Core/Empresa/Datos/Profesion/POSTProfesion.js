import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario
export const validarYEnviarDatosProfesion = async (datos) => {
    const notificacionesStore = useNotificacionesStore()
    const profesion = datos.Profesion;

    // 🔍 Verificar campos obligatorios
    const camposObligatorios = ['nombre', 'permisos'];
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

    return await enviarFormularioProfesion(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API y IndexedDB
export const enviarFormularioProfesion = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    // Convertir permisos
    datos.Profesion.permisos = datos.Profesion.permisos.map((permiso) => {
        if (typeof permiso !== 'string') return permiso;

        const partes = permiso.split(' ');
        const seccion = partes.slice(0, -1).join(' ');
        const accion = partes[partes.length - 1];

        switch (accion) {
            case 'leer':
                return `${seccion}_get`;
            case 'crear':
                return `${seccion}_post`;
            case 'actualizar':
                return `${seccion}_put`;
            case 'eliminar':
                return `${seccion}_delete`;
            default:
                return `${permiso}_view`;
        }
    });


    let id_temporal = {}
    if(!reintento){
        // Guardar local
        id_temporal = await guardarEnDB(JSON.parse(JSON.stringify({Profesion: {...datos.Profesion, sincronizado: 0}})));
    } else {
        id_temporal = { data : datos.Profesion.id_temporal}
    }

    const online = navigator.onLine;
    if (online) {
        try {
            // Mandar a API
            let options = {
                metodo: 'POST',
                url: config.public.professions,
                token: token,
                body: {
                    codigo: datos.Profesion.codigo || null,
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
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
            notificacionesStore.options.texto = 'No se pudo enviar formulario, datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            notificacionesStore.simple()
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