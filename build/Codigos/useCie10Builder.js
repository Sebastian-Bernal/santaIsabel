import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useCie10Builder({
    storeId = 'Cie10Nuevo',
    storePinia = 'Cie10',
    cerrarModal = () => {},
    show = ref(false),
    tipoFormulario = 'Form',
    soloVer = false,
    eliminar = null,
} = {}) {

    const builder = new FormularioBuilder();

    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioShow(show)
        .setTipoFormulario(tipoFormulario)
        .setTamaño('MD')
        .setFondo('FondoClaroOutlined')
        .setEsquemas([
            {
                columnas: 'w-full',
                campos: [
                    {
                        modelo: 'Cie10.codigo',
                        tipo: 'input',
                        label: 'Código CIE-10',
                        placeholder: 'Ej: A00',
                        required: true,
                        atributos: { maxlength: 10 }
                    },
                    {
                        modelo: 'Cie10.nombre',
                        tipo: 'input',
                        label: 'Nombre de la Condición',
                        placeholder: 'Ej: Cólera',
                        required: true,
                        atributos: { maxlength: 255 }
                    }
                ]
            }
        ])
        .setFooter({
            botones: [
                {
                    label: 'Guardar',
                    action: 'guardar',
                    tipo: 'primary'
                },
                {
                    label: soloVer ? 'Cerrar' : 'Cancelar',
                    action: 'cerrar',
                    tipo: 'secondary'
                }
            ],
            mostrarEliminar: eliminar && !soloVer
        })
        .setSoloVer(soloVer);

    return builder.build();
}
