import { createFormStore } from '../../createFormStore';
// Creacion del store para historia clinica

// Estructura de datos de Historias Clinicas
const estructuraHistoria = {
    Paciente: {
        name: '',
        type_doc: '',
        No_document: '',
        id: '',
    },
    Diagnosticos: [{
        id: '',
        tipo: '',
        CIE_10: '',
        id_paciente: '',
        rol_attention: '',
    }],
    Antecedentes: [{
        id: '',
        valor: '',
        id_paciente: '',
    }],
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
        id_profesional: ''
    },
    ExamenFisico: {
        Peso: '',
        altura: '',
        otros: '',
        id_RegistrarHistoria: '',
    },
    AnalisisTratamiento: {
        analisis: '',
        tratamiento: '',
    },
    Plan_manejo_medicamentos: [],
    Plan_manejo_procedimientos: [],
}

// Pinia HistoriasClinicas
export const useHistoriasStore = defineStore('HistoriaClinica', {
    state: () => ({
        Historia: JSON.parse(JSON.stringify(estructuraHistoria)) // estructura base compartida
    }),

    actions: {
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraHistoria) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        }
    }
});