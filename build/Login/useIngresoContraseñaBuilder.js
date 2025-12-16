// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import CrossImg from '~/assets/img/cross.png'

export function useIngresoContraseñaBuilder({
  storeId,
  storePinia,
  cerrar,
  show,
}) {
  const builder = new FormularioBuilder()

  builder
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setFormulariotamaño('SM')
    .setFormularioEstilos('h-[75vh]!')
    .setFormularioFondo(true)
    .setFormularioShow(show)
    .setBotones([
      { text: 'Siguiente', color: 'dark:bg-white dark:text-black! dark:hover:bg-gray-100 bg-blue-500 hover:bg-blue-600 ', type: 'enviar', },
      { text: 'Cancelar', color: 'bg-gray-500 hover:bg-gray-600', type: 'cerrar', accion: cerrar },
    ])
    .nuevaSeccion('Cambiar Contraseña')
    .addCampo({
      component: 'Imagen',
      src: CrossImg,
      tamaño: 'w-1/6 logo mt-5 mb-10 select-none invert dark:invert-0',
      contenedor: 'flex justify-center w-full col-span-2'
    })
    .addCampo({
      component: 'Input',
      placeholder: 'Codigo de Recuperacion',
      icon: 'fa-solid fa-key',
      type: 'text',
      id: 'codigo',
      name: 'codigo',
      tamaño: 'lg:w-2/3 w-full justify-self-center col-span-2',
      vmodel: 'Usuario.codigo',
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

  return builder.build()
}