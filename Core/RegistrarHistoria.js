import { guardarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';

export const validarYEnviarRegistrarHistoria = async (datos) => {
    const { $swal } = useNuxtApp();

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

const enviarFormulario = async (datos) => {
    const { $swal } = useNuxtApp();
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
        await $swal.fire({ title: 'Sin conexión', text: 'Se guardará localmente', icon: 'warning' });
        await guardarEnIndexedDB(JSON.parse(JSON.stringify(datos)));
        return true
    }
};