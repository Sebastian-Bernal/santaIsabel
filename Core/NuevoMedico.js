import { medicos } from '~/data/medicos';
import { guardarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';

// storeId NuevoMedico
export const validarYEnviarNuevoMedico = async (datos) => {
    const { $swal } = useNuxtApp();

    const medico = medicos.value.find(
        p => p.nombre.toLowerCase() === datos.Medico.name.toLowerCase()
    )

    if (medico) {
        const res = await $swal.fire({
            icon: 'warning',
            title: 'Medico ya esta registrado',
            html: '¿Deseas registrar <strong>otro</strong>?',
            showCancelButton: true,
            confirmButtonText: 'si',
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