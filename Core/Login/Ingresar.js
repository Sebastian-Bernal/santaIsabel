import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useAdministrativosStore } from '~/stores/Formularios/administrativo/Administrativo.js';
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico.js';
import { useUsuariosStore } from '~/stores/Formularios/login/Login.js';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion.js'
import { secciones } from '~/data/Buttons.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarLogin = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const usuarioStore = useUsuariosStore();
    // Temporal codigo INDEXDB
    const administrativosStore = useAdministrativosStore();
    const profesionalesStore = useMedicosStore();
    const profesionesStore = useDatosProfesionStore();
    const administradores = await administrativosStore.listAdministrativos
    const medicos = await profesionalesStore.listMedicos

    const usuarios = [...administradores, ...medicos]

    // Buscar coincidencia por correo y contraseña
    const usuarioValido = usuarios.find(usuario =>
        usuario.correo?.toLowerCase() === datos.correo.toLowerCase() &&
        usuario.contraseña?.toLowerCase() === datos.contraseña.toLowerCase()
    );

    if (!usuarioValido) {
        notificacionesStore.options.icono = 'error'
        notificacionesStore.options.titulo = 'Error de ingreso';
        notificacionesStore.options.texto = 'El correo ingresado y la contraseña no son Correctos';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple()
        return;
    }
    // dato guardado Temporal por indexedDB
    sessionStorage.setItem('Nombre', usuarioValido.name)

    // Extraer permisos desde profesion
    if (usuarioValido.permisos === 'Todos') {
        sessionStorage.setItem('Permisos', JSON.stringify(secciones));
    } else {
        const profesiones = await profesionesStore.listProfesion
        const permisosProfesion = profesiones.filter(p => p.nombre === usuarioValido.profesion)?.[0].permisos
        usuarioStore.Permisos = permisosProfesion
        sessionStorage.setItem('Permisos', JSON.stringify(permisosProfesion));
    }



    return await enviarFormulario(datos);
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