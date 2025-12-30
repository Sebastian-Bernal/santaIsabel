// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

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
            { text: 'Enviar', color: 'bg-blue-500 hover:bg-blue-600', type: 'enviar' },
            { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500 hover:bg-gray-600', type: 'cerrar' },
        ])
    // 📌 Sección: Datos

    builder
        // 📌 Sección: Diagnósticos
        .nuevaSeccion('Nota Medica')

        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente',
            forLabel: 'nombre',
            tamaño: 'md:col-span-2 w-full'
        })
        .addCampo({
            component: 'Input',
            vmodel: 'Nota.name_paciente',
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
            vmodel: 'Nota.No_document_paciente',
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
            tamaño: 'md:col-span-2 w-full'
        })
        .addCampo({
            component: 'Input',
            vmodel: 'Nota.fecha_nota',
            type: 'date',
            id: 'fecha_nota',
            name: 'fecha_nota',
            placeholder: 'Fecha',
            tamaño: 'w-full',
            slot: '<input v-model="Nota.fecha_nota" type="date" class="w-[20px]">'
        })
        .addCampo({
            component: 'Input',
            vmodel: 'Nota.hora_nota',
            type: 'time',
            id: 'hora_nota',
            name: 'hora_nota',
            placeholder: 'Hora (00:00)',
            tamaño: 'w-full',
            slot: '<input v-model="Nota.hora_nota" type="time" class="w-[30px]">'
        })
        .addCampo({
            component: 'Input',
            vmodel: 'Nota.direccion',
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
            tamaño: 'md:col-span-2 w-full'
        })
        .addCampo({
            component: 'Select',
            vmodel: 'Nota.tipoAnalisis',
            id: 'rehabilitacion',
            name: 'rehabilitacion',
            placeholder: 'Tipo de Análisis',
            tamaño: 'w-full md:col-span-2',
            options: [
                { text: 'Estado clínico sin cambios', value: 'Estado clinico sin cambios' },
                { text: 'Recomendaciones Adicionales', value: 'Recomendaciones Adicionales' },
                { text: 'Cambios críticos', value: 'Cambios criticos' }
            ]
        })
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-note-sticky text-blue-500 mr-1"></i>Notas de enfermeria',
            forLabel: 'tipo',
            tamaño: 'md:col-span-2 w-full'
        })
        .addCampo({
            component: 'Label',
            icon: 'fa-solid fa-comment text-blue-500',
            text: 'Nota',
            forLabel: 'departamento',
            tamaño: 'md:col-span-2 w-full'
        })
        .addCampo({
            component: 'GroupCampos',
            labelGroup: 'Subjetivo',
            buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'subjetivo' } }],
            tamaño: 'w-full col-span-2',
            vmodel: 'Nota.subjetivo',
            ocultarEliminar: true,
            value: [],
            campos: [
                {
                    name: 'hora',
                    id: 'hora',
                    typeCampo: 'Input',
                    type: 'time',
                    placeholder: 'Hora del registro',
                    tamaño: 'w-full mt-1',
                    label: 'Hora del registro'
                },
                {
                    name: 'descripcion',
                    id: 'descripcion',
                    typeCampo: 'Textarea',
                    placeholder: 'Registre lo manifestado por el paciente o familiar (dolor, molestias, percepción)',
                    tamaño: 'w-full',
                },
            ],
            containerCampos: 'flex flex-col gap-1'
        })
        .addCampo({
            component: 'GroupCampos',
            labelGroup: 'Objetivos',
            buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'objetivo' } }],
            tamaño: 'w-full col-span-2',
            vmodel: 'Nota.objetivo',
            ocultarEliminar: true,
            value: [],
            campos: [
                {
                    name: 'hora',
                    id: 'hora',
                    typeCampo: 'Input',
                    type: 'time',
                    placeholder: 'Hora del registro',
                    tamaño: 'w-full',
                    label: 'Hora del registro'
                },
                {
                    name: 'descripcion',
                    id: 'descripcion',
                    typeCampo: 'Textarea',
                    placeholder: 'Registre el objetivo del cuidado de enfermería para el paciente',
                    tamaño: 'w-full',
                },
            ],
            containerCampos: 'flex flex-col gap-1'
        })
        .addCampo({
            component: 'GroupCampos',
            labelGroup: 'Actividades',
            buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'actividades' } }],
            tamaño: 'w-full col-span-2',
            vmodel: 'Nota.actividades',
            ocultarEliminar: true,
            value: [],
            campos: [
                {
                    name: 'hora',
                    id: 'hora',
                    typeCampo: 'Input',
                    type: 'time',
                    placeholder: 'Hora del registro',
                    tamaño: 'w-full',
                    label: 'Hora del registro'
                },
                {
                    name: 'descripcion',
                    id: 'descripcion',
                    typeCampo: 'Textarea',
                    placeholder: 'Detalle las actividades de enfermería realizadas durante el turno',
                    tamaño: 'w-full',
                },
            ],
            containerCampos: 'flex flex-col gap-1'
        })
        .addCampo({
            component: 'GroupCampos',
            labelGroup: 'Plan',
            buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'plan' } }],
            tamaño: 'w-full col-span-2',
            vmodel: 'Nota.plan',
            ocultarEliminar: true,
            value: [],
            campos: [
                {
                    name: 'hora',
                    id: 'hora',
                    typeCampo: 'Input',
                    type: 'time',
                    placeholder: 'Hora del registro',
                    tamaño: 'w-full',
                    label: 'Hora del registro'
                },
                {
                    name: 'descripcion',
                    id: 'descripcion',
                    typeCampo: 'Textarea',
                    placeholder: 'Indique el plan de cuidado a seguir según la valoración del paciente',
                    tamaño: 'w-full',
                },
            ],
            containerCampos: 'flex flex-col gap-1'
        })
        .addCampo({
            component: 'GroupCampos',
            labelGroup: 'Intervencion',
            buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'intervencion' } }],
            tamaño: 'w-full col-span-2',
            vmodel: 'Nota.intervencion',
            ocultarEliminar: true,
            value: [],
            campos: [
                {
                    name: 'hora',
                    id: 'hora',
                    typeCampo: 'Input',
                    type: 'time',
                    placeholder: 'Hora del registro',
                    tamaño: 'w-full',
                    label: 'Hora del registro'
                },
                {
                    name: 'descripcion',
                    id: 'descripcion',
                    typeCampo: 'Textarea',
                    placeholder: 'Describa la intervención realizada (procedimiento, cuidado o acción aplicada)',
                    tamaño: 'w-full',
                },
            ],
            containerCampos: 'flex flex-col gap-1'
        })
        .addCampo({
            component: 'GroupCampos',
            labelGroup: 'Evaluacion',
            buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'evaluacion' } }],
            tamaño: 'w-full col-span-2',
            vmodel: 'Nota.evaluacion',
            ocultarEliminar: true,
            value: [],
            campos: [
                {
                    name: 'hora',
                    id: 'hora',
                    typeCampo: 'Input',
                    type: 'time',
                    placeholder: 'Hora del registro',
                    tamaño: 'w-full',
                    label: 'Hora del registro'
                },
                {
                    name: 'descripcion',
                    id: 'descripcion',
                    typeCampo: 'Textarea',
                    placeholder: 'Registre la valoración del paciente (signos, síntomas, estado general)',
                    tamaño: 'w-full',
                },
            ],
            containerCampos: 'flex flex-col gap-1'
        })



    return builder.build()
}