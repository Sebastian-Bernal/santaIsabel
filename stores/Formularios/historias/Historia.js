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
            let historias = await this.listHistorias
            // Validar que todos los objetos tengan el campo fecha_historia
            const faltanFechas = historias.some(h => !h.fecha_historia || typeof h.fecha_historia !== 'string');

            if (faltanFechas) {
                // Volver a llamar si hay datos incompletos
                historias = await this.listHistorias;
            }

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
            const store = useIndexedDBStore()

            const historias = await traerHistorias();

            store.almacen = 'Analisis'
            const analisisLocal = await store.leerdatos()
            store.almacen = 'Diagnosticos'
            const diagnosticosLocal = await store.leerdatos()
            store.almacen = 'Enfermedad'
            const enfermedadLocal = await store.leerdatos()
            store.almacen = 'ExamenFisico'
            const examenFisicoLocal = await store.leerdatos()
            store.almacen = 'Plan_manejo_medicamentos'
            const medicamentosLocal = await store.leerdatos()
            store.almacen = 'Plan_manejo_procedimientos'
            const procedimientosLocal = await store.leerdatos()
            store.almacen = 'Plan_manejo_insumos'
            const insumosLocal = await store.leerdatos()
            store.almacen = 'Plan_manejo_equipos'
            const equiposLocal = await store.leerdatos()

            // Estrategia 1: Cargar todos los datos locales por tabla
            const historiasLocal = await this.listHistorias;

            // Crear mapas por ID para comparación rápida
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
                const analisisId = data.analisis?.id;

                const nuevaHistoria = {
                    HistoriaClinica: {
                        id: data.id,
                        id_paciente: data.id_paciente,
                        fecha_historia: data.fecha_historia,
                    },
                    Analisis: {
                        id: data.analisis?.id,
                        motivo: data.analisis?.motivo,
                        observacion: data.analisis?.observacion,
                        tratamiento: data.analisis?.tratamiento,
                        analisis: data.analisis?.analisis,
                        tipoAnalisis: data.analisis?.tipoAnalisis,
                        id_medico: data.analisis?.id_medico,
                        id_historia: data.analisis?.id_historia,
                        fecha: data.analisis.updated_at
                    },
                    Diagnosticos: data.analisis?.diagnosticos?.map((d) => ({
                        id: d.id,
                        descripcion: d.descripcion,
                        codigo: d.codigo,
                        id_analisis: d.id_analisis
                    })) || [],
                    Enfermedad: data.analisis?.enfermedad
                        ? {
                            id: data.analisis.enfermedad.id,
                            valor: data.analisis.enfermedad.valor,
                            fecha_diagnostico: data.analisis.enfermedad.fecha_diagnostico,
                            fecha_rehabilitacion: data.analisis.enfermedad.fecha_rehabilitacion,
                            id_paciente: data.analisis.enfermedad.id_paciente,
                            id_analisis: data.analisis.enfermedad.id_analisis
                        }
                        : null,
                    ExamenFisico: data.analisis?.examen_fisico
                        ? {
                            id: data.analisis.examen_fisico.id,
                            Peso: data.analisis.examen_fisico.peso,
                            altura: data.analisis.examen_fisico.altura,
                            otros: data.analisis.examen_fisico.otros,
                            signosVitales: { ...data.analisis.examen_fisico.signosVitales },
                            id_analisis: data.analisis.examen_fisico.id_analisis
                        }
                        : null,
                    Plan_manejo_medicamentos: data.analisis?.medicamentos?.map((m) => ({
                        id: m.id,
                        medicamento: m.medicamento,
                        dosis: m.dosis,
                        cantidad: m.cantidad,
                        id_analisis: m.id_analisis
                    })) || [],
                    Plan_manejo_procedimientos: data.analisis?.procedimientos?.map((p) => ({
                        id: p.id,
                        procedimiento: p.procedimiento,
                        codigo: p.codigo,
                        fecha: p.fecha,
                        id_analisis: p.id_analisis
                    })) || [],
                    Plan_manejo_insumos: data.analisis?.insumos?.map((i) => ({
                        id: i.id,
                        insumo: i.insumo,
                        cantidad: i.cantidad,
                        id_analisis: i.id_analisis,
                    })) || [],
                    Plan_manejo_equipos: data.analisis?.equipos?.map((e) => ({
                        id: e.id,
                        equipo: e.equipo,
                        cantidad: e.cantidad,
                        id_analisis: e.id_analisis
                    })) || [],
                };

                // Comparar cada tabla por ID
                const historiaLocal = mapHistoria.get(historiaId);
                const analisisLocal = mapAnalisis.get(analisisId);

                const historiaCambiada = JSON.stringify(historiaLocal) !== JSON.stringify(nuevaHistoria.HistoriaClinica);
                const analisisCambiado = JSON.stringify(analisisLocal) !== JSON.stringify(nuevaHistoria.Analisis);

                const diagnosticosCambiados = nuevaHistoria.Diagnosticos.some(d => {
                    const local = mapDiagnosticos.get(d.id);
                    return !local || JSON.stringify(local) !== JSON.stringify(d);
                });

                const enfermedadCambiada = nuevaHistoria.Enfermedad &&
                    JSON.stringify(mapEnfermedad.get(nuevaHistoria.Enfermedad.id)) !== JSON.stringify(nuevaHistoria.Enfermedad);

                const examenCambiado = nuevaHistoria.ExamenFisico &&
                    JSON.stringify(mapExamen.get(nuevaHistoria.ExamenFisico.id)) !== JSON.stringify(nuevaHistoria.ExamenFisico);

                const medicamentosCambiados = nuevaHistoria.Plan_manejo_medicamentos.some(m => {
                    const local = mapMedicamentos.get(m.id);
                    return !local || JSON.stringify(local) !== JSON.stringify(m);
                });

                const procedimientosCambiados = nuevaHistoria.Plan_manejo_procedimientos.some(p => {
                    const local = mapProcedimientos.get(p.id);
                    return !local || JSON.stringify(local) !== JSON.stringify(p);
                });

                const insumosCambiados = nuevaHistoria.Plan_manejo_insumos.some(i => {
                    const local = mapInsumos.get(i.id);
                    return !local || JSON.stringify(local) !== JSON.stringify(i);
                });

                const equiposCambiados = nuevaHistoria.Plan_manejo_equipos.some(e => {
                    const local = mapEquipos.get(e.id);
                    return !local || JSON.stringify(local) !== JSON.stringify(e);
                });

                const hayCambios = historiaCambiada || analisisCambiado || diagnosticosCambiados ||
                    enfermedadCambiada || examenCambiado || medicamentosCambiados ||
                    procedimientosCambiados || insumosCambiados || equiposCambiados;

                if (!historiaLocal) {
                    guardarEnDB(nuevaHistoria);
                } else if (hayCambios) {
                    // actualizarEnIndexedDB(nuevaHistoria);
                    console.log('hay cambios')
                }
            }
        }


    }
});