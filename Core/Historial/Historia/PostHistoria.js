
import { useCalendarioCitas } from '~/stores/Calendario.js';
import { enviarTerapia } from './Terapia.js';
import { enviarEvolucion } from './Evolucion.js';
import { enviarTrabajoSocial } from './TrabajoSocial.js';
import { enviarNota } from './Nota.js';
import { enviarMedicina } from './Medicina.js';

// funcion para Validar campos del formulario Historia Clinica
export const validarYEnviarRegistrarHistoria = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas();
    const varView = useVarView();

    const errores = [];
    // --- Validaciones por tipo de consulta ---
    switch (varView.tipoConsulta.plantilla) {
        case 'Terapia':
            datos.HistoriaClinica.fecha_historia = calendarioStore.fechaActual.split('/').reverse().join('-');
            if (!datos.Terapia?.sesion) errores.push("La sesión es obligatoria.");
            if (!datos.Terapia?.fecha) errores.push("La fecha es obligatoria.");
            if (!datos.Terapia?.hora) errores.push("La hora es obligatoria.");
            if (!datos.Terapia?.objetivos) errores.push("El objetivo es obligatorio.");
            if (!datos.Terapia?.evolucion) errores.push("La evolución es obligatoria.");

            // Validar Diagnosticos
            datos.Diagnosticos = datos.Diagnosticos.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null))
            datos.Diagnosticos.forEach((i, idx) => {
                if (!i.descripcion || !i.codigo) {
                    errores.push(`Diagnostico ${idx + 1} incompleto o codigo incompleto.`);
                }
            });

            datos.DiagnosticosCIF = datos.DiagnosticosCIF.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null))
            datos.DiagnosticosCIF.forEach((i, idx) => {
                if (!i.descripcion || !i.codigo) {
                    errores.push(`Diagnostico CIF ${idx + 1} incompleto o codigo incompleto.`);
                }
            });

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            const terapia = {
                HistoriaClinica: {
                    fecha_historia: datos.HistoriaClinica.fecha_historia,
                    id_paciente: datos.HistoriaClinica.id_paciente
                },
                Terapia: {
                    sesion: datos.Terapia.sesion,
                    objetivos: datos.Terapia.objetivos,
                    fecha: datos.Terapia.fecha,
                    hora: datos.Terapia.hora,
                    evolucion: datos.Terapia.evolucion,
                    id_procedimiento: datos.Terapia.id_procedimiento || null,
                },
                Analisis: {
                    motivo: datos.Cita.servicio,
                    id_medico: datos.Cita.id_medico,
                    id_servicio: datos.Cita.id_servicio,
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

            return await enviarTerapia(terapia);

        case 'Evolucion':
            datos.HistoriaClinica.fecha_historia = calendarioStore.fechaActual.split('/').reverse().join('-');
            datos.Analisis.id_servicio = datos.Cita.id_servicio
            if (!datos.Analisis?.analisis) errores.push("El análisis es obligatorio.");
            if (!datos.Analisis?.motivo) errores.push("El motivo de consulta es obligatorio.");

            datos.Diagnosticos = datos.Diagnosticos.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null));
            // Validar Diagnosticos
            datos.Diagnosticos.forEach((i, idx) => {
                if (!i.descripcion || !i.codigo) {
                    errores.push(`Diagnostico ${idx + 1} incompleto o codigo incompleto.`);
                }
            });

            datos.Plan_manejo_medicamentos = datos.Plan_manejo_medicamentos.filter(d => {
                return d && Object.values(d).some(v => v !== '' && v != null);
            });
            if (!Array.isArray(datos.Plan_manejo_medicamentos)) {
                errores.push("El plan de medicamentos debe ser un arreglo.");
            } else {
                datos.Plan_manejo_medicamentos.forEach((m, i) => {
                    if (!m.medicamento || !m.dosis || isNaN(parseInt(m.cantidad))) {
                        errores.push(`Medicamento ${i + 1} incompleto o cantidad inválida.`);
                    }
                });
            }

            // Validar Examen Físico
            const examenT = datos.ExamenFisico;
            if (!examenT?.peso || isNaN(examenT.peso)) errores.push("El peso debe ser un número.");
            if (!examenT?.altura || isNaN(examenT.altura)) errores.push("La altura debe ser un número.");
            if (!examenT?.signosVitales) {
                errores.push("Los signos vitales son obligatorios.");
            } else {
                const sv = examenT.signosVitales;
                if (!sv.ta || !sv.fc || !sv.fr || !sv.t || !sv.SATo2) {
                    errores.push("Todos los signos vitales deben estar completos.");
                }
            }

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);
            const evolucion = {
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
                    id_servicio: datos.Analisis.id_servicio,
                },
                Diagnosticos: (datos.Diagnosticos ?? []).map(d => ({
                    descripcion: d.descripcion,
                    codigo: d.codigo
                })),
                Plan_manejo_medicamentos: (datos.Plan_manejo_medicamentos ?? []).map(m => ({
                    medicamento: m.medicamento,
                    codigo: m.codigo,
                    dosis: m.dosis,
                    cantidad: parseInt(m.cantidad),
                    id_insumo: m.id_insumo,
                    observacion: m.observacion
                })),
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
                Cita: {
                    id: datos.Cita.id
                }
            }

            return await enviarEvolucion(evolucion);

        case 'Trabajo Social':
            if (!datos.Analisis?.analisis) errores.push("El análisis es obligatorio.");
            if (!datos.Analisis?.motivo) errores.push("El motivo de consulta es obligatorio.");
            if (!datos.Analisis?.observacion) errores.push("La observacion de la consulta es obligatorio.");
            if (!datos.Analisis?.tipoAnalisis) errores.push("El tipo de analisis es obligatorio.");
            if (!datos.Analisis?.tratamiento) errores.push("El tratamiento es obligatorio.");

            datos.Diagnosticos = datos.Diagnosticos.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null))
            // Validar Diagnosticos
            datos.Diagnosticos.forEach((i, idx) => {
                if (!i.descripcion || !i.codigo) {
                    errores.push(`Diagnostico ${idx + 1} incompleto o codigo incompleto.`);
                }
            });

            datos.Plan_manejo_medicamentos = datos.Plan_manejo_medicamentos.filter(d => {
                return d && Object.values(d).some(v => v !== '' && v != null);
            });
            if (!Array.isArray(datos.Plan_manejo_medicamentos)) {
                errores.push("El plan de medicamentos debe ser un arreglo.");
            } else {
                datos.Plan_manejo_medicamentos.forEach((m, i) => {
                    if (!m.medicamento || !m.dosis || isNaN(parseInt(m.cantidad))) {
                        errores.push(`Medicamento ${i + 1} incompleto o cantidad inválida.`);
                    }
                });
            }

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
                    id_servicio: datos.Cita.id_servicio
                },
                Diagnosticos: datos.Diagnosticos.map(d => ({
                    descripcion: d.descripcion,
                    codigo: d.codigo
                })),
                Plan_manejo_medicamentos: datos.Plan_manejo_medicamentos.map(m => ({
                    medicamento: m.medicamento,
                    codigo: m.codigo,
                    dosis: m.dosis,
                    cantidad: parseInt(m.cantidad),
                    id_insumo: m.id_insumo,
                    observacion: m.observacion
                })),
                Cita: {
                    id: datos.Cita.id,
                    ...datos.Cita
                }
            };

            return await enviarTrabajoSocial(trabajoSocial);

        case 'Nota':
            const nota = datos?.Nota;
            datos.HistoriaClinica.fecha_historia = calendarioStore.fechaActual.split('/').reverse().join('-');
            // Validar que todos los campos estén presentes y no vacíos
            if (
                !nota?.direccion ||
                !nota?.fecha_nota ||
                !nota?.hora_nota ||
                !nota?.subjetivo.length ||
                !nota?.objetivo.length ||
                !nota?.actividades.length ||
                !nota?.plan.length ||
                !nota?.intervencion.length ||
                !nota?.evaluacion.length ||
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

            datos.Nota.objetivo = datos.Nota.objetivo.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Nota.objetivo.forEach((i, idx) => {
                    if (!i.descripcion || !i.hora) {
                        errores.push(`Descripcion ${idx + 1} de Objetivo incompleto.`);
                    }
                });

            datos.Nota.subjetivo = datos.Nota.subjetivo.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Nota.subjetivo.forEach((i, idx) => {
                    if (!i.descripcion || !i.hora) {
                        errores.push(`Descripcion ${idx + 1} de Subjetivo incompleto.`);
                    }
                });

            datos.Nota.actividades = datos.Nota.actividades.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Nota.actividades.forEach((i, idx) => {
                    if (!i.descripcion || !i.hora) {
                        errores.push(`Descripcion ${idx + 1} de Actividades incompleto.`);
                    }
                });

            datos.Nota.plan = datos.Nota.plan.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Nota.plan.forEach((i, idx) => {
                    if (!i.descripcion || !i.hora) {
                        errores.push(`Descripcion ${idx + 1} de Plan incompleto.`);
                    }
                });

            datos.Nota.intervencion = datos.Nota.intervencion.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Nota.intervencion.forEach((i, idx) => {
                    if (!i.descripcion || !i.hora) {
                        errores.push(`Descripcion ${idx + 1} de Intervencion incompleto.`);
                    }
                });

            datos.Nota.evaluacion = datos.Nota.evaluacion.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Nota.evaluacion.forEach((i, idx) => {
                    if (!i.descripcion || !i.hora) {
                        errores.push(`Descripcion ${idx + 1} de Evaluacion incompleto.`);
                    }
                });

            datos.Diagnosticos = datos.Diagnosticos.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null)),
                datos.Diagnosticos.forEach((d, i) => {
                    if (!d.descripcion || !d.codigo) {
                        errores.push(`Diagnóstico ${i + 1} incompleto.`);
                    }
                });

            datos.Nota.Descripcion = [
                ...(datos.Nota.objetivo ?? [])
                    .map(d => ({ ...d, tipo: 'objetivo' }))
                    .filter(d => !Object.values(d).every(v => v === '' || v == null)),

                ...(datos.Nota.subjetivo ?? [])
                    .map(d => ({ ...d, tipo: 'subjetivo' }))
                    .filter(d => !Object.values(d).every(v => v === '' || v == null)),

                ...(datos.Nota.actividades ?? [])
                    .map(d => ({ ...d, tipo: 'actividades' }))
                    .filter(d => !Object.values(d).every(v => v === '' || v == null)),

                ...(datos.Nota.plan ?? [])
                    .map(d => ({ ...d, tipo: 'plan' }))
                    .filter(d => !Object.values(d).every(v => v === '' || v == null)),

                ...(datos.Nota.intervencion ?? [])
                    .map(d => ({ ...d, tipo: 'intervencion' }))
                    .filter(d => !Object.values(d).every(v => v === '' || v == null)),

                ...(datos.Nota.evaluacion ?? [])
                    .map(d => ({ ...d, tipo: 'evaluacion' }))
                    .filter(d => !Object.values(d).every(v => v === '' || v == null)),
            ];

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

            const envio = {
                HistoriaClinica: {
                    fecha_historia: datos.HistoriaClinica.fecha_historia,
                    id_paciente: datos.HistoriaClinica.id_paciente
                },
                Nota: {
                    id_paciente: datos.HistoriaClinica.id_paciente,
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
                    id_servicio: datos.Cita.id_servicio
                },
                Diagnosticos: (datos.Diagnosticos ?? []).map(d => ({
                    descripcion: d.descripcion,
                    codigo: d.codigo
                }))
                    .filter(d => !Object.values(d).every(v => v === '' || v == null)),
                Descripcion: (datos.Nota.Descripcion ?? []).map(d => ({
                    descripcion: d.descripcion,
                    hora: d.hora,
                    tipo: d.tipo,
                })),
                Cita: {
                    id: datos.Cita.id
                }
            }
            return await enviarNota(envio)

        case 'Medicina':
            datos.HistoriaClinica.fecha_historia = calendarioStore.fechaActual;

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

            datos.Diagnosticos = datos.Diagnosticos.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null))
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

            datos.Antecedentes = datos.Antecedentes.filter(d => Object.keys(d).length > 0 && Object.values(d).some(v => v !== '' || v != null))
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
            datos.Plan_manejo_medicamentos = datos.Plan_manejo_medicamentos.filter(d => {
                return d && Object.values(d).some(v => v !== '' && v != null);
            });
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
            datos.Plan_manejo_procedimientos = datos.Plan_manejo_procedimientos.filter(d => {
                return d && Object.values(d).some(v => v !== '' && v != null);
            });
            datos.Plan_manejo_procedimientos.forEach((p, i) => {
                if (!p.procedimiento || !p.codigo) {
                    errores.push(`Procedimiento ${i + 1} incompleto.`);
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
                    id_servicio: datos.Cita.id_servicio,
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
                    codigo: m.codigo,
                    dosis: m.dosis,
                    cantidad: parseInt(m.cantidad),
                    id_insumo: m.id_insumo,
                    observacion: m.observacion
                })),
                Plan_manejo_procedimientos: datos.Plan_manejo_procedimientos.map(p => ({
                    procedimiento: p.procedimiento,
                    codigo: p.codigo,
                    dias_asignados: p.dias_asignados,
                    id_medico: p.id_medico,
                    id_paciente: datos.HistoriaClinica.id_paciente,
                    observacion: p.observacion
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

            return await enviarMedicina(body);

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