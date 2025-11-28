// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useServicioBuilder({
  storeId,
  storePinia,
  actualizar,
  showModificarServicio,
  cerrar
}) {
  const builder = new FormularioBuilder()

  if (actualizar) {
    builder
      .setFormularioFondo(true)
      .nuevaSeccion('Formulario Servicio')
      .setFormularioShow(showModificarServicio)
      .setBotones([
        {type: 'cancelar', text: 'Cancelar', color: 'bg-gray-500', accion: cerrar},
        {type: 'enviar', text: 'Enviar', color: 'bg-blue-500',},
      ])
  } else {
    builder
      .setFormularioFondo(false)
      .nuevaSeccion('Agregar Nuevo Servicio')
      .setBotones([{
        type: 'enviar', text: 'Enviar', color: 'bg-blue-500',
      }])
  }

  builder
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setFormulariotamaño('XS')
    .setCamposRequeridos(['Servicio.name', 'Servicio.plantilla',])
    .setEditarFormulario(actualizar)
    .addCampo({
      component: 'Label',
      text: '<i class="fa-solid fa-user-doctor text-purple-500 mr-1"></i>Servicio',
      tamaño: 'w-full md:col-span-2',
      forLabel: 'Servicio'
    })
    .addCampo({
      component: 'Input',
      type: 'text',
      placeholder: 'Nombre Servicio',
      id: 'Servicio',
      name: 'Servicio',
      minlength: 5,
      tamaño: 'md:col-span-2',
      vmodel: 'Servicio.name',
      upperCase: true
    })
    .addCampo({
      component: 'Select',
      placeholder: 'Seleccione la plantilla',
      id: 'plantilla',
      name: 'plantilla',
      tamaño: 'w-full md:col-span-2',
      vmodel: 'Servicio.plantilla',
      options: [
        {text: 'Nota', value: 'Nota'},
        {text: 'Terapia', value: 'Terapia'},
        {text: 'Evolucion', value: 'Evolucion'},
        {text: 'Medicina', value: 'Medicina'},
        {text: 'Trabajo Social', value: 'Trabajo Social'},
      ],
    })

  return builder.build()
}