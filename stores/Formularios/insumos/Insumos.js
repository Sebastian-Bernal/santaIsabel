import { guardarEnDB } from "~/composables/Formulario/useIndexedDBManager";

// Estructura de datos de Insumos
const estructura = {
    Insumos: {
        nombre: '',
        categoria: '',
        activo: '',
        receta: '',
        unidad: '',
        stock: '',
        lote: '',
        vencimiento: '',
        ubicacion: '',
        precio: '',
    },
    Movimiento: {
        cantidadMovimiento: '',
        tipoMovimiento: '',
        fechaMovimiento: '',
        id_medico: '',
        name_medico: '',
    }
}

// Pinia Insumos
export const useInsumosStore = defineStore('Insumos', {
    state: () => ({
        Formulario : estructura,
        InsumosData: []
    }),

    getters: {
        async listResoluciones(state) {
        },
    },

    actions: {
        async indexDBDatos() {

        },
    }
});