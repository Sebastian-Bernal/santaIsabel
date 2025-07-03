import { createFormStore } from '../../createFormStore';
// Creacion del store para Nuevo Medico

// Estructura de datos de Medicos
const estructuraMedico = {
    Medico: {
        name: '',
        nacimiento: '',
        type_doc: '',
        No_document: '',
        genero: '',
        direccion: '',
        departamento: '',
        municipio: '',
        zona: '',
        barrio: '',
        celular: '',
        telefono: '',
    }
}

// Pinia Medicos
export const useMedicosStore = defineStore('Medicos', {
    state: () => ({
        Medico: JSON.parse(JSON.stringify(estructuraMedico)), // estructura base compartida
        Medicos: [] // Lista de medicos
    }),

    getters: {
        async listMedicos(state) {
            const store = useIndexedDBStore()
            store.almacen = 'Medico'
            const medicos = await store.leerdatos()
            state.Medicos = medicos
            return medicos
        }
    },

    actions: {
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraMedico) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        }
    }
});