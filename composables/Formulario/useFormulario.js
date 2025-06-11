import { useFormStorage } from './useFormStorage';
import { guardarEnIndexedDB } from './useIndexedDBManager';
import { useFormPendiente } from '@/stores/formularioPendiente';
import { useNuxtApp } from '#app';

export function useFormulario() {
    const { $swal } = useNuxtApp();
    const form = useFormPendiente();
    const { formData, traer, limpiar } = useFormStorage();

    const enviarFormulario = async () => {
        const online = navigator.onLine;

        if (online) {
            try {
                // mandar a api
                await guardarEnIndexedDB(formData.value);
                $swal.fire({ title: '¡Se ha enviado correctamente!', icon: 'success' });
                limpiar();
                window.location.href = '/';
            } catch (e) {
                console.error('Fallo al enviar. Guardando localmente', e);
                await guardarEnIndexedDB(formData.value);
            }
        } else {
            await $swal.fire({ title: 'Sin conexión', text: 'Se guardará localmente', icon: 'warning' });
            await guardarEnIndexedDB(formData.value);
            limpiar();
            window.location.href = '/';
        }
    };

    const validarYEnviar = async () => {
        traer();

        if (formData.value?.Plan_manejo_medicamentos?.length < 1) {
            const res = await $swal.fire({
                icon: 'warning',
                title: 'Historia sin plan de medicamentos',
                html: '¿Deseas registrar <strong>medicamentos</strong>?',
                showCancelButton: true,
                confirmButtonText: '<a href="/forms/Datostratamiento">Sí</a>',
                cancelButtonText: 'No, continuar',
            });
            if (res.isConfirmed) return;
        }

        if (formData.value?.Plan_manejo_procedimientos?.length < 1) {
            const res = await $swal.fire({
                icon: 'warning',
                title: 'Historia sin procedimientos',
                html: '¿Deseas registrar <strong>procedimientos</strong>?',
                showCancelButton: true,
                confirmButtonText: '<a href="/forms/Datosservicios">Sí</a>',
                cancelButtonText: 'No, continuar',
            });
            if (res.isConfirmed) return;
        }

        await enviarFormulario();
    };

    return { formData, validarYEnviar };
}