import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales.js';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { useUsuariosStore } from '~/stores/Formularios/login/Login.js';
import { useUsersStore } from '~/stores/Formularios/usuarios/Users.js';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion.js'
import { secciones } from '~/data/Buttons.js';
import { useApiRest } from '~/stores/apiRest.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarLogin = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const usuarioStore = useUsuariosStore();
    const usersStore = useUsersStore();

    const usuarios = await usersStore.listUsers
    const profesionesStore = useDatosProfesionStore();
    const profeionales = useMedicosStore();

    const usuarioValido = usuarios.find(usuario =>
        usuario.correo?.toLowerCase() === datos.Usuario.correo.toLowerCase() &&
        usuario.contraseña?.toLowerCase() === datos.Usuario.contraseña.toLowerCase()
    );

    if (!usuarioValido) {
        notificacionesStore.options.icono = 'error'
        notificacionesStore.options.titulo = 'Error de ingreso';
        notificacionesStore.options.texto = 'El correo ingresado y/o la contraseña no son Correctos';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple()
        return;
    }
    // dato guardado Temporal por indexedDB
    sessionStorage.setItem('Nombre', usuarioValido.name)

    // Extraer permisos desde profesion
    if (usuarioValido.rol === 'Administrativo') {
        sessionStorage.setItem('Permisos', JSON.stringify(secciones));
        sessionStorage.setItem('Rol', 'Admin');
    } else if(usuarioValido.rol === 'Paciente') {
        sessionStorage.setItem('Permisos', JSON.stringify(['Historia']));
        sessionStorage.setItem('Rol', 'Paciente');
        sessionStorage.setItem('Paciente', JSON.stringify(usuarioValido));
    } else {
        const medicos = await profeionales.listMedicos
        const profesional = medicos.filter(p => p.No_document === usuarioValido.No_document)?.[0];

        const profesiones = await profesionesStore.listProfesion
        const permisosProfesion = profesiones.filter(p => p.nombre === profesional.profesion)?.[0].permisos

        usuarioStore.Permisos = permisosProfesion

        sessionStorage.setItem('Permisos', JSON.stringify(permisosProfesion));
        sessionStorage.setItem('Rol', 'Profesional');
    }


    const estado = await enviarFormulario(datos.Usuario)
    return {
        estado,
    };
};

// Funcion para validar conexion a internet y enviar fomulario a API
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()

    sessionStorage.setItem('Empresa', datos.empresa)
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.login,
                body: {
                    email: datos.correo,
                    password: datos.contraseña
                },
            }
            const respuesta = await api.functionCall(options)
            if (respuesta) {
                sessionStorage.setItem('token', respuesta.access_token)
                sessionStorage.setItem('name', respuesta.user_name)
                sessionStorage.setItem('Usuario', datos.correo)
                return true
            } else {
                return false
            }
        } catch (error) {
            console.error('Fallo al enviar. Intenta en otro momento', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};
