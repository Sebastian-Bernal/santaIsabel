import { pacientes } from '~/data/pacientes';
import { guardarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarNuevoPaciente = async (datos) => {
    const { $swal } = useNuxtApp();
    
    // Validacion si ya existe Paciente
    const paciente = pacientes.value.find(
        p => p.nombre.toLowerCase() === datos.Paciente.name.toLowerCase()
    )

    if (paciente) {
        const res = await $swal.fire({
            icon: 'warning',
            title: 'Paciente ya esta registrado',
            html: '¿Deseas registrar <strong>otro</strong>?',
            showCancelButton: true,
            cancelButtonText: 'Regresar',
        });
        if (res) return;
    }

    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
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