import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Nueva Cita
export const validarYEnviarNuevaCita = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const cita = datos.Cita;

    // Validar campos vacíos
    const camposObligatorios = [
        'id_paciente',
        'id_medico',
        'name_paciente',
        'name_medico',
        'servicio',
        'motivo',
        'fecha',
        'hora'
    ];

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

        // Comparar solo fechas (sin hora)
        const fechaCitaSoloFecha = new Date(fechaCita.getFullYear(), fechaCita.getMonth(), fechaCita.getDate());
        const hoySoloFecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

        return fechaCitaSoloFecha > hoySoloFecha;
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

    return await enviarFormularioCita({ ...datos });
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioCita = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    let id_temporal = {}
    if (!reintento) {
        id_temporal = await guardarEnDB(JSON.parse(JSON.stringify({ Cita: { ...datos.Cita, estado: 'inactiva', sincronizado: 0 } })));
    } else {
        id_temporal.data = datos.Cita.id_temporal
    }

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
                    hora: datos.Cita.hora
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                const datosActualizadosLocal = {
                    Cita: {
                        id_temporal: id_temporal.data,
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
                        estado: respuesta.data.estado
                    }
                }
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
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
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};