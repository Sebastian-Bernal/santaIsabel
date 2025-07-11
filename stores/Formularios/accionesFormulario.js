// acciones validar y enviar fomularios
import { validarYEnviarNuevaCita } from '../../Core/NuevaCita';
import { validarYEnviarNuevoPaciente } from "~/Core/NuevoPaciente";
import { validarYEnviarModificarPaciente } from '../../Core/ModificarPaciente';
import { validarYEnviarNuevoMedico } from '../../Core/NuevoMedico';
import { validarYEnviarRegistrarHistoria } from '../../Core/RegistrarHistoria';
import { validarYEnviarModificarMedico } from '~/Core/ModificarMedico';

// Importa accion de cada formulario desde el core
export const accionesFormularios = {
    NuevaCita: async (data) => {
        await validarYEnviarNuevaCita(data);
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
    ModificarMedico: async (data) => {
        await validarYEnviarModificarMedico(data)
        return true;
    },
    RegistrarHistoria: async (data) => {
        const respuesta = await validarYEnviarRegistrarHistoria(data)
        return respuesta;
    },
};