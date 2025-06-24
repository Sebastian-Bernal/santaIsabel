import { createFormStore } from '../../stores/useFormData';
// Creacion del store para nueva cita medica

const estructuraNuevaCita = {
    Paciente: {
        name: '',
        type_doc: '',
        No_document: '',
        id: '',
    },
    Medico: {
        name: '',
        profesion: '',
        id: ''
    }
}

export const useNuevaCitaStore = createFormStore('NuevaCita', estructuraNuevaCita);