// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/composables/Formulario/ClassFormulario'

export function useEpsBuilder({
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
    .nuevaSeccion('Agregar Nueva EPS')
      .addCampo({
          component: 'Label',
          text: '<i class="fa-solid fa-hospital text-purple-500 mr-1"></i>Agregar Nueva EPS',
          tamaño: 'w-full col-span-2',
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
      
    .build()
}