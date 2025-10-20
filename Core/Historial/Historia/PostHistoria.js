import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../../stores/notificaciones.js'
import { useCalendarioCitas } from '~/stores/Calendario.js';
import { useVarView } from '~/stores/varview.js';
import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario Historia Clinica
export const validarYEnviarRegistrarHistoria = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas();
    const varView = useVarView();
    datos.HistoriaClinica.fecha_historia = calendarioStore.fechaActual;
    datos.Analisis.fecha = calendarioStore.fechaActual;

    // Validacion si no se registran medicamentos
    if (datos.Plan_manejo_medicamentos?.length < 1) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.title = 'Historia sin plan de medicamentos'
        notificacionesStore.options.html = '¿Deseas registrar <strong>medicamentos</strong>?'
        notificacionesStore.options.confirmtext = 'Si'
        notificacionesStore.options.canceltext = 'No, continuar'
        let res = await notificacionesStore.alertRespuesta();
        if (res === 'confirmado') {
            varView.showMedicinas = true;
            return false
        };
    }

    // Validacion si no se registran procedimientos
    if (datos.Plan_manejo_procedimientos?.length < 1) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.title = 'Historia sin plan de procedimientos'
        notificacionesStore.options.html = '¿Deseas registrar <strong>Procedimiento</strong>?'
        notificacionesStore.options.confirmtext = 'Si'
        notificacionesStore.options.canceltext = 'No, continuar'
        let resp = await notificacionesStore.alertRespuesta();
        if (resp === 'confirmado') {
            varView.showProcedimientos = true;
            return false
        }
    }

    const errores = [];

    // Validar HistoriaClinica
    if (!datos.HistoriaClinica?.id_paciente) {
        errores.push("El ID del paciente es obligatorio.");
    }

    // Validar Analisis
    const analisis = datos.Analisis;
    if (!analisis?.motivo) errores.push("El motivo de consulta es obligatorio.");
    if (!analisis?.observacion) errores.push("La observación es obligatoria.");
    if (!analisis?.tratamiento) errores.push("El tratamiento es obligatorio.");
    if (!analisis?.analisis) errores.push("El análisis es obligatorio.");
    if (!analisis?.tipoAnalisis) errores.push("El tipo de análisis es obligatorio.");
    if (!datos.Cita?.id_medico) errores.push("El ID del médico es obligatorio.");

    // Validar Diagnosticos
    if (!Array.isArray(datos.Diagnosticos) || datos.Diagnosticos.length === 0) {
        errores.push("Debe ingresar al menos un diagnóstico.");
    } else {
        datos.Diagnosticos.forEach((d, i) => {
            if (!d.descripcion || !d.codigo) {
                errores.push(`Diagnóstico ${i + 1} incompleto.`);
            }
        });
    }

    // Validar Antecedentes
    if (!Array.isArray(datos.Antecedentes)) {
        errores.push("Los antecedentes deben ser un arreglo.");
    } else {
        datos.Antecedentes.forEach((a, i) => {
            if (!a.tipo || !a.descripcion) {
                errores.push(`Antecedente ${i + 1} incompleto.`);
            }
        });
    }

    // Validar Enfermedad
    const enfermedad = datos.Enfermedad;
    if (!enfermedad?.valor) errores.push("La descripción de la enfermedad actual es obligatoria.");

    // Validar Examen Físico
    const examen = datos.ExamenFisico;
    if (!examen?.Peso || isNaN(examen.Peso)) errores.push("El peso debe ser un número.");
    if (!examen?.altura || isNaN(examen.altura)) errores.push("La altura debe ser un número.");
    if (!examen?.signosVitales) {
        errores.push("Los signos vitales son obligatorios.");
    } else {
        const sv = examen.signosVitales;
        if (!sv.ta || !sv.fc || !sv.fr || !sv.t || !sv.SATo2) {
            errores.push("Todos los signos vitales deben estar completos.");
        }
    }

    // Validar Plan de Medicamentos
    if (!Array.isArray(datos.Plan_manejo_medicamentos)) {
        errores.push("El plan de medicamentos debe ser un arreglo.");
    } else {
        datos.Plan_manejo_medicamentos.forEach((m, i) => {
            if (!m.medicamento || !m.dosis || isNaN(parseInt(m.cantidad))) {
                errores.push(`Medicamento ${i + 1} incompleto o cantidad inválida.`);
            }
        });
    }

    // Validar Procedimientos
    datos.Plan_manejo_procedimientos.forEach((p, i) => {
        if (!p.procedimiento || !p.codigo || !p.fecha) {
            errores.push(`Procedimiento ${i + 1} incompleto.`);
        }
    });

    // Validar Insumos
    datos.Plan_manejo_insumos.forEach((i, idx) => {
        if (!i.nombre || isNaN(parseInt(i.cantidad))) {
            errores.push(`Insumo ${idx + 1} incompleto o cantidad inválida.`);
        }
    });

    // Validar Equipos
    datos.Plan_manejo_equipos.forEach((e, idx) => {
        if (!e.descripcion || !e.uso) {
            errores.push(`Equipo ${idx + 1} incompleto.`);
        }
    });

    // Validar Cita
    if (!datos.Cita?.id) {
        errores.push("El ID de la cita es obligatorio.");
    }

    // Mostrar errores o continuar
    if (errores.length > 0) {
        errores.forEach(msg => {
            notificacionesStore.options.icono = 'error';
            notificacionesStore.options.titulo = 'Informacion invalida.';
            notificacionesStore.options.texto = msg;
            notificacionesStore.options.tiempo = 5000;
            notificacionesStore.simple();
        });
        return false;
    }


    const body = {
        HistoriaClinica: {
            fecha_historia: calendarioStore.fechaActual.split('/').reverse().join('-'),
            id_paciente: datos.HistoriaClinica.id_paciente
        },
        Analisis: {
            motivo: datos.Analisis.motivo,
            observacion: datos.Analisis.observacion,
            tratamiento: datos.Analisis.tratamiento,
            analisis: datos.Analisis.analisis,
            tipoAnalisis: datos.Analisis.tipoAnalisis,
            id_medico: datos.Cita.id_medico
        },
        Diagnosticos: datos.Diagnosticos.map(d => ({
            descripcion: d.descripcion,
            codigo: d.codigo
        })),
        Antecedentes: datos.Antecedentes.map(a => ({
            tipo: a.tipo,
            descripcion: a.descripcion,
            id_paciente: datos.HistoriaClinica.id_paciente
        })),
        Enfermedad: {
            valor: datos.Enfermedad.valor,
            fecha_diagnostico: calendarioStore.fechaActual.split('/').reverse().join('-'),
            fecha_rehabilitacion: datos.Enfermedad.fecha_rehabilitacion,
            id_paciente: datos.HistoriaClinica.id_paciente
        },
        ExamenFisico: {
            Peso: datos.ExamenFisico.Peso,
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
        Plan_manejo_medicamentos: datos.Plan_manejo_medicamentos.map(m => ({
            medicamento: m.medicamento,
            dosis: m.dosis,
            cantidad: parseInt(m.cantidad)
        })),
        Plan_manejo_procedimientos: datos.Plan_manejo_procedimientos.map(p => ({
            procedimiento: p.procedimiento,
            codigo: p.codigo,
            fecha: p.fecha
        })),
        Plan_manejo_insumos: datos.Plan_manejo_insumos.map(i => ({
            nombre: i.nombre,
            cantidad: parseInt(i.cantidad)
        })),
        Plan_manejo_equipos: datos.Plan_manejo_equipos.map(e => ({
            descripcion: e.descripcion,
            uso: e.uso
        })),
        Cita: {
            id: datos.Cita.id,
            ...datos.Cita
        }
    };

    return await enviarFormulario(body);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas()
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

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
                        Peso: datos.ExamenFisico.Peso,
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
                    Cita: {
                        id: datos.Cita.id,
                        ...datos.Cita,
                        estado: 'Realizada',
                        id_examen_fisico: respuesta.ids.Analisis
                    }
                };
                await actualizarEnIndexedDB(JSON.stringify(datosActualizar))
                return true
            } else {
                console.log(respuesta)
            }
            // await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
        } catch (error) {
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