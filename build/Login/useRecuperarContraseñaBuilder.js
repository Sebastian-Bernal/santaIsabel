// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import CrossImg from '~/assets/img/cross.png'

export function useRecuperarContraseñaBuilder({
  storeId,
  storePinia,
  cerrar,
  show,
  enviarCodigo,
  validarCodigo,
  stateCodigo,
}) {
  const builder = new FormularioBuilder()

  builder
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setFormulariotamaño('SM')
    .setFormularioEstilos('h-[75vh]!')
    .setFormularioFondo(true)
    .setFormularioShow(show)
  if (stateCodigo) {
    builder.setBotones([
      { text: 'Siguiente', color: 'dark:bg-white dark:text-black! dark:hover:bg-gray-100 bg-blue-500 hover:bg-blue-600 ', type: 'enviar', },
      { text: 'Cancelar', color: 'bg-gray-500 hover:bg-gray-600', type: 'cerrar', accion: cerrar },
    ])
  } else {
    builder.setBotones([
      { text: 'Enviar Codigo', color: 'bg-blue-500 hover:bg-blue-600', type: 'enviarCodigo', accion: enviarCodigo },
      { text: 'Cancelar', color: 'bg-gray-500 hover:bg-gray-600', type: 'cerrar', accion: cerrar },
    ])
  }
  builder
    .nuevaSeccion('Recuperar Contraseña')
    .addCampo({
      component: 'Imagen',
      src: CrossImg,
      tamaño: 'w-1/6 logo mb-2 select-none invert dark:invert-0',
      contenedor: 'flex justify-center w-full col-span-2'
    })
    .addCampo({
      component: 'Label',
      text: `
            <div class="flex flex-col justify-center items-center gap-1 pt-5 pb-10">
                <h3 class="dark:text-white text-black text-3xl font-bold">Thesalus</h3>
                <p>Introduce tu direccion de correo electronico para restablecer la contraseña</p>
            </div>
        `,
      tamaño: 'w-full col-span-2 flex justify-center'
    })
    .addCampo({
      component: 'Input',
      placeholder: 'Correo Electronico',
      type: 'email',
      id: 'correo-user',
      name: 'correo-user',
      tamaño: 'lg:w-2/3 w-full col-span-2 justify-self-center text-white!',
      vmodel: 'Usuario.correo',
    })
    .nuevaSeccion('Cambiar Contraseña')
    .addCampo({
      component: 'Imagen',
      src: CrossImg,
      tamaño: 'w-1/6 logo mb-2 select-none invert dark:invert-0',
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

  return builder.build()
}