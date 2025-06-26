import { createFormStore } from '../../createFormStore';
// Creacion del store para nueva cita medica

// Estructura de datos de Citas
const estructuraCita = {
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

// Pinia Citas
export const useCitasStore = defineStore('Citas', {
    state: () => ({
        Cita: JSON.parse(JSON.stringify(estructuraCita)) // estructura base compartida
    }),

    actions: {

        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraCita) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        }
    }
});