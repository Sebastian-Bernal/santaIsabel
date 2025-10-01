// Estructura de datos de Facturacion
const estructura = {
    Facturacion: {
        tipoDocumento: '',
        prefijo: '',
        no_resolucion: '',
        fechaResolucion: '',
        fechaInicial: '',
        fechaHasta: '',
        numeroInicial: '',
        numeroHasta: '',
        claveTecnica: '',
        descripcion: '',
    },
}

// Pinia Empresa
export const useFacturacionStore = defineStore('Facturacion', {
    state: () => ({
        Formulario : estructura,
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

    }
});