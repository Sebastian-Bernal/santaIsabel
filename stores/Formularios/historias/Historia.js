import { usePacientesStore } from '../paciente/Paciente';
import { useIndexedDBStore } from '~/stores/indexedDB';
import { traerHistorias } from '~/Core/Historial/Historia/GetHistoria';
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager';

// Pinia HistoriasClinicas
export const useHistoriasStore = defineStore('HistoriaClinica', {
    state: () => ({
        Formulario: {
            Analisis: {
                id: '',
                motivo: '',
                acompañante: [],
                observacion: '',
                tratamiento: '',
                analisis: '',
                tipoAnalisis: '',
                id_historia: '',
            },
            Diagnosticos: [],
            Antecedentes: [],
            Enfermedad: {
                valor: '',
                fecha_diagnostico: '',
                fecha_rehabilitacion: '',
            },
            HistoriaClinica: {
                id: '',
                fecha_historia: '',
                id_paciente: '',
                name_paciente: '',
                type_doc_paciente: '',
                No_document_paciente: '',
            },
            ExamenFisico: {
                id: '',
                Peso: '',
                altura: '',
                otros: '',
                id_historia: '',
                signosVitales: {
                    ta: '',
                    fc: '',
                    fr: '',
                    t: '',
                    SATo2: '',
                },
            },
            Plan_manejo_medicamentos: [],
            Plan_manejo_procedimientos: [],
            Plan_manejo_insumos: [],
            Plan_manejo_equipos: [],
            Cita: {},
        },
        Historias: [],

    }),

    getters: {
        async listHistorias(state) {
            const store = useIndexedDBStore()
            store.almacen = 'HistoriaClinica'
            const historias = await store.leerdatos()

            state.Historias = historias
            return historias
        },
        // Tabla Historias
        async datosHistoria() {
            // Traer pacientes
            const pacienteStore = usePacientesStore()
            const pacientes = await pacienteStore.listPacientes

            const datos = [];
            const historiasPacientes = []

            const historias = await this.listHistorias

            // Array de que devuelve todas la id_paciente en historias
            await historias.map((historia) => {
                historiasPacientes.push(historia.id_paciente)
            })

            // Array que devuelve json con Pacientes con historia
            await pacientes.map((paciente) => {
                datos.push({ id: paciente.id_paciente, paciente: paciente.name, cedula: paciente.No_document, estado: historiasPacientes.includes(paciente.id_paciente) ? 'Creada' : 'Nueva' })
            })

            return datos
        },
    },

    actions: {
        async cargarHistorias() {
            const store = useIndexedDBStore();
            store.almacen = 'HistoriaClinica';
            this.Historias = await store.leerdatos();
        },

        // Dashboard
        async ultimasHistorias() {
            const pacientesStore = usePacientesStore()
            let historias = await this.listHistorias
            // Validar que todos los objetos tengan el campo fecha_historia
            const faltanFechas = historias.some(h => !h.fecha_historia || typeof h.fecha_historia !== 'string');

            if (faltanFechas) {
                // Volver a llamar si hay datos incompletos
                historias = await this.listHistorias;
            }
            const pacientes = await pacientesStore.listPacientes

            historias = historias.map((historia) => {
                const paciente = pacientes.find(p => p.id_paciente == historia.id_paciente)
                return {
                    ...historia,
                    ...paciente
                }
            })

            return historias?.sort(
                (a, b) => {
                    const fechaA = new Date(a.fecha_historia.split('/').reverse().join('-'));
                    const fechaB = new Date(b.fecha_historia.split('/').reverse().join('-'));
                    return fechaB - fechaA; // Orden descendente
                }).slice(0, 3);
        },

        async listDatos(id, Tabla, Campo = 'id_historia') {
            // Traer datos de indexedDB
            const store = useIndexedDBStore()
            store.almacen = Tabla
            const datosTabla = await store.leerdatos()

            // Array que devuelve los datos filtrados por historia
            const datos = datosTabla.filter((dato) => {
                return parseInt(dato[Campo]) === parseInt(id)
            })

            return datos
        },

        // async indexDBDatos() {
        //     const historias = await traerHistorias()
        //     const historiasLocal = await this.listHistorias

        //     // Crear sets para comparación rápida
        //     const historiaIds = new Set(historiasLocal.map(h => h.id));

        //     const analisisLocal = await this.listDatos(historiaIds, 'Analisis', 'id_historia')
        //     const analisisIds = new Set(historiasLocal.map(h => h.Analisis?.id_historia));
        //     const analisisRefIds = new Set(historiasLocal.map(h => h.Analisis?.id)); // para diagnosticos, etc.


        //     const historiasIndexed = historias.map((data) => {
        //         const historiaId = data.id;
        //         const analisisId = data.analisis?.id;
        //         const id_historia = data.analisis?.id_historia;

        //         // Verificar si ya existe la historia
        //         if (historiaIds.has(historiaId)) return null;

        //         // Verificar si ya existe el análisis
        //         if (id_historia && analisisIds.has(id_historia)) return null;

        //         // Verificar si ya existen los datos dependientes
        //         if (analisisId && analisisRefIds.has(analisisId)) return null;

        //         return {
        //             HistoriaClinica: {
        //                 id: data.id,
        //                 id_paciente: data.id_paciente,
        //                 fecha_historia: data.fecha_historia,
        //             },
        //             Analisis: {
        //                 id: data.analisis?.id,
        //                 motivo: data.analisis?.motivo,
        //                 observacion: data.analisis?.observacion,
        //                 tratamiento: data.analisis?.tratamiento,
        //                 analisis: data.analisis?.analisis,
        //                 tipoAnalisis: data.analisis?.tipoAnalisis,
        //                 id_medico: data.analisis?.id_medico,
        //                 id_historia: data.analisis?.id_historia,
        //             },
        //             Diagnosticos: data.analisis?.diagnosticos?.map((d) => ({
        //                 id: d.id,
        //                 descripcion: d.descripcion,
        //                 codigo: d.codigo,
        //                 id_analisis: d.id_analisis
        //             })) || [],
        //             Enfermedad: data.analisis?.enfermedad
        //                 ? {
        //                     id: data.analisis.enfermedad.id,
        //                     valor: data.analisis.enfermedad.valor,
        //                     fecha_diagnostico: data.analisis.enfermedad.fecha_diagnostico,
        //                     fecha_rehabilitacion: data.analisis.enfermedad.fecha_rehabilitacion,
        //                     id_paciente: data.analisis.enfermedad.id_paciente,
        //                     id_analisis: data.analisis.enfermedad.id_analisis
        //                 }
        //                 : null,
        //             ExamenFisico: data.analisis?.examen_fisico
        //                 ? {
        //                     id: data.analisis.examen_fisico.id,
        //                     Peso: data.analisis.examen_fisico.peso,
        //                     altura: data.analisis.examen_fisico.altura,
        //                     otros: data.analisis.examen_fisico.otros,
        //                     signosVitales: { ...data.analisis.examen_fisico.signosVitales },
        //                     id_analisis: data.analisis.examen_fisico.id_analisis
        //                 }
        //                 : null,
        //             Plan_manejo_medicamentos: data.analisis?.medicamentos?.map((m) => ({
        //                 id: m.id,
        //                 medicamento: m.medicamento,
        //                 dosis: m.dosis,
        //                 cantidad: m.cantidad,
        //                 id_analisis: m.id_analisis
        //             })) || [],
        //             Plan_manejo_procedimientos: data.analisis?.procedimientos?.map((p) => ({
        //                 id: p.id,
        //                 procedimiento: p.procedimiento,
        //                 codigo: p.codigo,
        //                 fecha: p.fecha,
        //                 id_analisis: p.id_analisis
        //             })) || [],
        //             Plan_manejo_insumos: data.analisis?.insumos?.map((i) => ({
        //                 id: i.id,
        //                 insumo: i.insumo,
        //                 cantidad: i.cantidad,
        //                 id_analisis: i.id_analisis,
        //             })) || [],
        //             Plan_manejo_equipos: data.analisis?.equipos?.map((e) => ({
        //                 id: e.id,
        //                 equipo: e.equipo,
        //                 cantidad: e.cantidad,
        //                 id_analisis: e.id_analisis
        //             })) || [],
        //         }
        //     }).filter(item => item !== null);

        //     historiasIndexed?.map((item) => {
        //         guardarEnDB(item)
        //     })
        // },

        async indexDBDatos() {
            const store = useIndexedDBStore();

            const historias = await traerHistorias();

            // Cargar datos locales por tabla
            const historiasLocal = await this.listHistorias;
            const analisisLocal = await store.leerdatos('Analisis');
            const diagnosticosLocal = await store.leerdatos('Diagnosticos');
            const enfermedadLocal = await store.leerdatos('Enfermedad');
            const examenFisicoLocal = await store.leerdatos('ExamenFisico');
            const medicamentosLocal = await store.leerdatos('Plan_manejo_medicamentos');
            const procedimientosLocal = await store.leerdatos('Plan_manejo_procedimientos');
            const insumosLocal = await store.leerdatos('Plan_manejo_insumos');
            const equiposLocal = await store.leerdatos('Plan_manejo_equipos');

            // Crear mapas por ID
            const mapHistoria = new Map(historiasLocal.map(h => [h.id, h]));
            const mapAnalisis = new Map(analisisLocal.map(a => [a.id, a]));
            const mapDiagnosticos = new Map(diagnosticosLocal.map(d => [d.id, d]));
            const mapEnfermedad = new Map(enfermedadLocal.map(e => [e.id, e]));
            const mapExamen = new Map(examenFisicoLocal.map(e => [e.id, e]));
            const mapMedicamentos = new Map(medicamentosLocal.map(m => [m.id, m]));
            const mapProcedimientos = new Map(procedimientosLocal.map(p => [p.id, p]));
            const mapInsumos = new Map(insumosLocal.map(i => [i.id, i]));
            const mapEquipos = new Map(equiposLocal.map(e => [e.id, e]));

            for (const data of historias) {
                const historiaId = data.id;

                // Guardar historia si no existe
                if (!mapHistoria.has(historiaId)) {
                    guardarEnDB({
                        HistoriaClinica: {
                            id: historiaId,
                            id_paciente: data.id_paciente,
                            fecha_historia: data.fecha_historia,
                        }
                    });
                }

                // Recorrer todos los análisis
                for (const analisis of data.analisis || []) {
                    const analisisId = analisis.id;

                    if (!mapAnalisis.has(analisisId)) {
                        guardarEnDB({
                            Analisis: {
                                id: analisis.id,
                                motivo: analisis.motivo,
                                observacion: analisis.observacion,
                                tratamiento: analisis.tratamiento,
                                analisis: analisis.analisis,
                                tipoAnalisis: analisis.tipoAnalisis,
                                id_medico: analisis.id_medico,
                                id_historia: analisis.id_historia,
                                fecha: analisis.updated_at,
                            }
                        });
                    }

                    analisis.diagnosticos?.forEach(d => {
                        if (!mapDiagnosticos.has(d.id)) {
                            guardarEnDB({
                                Diagnosticos: {
                                    id: d.id,
                                    descripcion: d.descripcion,
                                    codigo: d.codigo,
                                    id_analisis: d.id_analisis,
                                }
                            });
                        }
                    });

                    if (analisis.enfermedad && !mapEnfermedad.has(analisis.enfermedad.id)) {
                        guardarEnDB({
                            Enfermedad: {
                                id: analisis.enfermedad.id,
                                valor: analisis.enfermedad.valor,
                                fecha_diagnostico: analisis.enfermedad.fecha_diagnostico,
                                fecha_rehabilitacion: analisis.enfermedad.fecha_rehabilitacion,
                                id_paciente: analisis.enfermedad.id_paciente,
                                id_analisis: analisis.enfermedad.id_analisis,
                            }
                        });
                    }

                    if (analisis.examen_fisico && !mapExamen.has(analisis.examen_fisico.id)) {
                        guardarEnDB({
                            ExamenFisico: {
                                id: analisis.examen_fisico.id,
                                Peso: analisis.examen_fisico.peso,
                                altura: analisis.examen_fisico.altura,
                                otros: analisis.examen_fisico.otros,
                                signosVitales: { ...analisis.examen_fisico.signosVitales },
                                id_analisis: analisis.examen_fisico.id_analisis,
                            }
                        });
                    }

                    analisis.medicamentos?.forEach(m => {
                        if (!mapMedicamentos.has(m.id)) {
                            guardarEnDB({
                                Plan_manejo_medicamentos: {
                                    id: m.id,
                                    medicamento: m.medicamento,
                                    dosis: m.dosis,
                                    cantidad: m.cantidad,
                                    id_analisis: m.id_analisis,
                                }
                            });
                        }
                    });

                    analisis.procedimientos?.forEach(p => {
                        if (!mapProcedimientos.has(p.id)) {
                            guardarEnDB({
                                Plan_manejo_procedimientos: {
                                    id: p.id,
                                    procedimiento: p.procedimiento,
                                    codigo: p.codigo,
                                    fecha: p.fecha,
                                    id_analisis: p.id_analisis,
                                }
                            });
                        }
                    });

                    analisis.insumos?.forEach(i => {
                        if (!mapInsumos.has(i.id)) {
                            guardarEnDB({
                                Plan_manejo_insumos: {
                                    id: i.id,
                                    insumo: i.insumo,
                                    cantidad: i.cantidad,
                                    id_analisis: i.id_analisis,
                                }
                            });
                        }
                    });

                    analisis.equipos?.forEach(e => {
                        if (!mapEquipos.has(e.id)) {
                            guardarEnDB({
                                Plan_manejo_equipos: {
                                    id: e.id,
                                    equipo: e.equipo,
                                    cantidad: e.cantidad,
                                    id_analisis: e.id_analisis,
                                }
                            });
                        }
                    });
                }
            }
        }

    }
});