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
        id: '',
        No_document: '',
    },
    Cita: {
        fecha: '',
        servicio: '',
        hora: '',
        id_paciente: '',
    },
}

// Pinia Citas
export const useCitasStore = defineStore('Citas', {
    state: () => ({
        Cita: JSON.parse(JSON.stringify(estructuraCita)), // estructura base compartida
        Citas: []
    }),

    getters: {
        async listCitas(state) {
            const store = useIndexedDBStore()
            store.almacen = 'Cita'
            const citas = await store.leerdatos()
            state.Citas = citas
            return citas
        }
    },

    actions: {

        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraCita) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        }
    }
});