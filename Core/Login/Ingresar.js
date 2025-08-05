import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico.js';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { useUsuariosStore } from '~/stores/Formularios/login/Login.js';
import { useUsersStore } from '~/stores/Formularios/usuarios/Users.js';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion.js'
import { secciones } from '~/data/Buttons.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarLogin = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const usuarioStore = useUsuariosStore();
    const usersStore = useUsersStore();

    const usuarios = await usersStore.listUsers
    const profesionesStore = useDatosProfesionStore();
    const profeionales = useMedicosStore();

    // Temporal codigo INDEXDB

    // Buscar coincidencia por correo y contraseña
    const usuarioValido = usuarios.find(usuario =>
        usuario.correo?.toLowerCase() === datos.correo.toLowerCase() &&
        usuario.contraseña?.toLowerCase() === datos.contraseña.toLowerCase()
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

    let home = ''
    // Extraer permisos desde profesion
    if (usuarioValido.rol === 'Administrativo') {
        sessionStorage.setItem('Permisos', JSON.stringify(secciones));
        sessionStorage.setItem('Rol', 'Admin');
        home = 'Dashboard'
    } else if(usuarioValido.rol === 'Paciente') {
        sessionStorage.setItem('Permisos', JSON.stringify(['Historia']));
        sessionStorage.setItem('Rol', 'Paciente');
        sessionStorage.setItem('Paciente', JSON.stringify(usuarioValido));
        home = 'Historia'
    } else {
        const medicos = await profeionales.listMedicos
        const profesional = medicos.filter(p => p.No_document === usuarioValido.No_document)?.[0];

        const profesiones = await profesionesStore.listProfesion
        const permisosProfesion = profesiones.filter(p => p.nombre === profesional.profesion)?.[0].permisos

        usuarioStore.Permisos = permisosProfesion
        
        sessionStorage.setItem('Permisos', JSON.stringify(permisosProfesion));
        sessionStorage.setItem('Rol', 'Profesional');
        home = 'Citas'
    }

    const estado = await enviarFormulario(datos)
    return {
        estado,
        home
    };
};

// Funcion para validar conexion a internet y enviar fomulario a API
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const online = navigator.onLine;
    if (online) {
        try {
            console.log(datos)
            sessionStorage.setItem('Usuario', datos.correo)
            // sessionStorage.setItem('Nombre', datos.name)
            return true
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};