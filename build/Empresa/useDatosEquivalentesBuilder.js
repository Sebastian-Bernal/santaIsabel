// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/ClassFormulario'

export function useDatosEquivalentesBuilder({
  storeId,
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
    .nuevaSeccion()
      .addCampo({
          component: 'Label',
          text: '<i class="fa-solid fa-building text-blue-500 mr-1"></i>Configuracion de documentos equivalentes',
          tamaño: 'w-full col-span-2',
          forLabel: 'idEquivalentes'
      })
      .addCampo({
          component: 'Input',
          type: 'text',
          placeholder: 'ID Software Documentos Equivalentes',
          id: 'idEquivalentes',
          name: 'idEquivalentes',
          tamaño: 'md:col-span-1 col-span-3',
          minlength: 3,
          vmodel: 'Software.Equivalentes.id'
      })
      .addCampo({
          component: 'Input',
          type: 'text',
          maxLength: 5,
          min: 1,
          placeholder: 'Pin Software Docuementos Equivalentes',
          id: 'pinEquivalentes',
          name: 'pinEquivalentes',
          tamaño: 'md:col-span-1 col-span-3',
          vmodel: 'Software.Equivalentes.pin',
          slot: {
              label: '<div class="flex text-gray-500"><p>{{ formData.Equivalentes.pin.length }}</p>/<p>5</p></div>',
          }
      })
      .addCampo({
          component: 'Input',
          type: 'text',
          placeholder: 'Test Set ID Docuemntos Equivalentes',
          id: 'testEquivalentes',
          name: 'testEquivalentes',
          tamaño: 'md:col-span-1 col-span-3',
          vmodel: 'Software.Equivalentes.test',
      })
      
    .build()
}