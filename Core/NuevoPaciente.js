import { pacientes } from '~/data/pacientes';
import { guardarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';

export const validarYEnviarNuevoPaciente = async (datos) => {
    const { $swal } = useNuxtApp();
    
    const paciente = pacientes.value.find(
        p => p.nombre.toLowerCase() === datos.Paciente.name.toLowerCase()
    )

    if (paciente) {
        const res = await $swal.fire({
            icon: 'warning',
            title: 'Paciente ya esta registrado',
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