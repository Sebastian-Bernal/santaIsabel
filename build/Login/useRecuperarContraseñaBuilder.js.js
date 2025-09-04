// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/ClassFormulario'
import CrossImg from '~/assets/img/cross.png'

export function useRecuperarContraseñaBuilder({
  storeId,
  storePinia,
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
      { text: 'Siguiente', color: 'bg-white text-black!', type: 'enviar' },
    ])
    .nuevaSeccion('Recuperar Contraseña')
      .addCampo({
        component: 'Imagen',
        src: CrossImg,
        tamaño: 'w-1/6 logo mb-2 select-none',
        contenedor: 'flex justify-center w-full col-span-2'
      })
      .addCampo({
        component: 'Label',
        text: `
            <div class="flex flex-col justify-center items-center gap-1 pb-5">
                <h3 class="text-white text-3xl font-bold">Thesalus</h3>
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
    .build()
}