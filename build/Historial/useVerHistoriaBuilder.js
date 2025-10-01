// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useVerHistoriaBuilder({
    storeId,
    storePinia,
    cerrarModal,
    formularioItem,
    show,
}) {
    const builder = new FormularioBuilder()

    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormulariotamaño('XS')
        .setFormularioShow(show)
        .setSoloVer(true)
        .setFormularioTipo('solo')
        .setBotones([
            { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500', type: 'cancelar' },
        ])
    // 📌 Sección: Datos
    if (formularioItem.value === 'Medicamento') {
        builder
            // 📌 Sección: Diagnósticos
            .nuevaSeccion('Medicamento')

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
                tamaño: 'w-full col-span-2',
                minlength: 10
            })

            .addCampo({
                component: 'Label',
                forLabel: 'Medicamento',
                text: '<i class="fa-solid fa-prescription-bottle-medical text-blue-500 mr-1"></i>Medicamento',
                tamaño: 'col-span-2 w-full'
            })

            .addCampo({
                component: 'Input',
                vmodel: 'Plan_manejo_medicamentos.nombre',
                type: 'text',
                id: 'nombre',
                name: 'nombre',
                tamaño: 'w-full',
                minlength: 5
            })
            .addCampo({
                component: 'Input',
                vmodel: 'Plan_manejo_medicamentos.presentacion',
                type: 'text',
                id: 'presetacion',
                name: 'presetacion',
                tamaño: 'w-full',
                minlength: 5
            })
            .addCampo({
                component: 'Input',
                vmodel: 'Plan_manejo_medicamentos.cantidad',
                type: 'text',
                id: 'cantidad',
                name: 'cantidad',
                tamaño: 'w-full',
                minlength: 5
            })
    }
    else if (formularioItem.value === 'Tratamientos') {
        builder
            .nuevaSeccion('Tratamientos')

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
                tamaño: 'w-full col-span-2',
                minlength: 10
            })

            .addCampo({
                component: 'Label',
                forLabel: 'rehabilitacion',
                text: '<i class="fa-solid fa-kit-medical text-blue-500 mr-1"></i>Tratamiento',
                tamaño: 'col-span-2 w-full'
            })

            .addCampo({
                component: 'Input',
                label: 'Descripcion',
                vmodel: 'Plan_manejo_procedimientos.descripcion',
                type: 'text',
                id: 'nombre',
                name: 'nombre',
                tamaño: 'w-full',
                minlength: 5
            })
            .addCampo({
                component: 'Input',
                label: 'Mes',
                vmodel: 'Plan_manejo_procedimientos.mes',
                type: 'text',
                id: 'presetacion',
                name: 'presetacion',
                tamaño: 'w-full',
                minlength: 5
            })
            .addCampo({
                component: 'Input',
                label: 'Cantidad',
                vmodel: 'Plan_manejo_procedimientos.cantidad',
                type: 'text',
                id: 'cantidad',
                name: 'cantidad',
                tamaño: 'w-full',
                minlength: 5
            })

            // --- Select: Condición de rehabilitación ---
            .addCampo({
                component: 'Select',
                vmodel: 'Analisis.tratamiento',
                id: 'rehabilitacion',
                name: 'rehabilitacion',
                placeholder: 'Condición de rehabilitación',
                tamaño: 'w-full col-span-2',
                options: [
                    { text: 'Total o Parcial', value: 'Total o Parcial' },
                    { text: 'Sin potencial de rehabilitación', value: 'Sin potencial de rehabilitacion' },
                    { text: 'Cuidados paliativos o de mantenimiento', value: 'Cuidados paliativos o de mantenimiento' }
                ]
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
                component: 'Input',
                vmodel: 'Analisis.tipoAnalisis',
                id: 'tipoAnalisis',
                name: 'tipoAnalisis',
                tamaño: 'w-full'
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

    }
    else {
        builder
            .nuevaSeccion('No se encontro el Item')
    }


    return builder.build()
}