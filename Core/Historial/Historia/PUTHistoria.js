import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../../stores/notificaciones.js'
import { useCalendarioCitas } from '~/stores/Calendario.js';
import { decryptData } from '~/composables/Formulario/crypto';
import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario Historia Clinica
export const validarYEnviarActualizarHistoria = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const varView = useVarView()

    notificacionesStore.options.icono = 'warning';
    notificacionesStore.options.titulo = `Actualizar ${varView.tipoHistoria} en desarrollo.`;
    notificacionesStore.options.texto = '';
    notificacionesStore.options.tiempo = 5000;
    notificacionesStore.simple();

    // return await enviarFormulario(body);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas()
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    // Guardar Local

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.historiasClinicas,
                token: token,
                body: datos
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                const datosActualizar = {
                    HistoriaClinica: {
                        id: respuesta.ids.HistoriaClinica,
                        fecha_historia: calendarioStore.fechaActual.split('/').reverse().join('-'),
                        id_paciente: datos.HistoriaClinica.id_paciente
                    },
                    Analisis: {
                        id: respuesta.ids.Analisis,
                        motivo: datos.Analisis.motivo,
                        observacion: datos.Analisis.observacion,
                        tratamiento: datos.Analisis.tratamiento,
                        analisis: datos.Analisis.analisis,
                        tipoAnalisis: datos.Analisis.tipoAnalisis,
                        id_medico: datos.Cita.id_medico
                    },
                    Diagnosticos: datos.Diagnosticos.map((d, i) => ({
                        id: respuesta.ids.Diagnosticos[i],
                        descripcion: d.descripcion,
                        codigo: d.codigo
                    })),
                    Antecedentes: datos.Antecedentes.map((a, i) => ({
                        id: respuesta.ids.Antecedentes[i],
                        tipo: a.tipo,
                        descripcion: a.descripcion,
                        id_paciente: datos.HistoriaClinica.id_paciente
                    })),
                    Enfermedad: {
                        id: respuesta.ids.Enfermedad,
                        valor: datos.Enfermedad.valor,
                        fecha_diagnostico: calendarioStore.fechaActual.split('/').reverse().join('-'),
                        fecha_rehabilitacion: datos.Enfermedad.fecha_rehabilitacion,
                        id_paciente: datos.HistoriaClinica.id_paciente
                    },
                    ExamenFisico: {
                        id: respuesta.ids.ExamenFisico,
                        peso: datos.ExamenFisico.peso,
                        altura: datos.ExamenFisico.altura,
                        otros: datos.ExamenFisico.otros,
                        signosVitales: {
                            ta: datos.ExamenFisico.signosVitales.ta,
                            fc: datos.ExamenFisico.signosVitales.fc,
                            fr: datos.ExamenFisico.signosVitales.fr,
                            t: datos.ExamenFisico.signosVitales.t,
                            SATo2: datos.ExamenFisico.signosVitales.SATo2
                        }
                    },
                    Plan_manejo_medicamentos: datos.Plan_manejo_medicamentos.map((m, i) => ({
                        id: respuesta.ids.Plan_manejo_medicamentos[i],
                        medicamento: m.medicamento,
                        dosis: m.dosis,
                        cantidad: parseInt(m.cantidad)
                    })),
                    Plan_manejo_procedimientos: datos.Plan_manejo_procedimientos.map((p, i) => ({
                        id: respuesta.ids.Plan_manejo_procedimientos[i],
                        procedimiento: p.procedimiento,
                        codigo: p.codigo,
                        fecha: p.fecha
                    })),
                    Plan_manejo_insumos: datos.Plan_manejo_insumos.map((i, index) => ({
                        id: respuesta.ids.Plan_manejo_insumos[i],
                        nombre: i.nombre,
                        cantidad: parseInt(i.cantidad)
                    })),
                    Plan_manejo_equipos: datos.Plan_manejo_equipos.map((e, i) => ({
                        id: respuesta.ids.Plan_manejo_equipos[i],
                        descripcion: e.descripcion,
                        uso: e.uso
                    })),
                };
                await actualizarEnIndexedDB(JSON.stringify(datosActualizar))
                return true
            } else {
                console.log(respuesta)
            }
            // await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
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
        await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
        return true
    }
};