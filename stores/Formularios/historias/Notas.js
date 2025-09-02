import { createFormStore } from '../../createFormStore';
import { useIndexedDBStore } from '~/stores/indexedDB';

// Pinia NotasClinicas
export const useNotasStore = defineStore('Notas', {
    state: () => ({
        Formulario: {
            Nota: {
                fecha_nota: '',
                hora_nota: '',
                id_paciente: '',
                name_paciente: '',
                No_document_paciente: '',
                direccion: '',
                id_profesional: '',
                name_profesional: '',
                nota: '',
            },
        },
        Notas: [],

    }),

    getters: {
        async listNotas(state) {
            const store = useIndexedDBStore()
            store.almacen = 'Nota'
            const Notas = await store.leerdatos()

            state.Notas = Notas
            return Notas
        },
    },

    actions: {
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraNota) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        },

    }
});