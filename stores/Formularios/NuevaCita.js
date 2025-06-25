import { createFormStore } from '../createFormStore';
// Creacion del store para nueva cita medica

const estructuraNuevaCita = {
    Paciente: {
        name: '',
        No_document: '',
        id: '',
    },
    Medico: {
        name: '',
        profesion: '',
        id: ''
    },
    cita: {
        fecha: '',
        servicio: '',
        hora: ''
    }
}

export const useNuevaCitaStore = createFormStore('NuevaCita', estructuraNuevaCita);