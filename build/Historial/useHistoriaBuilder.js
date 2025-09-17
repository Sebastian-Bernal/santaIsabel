// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/ClassFormulario'

export function useHistoriaBuilder({
    storeId,
    storePinia,
    cerrarModal,
    tipoFormulario,
    PacientesList,
    seleccionarPaciente,
    CIE10,
    seleccionarCIE_10,
    validarCampo,
    show,
    pacienteExiste,
    id_paciente
}) {
    const builder = new FormularioBuilder()

    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        // .setCamposRequeridos(['InformacionUser.No_document', 'InformacionUser.name', 'Paciente.Regimen', 'Paciente.genero', 'Paciente.poblacionVulnerable', 'Paciente.sexo'])
        .setFormulariotamaño('LG')
        .setFormularioTituloFormulario('Registrar Consulta')
        .setFormularioShow(show)
        .setFormularioTipo(tipoFormulario)
        .setBotones([
            { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500', type: 'cerrar' },
            { text: 'Siguiente', color: 'bg-blue-500', type: 'enviar' },
        ])
        // 📌 Sección: Datos
        .nuevaSeccion('Datos usuarios')
        .addCampo({
            component: 'Label',
            forLabel: 'nombre',
            size: 'text-sm',
            tamaño: 'w-full md:col-span-2',
            text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente'
        })
        // --- Nombre Paciente ---
        .addCampo({
            component: 'SelectSearch',
            vmodel: 'HistoriaClinica.name_paciente',
            id: 'nombre',
            name: 'nombre',
            placeholder: 'Nombre del paciente',
            options: PacientesList,
            seleccionarItem: seleccionarPaciente,
            opciones: [
                { value: 'name' },
                { text: 'Cedula', value: 'No_document' }
            ],
            tamaño: 'w-full',
            events: {
                onChange: pacienteExiste
            },
        })

        // --- Numero de documento ---
        .addCampo({
            component: 'SelectSearch',
            vmodel: 'HistoriaClinica.No_document_paciente',
            id: 'documento',
            name: 'documento',
            placeholder: 'Numero de documento',
            options: 'PacientesList',
            seleccionarItem: 'seleccionarPaciente',
            opciones: [{ value: 'No_document' }],
            tamaño: 'w-full'
        })

        // --- Tipo de documento ---
        .addCampo({
            component: 'Select',
            vmodel: 'HistoriaClinica.type_doc_paciente',
            id: 'tipoDocumento',
            name: 'tipoDocumento',
            placeholder: 'Tipo de documento',
            tamaño: 'w-full',
            options: [
                { text: 'Cedula de ciudadania', value: 'cedula' },
                { text: 'Cedula Extranjera', value: 'extranjera' },
                { text: 'Tarjeta de Identidad', value: 'TarjetaIdentidad' }
            ],
        })

        // --- Label Acompañante ---
        .addCampo({
            component: 'Label',
            forLabel: 'tipo',
            size: 'text-sm',
            text: '<i class="fa-solid fa-users text-blue-700 mr-1"></i>Acompañante (Opcional)',
            tamaño: 'w-full md:col-span-2'
        })

        // --- Nombre Acompañante ---
        .addCampo({
            component: 'Input',
            vmodel: 'Analisis.acompañante',
            type: 'text',
            id: 'nombreAcompañante',
            name: 'nombreAcompañante',
            placeholder: 'Nombre completo del acompañante',
            tamaño: 'w-full'
        })

        // --- Parentesco Acompañante ---
        .addCampo({
            component: 'Select',
            vmodel: 'Analisis.acompañante',
            id: 'parentesco',
            name: 'parentesco',
            placeholder: 'Seleccione el parentesco',
            tamaño: 'w-full',
            options: [
                { text: 'Padre', value: 'Padre' },
                { text: 'Madre', value: 'Madre' },
                { text: 'Hijo', value: 'Hijo' },
                { text: 'Conyuge', value: 'Conyuge' },
                { text: 'Hermano/a', value: 'Hermano/a' }
            ]
        })

        .nuevaSeccion('Consulta')
        .addCampo({
            component: 'Label',
            forLabel: 'motivo',
            size: 'text-sm',
            tamaño: 'w-full col-span-2',
            text: '<i class="fa-solid fa-comment text-blue-500 mr-1"></i>Consulta'
        })
        .addCampo({
            component: 'Textarea',
            vmodel: 'Analisis.motivo',
            id: 'motivo',
            name: 'motivo',
            placeholder: 'Describa el motivo principal de la consulta...',
            tamaño: 'w-full col-span-2'
        })
        .addCampo({
            component: 'Label',
            forLabel: 'enfermedad',
            size: 'text-sm',
            tamaño: 'w-full col-span-2',
            text: '<i class="fa-solid fa-clock text-red-300 mr-1"></i>Enfermedad Actual'
        })
        .addCampo({
            component: 'Textarea',
            vmodel: 'Enfermedad.valor',
            id: 'enfermedad',
            name: 'enfermedad',
            placeholder: 'Describa la evolucion de la enfermedad actual, sintomas, duracion, factores, desencadenantes...',
            tamaño: 'w-full col-span-2'
        })
        .addCampo({
            component: 'GroupCampos',
            type: 'Input',
            labelGroup: 'Antecedentes',
            buttons: [
                { icon: 'fa-solid fa-plus', color: 'bg-blue-500', label: 'Personal', addItem: { descripcion: '', tipo: 'Personal' } },
                { icon: 'fa-solid fa-plus', color: 'bg-blue-700', label: 'Familiar', addItem: { descripcion: '', tipo: 'Familiar' } },
            ],
            tamaño: 'w-full col-span-2',
            vmodel: 'Antecedentes',
            value: [],
            campos: [
                { name: 'descripcion', id: 'antecedente', type: 'Input', placeholder: 'Antecedente', tamaño: 'w-full' },
            ],
            containerCampos: 'w-full'
        })
        .nuevaSeccion('Examen Fisico')
        .addCampo({
            component: 'Label',
            forLabel: 'motivo',
            text: '<i class="fa-solid fa-heart-pulse text-blue-500 mr-1"></i>Signos Vitales',
            tamaño: 'w-full md:col-span-2'
        })

        // --- Input: TA ---
        .addCampo({
            component: 'Input',
            vmodel: 'ExamenFisico.signosVitales.ta',
            type: 'text',
            id: 'ta',
            name: 'ta',
            placeholder: 'TA',
            tamaño: 'w-full',
            slot: {
                tooltip: `<div id="error-ta" class="text-red-300 text-xs mt-1"></div>`
            },
            events: {
                onChange: validarCampo
            },
        })

        // --- Input: FC ---
        .addCampo({
            component: 'Input',
            vmodel: 'ExamenFisico.signosVitales.fc',
            type: 'number',
            id: 'fc',
            name: 'fc',
            placeholder: 'FC',
            max: 100,
            tamaño: 'w-full',
            slot: {
                tooltip: `<div id="error-fc" class="text-red-300 text-xs mt-1"></div>`
            },
            events: {
                onChange: validarCampo
            }
        })

        // --- Input: FR ---
        .addCampo({
            component: 'Input',
            vmodel: 'ExamenFisico.signosVitales.fr',
            type: 'number',
            id: 'fr',
            name: 'fr',
            placeholder: 'FR',
            max: 250,
            tamaño: 'w-full',
            slot: {
                tooltip: `<div id="error-fr" class="text-red-300 text-xs mt-1"></div>`
            },
            events: {
                onChange: validarCampo
            }
        })

        // --- Input: Temperatura (Tº) ---
        .addCampo({
            component: 'Input',
            vmodel: 'ExamenFisico.signosVitales.t',
            type: 'number',
            id: 't',
            name: 't',
            placeholder: 'Tº',
            max: 50,
            tamaño: 'w-full',
            slot: {
                tooltip: `<div id="error-t" class="text-red-300 text-xs mt-1"></div>`
            },
            events: {
                onChange: validarCampo
            }
        })

        .addCampo({
            component: 'Label',
            text: `
                    <div class="w-full flex md:flex-row flex-col justify-between gap-3 items-center text-orange-400 dark:text-orange-50">
                        <span class="text-sm font-semibold">TA : 90-140/60-90 mmHg</span>
                        <span class="text-sm font-semibold">FC : 60-100 lpm</span>
                        <span class="text-sm font-semibold">FR : 12-20 rpm</span>
                        <span class="text-sm font-semibold">Tº : 36.1-37.2°C</span>
                        <span class="text-sm font-semibold">SAT o2 : 90% - 100%</span>
                    </div>
                `,
            tamaño: 'md:col-span-2 bg-orange-50 dark:bg-orange-900 p-5'
        })

        // --- Input: Otros ---
        .addCampo({
            component: 'Input',
            vmodel: 'ExamenFisico.otros',
            type: 'text',
            id: 'otros',
            name: 'otros',
            placeholder: 'Otros (opcional)',
            tamaño: 'w-full col-span-1'
        })

        // --- Input: Peso ---
        .addCampo({
            component: 'Input',
            vmodel: 'ExamenFisico.Peso',
            type: 'number',
            id: 'peso',
            name: 'peso',
            placeholder: 'Peso (KG)',
            tamaño: 'w-full col-span-1'
        })

        // --- Input: Altura ---
        .addCampo({
            component: 'Input',
            vmodel: 'ExamenFisico.altura',
            type: 'number',
            id: 'altura',
            name: 'altura',
            placeholder: 'Altura (CM)',
            tamaño: 'w-full col-span-1'
        })

        // --- Label: Medidas Antropométricas ---
        .addCampo({
            component: 'Label',
            forLabel: 'peso',
            text: '<i class="fa-solid fa-weight-hanging text-blue-600 mr-1"></i>Medidas Antropométricas',
            tamaño: 'w-full md:col-span-2'
        })


        // --- Input: Saturación O2 ---
        .addCampo({
            component: 'Input',
            vmodel: 'ExamenFisico.signosVitales.SATo2',
            type: 'number',
            id: 'sat',
            name: 'sat',
            placeholder: 'Sat O2',
            max: 100,
            tamaño: 'w-full col-span-1',
            slot: {
                tooltip: `<div id="error-sat" class="text-red-300 text-xs mt-1"></div>`
            },
            events: {
                onChange: validarCampo
            }
        })

        .nuevaSeccion('Analisis')
        // 📌 Sección: Diagnósticos

        .addCampo({
            component: 'GroupCampos',
            labelGroup: 'Diagnosticos',
            buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', codigoCIE10: '', id_paciente: '' } }],
            tamaño: 'w-full md:col-span-2',
            vmodel: 'Diagnosticos',
            value: [],
            campos: [
                {
                    name: 'descripcion',
                    id: 'cie-10',
                    type: 'SelectSearch',
                    placeholder: 'CIE-10',
                    tamaño: 'w-full',
                    options: CIE10,
                    opciones: [{ value: 'description' }, { text: 'Codigo', value: 'code' }],
                    seleccionarItem: seleccionarCIE_10,
                },

            ]
        })

        // --- Select: Tipo de Análisis ---
        .addCampo({
            component: 'Select',
            vmodel: 'Analisis.tipoAnalisis',
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

        // --- Input: Observación ---
        .addCampo({
            component: 'Input',
            vmodel: 'Analisis.observacion',
            type: 'text',
            id: 'observacion',
            name: 'observacion',
            placeholder: 'Observación',
            tamaño: 'w-full',
            minlength: 5
        })

        // --- Textarea: Análisis ---
        .addCampo({
            component: 'Textarea',
            vmodel: 'Analisis.analisis',
            id: 'analisis',
            name: 'analisis',
            placeholder: 'Análisis',
            tamaño: 'w-full md:col-span-2',
            minlength: 10
        })

        // --- Label: Tratamiento ---
        .addCampo({
            component: 'Label',
            forLabel: 'rehabilitacion',
            text: '<i class="fa-solid fa-notes-medical text-blue-500 mr-1"></i>Tratamiento'
        })

        // --- Botones: Medicinas, Servicios, Insumos, Equipos ---

        .addCampo({
            component: 'GroupCampos',
            labelGroup: 'Equipos (opcional)',
            buttons: [{ icon: 'fa-solid fa-stethoscope', label: 'Agregar', color: 'bg-blue-700', addItem: { descripcion: '', cantidad: '', id_paciente: id_paciente }}, ],
            tamaño: 'w-full md:col-span-2',
            vmodel: 'Plan_manejo_equipos',
            value: [],
            campos: [
                {
                    name: 'descripcion',
                    id: 'descripcionEquipo',
                    type: 'Input',
                    placeholder: 'Descripcion',
                    tamaño: 'w-full',
                },
                {
                    name: 'cantidad',
                    id: 'cantidadEquipos',
                    type: 'Input',
                    placeholder: 'Cantidad',
                    tamaño: 'w-full',
                },
            ],
            containerCampos: 'grid grid-cols-2 gap-2'
        })

        .addCampo({
            component: 'GroupCampos',
            labelGroup: 'Insumos (opcional)',
            buttons: [{ icon: 'fa-solid fa-syringe', label: 'Agregar', color: 'bg-green-700', addItem: { descripcion: '', cantidad: '', id_paciente: id_paciente }}, ],
            tamaño: 'w-full md:col-span-2',
            vmodel: 'Plan_manejo_insumos',
            value: [],
            campos: [
                {
                    name: 'descripcion',
                    id: 'descripcionInsumo',
                    type: 'Input',
                    placeholder: 'Descripcion',
                    tamaño: 'w-full',
                },
                {
                    name: 'cantidad',
                    id: 'cantidadInsumo',
                    type: 'Input',
                    placeholder: 'Cantidad',
                    tamaño: 'w-full',
                },
            ],
            containerCampos: 'grid grid-cols-2 gap-2'
        })

        .addCampo({
            component: 'GroupCampos',
            labelGroup: 'Medicamentos (opcional)',
            buttons: [{ icon: 'fa-solid fa-capsules', label: 'Agregar', color: 'bg-blue-500', addItem: { nombre: '', presentacion: '', cantidad: '',  id_paciente: id_paciente }}, ],
            tamaño: 'w-full md:col-span-2',
            vmodel: 'Plan_manejo_medicamentos',
            value: [],
            campos: [
                {
                    name: 'nombre',
                    id: 'Medicamento',
                    type: 'Input',
                    placeholder: 'Medicamento',
                    tamaño: 'w-full',
                },
                {
                    name: 'presentacion',
                    id: 'presentacion',
                    type: 'Input',
                    placeholder: 'Presentacion',
                    tamaño: 'w-full',
                },
                {
                    name: 'cantidad',
                    id: 'cantidad',
                    type: 'Input',
                    placeholder: 'Cantidad',
                    tamaño: 'w-full',
                },
            ],
            containerCampos: 'grid grid-cols-3 gap-2'
        })

        .addCampo({
            component: 'GroupCampos',
            labelGroup: 'Procedimientos (opcional)',
            buttons: [{ icon: 'fa-solid fa-kit-medical', label: 'Agregar', color: 'bg-green-500', addItem: { descripcion: '', cantidad: '', mes: '',  id_paciente: id_paciente }}, ],
            tamaño: 'w-full md:col-span-2 mt-5',
            vmodel: 'Plan_manejo_procedimientos',
            value: [],
            campos: [
                {
                    name: 'descripcion',
                    id: 'descripcionProcedimiento',
                    type: 'Input',
                    placeholder: 'Descripcion',
                    tamaño: 'w-full',
                },
                {
                    name: 'cantidad',
                    id: 'cantidad',
                    type: 'Input',
                    placeholder: 'Cantidad',
                    tamaño: 'w-full',
                },
                {
                    name: 'mes',
                    id: 'mes',
                    type: 'Input',
                    placeholder: 'Mes',
                    tamaño: 'w-full',
                },
            ],
            containerCampos: 'grid grid-cols-3 gap-2'
        })

        // --- Select: Condición de rehabilitación ---
        .addCampo({
            component: 'Select',
            vmodel: 'Analisis.tratamiento',
            id: 'rehabilitacion',
            name: 'rehabilitacion',
            placeholder: 'Condición de rehabilitación',
            tamaño: 'w-full md:col-span-2',
            options: [
                { text: 'Total o Parcial', value: 'Total o Parcial' },
                { text: 'Sin potencial de rehabilitación', value: 'Sin potencial de rehabilitacion' },
                { text: 'Cuidados paliativos o de mantenimiento', value: 'Cuidados paliativos o de mantenimiento' }
            ]
        })
    return builder.build()
}