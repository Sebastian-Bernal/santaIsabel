import { createFormStore } from '../../createFormStore';
// Creacion del store para nueva cita medica

// Estructura de datos de Citas
const estructuraCita = {
    Facturacion: {
        'tipoDocumento': '',
        'prefijo': '',
        'no_resolucion': '',
        'fechaResolucion': '',
        'fechaInicial': '',
        'fechaHasta': '',
        'numeroInicial': '',
        'numeroHasta': '',
        'claveTecnica': '',
        'descripcion': '',
    },
}

// Pinia Empresa
export const useFacturacionStore = defineStore('Facturacion', {
    state: () => ({
        Facturacion: JSON.parse(JSON.stringify(estructuraCita)), // estructura base compartida
        FacturacionData: []
    }),

    getters: {
        async listResoluciones(state) {
            const store = useIndexedDBStore()
            store.almacen = 'Facturacion'
            const datos = await store.leerdatos()

            state.FacturacionData = datos // Actualiza la lista de pacientes en el estado
            return datos
        },
    },

    actions: {

        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraCita) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        }
    }
});