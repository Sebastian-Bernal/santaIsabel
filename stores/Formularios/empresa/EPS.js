import { createFormStore } from '../../createFormStore';
import { useIndexedDBStore } from '~/stores/indexedDB';
import { traerdatosEPS } from '~/Core/Empresa/Datos/DatosEPS';
import { guardarEnDB } from '~/composables/Formulario/useIndexedDBManager';
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
        },

        async indexDBDatos() {
            const eps = await traerdatosEPS()

            const EPSIndexed = eps.map((data) => ({
                EPS: {
                    id: data.eps_id, 
                    nombre: data.eps_name, 
                    codigo: data.eps_code,
                    direccion: data.eps_address,
                    telefono: data.eps_phone,
                    email: data.eps_email,
                    website: data.eps_website,
                }
            }));

            EPSIndexed.map((item) => {
                guardarEnDB(item)
            })
        },
    }
});