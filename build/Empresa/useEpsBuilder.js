// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useEpsBuilder({
    storeId,
    storePinia,
    actualizar,
    showModificarEPS,
    cerrar
}) {
    const builder = new FormularioBuilder()
    if (actualizar) {
        builder
            .setFormularioFondo(true)
            .nuevaSeccion('Actualizar EPS')
            .setFormularioShow(showModificarEPS)
            .setBotones([
                { type: 'cancelar', text: 'Cancelar', color: 'bg-gray-500', accion: cerrar },
                { type: 'enviar', text: 'Enviar', color: 'bg-blue-500', },
            ])
    } else {
        builder
            .setFormularioFondo(false)
            .nuevaSeccion('Agregar Nueva EPS')
            .setBotones([{
                type: 'enviar', text: 'Enviar', color: 'bg-blue-500',
            }])
    }
    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setCamposRequeridos(['EPS.nombre',
            'EPS.codigo',
            'EPS.direccion',
            'EPS.telefono',
            'EPS.email',
            'EPS.website',])
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
            tamaño: '',
            minlength: 5,
            vmodel: 'EPS.nombre',
            upperCase: true
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
            placeholder: 'Direccion',
            id: 'Direccion',
            name: 'Direccion',
            vmodel: 'EPS.direccion',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'number',
            maxLength: 3,
            placeholder: 'Telefono',
            id: 'Telefono',
            name: 'Telefono',
            vmodel: 'EPS.telefono',
        })
        .addCampo({
            component: 'Input',
            type: 'email',
            maxLength: 3,
            placeholder: 'Email',
            id: 'Email',
            name: 'Email',
            vmodel: 'EPS.email',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            maxLength: 3,
            placeholder: 'Website',
            id: 'Website',
            name: 'Website',
            vmodel: 'EPS.website',
        })

    builder.build()
    return builder
}