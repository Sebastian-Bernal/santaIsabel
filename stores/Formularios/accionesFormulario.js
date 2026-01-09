// acciones validar y enviar fomularios

// Citas
import { validarYEnviarNuevaCita } from '~/Core/Usuarios/Cita/POSTCita';
import { validarYEnviarActualizarCita } from '~/Core/Usuarios/Cita/PUTCita';
// Pacientes
import { validarYEnviarNuevoPaciente } from "~/Core/Usuarios/Paciente/POSTPaciente";
import { validarYEnviarModificarPaciente } from '~/Core/Usuarios/Paciente/PUTPaciente';
// Historia
import { validarYEnviarRegistrarHistoria } from '~/Core/Historial/Historia/PostHistoria';
import { validarYEnviarActualizarHistoria } from '~/Core/Historial/Historia/PUTHistoria';
// Profesionales
import { validarYEnviarNuevoMedico } from '~/Core/Usuarios/Profesional/POSTMedico';
import { validarYEnviarModificarMedico } from '~/Core/Usuarios/Profesional/PUTMedico';
// Empresa
import { validarYEnviarDatosEmpresa } from '~/Core/Empresa/Configuracion/Empresa/POSTEmpresa';
import { validarYEnviarDatosSoftware } from '~/Core/Empresa/Configuracion/Software/POSTSoftware';
import { validarYEnviarDatosFacturacion } from '~/Core/Empresa/Facturacion/POSTFacturacion';
// Nota
import { validarYEnviarNuevaNota } from '~/Core/Historial/Notas/POSTNota';
import { validarYEnviarActualizarNota } from '~/Core/Historial/Notas/PUTNota';
// Usuarios
import { validarYEnviarNuevoUsuario } from '~/Core/Empresa/Usuario/NuevoUsuario';
import { validarYEnviarModificarAdministrador } from '~/Core/Empresa/Usuario/ModificarAdministrador';
// EPS
import { validarYEnviarDatosEPS } from '~/Core/Empresa/Datos/Eps/POSTEps';
import { validarYEnviarActualizarEps } from '~/Core/Empresa/Datos/Eps/PUTEps';
// Profesion
import { validarYEnviarDatosProfesion } from '~/Core/Empresa/Datos/Profesion/POSTProfesion';
import { validarYEnviarActualizarProfesion } from '~/Core/Empresa/Datos/Profesion/PUTProfesion';
// Servicio
import { validarYEnviarDatosServicio } from '~/Core/Empresa/Datos/Servicio/PostServicio';
import { validarYEnviarPutDatosServicio } from '~/Core/Empresa/Datos/Servicio/PutServicio';
// Login
import { validarYEnviarLogin } from '~/Core/Login/Ingresar';
import { validarYEnviarCambiarContraseña } from '~/Core/Login/CambiarContraseña';
import { validarYEnviarCambiarContraseñaPrimerVez } from '~/Core/Login/CambiarContraseñaPrimerVez';


// Importa accion de cada formulario desde el core
export const accionesFormularios = {
    Ingresar: async (data) => {
        const respuesta = await validarYEnviarLogin(data);
        return respuesta;
    },
    RecuperarContraseña: async (data) => {
        const respuesta = await validarYEnviarCambiarContraseña(data);
        return respuesta
    },
    CambiarContraseñaPrimerVez: async (data) => {
        const respuesta = await validarYEnviarCambiarContraseñaPrimerVez(data);
        return respuesta
    },
    NuevaCita: async (data) => {
        const respuesta = await validarYEnviarNuevaCita(data);
        return respuesta;
    },
    ActualizarCita: async (data) => {
        const respuesta = await validarYEnviarActualizarCita(data);
        return respuesta;
    },
    NuevoPaciente: async (data) => {
        const respuesta = await validarYEnviarNuevoPaciente(data);
        return respuesta;
    },
    ModificarPaciente: async (data) => {
        const respuesta = await validarYEnviarModificarPaciente(data)
        return respuesta;
    },
    NuevoProfesional: async (data) => {
        const respuesta = await validarYEnviarNuevoMedico(data)
        return respuesta;
    },
    ModificarProfesional: async (data) => {
        const respuesta = await validarYEnviarModificarMedico(data)
        return respuesta;
    },
    RegistrarHistoria: async (data) => {
        const respuesta = await validarYEnviarRegistrarHistoria(data)
        return respuesta;
    },
    ActualizarHistorias: async (data) => {
        const respuesta = await validarYEnviarActualizarHistoria(data)
        // window.location.reload()
        return respuesta;
    },
    DatosEmpresa: async (data) => {
        const respuesta = await validarYEnviarDatosEmpresa(data)
        console.log(respuesta)
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
        const respuesta = await validarYEnviarDatosFacturacion(data)
        return respuesta
    },
    NuevaNota: async (data) => {
        const respuesta = await validarYEnviarNuevaNota(data)
        return respuesta
    },
    ActualizarNota: async (data) => {
        const respuesta = await validarYEnviarActualizarNota(data)
        return respuesta
    },
    NuevoUsuario: async (data) => {
        const respuesta = await validarYEnviarNuevoUsuario(data)
        return respuesta
    },
    ModificarUsuario: async (data) => {
        const respuesta = await validarYEnviarModificarAdministrador(data)
        return respuesta
    },
    EPS: async (data) => {
        const respuesta = await validarYEnviarDatosEPS(data)
        return respuesta
    },
    ActualizarEPS: async (data) => {
        const respuesta = await validarYEnviarActualizarEps(data)
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
    Servicio: async (data) => {
        const respuesta = await validarYEnviarDatosServicio(data)
        return respuesta
    },
    ActualizarServicio: async (data) => {
        const respuesta = await validarYEnviarPutDatosServicio(data)
        return respuesta
    },
    ActualizarProfesion: async (data) => {
        const respuesta = await validarYEnviarActualizarProfesion(data)
        return respuesta
    },
};