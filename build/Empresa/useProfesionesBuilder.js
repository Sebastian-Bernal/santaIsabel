// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useProfesionesBuilder({
  storeId,
  storePinia,
  permisos,
  actualizar,
  showModificarProfesion,
  cerrar
}) {
  const builder = new FormularioBuilder()

  if (actualizar) {
    builder
      .setFormularioFondo(true)
      .nuevaSeccion('Actualizar Profesion')
      .setFormularioShow(showModificarProfesion)
      .setBotones([
        {type: 'cancelar', text: 'Cancelar', color: 'bg-gray-500', accion: cerrar},
        {type: 'enviar', text: 'Enviar', color: 'bg-blue-500',},
      ])
  } else {
    builder
      .setFormularioFondo(false)
      .nuevaSeccion('Agregar Nueva Profesion')
      .setBotones([{
        type: 'enviar', text: 'Enviar', color: 'bg-blue-500',
      }])
  }

  builder
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setCamposRequeridos(['Profesion.nombre', 'Profesion.codigo',])
    .setEditarFormulario(actualizar)
    .addCampo({
      component: 'Label',
      text: '<i class="fa-solid fa-user-doctor text-purple-500 mr-1"></i>Profesiones',
      tamaño: 'w-full md:col-span-2',
      forLabel: 'Profesion'
    })
    .addCampo({
      component: 'Input',
      type: 'text',
      placeholder: 'Nombre Profesion',
      id: 'Profesion',
      name: 'Profesion',
      minlength: 5,
      tamaño: 'col-span-1',
      vmodel: 'Profesion.nombre',
      upperCase: true
    })
    .addCampo({
      component: 'Input',
      type: 'text',
      placeholder: 'Codigo',
      id: 'ProfesionCodigo',
      name: 'ProfesionCodigo',
      minlength: 2,
      tamaño: 'col-span-1',
      vmodel: 'Profesion.codigo',
      upperCase: true
    })
    .addCampo({
      component: 'SelectMultiple',
      placeholder: 'Seleccione los permisos',
      id: 'permisos',
      name: 'permisos',
      tamaño: 'w-full md:col-span-2',
      vmodel: 'Profesion.permisos',
      options: permisos,
    })

  return builder.build()
}