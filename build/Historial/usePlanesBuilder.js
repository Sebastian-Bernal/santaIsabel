// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { CUPS } from '~/data/CUPS'
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia'
import { useInsumosStore } from '~/stores/Formularios/insumos/Insumos';

export function usePlanesBuilder({
    storeId,
    storePinia,
    cerrarModal,
    formularioItem,
    show,
    medicamentos,
    insumos,
    id_paciente,
    profesionales
}) {

    const builder = new FormularioBuilder()
    const varView = useVarView()
    const historiaStore = useHistoriasStore()
    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormulariotamaño('XS')
        .setFormularioShow(show)
        .setFormularioTipo('solo')
        .setBotones([
            { text: 'Agregar', color: 'bg-blue-500 hover:bg-blue-600', type: 'enviar' },
            { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500 hover:bg-gray-600', type: 'cancelar' },
        ])
    // 📌 Sección: Datos
    if (formularioItem === 'Medicamento') {
        builder
            // 📌 Sección: Diagnósticos
            .nuevaSeccion('Asignar productos')
        builder
            .addCampo({
                component: 'Label',
                forLabel: 'medicamento',
                text: '<i class="fa-solid fa-prescription-bottle-medical text-blue-500 mr-1"></i>Item de Inventario',
                tamaño: 'col-span-2 w-full'
            })
            if(varView.getRol == 'Admin'){
                builder
                .addCampo({
                    component: 'SelectSearch',
                    name: 'profesional',
                    id: 'profesional',
                    label: 'Selecciona el profesional que autoriza',
                    placeholder: 'Profesional',
                    tamaño: 'w-full md:col-span-2',
                    options: profesionales,
                    opciones: [                    
                        { value: 'name' },
                        { text: 'Cedula', value: 'No_document' }
                    ],
                    seleccionarItem: (item) => {
                        historiaStore.Formulario.id_profesional = item.id_profesional
                    },
                    vmodel: 'name',
                })
            }
            builder
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Insumos (opcional)',
                buttons: [{ icon: 'fa-solid fa-capsules', label: 'Agregar', color: 'bg-blue-500', addItem: { medicamento: '', dosis: '', cantidad: '', observacion: '', fecha_desde: '', fecha_hasta: '' } },],
                tamaño: 'w-full md:col-span-2',
                vmodel: 'Plan_manejo_medicamentos',
                value: [],
                campos: [
                    {
                        name: 'medicamento',
                        id: 'Medicamento',
                        typeCampo: 'SelectSearch',
                        placeholder: 'Insumo',
                        tamaño: 'w-full md:col-span-2',
                        upperCase: true,
                        options: medicamentos,
                        opciones: [{ value: 'nombre' }, { text: 'Activo', value: 'activoL' }, { text: 'Cantidad', value: 'stock' }],
                        seleccionarItem: (item) => {
                            historiaStore.Formulario.Plan_manejo_medicamentos.at(-1).medicamento = item.nombre
                            historiaStore.Formulario.Plan_manejo_medicamentos.at(-1).id_insumo = item.id
                        },
                    },
                    {
                        name: 'cantidad',
                        id: 'cantidad',
                        typeCampo: 'Input',
                        type: 'number',
                        placeholder: 'Cantidad',
                        tamaño: 'w-full',
                    },
                    {
                        name: 'dosis',
                        id: 'dosis',
                        typeCampo: 'Input',
                        placeholder: 'Dosis',
                        tamaño: 'w-full',
                    },
                    {
                        name: 'observacion',
                        id: 'observacion',
                        typeCampo: 'Input',
                        placeholder: 'Registrar Observacion / Autorizacion',
                        tamaño: 'w-ful md:col-span-2l'
                    },
                ],
                containerCampos: 'grid grid-cols-2 gap-2'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Insumos o Equipos Medicos Prestables (opcional)',
                buttons: [{ icon: 'fa-solid fa-capsules', label: 'Agregar', color: 'bg-blue-500', addItem: { medicamento: '', cantidad: '', observacion: '', fecha_desde: '', fecha_hasta: '' } },],
                tamaño: 'w-full md:col-span-2',
                vmodel: 'Plan_manejo_medicamentos',
                value: [],
                campos: [
                    {
                        name: 'medicamento',
                        id: 'Medicamento',
                        typeCampo: 'SelectSearch',
                        placeholder: 'Insumo',
                        tamaño: 'w-full col-span-2',
                        upperCase: true,
                        options: insumos,
                        opciones: [{ value: 'nombre' }, { text: 'Activo', value: 'activoL' }, { text: 'Cantidad', value: 'stock' }],
                        seleccionarItem: (item) => {
                            historiaStore.Formulario.Plan_manejo_medicamentos.at(-1).medicamento = item.nombre
                            historiaStore.Formulario.Plan_manejo_medicamentos.at(-1).id_insumo = item.id
                        },
                    },
                    {
                        name: 'cantidad',
                        id: 'cantidad',
                        typeCampo: 'Input',
                        type: 'number',
                        placeholder: 'Cantidad',
                        tamaño: 'w-full',
                    },
                    {
                        name: 'observacion',
                        id: 'observacion',
                        typeCampo: 'Input',
                        placeholder: 'Registrar Observacion / Autorizacion',
                        tamaño: 'w-full'
                    },
                    {
                        name: 'fecha_desde',
                        id: 'fecha_desde',
                        typeCampo: 'Input',
                        type: 'date',
                        label: 'Fecha desde',
                        tamaño: 'w-full'
                    },
                    {
                        name: 'fecha_hasta',
                        id: 'fecha_hasta',
                        typeCampo: 'Input',
                        type: 'date',
                        label: 'Fecha hasta',
                        tamaño: 'w-full'
                    }
                ],
                containerCampos: 'grid grid-cols-2 gap-2'
            })
    }
    else if (formularioItem === 'Tratamientos') {
        builder
            .nuevaSeccion('Tratamientos')

            .addCampo({
                component: 'Label',
                forLabel: 'rehabilitacion',
                text: '<i class="fa-solid fa-kit-medical text-blue-500 mr-1"></i>Tratamiento',
                tamaño: 'col-span-2 w-full'
            })
            .addCampo({
                component: 'SelectSearch',
                name: 'procedimiento',
                id: 'descripcionProcedimiento',
                placeholder: 'Procedimiento',
                tamaño: 'w-full md:col-span-2',
                UpperCase: true,
                options: CUPS,
                opciones: [{ value: 'DESCRIPCION' }, { text: 'Codigo', value: 'CODIGO' }],
                vmodel: 'Plan_manejo_procedimientos.procedimiento',
                seleccionarItem: (item) => {
                    historiaStore.Formulario.Plan_manejo_procedimientos.at(-1).procedimiento = item.DESCRIPCION
                    historiaStore.Formulario.Plan_manejo_procedimientos.at(-1).codigo = item.CODIGO
                },
            })
            .addCampo({
                component: 'Input',
                label: 'Codigo',
                vmodel: 'Plan_manejo_procedimientos.codigo',
                type: 'text',
                id: 'presetacion',
                name: 'presetacion',
                tamaño: 'w-full md:col-span-1 col-span-2',
                minlength: 5
            })
            .addCampo({
                component: 'Input',
                label: 'Dias asignados',
                vmodel: 'Plan_manejo_procedimientos.dias_asignados',
                id: 'rehabilitacion',
                name: 'rehabilitacion',
                placeholder: '0',
                tamaño: 'w-full md:col-span-1 col-span-2',
            })
    }
    else {
        builder
            .nuevaSeccion('No se encontro el Item')
    }

    return builder.build()
}