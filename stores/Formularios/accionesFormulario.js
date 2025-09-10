// acciones validar y enviar fomularios

// Citas
import { validarYEnviarNuevaCita } from '~/Core/Usuarios/Cita/NuevaCita';
// Pacientes
import { validarYEnviarNuevoPaciente } from "~/Core/Usuarios/Paciente/NuevoPaciente";
import { validarYEnviarModificarPaciente } from '~/Core/Usuarios/Paciente/ModificarPaciente';
// Historia
import { validarYEnviarRegistrarHistoria } from '~/Core/Historial/RegistrarHistoria';
// Profesionales
import { validarYEnviarNuevoMedico } from '~/Core/Usuarios/Profesional/NuevoMedico';
import { validarYEnviarModificarMedico } from '~/Core/Usuarios/Profesional/ModificarMedico';
// Empresa
import { validarYEnviarDatosEmpresa } from '~/Core/Empresa/Configuracion/DatosEmpresa';
import { validarYEnviarDatosSoftware } from '~/Core/Empresa/Configuracion/DatosSoftware';
import { validarYEnviarDatosFacturacion } from '~/Core/Empresa/DatosFacturacion';
// Nota
import { validarYEnviarNuevaNota } from '~/Core/Historial/Notas/NuevaNota';
// Usuarios
import { validarYEnviarNuevoUsuario } from '~/Core/Empresa/Usuario/NuevoUsuario';
import { validarYEnviarModificarUsuario } from '~/Core/Empresa/Usuario/ModificarUsuario';
// EPS
import { validarYEnviarDatosEPS } from '~/Core/Empresa/Datos/DatosEPS';
// Profesion
import { validarYEnviarDatosProfesion } from '~/Core/Empresa/Datos/DatosProfesion';
import { validarYEnviarActualizarProfesion } from '~/Core/Empresa/Datos/ActualizarProfesion';
// Login
import { validarYEnviarLogin } from '~/Core/Login/Ingresar';
import { validarYEnviarCambiarContraseña } from '~/Core/Login/CambiarContraseña';


// Importa accion de cada formulario desde el core
export const accionesFormularios = {
    Ingresar: async (data) => {
        const respuesta = await validarYEnviarLogin(data);
        if (respuesta.estado) {
            window.location.href = '/Home'
        }
        return respuesta;
    },
    RecuperarContraseña: async (data) => {
        const respuesta = await validarYEnviarCambiarContraseña(data);
        return respuesta
    },
    NuevaCita: async (data) => {
        const respuesta = await validarYEnviarNuevaCita(data);
        return respuesta;
    },
    NuevoPaciente: async (data) => {
        await validarYEnviarNuevoPaciente(data);
        return true;
    },
    ModificarPaciente: async (data) => {
        await validarYEnviarModificarPaciente(data)
        return true;
    },
    NuevoProfesional: async (data) => {
        await validarYEnviarNuevoMedico(data)
        return true;
    },
    ModificarProfesional: async (data) => {
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
    DatosNomina: async (data) => {
        const respuesta = await validarYEnviarDatosSoftware(data)
        return respuesta
    },
    DatosEquivalentes: async (data) => {
        const respuesta = await validarYEnviarDatosSoftware(data)
        return respuesta
    },
    DatosFacturacion: async (data) => {
        console.log('prueba')
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
    ActualizarProfesion: async (data) => {
        const respuesta = await validarYEnviarActualizarProfesion(data)
        return respuesta
    },
};