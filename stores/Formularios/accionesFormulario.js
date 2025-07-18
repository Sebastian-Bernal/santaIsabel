// acciones validar y enviar fomularios
import { validarYEnviarNuevaCita } from '~/Core/NuevaCita';
import { validarYEnviarNuevoPaciente } from "~/Core/Paciente/NuevoPaciente";
import { validarYEnviarModificarPaciente } from '~/Core/Paciente/ModificarPaciente';
import { validarYEnviarNuevoMedico } from '~/Core/Profesional/NuevoMedico';
import { validarYEnviarRegistrarHistoria } from '~/Core/RegistrarHistoria';
import { validarYEnviarModificarMedico } from '~/Core/Profesional/ModificarMedico';
import { validarYEnviarDatosEmpresa } from '~/Core/Empresa/DatosEmpresa';
import { validarYEnviarDatosSoftware } from '~/Core/Empresa/DatosSoftware';
import { validarYEnviarDatosFacturacion } from '~/Core/Empresa/DatosFacturacion';
import { validarYEnviarNuevaNota } from '~/Core/Notas/NuevaNota';
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
    DatosEmpresa: async (data) => {
        const respuesta = await validarYEnviarDatosEmpresa(data)
        return respuesta
    },
    DatosSoftware: async (data) => {
        const respuesta = await validarYEnviarDatosSoftware(data)
        return respuesta
    },
    DatosFacturacion: async (data) => {
        const respuesta = await validarYEnviarDatosFacturacion(data)
        return respuesta
    },
    NuevaNota: async (data) => {
        const respuesta = await validarYEnviarNuevaNota(data)
        return respuesta
    }
};