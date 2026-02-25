import { usePacientesStore } from '../paciente/Paciente';
import { useIndexedDBStore } from '~/stores/indexedDB';
import { useCacheStrategy } from '~/composables/useCacheStrategy';
import { decryptData } from '~/composables/Formulario/crypto';
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
                servicio: '',
            },
            Diagnosticos: [],
            DiagnosticosCIF: [],
            Antecedentes: [],
            DiagnosticosRegistrados: [],
            AntecedentesRegistrados: [],
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
                peso: '',
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
            Terapia: {
                id_paciente: '',
                id_profesional: '',
                id_procedimiento: '',
                sesion: '',
                fecha: '',
                hora: '',
                objetivos: '',
                evolucion: '',
            },
            Nota: {
                subjetivo: [],
                objetivo: [],
                actividades: [],
                plan: [],
                intervencion: [],
                evaluacion: [],
            },
            Historial_cambios_sonda: {
                fecha_cambio: '',
                observacion: '',
                id: ''
            },
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
            const pacientes = await pacienteStore.listPacientes()

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
            const faltanFechas = historias?.some(h => !h.fecha_historia || typeof h.fecha_historia !== 'string');

            if (faltanFechas) {
                // Volver a llamar si hay datos incompletos
                historias = await this.listHistorias;
            }
            const pacientes = await pacientesStore.listPacientes()

            historias = historias.map((historia) => {
                const paciente = pacientes.find(p => p.id_paciente == historia.id_paciente)
                return {
                    ...historia,
                    ...paciente
                }
            })

            return historias?.sort(
                (a, b) => {
                    const fechaA = new Date(a.fecha_historia?.split('/').reverse().join('-'));
                    const fechaB = new Date(b.fecha_historia?.split('/').reverse().join('-'));
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

        async indexDBDatos() {
            const apiRest = useApiRest()
            const token = decryptData(sessionStorage.getItem('token'))
            const config = useRuntimeConfig()
            const dataHistoria = await apiRest.functionCall({
                metodo: 'GET',
                url: config.public.traeDatosHistoria,
                token: token
            })

            if (dataHistoria.success) {
                // guardar en IndexedDB para uso offline
                const store = useIndexedDBStore();
                // Definir mapeo entre nombre del almacén y propiedad en dataHistoria
                const colecciones = {
                    HistoriaClinica: dataHistoria.historias,
                    Analisis: dataHistoria.analisis,
                    Enfermedad: dataHistoria.enfermedades,
                    Antecedentes: dataHistoria.antecedentes,
                    ExamenFisico: dataHistoria.examenes_fisicos,
                    Terapia: dataHistoria.terapias,
                    Nota: dataHistoria.notas,
                    Descripcion_nota: dataHistoria.descripciones_notas
                };

                // Recorremos cada colección y guardamos en IndexedDB
                for (const [almacen, datos] of Object.entries(colecciones)) {
                    store.almacen = almacen;
                    store.bulkPut(datos)
                }

            }

            const dataPlan = await apiRest.functionCall({
                metodo: 'GET',
                url: config.public.traeDatosPlanManejo,
                token: token
            })

            if (dataPlan.success) {
                // guardar en IndexedDB para uso offline
                const store = useIndexedDBStore();
                // Definir mapeo entre nombre del almacén y propiedad en dataHistoria
                const coleccionesPlan = {
                    Plan_manejo_medicamentos: dataPlan.medicamentos,
                    Plan_manejo_procedimientos: dataPlan.procedimientos,
                    Plan_manejo_insumos: dataPlan.insumos,
                    Plan_manejo_equipos: dataPlan.equipos,
                };

                // Recorremos cada colección y guardamos en IndexedDB
                for (const [almacen, datos] of Object.entries(coleccionesPlan)) {
                    store.almacen = almacen;
                    store.bulkPut(datos)
                }

            }

            await apiRest.getData('Diagnosticos', 'diagnosticos')
            await apiRest.getData('DiagnosticosCIF', 'diagnosticosCIF')

        },

        async cargarConCache() {
            const { cacheFirst } = useCacheStrategy();

            this.Historias = await cacheFirst(
                'HistoriaClinica',
                async () => {

                    const token = decryptData(sessionStorage.getItem('token'))
                    const config = useRuntimeConfig()
                    const api = useApiRest();
                    // const respuesta = await api.functionCall({
                    //     metodo: 'GET',
                    //     url: config.public.historiasClinicas,
                    //     token: token
                    // });
                    const respuesta = await apiRest.getData('HistoriaClinica', 'historiasClinicas')
                    return respuesta;
                },
                {
                    maxAge: 10 * 60 * 1000, // 10 minutos
                    showNotification: false
                }
            );
        }

    }
});