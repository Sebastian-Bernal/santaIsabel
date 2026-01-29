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
                        sincronizado: 1,
                        id: respuesta.data.id,
                        nombre: respuesta.data.nombre,
                        codigo: respuesta.data.codigo,
                        permisos: respuesta.data.permisos,
                    }
                }
                await guardarEnDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                console.log('datos actualizados')
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {

        try {

            if(!reintento){
                const datosLocal = {
                    Profesion: {
                        sincronizado: 0,
                        nombre: datos.Profesion.nombre,
                        codigo: datos.Profesion.codigo,
                        permisos: datos.Profesion.permisos,
                    }
                }
                await guardarEnDB(JSON.parse(JSON.stringify(datosLocal)));
            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true

        } catch (error) {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
};