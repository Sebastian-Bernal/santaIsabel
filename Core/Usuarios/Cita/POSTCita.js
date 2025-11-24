import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nueva Cita
export const validarYEnviarNuevaCita = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const cita = datos.Cita;

    let camposObligatorios = []
    if(datos.Cita.servicio === 'Terapia'){
        camposObligatorios = [
            'id_paciente',
            'id_medico',
            'name_paciente',
            'name_medico',
            'servicio',
            'motivo',
            'fecha',
            'hora',
            'id_procedimiento'
        ];
    } else {
        camposObligatorios = [
            'id_paciente',
            'id_medico',
            'name_paciente',
            'name_medico',
            'servicio',
            'motivo',
            'fecha',
            'hora'
        ];
    }
    // Validar campos vacíos

    const camposVacios = camposObligatorios.filter(campo => {
        const valor = cita[campo];
        return valor === undefined || valor === null || valor === '';
    });

    if (camposVacios.length > 0) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Informacion invalida.';
        notificacionesStore.options.texto = `Faltan campos por llenar: ${camposVacios.join(', ')}`;
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
        return false;
    }

    // Validar fecha
    const validarFecha = (fechaStr) => {
        if (!fechaStr) return false;

        const fechaCita = new Date(fechaStr);
        const hoy = new Date();

        // Limpiar la hora para comparar solo fechas
        hoy.setHours(0, 0, 0, 0);
        fechaCita.setHours(0, 0, 0, 0);

        const maxFecha = new Date(hoy);
        maxFecha.setDate(maxFecha.getDate() - 2);
        return fechaCita > maxFecha;
    };


    if (!validarFecha(cita.fecha)) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Informacion invalida.';
        notificacionesStore.options.texto = 'La fecha de la cita no puede ser anterior a hoy.';
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
        return false;
    }

    // Validar hora
    const validarHora = (horaStr) => {
        if (!horaStr) return false;

        const [hora, minutos] = horaStr.split(":").map(Number);
        const horaIngresada = hora + minutos / 60;

        const horaMinima = 5;   // 5:00 AM
        const horaMaxima = 22;  // 10:00 PM

        return horaIngresada >= horaMinima && horaIngresada <= horaMaxima;
    };

    if (!validarHora(cita.hora)) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Informacion invalida.';
        notificacionesStore.options.texto = 'La hora debe estar entre las 5:00 AM y las 10:00 PM.';
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
        return false;
    }
    // console.log(datos)
    return await enviarFormularioCita({ ...datos });
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioCita = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.citas,
                token: token,
                body: {
                    id_paciente: datos.Cita.id_paciente,
                    id_medico: datos.Cita.id_medico,
                    name_paciente: datos.Cita.name_paciente,
                    name_medico: datos.Cita.name_medico,
                    servicio: datos.Cita.servicio,
                    motivo: datos.Cita.motivo,
                    fecha: datos.Cita.fecha,
                    hora: datos.Cita.hora,
                    id_procedimiento: datos.Cita.id_procedimiento
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                const datosActualizadosLocal = {
                    Cita: {
                        sincronizado: 1,
                        id: respuesta.data.id,
                        id_paciente: respuesta.data.id_paciente,
                        id_medico: respuesta.data.id_medico,
                        name_paciente: respuesta.data.name_paciente,
                        name_medico: respuesta.data.name_medico,
                        servicio: respuesta.data.servicio,
                        motivo: respuesta.data.motivo,
                        fecha: respuesta.data.fecha,
                        hora: respuesta.data.hora,
                        estado: respuesta.data.estado,
                        id_procedimiento: respuesta.data.id_procedimiento
                    }
                }
                await guardarEnDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                console.log('datos actualizados')
                return true
            }
        } catch (error) {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = '¡Ha ocurrido un problema!'
            notificacionesStore.options.texto = 'No se pudo enviar formulario, datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            notificacionesStore.simple()
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        try {
            if(!reintento){
                await guardarEnDB(JSON.parse(JSON.stringify({Cita: {...datos.Cita, sincronizado: 0}})));
            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
};