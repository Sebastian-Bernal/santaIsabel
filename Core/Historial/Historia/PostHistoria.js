import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../../stores/notificaciones.js'
import { useCalendarioCitas } from '~/stores/Calendario.js';
import { useVarView } from '~/stores/varview.js';
import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// funcion para Validar campos del formulario Historia Clinica
export const validarYEnviarRegistrarHistoria = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas();
    const varView = useVarView();

    const errores = [];
    // --- Validaciones por tipo de consulta ---
    switch (varView.tipoConsulta) {
        case 'Terapia':
            if (!datos.Terapia?.id_paciente) errores.push("El paciente es obligatorio.");
            if (!datos.Terapia?.id_profesional) errores.push("El médico es obligatorio.");
            if (!datos.Terapia?.sesion) errores.push("La sesión es obligatoria.");
            if (!datos.Terapia?.fecha) errores.push("La fecha es obligatoria.");
            if (!datos.Terapia?.hora) errores.push("La hora es obligatoria.");
            if (!datos.Terapia?.objetivos) errores.push("El objetivo es obligatorio.");
            if (!datos.Terapia?.evolucion) errores.push("La evolución es obligatoria.");
            if (!datos.Terapia?.id_procedimiento) errores.push("El procedimiento es obligatoria.");

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            const bodyTerapia = {
                Terapia: {
                    id_paciente: datos.Terapia.id_paciente,
                    id_medico: datos.Terapia.id_medico,
                    sesion: datos.Terapia.sesion,
                    fecha: datos.Terapia.fecha,
                    hora: datos.Terapia.hora,
                    objetivo: datos.Terapia.objetivo,
                    evolucion: datos.Terapia.evolucion
                }
            };
            return await enviarFormularioTerapia(datos);

        case 'Nutricion':
            if (!datos.Analisis?.analisis) errores.push("El análisis es obligatorio.");
            if (!datos.Analisis?.motivo) errores.push("El motivo de consulta es obligatorio.");

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            // const bodyNutricion = {
            //     Analisis: {
            //         fecha: calendarioStore.fechaActual,
            //         motivo: datos.Analisis.motivo,
            //         analisis: datos.Analisis.analisis,
            //         observacion: datos.Analisis.observacion,
            //         tratamiento: datos.Analisis.tratamiento,
            //         tipoAnalisis: datos.Analisis.tipoAnalisis,
            //         id_medico: datos.Cita.id_medico,
            //         servicio: datos.Cita.servicio,
            //     }
            // };
            return await enviarFormularioNutricion(datos);

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
                    servicio: datos.Cita.servicio,
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