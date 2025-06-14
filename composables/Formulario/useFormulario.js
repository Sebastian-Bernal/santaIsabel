import { useFormStorage } from './useFormStorage';
import { useFormData } from '../../stores/useFormData.js';
import { guardarEnIndexedDB } from './useIndexedDBManager';
import { useFormPendiente } from '@/stores/formularioPendiente';
import { useNuxtApp } from '#app';

export function useFormulario() {
    const { $swal } = useNuxtApp();
    const form = useFormPendiente();
    const { formData, traerDatos, limpiar } = useFormStorage();

    const enviarFormulario = async () => {
        const online = navigator.onLine;

        if (online) {
            try {
                // mandar a api
                await guardarEnIndexedDB(JSON.parse(JSON.stringify(formData.value)));
                $swal.fire({ title: '¡Se ha enviado correctamente!', icon: 'success' });
                limpiar();
                window.location.href = '/';
            } catch (e) {
                console.error('Fallo al enviar. Guardando localmente', e);
                await guardarEnIndexedDB(JSON.parse(JSON.stringify(formData.value)));
            }
        } else {
            await $swal.fire({ title: 'Sin conexión', text: 'Se guardará localmente', icon: 'warning' });
            await guardarEnIndexedDB(JSON.parse(JSON.stringify(formData.value)));
            limpiar();
            window.location.href = '/';
        }
    };

    const validarYEnviar = async () => {
        traerDatos();

        if (formData.value?.Plan_manejo_medicamentos?.length < 1) {
            const res = await $swal.fire({
                icon: 'warning',
                title: 'Historia sin plan de medicamentos',
                html: '¿Deseas registrar <strong>medicamentos</strong>?',
                showCancelButton: true,
                confirmButtonText: '<a href="/forms/HistoriaClinica/Medicamentos">Sí</a>',
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
                confirmButtonText: '<a href="/forms/HistoriaClinica/Procedimientos">Sí</a>',
                cancelButtonText: 'No, continuar',
            });
            if (res.isConfirmed) return;
        }

        await enviarFormulario();
    };

    return { formData, validarYEnviar };
}