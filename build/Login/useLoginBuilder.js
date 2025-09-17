// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/ClassFormulario'
import CrossImg from '~/assets/img/cross.png'

export function useLoginBuilder({
  storeId,
  storePinia,
  recuperarcontraseña,
  validaUsuario,
  selectEmpresa,
  opcionesCompañy
}) {
  const builder = new FormularioBuilder()

  builder
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setFormulariotamaño('SM')
    .setFormularioFondo('FondoTransparent')
    .setFormularioShow(true)
    .setBotones([
      { text: 'Ingresar', color: 'bg-white text-black!', type: 'enviar' },
    ])
    .nuevaSeccion()
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
      tamaño: 'lg:w-2/3 w-full col-span-2 justify-self-center',
      estilo: 'text-white!',
      vmodel: 'Usuario.correo',
      events: {
        onChange: validaUsuario
      }
    })
    if (selectEmpresa.value) {
      builder
        .setFormularioEstilos('bg-inherit! h-[75vh]!')
        .addCampo({
          component: 'Select',
          placeholder: 'Seleccione la Empresa',
          tamaño: 'lg:w-2/3 w-full col-span-2 justify-self-center text-white!',
          options: opcionesCompañy
        })
    } else {
      builder
        .setFormularioEstilos('bg-inherit!')
    }
    builder
    .addCampo({
      component: 'Input',
      placeholder: 'Contraseña',
      type: 'password',
      id: 'contraseña',
      name: 'contraseña',
      tamaño: 'lg:w-2/3 w-full justify-self-center col-span-2',
      estilo: 'text-white!',
      vmodel: 'Usuario.contraseña',
    })
    .addCampo({
      component: 'Label',
      text: `
            <p class="text-sm my-3 text-gray-100">
                Olvidaste tu contraseña?
                <span @click="recuperarContraseña" class="underline font-semibold cursor-pointer">Recuperar</span>
            </p>
        `,
      events: {
        onClick: recuperarcontraseña
      },
      tamaño: 'w-full col-span-2 flex justify-center'
    })
  return builder.build()
}