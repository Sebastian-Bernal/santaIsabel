// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/ClassFormulario'

export function useProfesionesBuilder({
  storeId,
  storePinia,
  permisos
}) {
  const builder = new FormularioBuilder()

  return builder
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setFormularioFondo(false)
    .setBotones([{
      type: 'enviar', text: 'Enviar', color: 'bg-blue-500',
    }])
    .nuevaSeccion('Agregar Nueva Profesion')
      .addCampo({
          component: 'Label',
          text: '<i class="fa-solid fa-user-doctor text-purple-500 mr-1"></i>Profesiones',
          tamaño: 'w-full col-span-2',
          forLabel: 'eps'
      })
    .addCampo({
      component: 'Input',
      type: 'text',
      placeholder: 'Nombre Profesion',
      id: 'Profesion',
      name: 'Profesion',
      minlength: 5,
      tamaño: 'col-span-1',
      vmodel: 'Profesion.nombre'
    })
    .addCampo({
      component: 'Input',
      type: 'text',
      placeholder: 'Codigo',
      id: 'ProfesionCodigo',
      name: 'ProfesionCodigo',
      minlength: 2,
      tamaño: 'col-span-1',
      vmodel: 'Profesion.codigo'
    })
    .addCampo({
      component: 'SelectMultiple',
      placeholder: 'Seleccione los permisos',
      id: 'permisos',
      name: 'permisos',
      tamaño: 'col-span-2',
      vmodel: 'Profesion.permisos',
      options: permisos
    })
    .addCampo({
      component: 'Select',
      placeholder: 'Tipo',
      id: 'tipo',
      name: 'tipo',
      tamaño: 'col-span-1',
      options: [
        { text: 'Medico', value: 'Medico' },
        { text: 'Enfermero', value: 'Enfermero' },
        { text: 'Fisioterapeuta', value: 'Fisioterapeuta' },
        { text: 'Optómetra', value: 'Optómetra' },
        { text: 'Ortopedista', value: 'Ortopedista' }
      ],
      vmodel: 'Profesion.tipo'
    })

    .build()
}