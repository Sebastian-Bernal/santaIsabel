// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/ClassFormulario'

export function useDatosEmpresaBuilder({
    storeId,
    storePinia
}) {
    const builder = new FormularioBuilder()

    return builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioFondo(false)
        .setBotones([{
            type: 'enviar', text: 'Enviar', color: 'bg-blue-500',
        }])
        .setCamposRequeridos(['nombre',
            'logo',
            'logoLogin',
            'JPG',
            'no_identificacion',
            'DV',
            'registroMercantil',
            'direccion',
            'telefono',
            'lenguaje',
            'impuesto',
            'pais',
            'tipoDocumento',
            'tipoOperacion',
            'tipoEntorno',
            'tipoMoneda',
            'tipoOrganizacion',
            'municipio',
            'tipoResponsabilidad',
            'tipoRegimen',])
        .nuevaSeccion('Datos Empresa')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-building text-blue-500 mr-1"></i>Datos de la Empresa',
            tamaño: 'w-full col-span-4',
            forLabel: 'nombre'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Nombre Comercial',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'md:col-span-1 col-span-4',
            minlength: 3,
            vmodel: 'Empresa.nombre'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Logo',
            id: 'logo',
            name: 'logo',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.logo',
            slot: {
                label: '<label for="logoFile"><i class="fa-solid fa-image text-blue-500 cursor-pointer hover:text-blue-600"></i></label>',
                input: {
                    type: 'file',
                    accept: 'image/png, image/jpeg',
                    id: 'logoFile',
                    name: 'logoFile',
                    onChange: "event => logoFile(Empresa, 'logo', event)"
                }
            }
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Logo Login',
            id: 'logoLogin',
            name: 'logoLogin',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.logoLogin',
            slot: {
                label: '<label for="logoLoginFile"><i class="fa-solid fa-image text-blue-500 cursor-pointer hover:text-blue-600"></i></label>',
                input: {
                    type: 'file',
                    accept: 'image/png, image/jpeg',
                    id: 'logoLoginFile',
                    name: 'logoLoginFile',
                    onChange: "event => logoFile(Empresa, 'logoLogin', event)"
                }
            }
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'JPG firmas facturas',
            id: 'JPG',
            name: 'firmas',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.JPG',
            slot: {
                label: '<label for="JPGfirmas"><i class="fa-solid fa-image text-blue-500 cursor-pointer hover:text-blue-600"></i></label>',
                input: {
                    type: 'file',
                    accept: 'image/png, image/jpeg',
                    id: 'JPGfirmas',
                    name: 'JPGfirmas',
                    onChange: "event => logoFile(Empresa, 'JPG', event)"
                }
            }
        })

        // 📌 Sección: Configuración de la Empresa
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-gear text-blue-500 mr-1"></i>Configuración de la Empresa',
            tamaño: 'w-full col-span-4',
            forLabel: 'IdEmpresa'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Número de identificación',
            id: 'IdEmpresa',
            name: 'IdEmpresa',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.no_identificacion'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'DV',
            id: 'DV',
            name: 'DV',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.DV'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Registro Mercantil',
            id: 'registroMercantil',
            name: 'registroMercantil',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.registroMercantil'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Dirección',
            id: 'direccion',
            name: 'direccion',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.direccion'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Teléfono',
            id: 'telefono',
            name: 'telefono',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.telefono'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Lenguaje',
            id: 'lenguaje',
            name: 'lenguaje',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.lenguaje'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Impuesto',
            id: 'impuesto',
            name: 'impuesto',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.impuesto'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'País',
            id: 'pais',
            name: 'pais',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.pais'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo de Documento',
            id: 'tipoDocumento',
            name: 'tipoDocumento',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.tipoDocumento'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo de Operación',
            id: 'tipoOperacion',
            name: 'tipoOperacion',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.tipoOperacion'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo Entorno',
            id: 'tipoEntorno',
            name: 'tipoEntorno',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.tipoEntorno'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo Moneda',
            id: 'tipoMoneda',
            name: 'tipoMoneda',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.tipoMoneda'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo de Organización',
            id: 'tipoOrganizacion',
            name: 'tipoOrganizacion',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.tipoOrganizacion'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Municipio',
            id: 'municipio',
            name: 'municipio',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.municipio'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo de Responsabilidad',
            id: 'tipoResponsabilidad',
            name: 'tipoResponsabilidad',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.tipoResponsabilidad'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo de Régimen',
            id: 'tipoRegimen',
            name: 'tipoRegimen',
            tamaño: 'md:col-span-1 col-span-4',
            vmodel: 'Empresa.tipoRegimen'
        })
        .build()
}