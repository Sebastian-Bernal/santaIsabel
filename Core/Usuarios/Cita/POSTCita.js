import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { decryptData } from '~/composables/Formulario/crypto';
import { useDatosServicioStore } from '~/stores/Formularios/empresa/Servicio';

// funcion para Validar campos del formulario Nueva Cita
export const validarYEnviarNuevaCita = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const varView = useVarView()
    const cita = datos.Cita;

    let camposObligatorios = [
            'id_paciente',
            'id_medico',
            'name_paciente',
            'name_medico',
            'id_servicio',
            'motivo',
            'fecha',
    ]
    const servicioStore = useDatosServicioStore()
    const serviciosPlantilla = await servicioStore.listServicios()
    const tipoConsulta = serviciosPlantilla.find((s) => {
        return s.name === cita.servicio
    })?.plantilla

    if (datos.Cita.tipo) {
        camposObligatorios.push(
            'intervaloCitas',
            'cantidadCitas',);
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

    const fechaInicial = parseFechaISO(datos.Cita.fecha)
    const fechaFinal = parseFechaISO(datos.Cita.fechaHasta)

    if(fechaFinal < fechaInicial){
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Informacion invalida.';
        notificacionesStore.options.texto = `Valida el Rango de fecha de cumplimiento de Cita.`;
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
        return false;
    }
    // Validar fecha
    // const validarFecha = (fechaStr) => {
    //     if (!fechaStr) return false;

    //     const fechaCita = new Date(fechaStr);
    //     const hoy = new Date();

    //     // Limpiar la hora para comparar solo fechas
    //     hoy.setHours(0, 0, 0, 0);
    //     fechaCita.setHours(0, 0, 0, 0);

    //     const maxFecha = new Date(hoy);
    //     maxFecha.setDate(maxFecha.getDate() - 2);
    //     return fechaCita > maxFecha;
    // };


    // if (!validarFecha(cita.fecha)) {
    //     notificacionesStore.options.icono = 'error';
    //     notificacionesStore.options.titulo = 'Informacion invalida.';
    //     notificacionesStore.options.texto = 'La fecha de la cita no puede ser anterior a hoy.';
    //     notificacionesStore.options.tiempo = 5000;
    //     notificacionesStore.simple();
    //     return false;
    // }

    // Validar hora
    const validarHora = (horaStr) => {
        if (!horaStr) return false;

        const [hora, minutos] = horaStr.split(":").map(Number);
        const horaIngresada = hora + minutos / 60;

        const horaMinima = 5;   // 5:00 AM
        const horaMaxima = 22;  // 10:00 PM

        return horaIngresada >= horaMinima && horaIngresada <= horaMaxima;
    };

    if (!validarHora(cita.hora) && cita.hora) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Informacion invalida.';
        notificacionesStore.options.texto = 'La hora debe estar entre las 5:00 AM y las 10:00 PM.';
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
        return false;
    }

    if (cita.cantidadCitas > 1) {
        const cantidad = parseInt(cita.cantidadCitas) || 0;

        if (tipoConsulta === 'Terapia' && cita.id_procedimiento) {
            const dias_restantes = varView.tratamientos.find(tratamiento => {
                return parseInt(tratamiento.id) === parseInt(cita.id_procedimiento)
            })?.dias_restantes

            if (cantidad > dias_restantes) {
                notificacionesStore.options.icono = 'warning';
                notificacionesStore.options.titulo = 'Informacion invalida.';
                notificacionesStore.options.texto = 'Cantidad de Citas mayor a las restantes';
                notificacionesStore.options.tiempo = 5000;
                notificacionesStore.simple();
                return false;
            }
        }

        if(datos.Cita.motivo === 'Atención domiciliaria') {
            datos.Cita.intervaloCitas = 1

            // Diferencia en milisegundos
            const diffMs = fechaFinal - fechaInicial;
            // Convertir a días
            const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; 
            // +1 para incluir el día inicial
            // Validar si caben todas las citas
            if (datos.Cita.cantidadCitas > diffDias) {
                notificacionesStore.options.icono = 'warning';
                notificacionesStore.options.titulo = 'Información inválida.';
                notificacionesStore.options.texto = 'Cantidad de citas mayor al rango de fechas';
                notificacionesStore.options.tiempo = 5000;
                notificacionesStore.simple();
                return false;
            }
        }


        varView.cargando = true

        // Generar todas las citas
        for (let i = 0; i < cantidad; i++) {
            // Clonar la fecha inicial
            const fechaCita = new Date(fechaInicial);

            // Sumar el intervalo en días multiplicado por el índice
            fechaCita.setDate(fechaCita.getDate() + (i * datos.Cita.intervaloCitas));

            // Formatear la fecha en YYYY-MM-DD
            const fechaFormateada = formatearISO(fechaCita);

            const body = {
                id_paciente: datos.Cita.id_paciente,
                id_medico: datos.Cita.id_medico,
                id_servicio: datos.Cita.id_servicio,
                motivo: datos.Cita.motivo,
                fecha: fechaFormateada,
                fechaHasta: datos.Cita.fechaHasta,
                hora: datos.Cita.hora,
                id_procedimiento: datos.Cita.id_procedimiento,

                procedimiento: datos.Cita.procedimiento,
                codigo: datos.Cita.codigo,
            };
            await enviarFormularioCita({ Cita: { ...body } });
        }
        varView.cargando = false
        return true;
    }

    return await enviarFormularioCita({ ...datos });
};
// Utilidad para convertir string "YYYY-MM-DD" a Date
function parseFechaISO(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// Utilidad para formatear Date a "YYYY-MM-DD"
function formatearISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}


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
                    id_servicio: datos.Cita.id_servicio,
                    motivo: datos.Cita.motivo,
                    fecha: datos.Cita.fecha,
                    fechaHasta: datos.Cita.fechaHasta,
                    hora: datos.Cita.hora,
                    id_procedimiento: datos.Cita.id_procedimiento,

                    procedimiento: datos.Cita.procedimiento,
                    codigo: datos.Cita.codigo,
                    dias_asignados: datos.Cita.cantidadCitas
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
                        id_servicio: respuesta.data.id_servicio,
                        motivo: respuesta.data.motivo,
                        fecha: respuesta.data.fecha,
                        fechaHasta: respuesta.data.fechaHasta,
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
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        try {
            if (!reintento) {
                await guardarEnDB(JSON.parse(JSON.stringify({ Cita: { ...datos.Cita, sincronizado: 0 } })));
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