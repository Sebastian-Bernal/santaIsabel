import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../../stores/notificaciones.js'
import { useCalendarioCitas } from '~/stores/Calendario.js';
import { decryptData } from '~/composables/Formulario/crypto';
import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario Historia Clinica
export const validarYEnviarActualizarHistoria = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas();
    const varView = useVarView();

    const errores = [];
    // --- Validaciones por tipo de consulta ---
    switch (varView.tipoHistoria) {

        case 'Medicamento':
            if (!datos.Plan_manejo_medicamentos?.cantidad) errores.push("La cantidad de dias es obligatoria.");
            if (!datos.Plan_manejo_medicamentos?.dosis) errores.push("La dosis de medicina es obligatorio.");
            if (!datos.Plan_manejo_medicamentos?.medicamento) errores.push("La medicamento es obligatorio.");

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            const medicamentos = {
                ...datos.Plan_manejo_medicamentos
            }
            return await enviarFormularioActualizarMedicamento(medicamentos);

        case 'Tratamientos':
            if (!datos.Plan_manejo_procedimientos?.procedimiento) errores.push("El procedimiento es obligatorio.");
            if (!datos.Plan_manejo_procedimientos?.codigo) errores.push("El codigo del procedimiento es obligatorio.");
            if (!datos.Plan_manejo_procedimientos?.dias_asignados) errores.push("Los dias asignados es obligatorio.");

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            const tratamientos = {
                ...datos.Plan_manejo_procedimientos
            }
            return await enviarFormularioActualizarTratamiento(tratamientos);

        case 'Consulta':
            const analisisT = datos.Analisis;
            if (!analisisT?.motivo && puedePostAnalisis) errores.push("El motivo de consulta es obligatorio.");
            if (!analisisT?.observacion && puedePostAnalisis) errores.push("La observación es obligatoria.");
            if (!analisisT?.tratamiento && puedePostAnalisis) errores.push("El tratamiento es obligatorio.");
            if (!analisisT?.analisis && puedePostAnalisis) errores.push("El análisis es obligatorio.");
            if (!analisisT?.tipoAnalisis && puedePostAnalisis) errores.push("El tipo de análisis es obligatorio.");

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            const consultas = {
                Analisis: {...datos.Analisis}
            }
            return await enviarFormularioActualizarConsulta(consultas);

        case 'Evolucion':
            if (!datos.Analisis?.analisis) errores.push("El análisis es obligatorio.");
            if (!datos.Analisis?.motivo) errores.push("El motivo de consulta es obligatorio.");

            if (errores.length > 0) return mostrarErrores(errores, notificacionesStore);

            return await enviarFormularioActualizarNutricion(datos);

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

const enviarFormularioActualizarMedicamento = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    // Guardar Local
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.planManejoMedicamentos + '/' + datos.id,
                token: token,
                body: datos
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                // const datosActualizar = {
                //     Plan_manejo_medicamentos: {
                //         id: respuesta.data.id,
                //         medicamento: respuesta.data.medicamento,
                //         dosis: respuesta.data.dosis,
                //         cantidad: respuesta.data.cantidad,
                //     }
                // };
                // await actualizarEnIndexedDB(JSON.stringify(datosActualizar))
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
        await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
        return true
    }
}

const enviarFormularioActualizarTratamiento = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    // Guardar Local
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.planManejoProcedimientos + '/' + datos.id,
                token: token,
                body: datos
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                const datosActualizar = {
                    Plan_manejo_procedimientos: {
                        id: respuesta.data.id,
                        procedimiento: respuesta.data.procedimiento,
                        codigo: respuesta.data.codigo,
                        dias_asignados: respuesta.data.dias_asignados,
                    }
                };
                await actualizarEnIndexedDB(JSON.stringify(datosActualizar))
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
        await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
        return true
    }
}

const enviarFormularioActualizarConsulta = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    // Guardar Local
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.analisis + '/' + datos.Analisis.id,
                token: token,
                body: datos.Analisis
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                const datosActualizar = {
                    Analisis: {
                        ...datos.Analisis
                    }
                };
                await actualizarEnIndexedDB(JSON.stringify(datosActualizar))
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
        await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
        return true
    }
}

const enviarFormularioActualizarNutricion = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    // Guardar Local
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'PUT',
                url: config.public.analisis + '/' + datos.Analisis.id,
                token: token,
                body: datos.Analisis
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                // Actualizar local
                const datosActualizar = {
                    Analisis: {
                        ...datos.Analisis
                    }
                };
                await actualizarEnIndexedDB(JSON.stringify(datosActualizar))
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
        await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
        return true
    }
}

export const enviarFormularioActualizarTerapia = async (datos, reintento = false) => {
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
                metodo: 'PUT',
                url: config.public.terapias + '/' + datos.Terapia.id,
                token: token,
                body: {
                    Terapia: {
                        id: datos.Terapia.id,
                        sesion: datos.Terapia.sesion,
                        objetivos: datos.Terapia.objetivos,
                        fecha: datos.Terapia.fecha,
                        hora: datos.Terapia.hora,
                        evolucion: datos.Terapia.evolucion,
                        id_paciente: datos.Terapia.id_paciente,
                        id_profesional: datos.Terapia.id_profesional,
                        id_procedimiento: datos.Terapia.id_procedimiento,
                    },
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
                };

                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizar)))
                varView.propiedadesPDF = respuesta.data
                varView.showPDFTerapia = true
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