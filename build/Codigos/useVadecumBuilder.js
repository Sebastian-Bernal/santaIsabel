import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useVadecumBuilder({
    storeId = 'VadecumNuevo',
    storePinia = 'Vadecum',
    cerrarModal = () => {},
    show = ref(false),
    tipoFormulario = 'Wizard',
    soloVer = false,
    eliminar = null,
} = {}) {

    const builder = new FormularioBuilder();

    builder
        .setId(storeId)
        .setStorePinia(storePinia)
        .setShow(show)
        .setCerrarModal(cerrarModal)
        .setTipoFormulario(tipoFormulario)
        .setTamaño('LG')
        .setFondo('FondoClaroOutlined')
        .setEsquemas([
            {
                titulo: 'Datos Básicos',
                columnas: 'w-full md:w-1/2',
                campos: [
                    {
                        modelo: 'Vadecum.expediente',
                        tipo: 'input',
                        label: 'Expediente',
                        placeholder: 'Número de expediente',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.producto',
                        tipo: 'input',
                        label: 'Producto',
                        placeholder: 'Nombre del producto',
                        required: true
                    },
                    {
                        modelo: 'Vadecum.titular',
                        tipo: 'input',
                        label: 'Titular',
                        placeholder: 'Empresa titular',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.unidad',
                        tipo: 'input',
                        label: 'Unidad',
                        placeholder: 'Unidad comercial',
                        required: false
                    }
                ]
            },
            {
                titulo: 'Registro Sanitario',
                columnas: 'w-full md:w-1/2',
                campos: [
                    {
                        modelo: 'Vadecum.registrosanitario',
                        tipo: 'input',
                        label: 'Registro Sanitario',
                        placeholder: 'Número RS',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.fechaexpedicion',
                        tipo: 'date',
                        label: 'Fecha Expedición',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.fechavencimiento',
                        tipo: 'date',
                        label: 'Fecha Vencimiento',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.estadoregistro',
                        tipo: 'select',
                        label: 'Estado Registro',
                        options: [
                            { text: 'Activo', value: 'activo' },
                            { text: 'Vencido', value: 'vencido' },
                            { text: 'Suspendido', value: 'suspendido' }
                        ]
                    }
                ]
            },
            {
                titulo: 'Registro CUM',
                columnas: 'w-full md:w-1/2',
                campos: [
                    {
                        modelo: 'Vadecum.expedientecum',
                        tipo: 'input',
                        label: 'Expediente CUM',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.consecutivocum',
                        tipo: 'input',
                        label: 'Consecutivo CUM',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.cantidadcum',
                        tipo: 'input',
                        label: 'Cantidad CUM',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.estadocum',
                        tipo: 'select',
                        label: 'Estado CUM',
                        options: [
                            { text: 'Activo', value: 'activo' },
                            { text: 'Inactivo', value: 'inactivo' }
                        ]
                    }
                ]
            },
            {
                titulo: 'Descripción Comercial',
                columnas: 'w-full',
                campos: [
                    {
                        modelo: 'Vadecum.descripcioncomercial',
                        tipo: 'textarea',
                        label: 'Descripción Comercial',
                        placeholder: 'Descripción del producto',
                        required: false
                    }
                ]
            },
            {
                titulo: 'Datos Farmacéuticos',
                columnas: 'w-full md:w-1/2',
                campos: [
                    {
                        modelo: 'Vadecum.atc',
                        tipo: 'input',
                        label: 'Código ATC',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.descripcionatc',
                        tipo: 'input',
                        label: 'Descripción ATC',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.viaadministracion',
                        tipo: 'input',
                        label: 'Vía Administración',
                        placeholder: 'Oral, IV, IM, etc',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.formafarmaceutica',
                        tipo: 'input',
                        label: 'Forma Farmacéutica',
                        placeholder: 'Tableta, cápsula, inyección, etc',
                        required: false
                    }
                ]
            },
            {
                titulo: 'Componentes Activos',
                columnas: 'w-full md:w-1/2',
                campos: [
                    {
                        modelo: 'Vadecum.principioactivo',
                        tipo: 'input',
                        label: 'Principio Activo',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.concentracion',
                        tipo: 'input',
                        label: 'Concentración',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.unidadmedida',
                        tipo: 'input',
                        label: 'Unidad de Medida',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.cantidad',
                        tipo: 'input',
                        label: 'Cantidad',
                        type: 'number',
                        required: false
                    }
                ]
            },
            {
                titulo: 'Información Adicional',
                columnas: 'w-full md:w-1/2',
                campos: [
                    {
                        modelo: 'Vadecum.unidadreferencia',
                        tipo: 'input',
                        label: 'Unidad de Referencia',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.nombrerol',
                        tipo: 'input',
                        label: 'Nombre del Rol',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.tiporol',
                        tipo: 'input',
                        label: 'Tipo de Rol',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.modalidad',
                        tipo: 'input',
                        label: 'Modalidad',
                        required: false
                    }
                ]
            },
            {
                titulo: 'Datos de Control',
                columnas: 'w-full md:w-1/2',
                campos: [
                    {
                        modelo: 'Vadecum.muestramedica',
                        tipo: 'input',
                        label: 'Muestra Médica',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.IUM',
                        tipo: 'input',
                        label: 'IUM',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.fechaactivo',
                        tipo: 'date',
                        label: 'Fecha Activo',
                        required: false
                    },
                    {
                        modelo: 'Vadecum.fechainactivo',
                        tipo: 'date',
                        label: 'Fecha Inactivo',
                        required: false
                    }
                ]
            }
        ])
        .setFooter({
            botones: [
                {
                    label: 'Guardar',
                    action: 'guardar',
                    tipo: 'primary'
                },
                {
                    label: soloVer ? 'Cerrar' : 'Cancelar',
                    action: 'cerrar',
                    tipo: 'secondary'
                }
            ],
            mostrarEliminar: eliminar && !soloVer
        })
        .setSoloVer(soloVer);

    return builder.build();
}
