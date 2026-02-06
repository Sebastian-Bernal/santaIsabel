import { guardarEnDB } from "~/composables/Formulario/useIndexedDBManager";
import { useMedicosStore } from "../profesional/Profesionales";
import { useHistoriasStore } from "../historias/Historia";

// Estructura de datos de Insumos
const estructura = {
    Insumos: {
        id: '',
        nombre: '',
        categoria: '',
        activo: '',
        receta: false,
        unidad: '',
        stock: '',
        lote: '',
        vencimiento: '',
        ubicacion: '',
    },
    Movimiento: {
        cantidadMovimiento: '',
        tipoMovimiento: '',
        fechaMovimiento: '',
        id_medico: '',
        id_insumo: '',
        name_medico: '',
    }
}

// Pinia Insumos
export const useInsumosStore = defineStore('Insumos', {
    state: () => ({
        Formulario: estructura,
        InsumosData: []
    }),

    getters: {
        async listResoluciones(state) {
        },
    },

    actions: {
        async listInsumos() {
            const varView = useVarView()
            const apiRest = useApiRest()
            let insumos = await apiRest.getData('Insumo', 'insumos')

            this.InsumosData = insumos;
            return insumos;
        },

        async listMovimientodeInsumo() {
            const varView = useVarView()
            const apiRest = useApiRest()
            const medicosStore = useMedicosStore()
            const historiaStore = useHistoriasStore()

            const movimientos = await apiRest.getData('Movimiento', 'movimientos')
            const profesionales = await medicosStore.listMedicos(true)

            // Filtrar solo los movimientos del insumo actual
            let movimientosInsumo = movimientos.filter(
                mov => mov.id_insumo === this.Formulario.Insumos.id
            )

            // Mapear cada movimiento con su profesional y análisis
            movimientosInsumo = await Promise.all(
                movimientosInsumo.map(async mov => {
                    const medico = profesionales.find(
                        p => p.id_profesional === mov.id_medico
                    )

                    // listDatos puede ser async, así que lo tratamos como tal
                    const analisis = await historiaStore.listDatos(
                        mov.id_analisis,
                        'Analisis',
                        'id'
                    )

                    return {
                        ...mov,
                        medico,
                        analisis: analisis[0] || null
                    }
                })
            )

            return movimientosInsumo;
        },

        async indexDBDatos() {

        },
    }
});