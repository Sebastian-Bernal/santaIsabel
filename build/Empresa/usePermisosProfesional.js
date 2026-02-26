// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function usePermisosProfesionalBuilder({
  storeId,
  storePinia,
  permisos,
  show,
  cerrar,
}) {
  const builder = new FormularioBuilder()
  const varView = useVarView()

builder
      .setFormularioFondo(true)
      .nuevaSeccion('Actualizar Permisos para el Profesional')
      .setFormularioShow(show)
      .setFormularioTipo('Wizard')
      .setFormularioTituloFormulario('Permisos')
      .setBotones([
        { type: 'enviar', text: 'Enviar', color: 'bg-blue-500 hover:bg-blue-600', },
        { type: 'cancelar', text: 'Cancelar', color: 'bg-gray-500 hover:bg-gray-600', accion: cerrar },
      ])
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setFormulariotamaño('MD')
    .setCamposRequeridos(['Profesion.id_profesional', 'Profesion.permisos',])
    .addCampo({
      component: 'Label',
      text: '<i class="fa-solid fa-user-doctor text-purple-500 mr-1"></i>Profesiones',
      tamaño: 'w-full md:col-span-2',
      forLabel: 'Profesion'
    })
    .addCampo({
      component: 'Input',
      type: 'date',
      placeholder: 'Fecha Final',
      label: 'Fecha Final',
      id: 'fin',
      name: 'fin',
      minlength: 5,
      tamaño: 'col-span-2',
      vmodel: 'Profesion.fecha_fin',
      upperCase: true
    })
      .addCampo({
        component: 'Checkbox',
        placeholder: 'Permitir mostrar todos los Pacientes?',
        tamaño: 'w-full',
        vmodel: 'Profesion.ListaPacientes',
      })
      .addCampo({
        component: 'Checkbox',
        placeholder: 'Permitir realizar diagnosticos?',
        tamaño: 'w-full',
        vmodel: 'Profesion.Diagnosticos_view',
      })
    .addCampo({
      component: 'Permisos',
      placeholder: 'Seleccione los permisos en cada Seccion',
      id: 'permisos',
      name: 'permisos',
      tamaño: 'w-full md:col-span-2',
      vmodel: 'Profesion.permisos',
      options: permisos,
      showOptions: true,
    })

  return builder.build()
}