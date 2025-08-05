// acciones validar y enviar fomularios
import { validarYEnviarNuevaCita } from '~/Core/Cita/NuevaCita';
import { validarYEnviarNuevoPaciente } from "~/Core/Paciente/NuevoPaciente";
import { validarYEnviarModificarPaciente } from '~/Core/Paciente/ModificarPaciente';
import { validarYEnviarNuevoMedico } from '~/Core/Profesional/NuevoMedico';
import { validarYEnviarRegistrarHistoria } from '~/Core/RegistrarHistoria';
import { validarYEnviarModificarMedico } from '~/Core/Profesional/ModificarMedico';
import { validarYEnviarDatosEmpresa } from '~/Core/Empresa/DatosEmpresa';
import { validarYEnviarDatosSoftware } from '~/Core/Empresa/DatosSoftware';
import { validarYEnviarDatosFacturacion } from '~/Core/Empresa/DatosFacturacion';
import { validarYEnviarNuevaNota } from '~/Core/Notas/NuevaNota';
import { validarYEnviarNuevoUsuario } from '~/Core/Usuario/NuevoUsuario';
import { validarYEnviarModificarUsuario } from '~/Core/Usuario/ModificarUsuario';
import { validarYEnviarDatosEPS } from '~/Core/Empresa/DatosEPS';
import { validarYEnviarDatosProfesion } from '~/Core/Empresa/DatosProfesion';
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
    },
    NuevoUsuario: async (data) => {
        const respuesta = await validarYEnviarNuevoUsuario(data)
        return respuesta
    },
    ModificarUsuario: async (data) => {
        const respuesta = await validarYEnviarModificarUsuario(data)
        return respuesta
    },
    EPS: async (data) => {
        const respuesta = await validarYEnviarDatosEPS(data)
        return respuesta
    },
    Profesion: async (data) => {
        const respuesta = await validarYEnviarDatosProfesion(data)
        return respuesta
    },
};