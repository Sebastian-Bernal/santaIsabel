import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarDatosSoftware = async (datos) => {
    const notificacionesStore = useNotificacionesStore();

    // Filtra los objetos que tienen todos los campos completos
    const datosFiltrados = Object.entries(datos.Software)
        .filter(([_, valor]) =>
            Object.values(valor).every(v => v !== '')
        )
        .reduce((acc, [clave, valor]) => {
            acc[clave] = valor;
            console.log(acc)
            return acc;
        }, {});

    console.log(datosFiltrados);

    return await enviarFormulario({Software: datosFiltrados});
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            await guardarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
            return true
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