// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/ClassFormulario'

export function useNotasBuilder({
    storeId,
    storePinia,
    cerrarModal,
    show,
}) {
    const builder = new FormularioBuilder()

    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormulariotamaño('LG')
        .setFormularioShow(show)
        .setFormularioTipo('solo')
        .setBotones([
            { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500', type: 'cerrar' },
        ])
    // 📌 Sección: Datos

    builder
        // 📌 Sección: Diagnósticos
        .nuevaSeccion('Nota Medica')

        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente',
            forLabel: 'nombre',
            tamaño: 'col-span-2 w-full'
        })
        .addCampo({
            component: 'Input',
            vModel: 'Nota.name_paciente',
            type: 'text',
            id: 'nombre',
            name: 'nombre',
            list: 'nombreList',
            placeholder: 'Nombre del paciente',
            tamaño: 'w-full',
            evento: '@input=filtrarPacientes'
        })
        .addCampo({
            component: 'Input',
            vModel: 'Nota.No_document_paciente',
            type: 'number',
            id: 'documento',
            name: 'documento',
            placeholder: 'Número de documento',
            tamaño: 'w-full',
        })

        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-location-dot text-blue-500 mr-1"></i>Fecha y Ubicacion',
            forLabel: 'departamento',
            tamaño: 'col-span-2 w-full'
        })
        .addCampo({
            component: 'Input',
            vModel: 'Nota.fecha_nota',
            type: 'text',
            id: 'fecha_nota',
            name: 'fecha_nota',
            placeholder: 'Fecha',
            tamaño: 'w-full',
            slot: '<input v-model="Nota.fecha_nota" type="date" class="w-[20px]">'
        })
        .addCampo({
            component: 'Input',
            vModel: 'Nota.hora_nota',
            type: 'text',
            id: 'hora_nota',
            name: 'hora_nota',
            placeholder: 'Hora (00:00)',
            tamaño: 'w-full',
            slot: '<input v-model="Nota.hora_nota" type="time" class="w-[30px]">'
        })
        .addCampo({
            component: 'Input',
            vModel: 'Nota.direccion',
            type: 'text',
            id: 'direccion',
            name: 'direccion',
            placeholder: 'Dirección',
            tamaño: 'w-full',
            disabled: 'props.verNota'
        })

        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-file text-blue-500 mr-1"></i>Diagnosticos',
            forLabel: 'tipo',
            tamaño: 'col-span-2 w-full'
        })
        .addCampo({
            component: 'Select',
            vModel: 'Nota.tipoAnalisis',
            id: 'rehabilitacion',
            name: 'rehabilitacion',
            placeholder: 'Tipo de Análisis',
            tamaño: 'w-full',
            options: [
                { text: 'Estado clínico sin cambios', value: 'Estado clinico sin cambios' },
                { text: 'Recomendaciones Adicionales', value: 'Recomendaciones Adicionales' },
                { text: 'Cambios críticos', value: 'Cambios criticos' }
            ]
        })

        .addCampo({
            component: 'Label',
            icon: 'fa-solid fa-comment text-blue-500',
            text: 'Nota',
            forLabel: 'departamento',
            tamaño: 'col-span-2 w-full'
        })
        .addCampo({
            component: 'Textarea',
            vModel: 'Nota.nota',
            id: 'nota',
            name: 'nota',
            placeholder: 'Nota',
            tamaño: 'w-full',
            disabled: 'props.verNota'
        })

    return builder.build()
}