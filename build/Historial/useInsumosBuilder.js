// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useInsumosStore } from '~/stores/Formularios/insumos/Insumos'

export function useInsumosBuilder({
    storeId,
    storePinia,
    show,
    cerrarModal,
    actulizarDatos,
    soloVer,
    eliminarDato,
    movimientos
}) {
    const insumoStore = useInsumosStore();
    const builder = new FormularioBuilder()
    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioShow(show)
        .setEditarFormulario(actulizarDatos)
        .setSoloVer(soloVer)
        .setEliminarFormulario(eliminarDato)
        .setFormulariotamaño('LG')
        .setFormularioTipo('Wizard')
        .setBotones([
            { type: 'enviar', text: 'Siguiente', color: 'bg-blue-500', },
            { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500 hover:bg-gray-600', type: 'cerrar' },
        ])
    if (actulizarDatos) {
        builder
            .setFormularioTituloFormulario('Insumo Médico')
    } else {
        builder
            .setFormularioTituloFormulario('Nuevo insumo Médico')
    }
    builder
        .nuevaSeccion(actulizarDatos ? insumoStore.Formulario.Insumos.activo : 'Registrar nuevo producto en inventario')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-id-card text-blue-500 mr-1"></i>Informacion Basica',
            tamaño: 'w-full col-span-2',
            forLabel: 'nombre'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre del producto',
            placeholder: 'Paracetamol en Tableta x500mg',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'md:col-span-1 col-span-3',
            minlength: 3,
            vmodel: 'Insumos.nombre'
        })
        .addCampo({
            component: 'Select',
            options: [
                { value: 'Medicamento', text: 'Medicamento' },
                { value: 'Material Quirurgico', text: 'Material Quirurgico' },
                { value: 'Insumo de Laboratorio', text: 'Insumo de Laboratorio' },
                { value: 'Otro', text: 'Otro' },
            ],
            label: 'Categoria',
            placeholder: 'Categoria',
            id: 'categoria',
            name: 'categoria',
            tamaño: 'md:col-span-1 col-span-3',
            vmodel: 'Insumos.categoria',
        })
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-capsules text-blue-500 mr-1"></i>Informacion Farmacologica',
            tamaño: 'w-full col-span-2',
            forLabel: 'activo'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Ingrediente Activo',
            placeholder: 'Principio activo',
            id: 'activo',
            name: 'activo',
            tamaño: 'md:col-span-1 col-span-3',
            minlength: 3,
            vmodel: 'Insumos.activo'
        })
        .addCampo({
            component: 'Checkbox',
            placeholder: '¿Requiere receta médica?',
            id: 'receta',
            name: 'receta',
            tamaño: 'md:col-span-1 col-span-3 pt-6',
            vmodel: 'Insumos.receta',
        })
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-boxes-stacked text-blue-500 mr-1"></i>Informacion de Stock',
            tamaño: 'w-full col-span-2',
            forLabel: 'unidad'
        })
        .addCampo({
            component: 'Select',
            options: [
                { value: 'Caja', text: 'Caja' },
                { value: 'Unidad', text: 'Unidad' },
                { value: 'Frasco', text: 'Frasco' },
                { value: 'Otro', text: 'Otro' },
            ],
            label: 'Unidad de medida',
            placeholder: 'Unidad',
            id: 'unidad',
            name: 'unidad',
            tamaño: 'md:col-span-1 col-span-3',
            minlength: 3,
            vmodel: 'Insumos.unidad'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Cantidad Actual',
            placeholder: '0',
            id: 'stock',
            name: 'stock',
            tamaño: 'md:col-span-1 col-span-3',
            vmodel: 'Insumos.stock',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Lote de Fabricacion',
            placeholder: 'Lote',
            id: 'lote',
            name: 'lote',
            tamaño: 'md:col-span-1 col-span-3',
            minlength: 3,
            vmodel: 'Insumos.lote'
        })
        .addCampo({
            component: 'Input',
            type: 'date',
            label: 'Fecha de Vencimiento',
            placeholder: 'AAAA-MM-DD',
            id: 'vencimiento',
            name: 'vencimiento',
            tamaño: 'md:col-span-1 col-span-3',
            vmodel: 'Insumos.vencimiento',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Ubicacion',
            placeholder: 'Estante 1',
            id: 'ubicacion',
            name: 'ubicacion',
            tamaño: 'md:col-span-1 col-span-3',
            vmodel: 'Insumos.ubicacion',
        })

    if (soloVer) {
        // Construimos las cards dinámicamente
        const cardsMovimientos = movimientos.map(mov => {
            // Definir estilos según tipo de movimiento
            let bgClass = ''
            let icon = ''
            let text = ''

            switch (mov.tipoMovimiento) {
                case 'Ingreso':
                    bgClass = 'bg-green-100 dark:bg-green-900'
                    icon = 'fa-solid fa-plus text-green-600'
                    text = `Stock agregado: ${mov.cantidadMovimiento} unidades`
                    break
                case 'usado':
                    bgClass = 'bg-yellow-100 dark:bg-yellow-900'
                    icon = 'fa-solid fa-arrow-up text-yellow-600'
                    text = `Stock usado: ${mov.cantidadMovimiento} unidades`
                    break
                case 'Egreso':
                    bgClass = 'bg-red-100 dark:bg-red-900'
                    icon = 'fa-solid fa-trash text-red-600'
                    text = `Stock eliminado: ${mov.cantidadMovimiento} unidades`
                    break
                default:
                    bgClass = 'bg-gray-100 dark:bg-gray-700'
                    icon = 'fa-solid fa-circle-info text-gray-600'
                    text = `Movimiento: ${mov.cantidadMovimiento} unidades`
            }

            return {
                header: {
                    icon: 'fa-solid fa-pills',
                    title: `${mov.cantidadMovimiento} unidades`,
                    html: `<span class="text-sm text-gray-500">${insumoStore.Formulario.Insumos?.nombre || ''}</span>`
                },
                body: {
                    html: `
                        <div class="flex items-center ${bgClass} p-2 rounded-lg gap-5">
                            <i class="${icon} mx-1"></i>
                            <div class="flex flex-col gap-1 text-sm">
                                <span class="font-semibold">${text}</span>
                                <span class="text-gray-600 dark:text-gray-400">Profesional: ${mov.medico?.name || 'N/A'}</span>
                                <span class="text-xs text-gray-500">
                                    <i class="fa-solid fa-clock mr-1"></i> ${mov.fechaMovimiento}
                                </span>
                            </div>
                        </div>
                    `
                },
                footer: {}
            }
        })

        builder
        .nuevaSeccion('Movimientos de Inventario')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-boxes-stacked text-blue-500 mr-1"></i>Informacion de Stock',
            tamaño: 'w-full col-span-2',
            forLabel: 'unidad'
        })
            .addCampo({
                component: 'Card',
                cards: cardsMovimientos,
                contenedorCards: 'grid lg:grid-cols-2 grid-cols-1 gap-4 !space-y-0',
                contenedor: 'col-span-2 bg-gray-100 dark:bg-gray-800 px-3 pb-3 rounded-xl',
                tamaño: 'flex justify-between rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200 hover:bg-white! dark:hover:bg-gray-900!',
                header: {
                    title: 'Historial de Movimientos de Inventario',
                    html: `
                        <div class="flex items-center bg-green-400 dark:bg-green-900 text-white text-xs p-2 rounded-lg">
                            <i class="fa-solid fa-plus mr-2"></i>
                            <span class="font-semibold">Agregar</span>
                        </div>
                    `
                }
            })


    }
    builder.build()
    return builder
}