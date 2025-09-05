// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/ClassFormulario'

export function useDatosSofwareBuilder({
    storeId,
    numeroLetras,
    storePinia
}) {
    const builder = new FormularioBuilder()

    return builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioFondo(false)
        .setBotones([{
            type: 'enviar', text: 'Enviar', color: 'bg-blue-500',
        }])
        .setCamposRequeridos(['Software.Dian.id',
            'Software.Dian.pin',
            'Software.Dian.testID',])
        .nuevaSeccion('Datos del Software')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-building text-blue-500 mr-1"></i>Datos de Software',
            tamaño: 'w-full col-span-2',
            forLabel: 'idSoftware'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'ID asignado por la DIAN',
            id: 'idSoftware',
            name: 'idSoftware',
            tamaño: 'md:col-span-1 col-span-3',
            minlength: 3,
            vmodel: 'Software.Dian.id'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            maxLength: 5,
            min: 1,
            placeholder: 'Digite el pin del Software',
            id: 'pinSoftware',
            name: 'pinSoftware',
            tamaño: 'md:col-span-1 col-span-3',
            vmodel: 'Software.Dian.pin',
            slot: {
                label: `<div class="flex text-gray-500"><p>${numeroLetras}</p>/<p>5</p></div>`,
            }
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Introduzca el codigo del Set de pruebas para habilitacion',
            id: 'testSoftware',
            name: 'testSoftware',
            tamaño: 'md:col-span-1 col-span-3',
            vmodel: 'Software.Dian.testID',
        })

        .build()
}