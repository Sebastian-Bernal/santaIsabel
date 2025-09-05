import { createFormStore } from '../../createFormStore';
// Creacion del store para nueva cita medica

// Estructura de datos de Citas
const estructuraCita = {
    Software: {
        Equivalentes: {
            id: '',
            pin: '',
            testID: '',
        },
    },
}

// Pinia Empresa
export const useSoftwareDEStore = defineStore('SoftwareDE', {
    state: () => ({
        Formulario: estructuraCita,
        Software: JSON.parse(JSON.stringify(estructuraCita)), // estructura base compartida
        SoftwareData: []
    }),

    getters: {

    },

    actions: {

        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraCita) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        }
    }
});