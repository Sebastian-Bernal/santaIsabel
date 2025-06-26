// acciones validar y enviar fomularios
import { validarYEnviarNuevaCita } from "~/Core/NuevaCita";
import { validarYEnviarNuevoPaciente } from "~/Core/NuevoPaciente";
import { validarYEnviarModificarPaciente } from '../../Core/ModificarPaciente';
import { validarYEnviarNuevoMedico } from '../../Core/NuevoMedico';
import { validarYEnviarRegistrarHistoria } from '../../Core/RegistrarHistoria';

// Importa accion de cada formulario desde el core
export const accionesFormularios = {
    NuevaCita: async (data) => {
        // lógica de envío de Nueva Cita
        console.log("Mandando formulario NuevaCita:", data);
        return true;
    },
    NuevoPaciente: async (data) => {
        await validarYEnviarNuevoPaciente(data);
        return true;
    },
    ModificarPaciente: async (data) => {
        await validarYEnviarModificarPaciente(data)
        return true;
    },
    NuevoMedico: async (data) => {
        await validarYEnviarNuevoMedico(data)
        return true;
    },
    RegistrarHistoria: async (data) => {
        await validarYEnviarRegistrarHistoria(data)
        return true;
    },
};