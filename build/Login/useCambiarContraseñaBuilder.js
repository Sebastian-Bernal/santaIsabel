// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/composables/Formulario/ClassFormulario'

export function useCambiarContraseñaBuilder({
  storeId,
  storePinia,
  validarCodigo,
  cerrar,
  show
}) {
  const builder = new FormularioBuilder()

  return builder
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setFormulariotamaño('SM')
    .setFormularioFondo(true)
    .setFormularioShow(show)
    .setBotones([
      { text: 'Cancelar', color: 'bg-gray-500', type: 'cerrar', accion: cerrar },
      { text: 'Cambiar', color: 'bg-white text-black!', type: 'enviar' },
    ])
      .nuevaSeccion('Cambiar Contraseña')
      .addCampo({
        component: 'Input',
        placeholder: 'Codigo de Recuperacion',
        icon: 'fa-solid fa-key',
        type: 'password',
        id: 'contraseña',
        name: 'contraseña',
        tamaño: 'lg:w-2/3 w-full justify-self-center col-span-2',
        vmodel: 'Usuario.contraseña',
        events: {
          OnChange: validarCodigo
        }
      })
      .addCampo({
        component: 'Input',
        placeholder: 'Contraseña',
        type: 'password',
        id: 'contraseña',
        name: 'contraseña',
        tamaño: 'lg:w-2/3 w-full justify-self-center col-span-2',
        vmodel: 'Usuario.contraseña',
      })
      .addCampo({
        component: 'Input',
        placeholder: 'Contraseña',
        type: 'password',
        id: 'contraseña',
        name: 'contraseña',
        tamaño: 'lg:w-2/3 w-full justify-self-center col-span-2',
        vmodel: 'Usuario.contraseña',
      })
    .build()
}