// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import CrossImg from '~/public/cruz.png'

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
    .setFormularioEstilos('h-[70vh]!')
    .setFormularioFondo(true)
    .setFormularioShow(show)
    .setBotones([
      { text: 'Crear cuenta', color: 'dark:bg-white dark:text-black! dark:hover:bg-gray-100 bg-blue-500 hover:bg-[var(--color-default)]! hover:text-white! ', type: 'enviar', },
      { text: 'Cancelar', color: 'bg-gray-500 hover:bg-gray-600', type: 'cerrar', accion: cerrar },
    ])
    .nuevaSeccion('')
    .addCampo({
      component: 'Imagen',
      src: CrossImg,
      tamaño: 'w-20 h-20 logo mt-8 mb-3 select-none',
      contenedor: 'flex justify-center w-full col-span-2'
    })
    .addCampo({
      component: 'Label',
      text: `
            <div class="flex flex-col justify-center items-center gap-2 pt-4 pb-8 text-center">
                <h3 class="text-[var(--color-default)] text-3xl font-bold tracking-wide">Thesalus</h3>
                <p class="text-gray-600 dark:text-gray-300 max-w-md">
                  Ingresa el código enviado a tu correo y crea una contraseña segura para tu cuenta.
                </p>
            </div>
        `,
      tamaño: 'w-full col-span-2 flex justify-center'
    })
    .addCampo({
      component: 'Input',
      placeholder: 'Código de recuperación',
      icon: 'fa-solid fa-key',
      type: 'text',
      id: 'codigo',
      name: 'codigo',
      tamaño: 'lg:w-2/3 w-full justify-self-center col-span-2',
      vmodel: 'Usuario.codigo',
    })
    .addCampo({
      component: 'Input',
      placeholder: 'Nueva contraseña',
      icon: 'fa-solid fa-lock',
      type: 'password',
      id: 'contraseña',
      name: 'contraseña',
      tamaño: 'lg:w-2/3 w-full justify-self-center col-span-2',
      vmodel: 'Usuario.contraseña',
    })

  return builder.build()
}