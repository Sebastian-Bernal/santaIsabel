// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useInsumosStore } from '~/stores/Formularios/insumos/Insumos'

export function useMovimientoBuilder({
    storeId,
    storePinia,
    show,
    cerrarModal,
    medicosList,
}) {
    const insumoStore = useInsumosStore();
    function seleccionarMedico(medico) {
        insumoStore.Formulario.Insumos.name_medico = medico.name
        insumoStore.Formulario.Insumos.id_medico = medico.id_profesional
    }
    const builder = new FormularioBuilder()
    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioShow(show)
        .setFormulariotamaño('XS')
        .setFormularioTipo('Wizard')
        .setBotones([
            { type: 'enviar', text: 'Enviar', color: 'bg-blue-500', },
            { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500 hover:bg-gray-600', type: 'cerrar' },
        ])
        .setFormularioTituloFormulario('Registrar movimiento de inventario')
        .nuevaSeccion(insumoStore.Formulario.Insumos.activo)
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-id-card text-blue-500 mr-1"></i>Medicamento',
            tamaño: 'w-full col-span-2',
            forLabel: 'nombre'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre del producto',
            placeholder: 'Nombre del producto',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'md:col-span-1 col-span-3',
            minlength: 3,
            vmodel: 'Insumos.nombre',
            disabled: true,
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
            disabled: true,
        })
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-capsules text-blue-500 mr-1"></i>Movimiento de Inventario',
            tamaño: 'w-full col-span-2',
            forLabel: 'activo'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Cantidad del movimiento',
            placeholder: '20',
            id: 'cantidadMovimiento',
            name: 'cantidadMovimiento',
            tamaño: 'md:col-span-1 col-span-3',
            minlength: 3,
            vmodel: 'Insumos.cantidadMovimiento'
        })
        .addCampo({
            component: 'Select',
            options: [
                { value: 'Ingreso', text: 'Ingreso' },
                { value: 'Egreso', text: 'Egreso' },
                { value: 'Usado', text: 'Usado' },
            ],
            label: 'Tipo',
            placeholder: 'Seleccione tipo de movimiento',
            id: 'tipoMovimiento',
            name: 'tipoMovimiento',
            tamaño: 'md:col-span-1 col-span-3',
            minlength: 3,
            vmodel: 'Insumos.tipoMovimiento'
        })
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Encargado del Movimiento',
            tamaño: 'w-full col-span-2',
            forLabel: 'activo'
        })
        .addCampo({
            component: 'SelectSearch',
            placeholder: 'Juan Pérez',
            label: 'Nombre del profesional',
            id: 'nombreM',
            name: 'nombreM',
            tamaño: 'w-full col-span-2',
            vmodel: 'Insumos.name_medico',
            options: medicosList,
            opciones: [{ value: 'name' }, { text: 'Cedula', value: 'No_document' }],
            seleccionarItem: seleccionarMedico,
            upperCase: true,
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Fecha de Movimiento',
            id: 'movimiento',
            name: 'movimiento',
            tamaño: 'md:col-span-1 col-span-2',
            vmodel: 'Insumos.fechaMovimiento',
        })

    builder.build()
    return builder
}