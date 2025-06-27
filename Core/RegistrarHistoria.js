import { guardarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../stores/notificaciones.js'

// funcion para Validar campos del formulario Historia Clinica
export const validarYEnviarRegistrarHistoria = async (datos) => {
    const { $swal } = useNuxtApp()

    // Validacion si no se registran medicamentos
    if (datos.Plan_manejo_medicamentos?.length < 1) {
        const res = await $swal.fire({
            icon: 'warning',
            title: 'Historia sin plan de medicamentos',
            html: '¿Deseas registrar <strong>medicamentos</strong>?',
            showCancelButton: true,
            confirmButtonText: '<a href="/Historias/Medicamentos">Sí</a>',
            cancelButtonText: 'No, continuar',
        });
        if (res.isConfirmed) return;
    }

    // Validacion si no se registran procedimientos
    if (datos.Plan_manejo_procedimientos?.length < 1) {
        const res = await $swal.fire({
            icon: 'warning',
            title: 'Historia sin procedimientos',
            html: '¿Deseas registrar <strong>procedimientos</strong>?',
            showCancelButton: true,
            confirmButtonText: '<a href="/Historias/Procedimientos">Sí</a>',
            cancelButtonText: 'No, continuar',
        });
        if (res.isConfirmed) return;
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
            await guardarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
            return true
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            await guardarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await guardarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        return true
    }
};