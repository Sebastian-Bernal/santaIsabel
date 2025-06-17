import { createFormStore } from '../../stores/useFormData';
// Creacion del store para historia clinica

const estructuraHistoriaClinica = {
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
        id_historiaClinica: '',
    },
    AnalisisTratamiento: {
        analisis: '',
        tratamiento: '',
    },
    Plan_manejo_medicamentos: [],
    Plan_manejo_procedimientos: [],
}

export const useHistoriaClinicaStore = createFormStore('HistoriaClinica', estructuraHistoriaClinica);