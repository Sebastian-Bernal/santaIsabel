import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { reducirImagen } from '~/Core/Usuarios/Profesional/POSTMedico';
import { useConvenioStore } from '~/stores/Formularios/Convenios/Convenio';

export function useConvenioBuilder({
    storeId = 'ConvenioNuevo',
    storePinia = 'Convenio',
    cerrarModal = () => { },
    show = ref(false),
    tipoFormulario = 'Wizard',
    soloVer = false,
    eliminar = null,
}) {

    const builder = new FormularioBuilder();
    const store = useConvenioStore()

    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioShow(show)
        .setSoloVer(false)
        .setEliminarFormulario(eliminar)
        .setFormularioTipo(tipoFormulario)
        .setFormulariotamaño('SM')
        .setFormularioTituloFormulario('Convenio')
        .setFormularioFondo(true)
        .setBotones([
            { type: 'enviar', text: 'Enviar', color: 'bg-blue-500 hover:bg-blue-600', },
            { type: 'cancelar', text: 'Cancelar', color: 'bg-gray-500 hover:bg-gray-600', accion: cerrarModal },
        ])
        .nuevaSeccion('Datos')
        .addCampo({
            vmodel: 'Convenio.nombre',
            component: 'Input',
            label: 'Nombre del Convenio',
            placeholder: 'Ej: Aseguradora XYZ',
            required: true,
            maxlength: 255,
            tamaño: 'w-full col-span-2',
        })
        .addCampo({
            component: 'Input',
            type: 'file',
            label: 'Logo URL',
            placeholder: 'URL del logo',
            required: false,
            tamaño: 'w-full col-span-2',
            events: {
                onInput: async (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        const imagenReducida = await reducirImagen(file);
                        store.Formulario.Convenio.logo = imagenReducida;
                    }
                }
            }
        })


    return builder.build();
}
