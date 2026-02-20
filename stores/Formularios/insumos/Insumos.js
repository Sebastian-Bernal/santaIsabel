import { useHistoriasStore } from "../historias/Historia";
import { formatDate } from "~/composables/Formulario/FormatearFecha";
// Estructura de datos de Insumos
const estructura = {
    Insumos: {
        id: '',
        nombre: '',
        categoria: '',
        activoL: '',
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
        async listInsumos(online = true) {
            const varView = useVarView()
            const apiRest = useApiRest()

            let insumos = []
            if(online) {
                insumos = await apiRest.getData('Insumo', 'insumos')
            } else {
                const store = useIndexedDBStore()
                store.almacen = 'Insumo'
                insumos = await store.leerdatos()
            }

            insumos = insumos.map(item => {
                // desestructuramos y renombramos la propiedad
                const { activo, ...rest } = item
                return {
                ...rest,
                activoL: activo
                }
            })

            this.InsumosData = insumos;
            return insumos;
        },

        async listMovimientodeInsumo(listMedicos, analisisList) {
            const varView = useVarView()
            const apiRest = useApiRest()

            const movimientos = await apiRest.getData('Movimiento', 'movimientos')
            // Filtrar solo los movimientos del insumo actual
            let movimientosInsumo = movimientos.filter(
                mov => mov.id_insumo === this.Formulario.Insumos.id
            )

            // Mapear cada movimiento con su profesional y análisis
            movimientosInsumo = await Promise.all(
                movimientosInsumo.map(mov => {
                    const medico = listMedicos.find(
                        p => p.id_profesional === mov.id_medico
                    )

                    const analisis = analisisList.find(
                        a => a.id === mov.id_analisis
                    )

                    return {
                        ...mov,
                        medico,
                        analisis,
                    }
                })
            )

            movimientosInsumo.sort((a, b) => new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento));


            return movimientosInsumo;
        },

        async listMovimientos(listMedicos, listPacientes, analisisList, insumosList) {
            const varView = useVarView()
            const apiRest = useApiRest()
            const historiaStore = useHistoriasStore()

            const movimientos = await apiRest.getData('Movimiento', 'movimientos')

            let movimientosPaciente = []
            // Mapear cada movimiento con su profesional y análisis
            movimientosPaciente = await Promise.all(
                movimientos.map(async mov => {
                    const medico = listMedicos.find(
                        p => p.id_profesional === mov.id_medico
                    )

                    const analisis = analisisList.find(
                        a => a.id === mov.id_analisis
                    )

                    const paciente = listPacientes.find(
                        p => p.id_paciente === analisis?.id_paciente
                    )

                    const insumo = insumosList.find(
                        i => i.id === mov.id_insumo
                    )

                    let dosis = 'No aplica';
                    if(analisis) {
                        const planMedicamento = await historiaStore.listDatos(analisis.id, 'Plan_manejo_medicamentos', 'id_analisis')

                        dosis = planMedicamento?.find(pm => pm.medicamento === insumo.nombre)?.dosis || 'dosis no registrada';
                    }

                    return {
                        ...mov,
                        ...insumo,
                        medico,
                        analisis,
                        paciente,
                        name_medico: medico? medico.name : 'Administrador',
                        name_paciente: paciente? paciente.name : 'Sin paciente',
                        fecha: formatDate(mov.created_at),
                        nombreServicio: analisis ? analisis.nombreServicio : 'Sin análisis',
                        dosis: dosis,
                    }
                })
            )

            movimientosPaciente.sort((a, b) => new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento));


            return movimientosPaciente;
        },

        async indexDBDatos() {

        },
    }
});