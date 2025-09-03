import { createFormStore } from '../../createFormStore';
import { useIndexedDBStore } from '~/stores/indexedDB';
// Creacion del store para registar eps

// Estructura de datos de eps
const estructuraDatosEPS = {
    EPS: {
        nombre: '',
        codigo: '',
        direccion: '',
        telefono: '',
        email: '',
        website: '',
    }
}

// Pinia EPS
export const useDatosEPSStore = defineStore('DatosEPS', {
    state: () => ({
        Formulario: estructuraDatosEPS,
        Datos: JSON.parse(JSON.stringify(estructuraDatosEPS)), // estructura base compartida
        DatosEPS: []
    }),

    getters: {
        async listEPS(state) {
            const store = useIndexedDBStore()
            store.almacen = 'EPS'
            const Notas = await store.leerdatos()

            state.Notas = Notas
            return Notas
        },
    },

    actions: {

        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraDatosEPS) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        }
    }
});