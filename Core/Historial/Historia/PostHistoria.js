import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../../stores/notificaciones.js'
import { useCalendarioCitas } from '~/stores/Calendario.js';
import { useVarView } from '~/stores/varview.js';
import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales.js';
import { PdfBuilder } from '~/build/Constructores/PDFBuilder.js';
import { useRouter } from 'vue-router'


// funcion para Validar campos del formulario Historia Clinica
export const validarYEnviarRegistrarHistoria = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas();
    const varView = useVarView();

    const errores = [];
    // --- Validaciones por tipo de consulta ---
    switch (varView.tipoConsulta.plantilla) {
        case 'Terapia':
            if (!datos.Terapia?.id_paciente) errores.push("El paciente es obligatorio.");
            if (!datos.Terapia?.id_profesional) errores.push("El médico es obligatorio.");
            if (!datos.Terapia?.sesion) errores.push("La sesión es obligatoria.");
            if (!datos.Terapia?.fecha) errores.push("La fecha es obligatoria.");
            if (!datos.Terapia?.hora) errores.push("La hora es obligatoria.");
            if (!datos.Terapia?.objetivos) errores.push("El objetivo es obligatorio.");
            if (!datos.Terapia?.evolucion) errores.push("La evolución es obligatoria.");
            if (!datos.Terapia?.id_procedimiento) errores.push("El procedimiento es obligatoria.");

            // Validar Diagnosticos
            datos.Diagnosticos.forEach((i, idx) => {
                if (!i.descripcion || !i.codigo) {
                    errores.push(`Diagnostico ${idx + 1} incompleto o codigo incompleto.`);
                }
            });

            datos.DiagnosticosCIF.forEach((i, idx) => {
                if (!i.descripcion || !i.codigo) {
                    errores.push(`Diagnostico CIF ${idx + 1} incompleto o codigo incompleto.`);
                }
            });

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);


            return await enviarFormularioTerapia(datos);

        case 'Evolucion':
            datos.HistoriaClinica.fecha_historia = calendarioStore.fechaActual;
            datos.Cita.servicio = varView.tipoConsulta.plantilla
            if (!datos.Analisis?.analisis) errores.push("El análisis es obligatorio.");
            if (!datos.Analisis?.motivo) errores.push("El motivo de consulta es obligatorio.");

            // Validar Diagnosticos
            datos.Diagnosticos.forEach((i, idx) => {
                if (!i.descripcion || !i.codigo) {
                    errores.push(`Diagnostico ${idx + 1} incompleto o codigo incompleto.`);
                }
            });

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            return await enviarFormularioNutricion(datos);

        case 'Trabajo Social':
            if (!datos.Analisis?.analisis) errores.push("El análisis es obligatorio.");
            if (!datos.Analisis?.motivo) errores.push("El motivo de consulta es obligatorio.");
            if (!datos.Analisis?.observacion) errores.push("La observacion de la consulta es obligatorio.");
            if (!datos.Analisis?.tipoAnalisis) errores.push("El tipo de analisis es obligatorio.");
            if (!datos.Analisis?.tratamiento) errores.push("El tratamiento es obligatorio.");

            if (!Array.isArray(datos.Plan_manejo_medicamentos)) {
                errores.push("El plan de medicamentos debe ser un arreglo.");
            } else {
                datos.Plan_manejo_medicamentos.forEach((m, i) => {
                    if (!m.medicamento || !m.dosis || isNaN(parseInt(m.cantidad))) {
                        errores.push(`Medicamento ${i + 1} incompleto o cantidad inválida.`);
                    }
                });
            }

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

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            const trabajoSocial = {
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
                    id_medico: datos.Cita.id_medico,
                    servicio: varView.tipoConsulta.plantilla,
                },
                Diagnosticos: datos.Diagnosticos.map(d => ({
                    descripcion: d.descripcion,
                    codigo: d.codigo
                })),
                Plan_manejo_medicamentos: datos.Plan_manejo_medicamentos.map(m => ({
                    medicamento: m.medicamento,
                    dosis: m.dosis,
                    cantidad: parseInt(m.cantidad)
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

            return await enviarFormularioTrabajoSocial(trabajoSocial);

        case 'Nota':
            const nota = datos?.Nota;
            datos.HistoriaClinica.fecha_historia = calendarioStore.fechaActual.split('/').reverse().join('-');
            // Validar que todos los campos estén presentes y no vacíos
            if (
                !nota?.id_paciente ||
                !nota?.direccion ||
                !nota?.fecha_nota ||
                !nota?.hora_nota ||
                !nota?.subjetivo ||
                !nota?.objetivo ||
                !nota?.actividades ||
                !nota?.plan ||
                !nota?.intervencion ||
                !nota?.evaluacion ||
                !nota?.tipoAnalisis
            ) {
                const msg = 'Todos los campos son obligatorios. Verifica que no haya ninguno vacío.';
                notificacionesStore.options.icono = 'error';
                notificacionesStore.options.titulo = 'Información inválida.';
                notificacionesStore.options.texto = msg;
                notificacionesStore.options.tiempo = 5000;
                notificacionesStore.simple();
                return;
            }

            datos.Nota.objetivo.forEach((i, idx) => {
                if (!i.descripcion || !i.hora) {
                    errores.push(`Descripcion ${idx + 1} de ${i.tipo} incompleto.`);
                }
            });

            datos.Nota.subjetivo.forEach((i, idx) => {
                if (!i.descripcion || !i.hora) {
                    errores.push(`Descripcion ${idx + 1} de ${i.tipo} incompleto.`);
                }
            });

            datos.Nota.actividades.forEach((i, idx) => {
                if (!i.descripcion || !i.hora) {
                    errores.push(`Descripcion ${idx + 1} de ${i.tipo} incompleto.`);
                }
            });

            datos.Nota.plan.forEach((i, idx) => {
                if (!i.descripcion || !i.hora) {
                    errores.push(`Descripcion ${idx + 1} de ${i.tipo} incompleto.`);
                }
            });

            datos.Nota.intervencion.forEach((i, idx) => {
                if (!i.descripcion || !i.hora) {
                    errores.push(`Descripcion ${idx + 1} de ${i.tipo} incompleto.`);
                }
            });

            datos.Nota.evaluacion.forEach((i, idx) => {
                if (!i.descripcion || !i.hora) {
                    errores.push(`Descripcion ${idx + 1} de ${i.tipo} incompleto.`);
                }
            });

            datos.Diagnosticos.forEach((d, i) => {
                if (!d.descripcion || !d.codigo) {
                    errores.push(`Diagnóstico ${i + 1} incompleto.`);
                }
            });
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
            return await enviarFormularioNota(datos)

        case 'Medicina':
            datos.HistoriaClinica.fecha_historia = calendarioStore.fechaActual;
            datos.Analisis.fecha = calendarioStore.fechaActual;

            const puedePostAnalisis = varView.getPermisos.includes('Analisis_post')

            // Validacion si no se registran medicamentos
            if (datos.Plan_manejo_medicamentos?.length < 1 && puedePostAnalisis) {
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
            if (datos.Plan_manejo_procedimientos?.length < 1 && puedePostAnalisis) {
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
            // Validar HistoriaClinica
            if (!datos.HistoriaClinica?.id_paciente) {
                errores.push("El ID del paciente es obligatorio.");
            }

            // Validar Analisis
            const analisis = datos.Analisis;
            if (!analisis?.motivo && puedePostAnalisis) errores.push("El motivo de consulta es obligatorio.");
            if (!analisis?.observacion && puedePostAnalisis) errores.push("La observación es obligatoria.");
            if (!analisis?.tratamiento && puedePostAnalisis) errores.push("El tratamiento es obligatorio.");
            if (!analisis?.analisis && puedePostAnalisis) errores.push("El análisis es obligatorio.");
            if (!analisis?.tipoAnalisis && puedePostAnalisis) errores.push("El tipo de análisis es obligatorio.");

            // Validar Profesional
            if (!datos.Cita?.id_medico) errores.push("El médico que registra historia es obligatorio.");

            // Validar Diagnosticos
            if (datos.Diagnosticos.length === 0 && puedePostAnalisis) {
                errores.push("Debe haber por lo menos un diagnostico.");
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
            if (!examen?.peso || isNaN(examen.peso)) errores.push("El peso debe ser un número.");
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
                if (!p.procedimiento || !p.codigo || !p.id_medico) {
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
                    id_medico: datos.Cita.id_medico,
                    servicio: varView.tipoConsulta.plantilla,
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
                    peso: datos.ExamenFisico.peso,
                    altura: datos.ExamenFisico.altura,
                    otros: datos.ExamenFisico.otros || null,
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
                    dias_asignados: p.dias_asignados,
                    id_medico: p.id_medico,
                    id_paciente: datos.HistoriaClinica.id_paciente
                })),
                Plan_manejo_insumos: datos.Plan_manejo_insumos.map(i => ({
                    nombre: i.nombre,
                    cantidad: parseInt(i.cantidad)
                })),
                Plan_manejo_equipos: datos.Plan_manejo_equipos.map(e => ({
                    descripcion: e.descripcion,
                    uso: e.uso
                })),
                Terapia: {
                    sesion: datos.Terapia.sesion,
                    objetivos: datos.Terapia.objetivos,
                    fecha: datos.Terapia.fecha,
                    hora: datos.Terapia.hora,
                    evolucion: datos.Terapia.evolucion,
                    id_paciente: datos.Terapia.id_paciente,
                    id_profesional: datos.Terapia.id_profesional,
                    id_procedimiento: datos.Terapia.id_procedimiento,
                },
                Cita: {
                    id: datos.Cita.id,
                    ...datos.Cita
                }
            };

            return await enviarFormularioHistoria(body);

        default:
            errores.push("Tipo de consulta no soportado.");
            return mostrarErrores(errores, notificacionesStore);
    }


};

function mostrarErrores(errores, notificacionesStore) {
    errores.forEach(msg => {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Información inválida';
        notificacionesStore.options.texto = msg;
        notificacionesStore.options.tiempo = 5000;
        notificacionesStore.simple();
    });
    return false;
}

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const enviarFormularioHistoria = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas()
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))
    const varView = useVarView()

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.historiasClinicas,
                token: token,
                body: {
                    HistoriaClinica: {
                        fecha_historia: datos.HistoriaClinica.fecha_historia,
                        id_paciente: datos.HistoriaClinica.id_paciente
                    },
                    Analisis: {
                        motivo: datos.Analisis.motivo,
                        observacion: datos.Analisis.observacion,
                        tratamiento: datos.Analisis.tratamiento,
                        analisis: datos.Analisis.analisis,
                        tipoAnalisis: datos.Analisis.tipoAnalisis,
                        id_medico: datos.Analisis.id_medico,
                        servicio: datos.Analisis.servicio,
                    },
                    Diagnosticos: (datos.Diagnosticos ?? []).map(d => ({
                        descripcion: d.descripcion,
                        codigo: d.codigo
                    })),
                    Antecedentes: (datos.Antecedentes ?? []).map(a => ({
                        tipo: a.tipo,
                        descripcion: a.descripcion,
                        id_paciente: datos.HistoriaClinica.id_paciente
                    })),
                    Enfermedad: {
                        valor: datos.Enfermedad.valor,
                        fecha_diagnostico: datos.Enfermedad.fecha_diagnostico,
                        fecha_rehabilitacion: datos.Enfermedad.fecha_rehabilitacion,
                        id_paciente: datos.HistoriaClinica.id_paciente
                    },
                    ExamenFisico: {
                        peso: datos.ExamenFisico.peso,
                        altura: datos.ExamenFisico.altura,
                        otros: datos.ExamenFisico.otros || null,
                        signosVitales: {
                            ta: datos.ExamenFisico.signosVitales.ta,
                            fc: datos.ExamenFisico.signosVitales.fc,
                            fr: datos.ExamenFisico.signosVitales.fr,
                            t: datos.ExamenFisico.signosVitales.t,
                            SATo2: datos.ExamenFisico.signosVitales.SATo2
                        }
                    },
                    Plan_manejo_medicamentos: (datos.Plan_manejo_medicamentos ?? []).map(m => ({
                        medicamento: m.medicamento,
                        dosis: m.dosis,
                        cantidad: parseInt(m.cantidad)
                    })),
                    Plan_manejo_procedimientos: (datos.Plan_manejo_procedimientos ?? []).map(p => ({
                        procedimiento: p.procedimiento,
                        codigo: p.codigo,
                        id_medico: p.id_medico,
                        dias_asignados: p.dias_asignados,
                        id_paciente: p.id_paciente
                    })),
                    Plan_manejo_insumos: (datos.Plan_manejo_insumos ?? []).map(i => ({
                        nombre: i.nombre,
                        cantidad: parseInt(i.cantidad)
                    })),
                    Plan_manejo_equipos: (datos.Plan_manejo_equipos ?? []).map(e => ({
                        descripcion: e.descripcion,
                        uso: e.uso
                    })),
                    Cita: {
                        id: datos.Cita.id
                    }
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                const datosActualizar = {
                    HistoriaClinica: {
                        id: respuesta.ids.HistoriaClinica,
                        fecha_historia: calendarioStore.fechaActual.split('/').reverse().join('-'),
                        id_paciente: datos.HistoriaClinica.id_paciente,
                        sincronizado: 1
                    },
                    Analisis: {
                        id: respuesta.ids.Analisis,
                        id_historia: respuesta.ids.HistoriaClinica,
                        motivo: datos.Analisis.motivo,
                        observacion: datos.Analisis.observacion,
                        tratamiento: datos.Analisis.tratamiento,
                        analisis: datos.Analisis.analisis,
                        tipoAnalisis: datos.Analisis.tipoAnalisis,
                        id_medico: datos.Cita.id_medico,
                        servicio: datos.Cita.servicio,
                        sincronizado: 1
                    },
                    Diagnosticos: datos.Diagnosticos.map((d, i) => ({
                        id_analisis: respuesta.ids.Analisis,
                        id: respuesta.ids.Diagnosticos[i],
                        descripcion: d.descripcion,
                        codigo: d.codigo,
                        sincronizado: 1
                    })),
                    Antecedentes: datos.Antecedentes.map((a, i) => ({
                        id: respuesta.ids.Antecedentes[i],
                        tipo: a.tipo,
                        descripcion: a.descripcion,
                        id_paciente: datos.HistoriaClinica.id_paciente,
                        sincronizado: 1
                    })),
                    Enfermedad: {
                        id: respuesta.ids.Enfermedad,
                        id_analisis: respuesta.ids.Analisis,
                        valor: datos.Enfermedad.valor,
                        fecha_diagnostico: calendarioStore.fechaActual.split('/').reverse().join('-'),
                        fecha_rehabilitacion: datos.Enfermedad.fecha_rehabilitacion,
                        id_paciente: datos.HistoriaClinica.id_paciente,
                        sincronizado: 1
                    },
                    ExamenFisico: {
                        id: respuesta.ids.ExamenFisico,
                        id_analisis: respuesta.ids.Analisis,
                        peso: datos.ExamenFisico.peso,
                        altura: datos.ExamenFisico.altura,
                        otros: datos.ExamenFisico.otros,
                        signosVitales: {
                            ta: datos.ExamenFisico.signosVitales.ta,
                            fc: datos.ExamenFisico.signosVitales.fc,
                            fr: datos.ExamenFisico.signosVitales.fr,
                            t: datos.ExamenFisico.signosVitales.t,
                            SATo2: datos.ExamenFisico.signosVitales.SATo2
                        },
                        sincronizado: 1
                    },
                    Plan_manejo_medicamentos: datos.Plan_manejo_medicamentos.map((m, i) => ({
                        id: respuesta.ids.Plan_manejo_medicamentos[i],
                        id_analisis: respuesta.ids.Analisis,
                        medicamento: m.medicamento,
                        dosis: m.dosis,
                        cantidad: parseInt(m.cantidad),
                        sincronizado: 1
                    })),
                    Plan_manejo_procedimientos: datos.Plan_manejo_procedimientos.map((p, i) => ({
                        id: respuesta.ids.Plan_manejo_procedimientos[i],
                        id_analisis: respuesta.ids.Analisis,
                        procedimiento: p.procedimiento,
                        codigo: p.codigo,
                        id_medico: p.id_medico,
                        dias_asignados: p.dias_asignados,
                        id_paciente: p.id_paciente,
                        sincronizado: 1
                    })),
                    Plan_manejo_insumos: datos.Plan_manejo_insumos.map((i, index) => ({
                        id: respuesta.ids.Plan_manejo_insumos[index],
                        id_analisis: respuesta.ids.Analisis,
                        nombre: i.nombre,
                        cantidad: parseInt(i.cantidad),
                        sincronizado: 1
                    })),
                    Plan_manejo_equipos: datos.Plan_manejo_equipos.map((e, i) => ({
                        id: respuesta.ids.Plan_manejo_equipos[i],
                        id_analisis: respuesta.ids.Analisis,
                        descripcion: e.descripcion,
                        uso: e.uso,
                        sincronizado: 1
                    })),
                    Cita: {
                        id: datos.Cita.id,
                        estado: 'Realizada',
                        id_analisis: respuesta.ids.Analisis,
                        sincronizado: 1,
                        ...datos.Cita
                    }
                };

                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizar)))
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
            const datosActualizar = {
                HistoriaClinica: {
                    fecha_historia: calendarioStore.fechaActual.split('/').reverse().join('-'),
                    id_paciente: datos.HistoriaClinica.id_paciente,
                    sincronizado: 0
                },
                Analisis: {
                    id_historia: respuesta.ids.HistoriaClinica,
                    motivo: datos.Analisis.motivo,
                    observacion: datos.Analisis.observacion,
                    tratamiento: datos.Analisis.tratamiento,
                    analisis: datos.Analisis.analisis,
                    tipoAnalisis: datos.Analisis.tipoAnalisis,
                    id_medico: datos.Cita.id_medico,
                    servicio: datos.Cita.servicio,
                    sincronizado: 0
                },
                Diagnosticos: datos.Diagnosticos.map((d, i) => ({
                    descripcion: d.descripcion,
                    codigo: d.codigo,
                    sincronizado: 0
                })),
                Antecedentes: datos.Antecedentes.map((a, i) => ({
                    tipo: a.tipo,
                    descripcion: a.descripcion,
                    id_paciente: datos.HistoriaClinica.id_paciente,
                    sincronizado: 0
                })),
                Enfermedad: {
                    valor: datos.Enfermedad.valor,
                    fecha_diagnostico: calendarioStore.fechaActual.split('/').reverse().join('-'),
                    fecha_rehabilitacion: datos.Enfermedad.fecha_rehabilitacion,
                    id_paciente: datos.HistoriaClinica.id_paciente,
                    sincronizado: 0
                },
                ExamenFisico: {
                    peso: datos.ExamenFisico.peso,
                    altura: datos.ExamenFisico.altura,
                    otros: datos.ExamenFisico.otros,
                    signosVitales: {
                        ta: datos.ExamenFisico.signosVitales.ta,
                        fc: datos.ExamenFisico.signosVitales.fc,
                        fr: datos.ExamenFisico.signosVitales.fr,
                        t: datos.ExamenFisico.signosVitales.t,
                        SATo2: datos.ExamenFisico.signosVitales.SATo2
                    },
                    sincronizado: 0
                },
                Plan_manejo_medicamentos: datos.Plan_manejo_medicamentos.map((m, i) => ({
                    medicamento: m.medicamento,
                    dosis: m.dosis,
                    cantidad: parseInt(m.cantidad),
                    sincronizado: 0
                })),
                Plan_manejo_procedimientos: datos.Plan_manejo_procedimientos.map((p, i) => ({
                    procedimiento: p.procedimiento,
                    codigo: p.codigo,
                    id_medico: p.id_medico,
                    dias_asignados: p.dias_asignados,
                    id_paciente: p.id_paciente,
                    sincronizado: 0
                })),
                Plan_manejo_insumos: datos.Plan_manejo_insumos.map((i, index) => ({
                    nombre: i.nombre,
                    cantidad: parseInt(i.cantidad),
                    sincronizado: 0
                })),
                Plan_manejo_equipos: datos.Plan_manejo_equipos.map((e, i) => ({
                    descripcion: e.descripcion,
                    uso: e.uso,
                    sincronizado: 0
                })),
                Cita: {
                    id: datos.Cita.id,
                    estado: 'Realizada',
                    sincronizado: 0,
                    ...datos.Cita
                }
            };
            if (!reintento) {
                await guardarEnDB(JSON.parse(JSON.stringify(datosActualizar)), "HistoriaClinica")
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

export const enviarFormularioTerapia = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))
    const varView = useVarView()

    const storeCodigos = useCodigos()
    const codigosLocal = await storeCodigos.leerdatos()
    const codigosSet = new Set(codigosLocal);

    const cie10 = datos.Diagnosticos
        .filter(d => !codigosSet.has(d.codigo))
        .map(d => ({ codigo: d.codigo, nombre: d.descripcion }));
    if (cie10.length > 0) {
        enviarDiagnostico(cie10)
    }


    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.terapias,
                token: token,
                body: {
                    Terapia: {
                        sesion: datos.Terapia.sesion,
                        objetivos: datos.Terapia.objetivos,
                        fecha: datos.Terapia.fecha,
                        hora: datos.Terapia.hora,
                        evolucion: datos.Terapia.evolucion,
                        id_paciente: datos.Terapia.id_paciente,
                        id_profesional: datos.Terapia.id_profesional,
                        id_procedimiento: datos.Terapia.id_procedimiento,
                    },
                    Analisis: {
                        motivo: 'Terapia',
                        id_medico: datos.Cita.id_medico,
                        servicio: 'Terapia',
                    },
                    Diagnosticos: (datos.Diagnosticos ?? []).map(d => ({
                        descripcion: d.descripcion,
                        codigo: d.codigo
                    })),
                    DiagnosticosCIF: (datos.DiagnosticosCIF ?? []).map(d => ({
                        descripcion: d.descripcion,
                        codigo: d.codigo
                    })),
                    Cita: {
                        id: datos.Cita.id
                    }
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                const datosActualizar = {
                    Terapia: {
                        sesion: datos.Terapia.sesion,
                        objetivos: datos.Terapia.objetivos,
                        fecha: datos.Terapia.fecha,
                        hora: datos.Terapia.hora,
                        evolucion: datos.Terapia.evolucion,
                        id_paciente: datos.Terapia.id_paciente,
                        id_profesional: datos.Terapia.id_profesional,
                        id_procedimiento: datos.Terapia.id_procedimiento,
                    },
                    Cita: {
                        id: datos.Cita.id,
                        estado: 'Realizada',
                        id_analisis: respuesta.ids.Analisis,
                        sincronizado: 1,
                        ...datos.Cita
                    }
                };

                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizar)))
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
            if (!reintento) {
                const datosActualizar = {
                    Terapia: {
                        sesion: datos.Terapia.sesion,
                        objetivos: datos.Terapia.objetivos,
                        fecha: datos.Terapia.fecha,
                        hora: datos.Terapia.hora,
                        evolucion: datos.Terapia.evolucion,
                        id_paciente: datos.Terapia.id_paciente,
                        id_profesional: datos.Terapia.id_profesional,
                        id_procedimiento: datos.Terapia.id_procedimiento,
                        sinconizado: 0
                    },
                    Cita: {
                        id: datos.Cita.id,
                        estado: 'Realizada',
                        sincronizado: 0,
                        ...datos.Cita
                    }
                };
                await guardarEnDB(JSON.parse(JSON.stringify(datosActualizar)));
            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch (error) {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
};

export const enviarFormularioNutricion = async (datos, reintento = false) => {
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
                url: config.public.historiasNutricion,
                token: token,
                body: {
                    HistoriaClinica: {
                        fecha_historia: datos.HistoriaClinica.fecha_historia,
                        id_paciente: datos.HistoriaClinica.id_paciente
                    },
                    Analisis: {
                        motivo: datos.Analisis.motivo,
                        observacion: datos.Analisis.observacion,
                        tratamiento: datos.Analisis.tratamiento,
                        analisis: datos.Analisis.analisis,
                        tipoAnalisis: datos.Analisis.tipoAnalisis,
                        id_medico: datos.Cita.id_medico,
                        servicio: datos.Cita.servicio,
                    },
                    Diagnosticos: (datos.Diagnosticos ?? []).map(d => ({
                        descripcion: d.descripcion,
                        codigo: d.codigo
                    })),
                    Cita: {
                        id: datos.Cita.id
                    }
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                const datosActualizar = {
                    Analisis: {
                        id: respuesta.ids.Analisis,
                        motivo: datos.Analisis.motivo,
                        observacion: datos.Analisis.observacion,
                        tratamiento: datos.Analisis.tratamiento,
                        analisis: datos.Analisis.analisis,
                        tipoAnalisis: datos.Analisis.tipoAnalisis,
                        id_medico: datos.Cita.id_medico,
                        servicio: datos.Cita.servicio,
                    },
                    Cita: {
                        id: datos.Cita.id,
                        estado: 'Realizada',
                        id_analisis: respuesta.ids.Analisis,
                        sincronizado: 1,
                        ...datos.Cita
                    }
                };

                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizar)))
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
            if (!reintento) {
                const datosActualizar = {
                    Analisis: {
                        motivo: datos.Analisis.motivo,
                        observacion: datos.Analisis.observacion,
                        tratamiento: datos.Analisis.tratamiento,
                        analisis: datos.Analisis.analisis,
                        tipoAnalisis: datos.Analisis.tipoAnalisis,
                        id_medico: datos.Cita.id_medico,
                        servicio: datos.Cita.servicio,
                        sinconizado: 0
                    },
                    Cita: {
                        id: datos.Cita.id,
                        estado: 'Realizada',
                        sincronizado: 0,
                        ...datos.Cita
                    }
                };
                await guardarEnDB(JSON.parse(JSON.stringify(datosActualizar)));
            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch (error) {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
};

export const enviarFormularioTrabajoSocial = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas()
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.historiasClinicasTrabajoSocial,
                token: token,
                body: {
                    HistoriaClinica: {
                        fecha_historia: datos.HistoriaClinica.fecha_historia,
                        id_paciente: datos.HistoriaClinica.id_paciente
                    },
                    Analisis: {
                        motivo: datos.Analisis.motivo,
                        observacion: datos.Analisis.observacion,
                        tratamiento: datos.Analisis.tratamiento,
                        analisis: datos.Analisis.analisis,
                        tipoAnalisis: datos.Analisis.tipoAnalisis,
                        id_medico: datos.Analisis.id_medico,
                        servicio: datos.Analisis.servicio,
                    },
                    Diagnosticos: (datos.Diagnosticos ?? []).map(d => ({
                        descripcion: d.descripcion,
                        codigo: d.codigo
                    })),
                    Plan_manejo_medicamentos: (datos.Plan_manejo_medicamentos ?? []).map(m => ({
                        medicamento: m.medicamento,
                        dosis: m.dosis,
                        cantidad: parseInt(m.cantidad)
                    })),
                    Plan_manejo_insumos: (datos.Plan_manejo_insumos ?? []).map(i => ({
                        nombre: i.nombre,
                        cantidad: parseInt(i.cantidad)
                    })),
                    Plan_manejo_equipos: (datos.Plan_manejo_equipos ?? []).map(e => ({
                        descripcion: e.descripcion,
                        uso: e.uso
                    })),
                    Cita: {
                        id: datos.Cita.id
                    }
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                const datosActualizar = {
                    HistoriaClinica: {
                        id: respuesta.ids.HistoriaClinica,
                        fecha_historia: calendarioStore.fechaActual.split('/').reverse().join('-'),
                        id_paciente: datos.HistoriaClinica.id_paciente,
                        sincronizado: 1
                    },
                    Analisis: {
                        id: respuesta.ids.Analisis,
                        id_historia: respuesta.ids.HistoriaClinica,
                        motivo: datos.Analisis.motivo,
                        observacion: datos.Analisis.observacion,
                        tratamiento: datos.Analisis.tratamiento,
                        analisis: datos.Analisis.analisis,
                        tipoAnalisis: datos.Analisis.tipoAnalisis,
                        id_medico: datos.Cita.id_medico,
                        servicio: datos.Cita.servicio,
                        sincronizado: 1
                    },
                    Diagnosticos: datos.Diagnosticos.map((d, i) => ({
                        id_analisis: respuesta.ids.Analisis,
                        id: respuesta.ids.Diagnosticos[i],
                        descripcion: d.descripcion,
                        codigo: d.codigo,
                        sincronizado: 1
                    })),
                    Plan_manejo_medicamentos: datos.Plan_manejo_medicamentos.map((m, i) => ({
                        id: respuesta.ids.Plan_manejo_medicamentos[i],
                        id_analisis: respuesta.ids.Analisis,
                        medicamento: m.medicamento,
                        dosis: m.dosis,
                        cantidad: parseInt(m.cantidad),
                        sincronizado: 1
                    })),
                    Plan_manejo_insumos: datos.Plan_manejo_insumos.map((i, index) => ({
                        id: respuesta.ids.Plan_manejo_insumos[index],
                        id_analisis: respuesta.ids.Analisis,
                        nombre: i.nombre,
                        cantidad: parseInt(i.cantidad),
                        sincronizado: 1
                    })),
                    Plan_manejo_equipos: datos.Plan_manejo_equipos.map((e, i) => ({
                        id: respuesta.ids.Plan_manejo_equipos[i],
                        id_analisis: respuesta.ids.Analisis,
                        descripcion: e.descripcion,
                        uso: e.uso,
                        sincronizado: 1
                    })),
                    Cita: {
                        id: datos.Cita.id,
                        estado: 'Realizada',
                        id_analisis: respuesta.ids.Analisis,
                        sincronizado: 1,
                        ...datos.Cita
                    }
                };

                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizar)))
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
            const datosActualizar = {
                HistoriaClinica: {
                    fecha_historia: calendarioStore.fechaActual.split('/').reverse().join('-'),
                    id_paciente: datos.HistoriaClinica.id_paciente,
                    sincronizado: 0
                },
                Analisis: {
                    id_historia: respuesta.ids.HistoriaClinica,
                    motivo: datos.Analisis.motivo,
                    observacion: datos.Analisis.observacion,
                    tratamiento: datos.Analisis.tratamiento,
                    analisis: datos.Analisis.analisis,
                    tipoAnalisis: datos.Analisis.tipoAnalisis,
                    id_medico: datos.Cita.id_medico,
                    servicio: datos.Cita.servicio,
                    sincronizado: 0
                },
                Diagnosticos: datos.Diagnosticos.map((d, i) => ({
                    descripcion: d.descripcion,
                    codigo: d.codigo,
                    sincronizado: 0
                })),
                Plan_manejo_medicamentos: datos.Plan_manejo_medicamentos.map((m, i) => ({
                    medicamento: m.medicamento,
                    dosis: m.dosis,
                    cantidad: parseInt(m.cantidad),
                    sincronizado: 0
                })),
                Plan_manejo_insumos: datos.Plan_manejo_insumos.map((i, index) => ({
                    nombre: i.nombre,
                    cantidad: parseInt(i.cantidad),
                    sincronizado: 0
                })),
                Plan_manejo_equipos: datos.Plan_manejo_equipos.map((e, i) => ({
                    descripcion: e.descripcion,
                    uso: e.uso,
                    sincronizado: 0
                })),
                Cita: {
                    id: datos.Cita.id,
                    estado: 'Realizada',
                    sincronizado: 0,
                    ...datos.Cita
                }
            };
            if (!reintento) {
                await guardarEnDB(JSON.parse(JSON.stringify(datosActualizar)), "HistoriaClinica")
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

export const enviarFormularioNota = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas()
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))
    const varView = useVarView()

    datos.Nota.Descripcion = [
        ...datos.Nota.objetivo,
        ...datos.Nota.subjetivo,
        ...datos.Nota.actividades,
        ...datos.Nota.plan,
        ...datos.Nota.intervencion,
        ...datos.Nota.evaluacion,
    ]

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.historiasClinicasNota,
                token: token,
                body: {
                    HistoriaClinica: {
                        fecha_historia: datos.HistoriaClinica.fecha_historia,
                        id_paciente: datos.HistoriaClinica.id_paciente
                    },
                    Nota: {
                        id_paciente: datos.Nota.id_paciente,
                        id_profesional: datos.Nota.id_profesional,
                        direccion: datos.Nota.direccion,
                        fecha_nota: datos.Nota.fecha_nota,
                        hora_nota: datos.Nota.hora_nota,
                        nota: datos.Nota.nota,
                        tipoAnalisis: datos.Nota.tipoAnalisis,
                    },
                    Analisis: {
                        motivo: 'Nota Medica',
                        tipoAnalisis: datos.Nota.tipoAnalisis,
                        id_medico: datos.Cita.id_medico,
                        servicio: 'Nota'
                    },
                    Diagnosticos: (datos.Diagnosticos ?? []).map(d => ({
                        descripcion: d.descripcion,
                        codigo: d.codigo
                    })),
                    Descripcion: (datos.Nota.Descripcion ?? []).map(d => ({
                        descripcion: d.descripcion,
                        hora: d.hora,
                        tipo: d.tipo,
                    })),
                    Cita: {
                        id: datos.Cita.id
                    }
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                const datosActualizar = {
                    HistoriaClinica: {
                        id: respuesta.ids.HistoriaClinica,
                        fecha_historia: calendarioStore.fechaActual.split('/').reverse().join('-'),
                        id_paciente: datos.HistoriaClinica.id_paciente,
                        sincronizado: 1
                    },
                    Nota: {
                        id: respuesta.data.id,
                        id_paciente: respuesta.data.id_paciente,
                        id_profesional: respuesta.data.id_profesional,
                        direccion: respuesta.data.direccion,
                        fecha_nota: respuesta.data.fecha_nota,
                        hora_nota: respuesta.data.hora_nota,
                        nota: respuesta.data.nota,
                        tipoAnalisis: respuesta.data.tipoAnalisis,
                    },
                    Cita: {
                        id: datos.Cita.id,
                        estado: 'Realizada',
                        id_analisis: respuesta.ids.Analisis,
                        sincronizado: 1,
                        ...datos.Cita
                    }
                };

                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizar)))
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
            const datosActualizar = {
                HistoriaClinica: {
                    fecha_historia: calendarioStore.fechaActual.split('/').reverse().join('-'),
                    id_paciente: datos.HistoriaClinica.id_paciente,
                    sincronizado: 0
                },
                Nota: {
                    id_paciente: datos.Nota.id_paciente,
                    id_profesional: datos.Nota.id_profesional,
                    direccion: datos.Nota.direccion,
                    fecha_nota: datos.Nota.fecha_nota,
                    hora_nota: datos.Nota.hora_nota,
                    nota: datos.Nota.nota,
                    tipoAnalisis: datos.Nota.tipoAnalisis,
                },
                Cita: {
                    id: datos.Cita.id,
                    estado: 'Realizada',
                    sincronizado: 0,
                    ...datos.Cita
                }
            };
            if (!reintento) {
                await guardarEnDB(JSON.parse(JSON.stringify(datosActualizar)), "HistoriaClinica")
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

export async function enviarDiagnostico(datos) {
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
                url: config.public.cie10,
                token: token,
                body: {
                    Cie10: (datos ?? []).map(d => ({
                        nombre: d.nombre,
                        codigo: d.codigo
                    })),
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
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
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch (error) {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }

}

async function notapdf(data) {
    const varView = useVarView()
    varView.cargando = true
    const pacientesStore = usePacientesStore()
    const medicoStore = useMedicosStore()

    const pacientes = await pacientesStore.listPacientes()
    const profesionales = await medicoStore.listMedicos(false)

    const dataPaciente = pacientes.find(user => {
        return user.id_paciente === data.HistoriaClinica.id_paciente
    })

    const profesional = profesionales.find(medico => {
        return medico.id_profesional === data.Cita.id_medico
    });

    const tiposOrden = ["subjetivo", "objetivo", "actividades", "plan", "intervencion", "evaluacion"];

    const descripcionesNota = [
        ...datos.Nota.objetivo,
        ...datos.Nota.subjetivo,
        ...datos.Nota.actividades,
        ...datos.Nota.plan,
        ...datos.Nota.intervencion,
        ...datos.Nota.evaluacion,
    ]

    // Agrupar por tipo
    const agrupadoPorTipo = descripcionesNota.reduce((acc, nota) => {
        if (!acc[nota.tipo]) acc[nota.tipo] = [];
        acc[nota.tipo].push(nota);
        return acc;
    }, {});

    // Construir filas ordenadas
    const filasNotas = tiposOrden.map(tipo => {
        const notasTipo = (agrupadoPorTipo[tipo] || []).sort((a, b) => {
            // Ordenar por hora ascendente
            return (a.hora || "").localeCompare(b.hora || "");
        });

        if (notasTipo.length === 0) return ""; // si no hay notas de ese tipo, no mostrar nada

        // Encabezado con el nombre del tipo
        let contenido = `<p class="text-start text-xs py-1"><strong>${tipo.toUpperCase()}:</strong></p>`;

        // Filas de cada nota
        contenido += notasTipo.map(nota => `
            <div class="flex">
                <p class="text-xs border-r-1 px-3 py-1">${nota.hora || ''}</p>
                <p class="text-xs w-full px-1">${nota.descripcion || ''}</p>
            </div>
        `).join("");

        // Separador visual
        contenido += `<hr class="w-full h-1"/>`;

        return contenido;
    }).join("");


    const diagnosticosNota = Array.isArray(unref(data.Diagnosticos))
        ? toRaw(data.Diagnosticos)
            .filter(diagnostico => diagnostico.id_analisis === data.id_analisis) // filtra solo los que aplican
            .map(diagnostico => [
                `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
                `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
            ])
        : [];

    propiedadesNotaPDF.value = { ...data, ...dataPaciente, nameProfesional: profesional.name, cedulaProfesional: profesional.No_document, sello: profesional.sello, filasNotas, diagnosticosNota }
    activePdfNotas.value = true
    const pdfNotas = new PdfBuilder()
    pdfNotas
        .setElementId('Nota')
        .setIsActive(true)
        .setFileName(`Nota_${propiedadesNotaPDF.value.name}`)
        .setSello(`${config.public.api}/storage/${propiedadesEvolucionPDF.value.sello}`)
        // ENCABEZADO PRINCIPAL
        .addComponente('Tabla', {
            container: 'border-b-2 pb-3',
            border: true,
            columnas: [
                '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                `
                            <p class="text-sm border-b-1 uppercase">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 uppercase">Registro</p></br>
                            <p class="text-sm uppercase">Nota de enfermeria de atencion domiciliaria</p>
                        `,
                `
                            <p class="w-full text-start text-xs border-b-1 pb-2">Codigo: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">version: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">Fecha: ${fechaFormateada()}</p>
                            <p class="w-full text-start text-xs">Pagina: 1 de 1</p>
                        `
            ],
        })

        // DATOS DEL PACIENTE
        .addComponente('Texto', { texto: 'Datos del paciente' })
        .addComponente('Tabla', {
            container: 'space-y-2 rounded-xl py-3',
            filas: [
                [
                    `<p class="text-xs w-full">Nombre completo: <span class="text-xs">${propiedadesNotaPDF.value.name}</span></p>`,
                    ``,
                ],
                [
                    [`<p class="text-xs ">No documento: <span class="text-xs">${propiedadesNotaPDF.value.No_document}</span></p>
                            <p class="text-xs ">Tipo de documento: <span class="text-xs">${propiedadesNotaPDF.value.type_doc}</span></p>`],
                    [`<p class="text-xs ">Edad: <span class="text-xs">${calcularEdad(propiedadesNotaPDF.value.nacimiento)}</span></p>
                            <p class="text-xs ">Sexo: <span class="text-xs">${propiedadesNotaPDF.value.sexo}</span></p>`],
                ],
                [
                    `<p class="text-xs ">EPS: <span class="text-xs">${propiedadesNotaPDF.value.Eps}</span></p>`,
                    `<p class="text-xs ">Zona: <span class="text-xs">${propiedadesNotaPDF.value.zona}</span></p>`
                ],
            ],
        })

        // SECCIÓN: DIAGNÓSTICOS
        .addComponente('Tabla', {
            container: 'w-full p-3',
            columnas: ['Diagnostico', 'CIE-10'],
            filas: propiedadesNotaPDF.value.diagnosticosNota?.length > 0
                ? propiedadesNotaPDF.value.diagnosticosNota
                : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
        })

        .addComponente('Espacio', { alto: 16 })

        // SECCIÓN: NOTA DE ENFERMERÍA
        .addComponente('Texto', {
            texto: 'Nota de Enfermería',
        })

        .addComponente('Tabla', {
            container: 'space-y-2 rounded-xl py-3!',
            styles: { border: '1px solid #DBEAFE' },
            filas: [
                [
                    `
                            <div class="w-full flex justify-between"> 
                                <p class="text-xs w-[80px]">Fecha:</p>
                                <div class="w-full text-center border-l-1">
                                    <p class="text-xs w-full">Nota</p>
                                </div>
                            </div>
                            `,
                ],
                [
                    `
                            <div class="w-full flex justify-between">
                                <p class="text-xs w-[80px]">${propiedadesNotaPDF.value.fecha_nota ?? ''}</p>
                                <div class="w-full flex flex-col gap-2 border-l-1 pl-3">
                                    ${propiedadesNotaPDF.value.filasNotas ?? ''}
                                </div>
                            </div>`,
                ],
            ],
        })

        .addComponente('Espacio', { alto: 32 })

        // PIE DE FIRMA
        .addComponente('Tabla', {
            container: 'pt-5',
            border: false,
            columnas: [
                `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Nombre y Apellido</p> </hr>
                                <p class="text-xs text-center pt-9">${propiedadesNotaPDF.value.nameProfesional}</p> </hr>
                                <p class="text-xs text-center pt-3">${propiedadesNotaPDF.value.cedulaProfesional}</p>
                            <div>
                            `,
                `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Firma y sello</p>
                                <div class="flex justify-center items-center" id="selloProfesional"><img src="${config.public.api}/storage/${propiedadesNotaPDF.value.sello}" class="w-[100px] h-[100px] pt-1"/></div>
                            </div>
                            `
            ],
        })
    pdfNotas.build()
    console.log(pdfNotas)


    varView.cargando = false
}