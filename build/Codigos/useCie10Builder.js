import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useCie10Builder({
    storeId = 'Cie10Nuevo',
    storePinia = 'Cie10',
    cerrarModal = () => {},
    show = ref(false),
    tipoFormulario = 'Form',
    soloVer = false,
    eliminar = null,
} = {}) {

    const builder = new FormularioBuilder();

    if (eliminar) {
        builder
            .setFormularioTituloFormulario('CIE-10')
            .setFormularioTipo(tipoFormulario)
    }

    builder
        .setFormularioFondo(true)
        .setFormulariotamaño('SM')
        .nuevaSeccion('Información CIE-10')
        .setFormularioShow(show)
        .setBotones([
            { type: 'enviar', text: 'Enviar', color: 'bg-blue-500 hover:bg-blue-600', },
            { type: 'cancelar', text: 'Cancelar', color: 'bg-gray-500 hover:bg-gray-600', accion: cerrarModal },
        ])
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setEliminarFormulario(eliminar)
        .setCamposRequeridos(['Cie10.codigo', 'Cie10.nombre'])
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-hospital text-purple-500 mr-1"></i>Datos basicos',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'codigo'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Ej: A00',
            id: 'codigo',
            name: 'codigo',
            tamaño: 'w-full col-span-2',
            minlength: 3,
            maxLength: 10,
            vmodel: 'Cie10.codigo',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Ej: Cólera',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full col-span-2',
            minlength: 3,
            maxLength: 255,
            vmodel: 'Cie10.nombre',
            upperCase: true
        })

    builder.build()
    return builder
}
