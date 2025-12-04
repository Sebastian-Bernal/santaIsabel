// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { CUPS } from '~/data/CUPS'
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia'

export function useVerHistoriaBuilder({
    storeId,
    storePinia,
    cerrarModal,
    formularioItem,
    actualizar,
    show,
}) {
    const builder = new FormularioBuilder()
    const historiaStore = useHistoriasStore()
    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormulariotamaño('XS')
        .setFormularioShow(show)
        .setSoloVer(!actualizar.value)
        .setEditarFormulario(actualizar.value)
        .setFormularioTipo('solo')
    if (actualizar.value) {
        builder
            .setBotones([
                { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500', type: 'cancelar' },
                { text: 'Actualizar', color: 'bg-blue-500', type: 'enviar' },
            ])
    } else {
        builder
            .setBotones([
                { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500', type: 'cancelar' },
            ])
    }
    // 📌 Sección: Datos
    if (formularioItem.value === 'Medicamento') {
        builder
            // 📌 Sección: Diagnósticos
            .nuevaSeccion('Medicamento')

        if (!actualizar.value) {
            builder
                // --- Select: Tipo de Análisis ---
                .addCampo({
                    component: 'Select',
                    vmodel: 'Analisis.tipoAnalisis',
                    id: 'rehabilitacion',
                    name: 'rehabilitacion',
                    placeholder: 'Tipo de Análisis',
                    tamaño: 'w-full md:col-span-1 col-span-2',
                    options: [
                        { text: 'Estado clínico sin cambios', value: 'Estado clinico sin cambios' },
                        { text: 'Recomendaciones Adicionales', value: 'Recomendaciones Adicionales' },
                        { text: 'Cambios críticos', value: 'Cambios criticos' },
                        { text: 'Estado inhabilitado', value: '' }
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
                    tamaño: 'w-full md:col-span-1 col-span-2',
                    minlength: 5
                })

                // --- Textarea: Análisis ---
                .addCampo({
                    component: 'Textarea',
                    vmodel: 'Analisis.analisis',
                    id: 'analisis',
                    name: 'analisis',
                    placeholder: 'Análisis',
                    tamaño: 'w-full col-span-2',
                    minlength: 10
                })
        }

        builder
            .addCampo({
                component: 'Label',
                forLabel: 'Medicamento',
                text: '<i class="fa-solid fa-prescription-bottle-medical text-blue-500 mr-1"></i>Medicamento',
                tamaño: 'col-span-2 w-full'
            })

            .addCampo({
                component: 'Input',
                label: 'Medicamento',
                vmodel: 'Plan_manejo_medicamentos.medicamento',
                type: 'text',
                id: 'nombre',
                name: 'nombre',
                tamaño: 'w-full md:col-span-1 col-span-2',
                minlength: 5
            })
            .addCampo({
                component: 'Input',
                label: 'Dosis',
                vmodel: 'Plan_manejo_medicamentos.dosis',
                type: 'text',
                id: 'presetacion',
                name: 'presetacion',
                tamaño: 'w-full md:col-span-1 col-span-2',
                minlength: 2
            })
            .addCampo({
                component: 'Input',
                label: 'Cantidad de dias',
                vmodel: 'Plan_manejo_medicamentos.cantidad',
                type: 'text',
                id: 'cantidad',
                name: 'cantidad',
                tamaño: 'w-full md:col-span-1 col-span-2',
                minlength: 1
            })
    }
    else if (formularioItem.value === 'Tratamientos') {
        builder
            .nuevaSeccion('Tratamientos')

            .addCampo({
                component: 'Label',
                forLabel: 'rehabilitacion',
                text: '<i class="fa-solid fa-kit-medical text-blue-500 mr-1"></i>Tratamiento',
                tamaño: 'col-span-2 w-full'
            })
            .addCampo({
                component: 'SelectSearch',
                name: 'procedimiento',
                id: 'descripcionProcedimiento',
                placeholder: 'Procedimiento',
                tamaño: 'w-full md:col-span-2',
                UpperCase: true,
                options: CUPS,
                opciones: [{ value: 'DESCRIPCION' }, { text: 'Codigo', value: 'CODIGO' }],
                vmodel: 'Plan_manejo_procedimientos.procedimiento',
                seleccionarItem: (item) => {
                    console.log(item)
                    historiaStore.Formulario.Plan_manejo_procedimientos.at(-1).procedimiento = item.DESCRIPCION
                    historiaStore.Formulario.Plan_manejo_procedimientos.at(-1).codigo = item.CODIGO
                },
            })
            .addCampo({
                component: 'Input',
                label: 'Codigo',
                vmodel: 'Plan_manejo_procedimientos.codigo',
                type: 'text',
                id: 'presetacion',
                name: 'presetacion',
                tamaño: 'w-full md:col-span-1 col-span-2',
                minlength: 5
            })
            .addCampo({
                component: 'Input',
                label: 'Dias asignados',
                vmodel: 'Plan_manejo_procedimientos.dias_asignados',
                id: 'rehabilitacion',
                name: 'rehabilitacion',
                placeholder: '0',
                tamaño: 'w-full md:col-span-1 col-span-2',
            })
    }

    else if (formularioItem.value === 'Consulta') {
        builder
            .nuevaSeccion('Consulta')

            .addCampo({
                component: 'Label',
                forLabel: 'nombre',
                size: 'text-sm',
                tamaño: 'w-full col-span-2',
                text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente'
            })
            // --- Nombre Paciente ---
            .addCampo({
                component: 'Input',
                vmodel: 'HistoriaClinica.name_paciente',
                id: 'nombre',
                name: 'nombre',
                placeholder: 'Nombre del paciente',
                tamaño: 'w-full col-span-2'
            })

            // --- Numero de documento ---


            // --- Label Acompañante ---
            // .addCampo({
            //     component: 'Label',
            //     forLabel: 'tipo',
            //     size: 'text-sm',
            //     text: '<i class="fa-solid fa-users text-blue-700 mr-1"></i>Acompañante (Opcional)',
            //     tamaño: 'w-full col-span-2'
            // })

            // // --- Nombre Acompañante ---
            // .addCampo({
            //     component: 'Input',
            //     vmodel: 'Analisis.acompañante',
            //     type: 'text',
            //     id: 'nombreAcompañante',
            //     name: 'nombreAcompañante',
            //     placeholder: 'Nombre completo del acompañante',
            //     tamaño: 'w-full'
            // })

            // --- Parentesco Acompañante ---
            // .addCampo({
            //     component: 'Select',
            //     vmodel: 'Analisis.acompañante',
            //     id: 'parentesco',
            //     name: 'parentesco',
            //     placeholder: 'Seleccione el parentesco',
            //     tamaño: 'w-full',
            //     options: [
            //         { text: 'Padre', value: 'Padre' },
            //         { text: 'Madre', value: 'Madre' },
            //         { text: 'Hijo', value: 'Hijo' },
            //         { text: 'Conyuge', value: 'Conyuge' },
            //         { text: 'Hermano/a', value: 'Hermano/a' }
            //     ]
            // })

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
                text: '<i class="fa-solid fa-clock text-red-300 mr-1"></i>Observacion'
            })
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.observacion',
                id: 'observacion',
                name: 'observacion',
                tamaño: 'w-full'
            })
            .addCampo({
                component: 'Select',
                vmodel: 'Analisis.tipoAnalisis',
                id: 'tipoAnalisis',
                name: 'tipoAnalisis',
                tamaño: 'w-full',
                placeholder: 'Estado inhabilitado',
                options: [
                    { text: 'Estado clínico sin cambios', value: 'Estado clinico sin cambios' },
                    { text: 'Recomendaciones Adicionales', value: 'Recomendaciones Adicionales' },
                    { text: 'Cambios críticos', value: 'Cambios criticos' },
                    { text: 'Estado inhabilitado', value: '' }
                ]
            })

            .addCampo({
                component: 'Label',
                forLabel: 'motivo',
                text: '<i class="fa-solid fa-heart-pulse text-blue-500 mr-1"></i>Signos Vitales',
                tamaño: 'w-full col-span-2'
            })

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
            })

            // --- Label: Medidas Antropométricas ---
            .addCampo({
                component: 'Label',
                forLabel: 'peso',
                text: '<i class="fa-solid fa-weight-hanging text-blue-600 mr-1"></i>Medidas Antropométricas',
                tamaño: 'w-full col-span-2'
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
                vmodel: 'ExamenFisico.peso',
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

    }
    else {
        builder
            .nuevaSeccion('No se encontro el Item')
    }


    return builder.build()
}