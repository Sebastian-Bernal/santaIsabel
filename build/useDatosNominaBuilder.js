// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/composables/Formulario/ClassFormulario'

export function useDatosNominaBuilder({
  storeId,
}) {
  const builder = new FormularioBuilder()

  return builder
    .setStoreId(storeId)
    .setFormularioFondo(false)
    .setBotones([{
        type: 'enviar', text: 'Enviar', color: 'bg-blue-500',
    }])
    .nuevaSeccion()
      .addCampo({
          component: 'Label',
          text: '<i class="fa-solid fa-building text-blue-500 mr-1"></i>Configuracion de nómina electrónica',
          tamaño: 'w-full col-span-2',
          forLabel: 'idNomina'
      })
      .addCampo({
          component: 'Input',
          type: 'text',
          placeholder: 'ID Nomina',
          id: 'idNomina',
          name: 'idNomina',
          tamaño: 'md:col-span-1 col-span-3',
          minlength: 3,
          vmodel: 'Software.Nomina.id'
      })
      .addCampo({
          component: 'Input',
          type: 'text',
          maxLength: 5,
          min: 1,
          placeholder: 'Pin Nomina',
          id: 'pinNomina',
          name: 'pinNomina',
          tamaño: 'md:col-span-1 col-span-3',
          vmodel: 'Software.Nomina.pin',
          slot: {
              label: '<div class="flex text-gray-500"><p>{{ formData.Nomina.pin.length }}</p>/<p>5</p></div>',
          }
      })
      .addCampo({
          component: 'Input',
          type: 'text',
          placeholder: 'Codigo Test Nomina',
          id: 'testNomina',
          name: 'testNomina',
          tamaño: 'md:col-span-1 col-span-3',
          vmodel: 'Software.Nomina.test',
      })
      
    .build()
}