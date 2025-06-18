import { useFormStorage } from './useFormStorage';
import { guardarEnIndexedDB } from './useIndexedDBManager';

export function useFormulario(storeName) {
    const { $swal } = useNuxtApp();

    // Traer informacion de la store por key del formulario en localStorage
    const { formData, traerDatos, limpiar } = useFormStorage(storeName);

    const enviarFormulario = async () => {
        const online = navigator.onLine;
        console.log(formData.value, storeName)
        if (online) {
            try {
                // mandar a api
                await guardarEnIndexedDB(JSON.parse(JSON.stringify(formData.value)));
                await $swal.fire({ title: '¡Se ha enviado correctamente!', icon: 'success' })
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
                confirmButtonText: '<a href="/Historias/Medicamentos">Sí</a>',
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
                confirmButtonText: '<a href="/Historias/Procedimientos">Sí</a>',
                cancelButtonText: 'No, continuar',
            });
            if (res.isConfirmed) return;
        }

        await enviarFormulario();
    };

    return { formData, validarYEnviar };
}