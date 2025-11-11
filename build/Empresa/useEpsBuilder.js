// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useEpsBuilder({
    storeId,
    storePinia,
    showModificarEPS,
    cerrar,
    eliminar
}) {

    const builder = new FormularioBuilder()
    if (eliminar) {
        builder
        .setFormularioTituloFormulario('EPS')
        .setFormularioTipo('Wizard')
    }
    builder
        .setFormularioFondo(true)
        .setFormulariotamaño('SM')
        .nuevaSeccion('Formulario EPS')
        .setFormularioShow(showModificarEPS)
        .setBotones([
            { type: 'cancelar', text: 'Cancelar', color: 'bg-gray-500', accion: cerrar },
            { type: 'enviar', text: 'Enviar', color: 'bg-blue-500', },
        ])
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setEliminarFormulario(eliminar)
        .setCamposRequeridos(['EPS.nombre',
            'EPS.codigo',
            'EPS.nit'])
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-hospital text-purple-500 mr-1"></i>Agregar Nueva EPS',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'eps'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Nombre EPS',
            id: 'eps',
            name: 'eps',
            tamaño: 'w-full',
            minlength: 5,
            vmodel: 'EPS.nombre',
            upperCase: true,
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            maxLength: 3,
            placeholder: 'Codigo',
            id: 'codigo',
            name: 'codigo',
            tamaño: '3',
            vmodel: 'EPS.codigo',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            maxLength: 3,
            placeholder: 'Nit',
            id: 'nit',
            name: 'nit',
            vmodel: 'EPS.nit',
            upperCase: true
        })

    builder.build()
    return builder
}