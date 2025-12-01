// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import CrossImg from '~/assets/img/cross.png'

export function useLoginBuilder({
  storeId,
  storePinia,
  recuperarcontraseña,
  validaUsuario,
  selectEmpresa,
  opcionesCompañy,
  mostrarContraseña
}) {
  const builder = new FormularioBuilder()

  const cambiarMostrarContraseña = () => {
      mostrarContraseña.value = !mostrarContraseña.value;
      console.log(mostrarContraseña.value)
  };

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
      tamaño: 'md:w-1/6 w-[60px] logo mb-2 select-none',
      contenedor: 'flex justify-center w-full col-span-2'
    })
    .addCampo({
      component: 'Label',
      text: `
            <div class="flex flex-col justify-center items-center gap-1 pb-5">
                <h3 class="text-white md:text-3xl text-xl font-bold">Thesalus</h3>
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
        onKeyUp: validaUsuario
      },
    })
  if (selectEmpresa.value) {
    builder
      .setFormularioEstilos('bg-inherit! h-[75vh]!')
      .addCampo({
        component: 'Select',
        placeholder: 'Seleccione la Empresa',
        tamaño: 'lg:w-2/3 w-full col-span-2 justify-self-center',
        estilo: 'text-white!',
        vmodel: 'Usuario.empresa',
        options: opcionesCompañy
      })
  } else {
    builder
      .setFormularioEstilos('bg-inherit! h-[70vh]!')
  }
  builder
    .addCampo({
      component: 'Input',
      placeholder: 'Contraseña',
      type: !mostrarContraseña.value ? 'password' : 'text',
      id: 'password',
      name: 'contraseña',
      tamaño: 'lg:w-2/3 w-full justify-self-center col-span-2',
      estilo: 'text-white!',
      vmodel: 'Usuario.contraseña',
      slot: {
        label: mostrarContraseña.value ? `<i class="fa-solid fa-eye text-gray-200"></i>` : `<i class="fa-solid fa-eye-slash text-gray-200"></i>`,
        action: cambiarMostrarContraseña
      }
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