import { createFormStore } from '../../createFormStore';
import { useIndexedDBStore } from '~/stores/indexedDB';
import { historias } from "~/data/historias";
// Creacion del store para historia clinica

// Estructura de datos de Historias Clinicas
const estructuraHistoria = {
    Diagnosticos: [],
    Antecedentes: [],
    Enfermedad: {
        valor: '',
        fecha_diagnostico: '',
        fecha_rehabilitacion: '',
    },
    HistoriaClinica: {
        motivo: '',
        signosVitales: {
            ta: '',
            fc: '',
            fr: '',
            t: '',
            SATo2: '',
        },
        fecha_historia: '',
        id_paciente: '',
        name_paciente: '',
        type_doc_paciente: '',
        No_document_paciente: '',
        acompañante: [{ nombre: '', parentesco: '' }],
        id_profesional: '',
        name_profesional: '',
        analisis: '',
        tipoAnalisis: ''
    },
    ExamenFisico: {
        Peso: '',
        altura: '',
        otros: '',
        id_RegistrarHistoria: '',
        id_historia: ''
    },
    AnalisisTratamiento: {
        analisis: '',
        tratamiento: '',
        id_historia: ''
    },
    Plan_manejo_medicamentos: [],
    Plan_manejo_procedimientos: [],
    Plan_manejo_insumos: [],
    Plan_manejo_equipos: [],
}

// Pinia HistoriasClinicas
export const useHistoriasStore = defineStore('HistoriaClinica', {
    state: () => ({
        Historia: JSON.parse(JSON.stringify(estructuraHistoria)), // estructura base compartida
        Historias: historias,

    }),

    getters: {
        async listHistorias(state) {
            const store = useIndexedDBStore()
            store.almacen = 'HistoriaClinica'
            const historias = await store.leerdatos()

            state.Historias = historias
            return historias
        },

        async datosHistoria() {
            // Traer pacientes
            const store = useIndexedDBStore()
            store.almacen = 'Paciente'
            const pacientes = await store.leerdatos()

            const datos = [];
            const historiasPacientes = []

            const historias = await this.listHistorias

            // Array de que devuelve todas la id_paciente en historias
            await historias.map((historia) => {
                historiasPacientes.push(historia.id_paciente)
            })

            // Array que devuelve json con Pacientes con historia
            await pacientes.map((paciente) => {
                datos.push({ id: paciente.id, paciente: paciente.name, cedula: paciente.No_document, estado: historiasPacientes.includes(paciente.id) ? 'Creada' : 'Nueva' })
            })

            return datos
        },
    },

        actions: {
            // Acción para crear nuevas instancias de formulario
            createForm(storeId, estructura = estructuraHistoria) {
                const useDynamicForm = createFormStore(storeId, estructura)
                return useDynamicForm() // devuelve instancia usable del formulario
            }
        }
    });