// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { CUPS } from '~/data/CUPS'
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente'
import { CIE10 } from '~/data/CIE10'
import { onMounted, ref } from 'vue'
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales'

export function useHistoriaBuilder({
    storeId,
    storePinia,
    cerrarModal,
    show,
}) {

    const historiaStore = useHistoriasStore()
    const notificaciones = useNotificacionesStore()
    const pacienteStore = usePacientesStore()
    const medicoStore = useMedicosStore()
    const varView = useVarView()

    const PacientesList = ref([])
    const MedicosList = ref([])
    const id_paciente = ref(null)
    const puedePostAnalisis = ref(varView.getPermisos.includes('Diagnosticos_view'))

    onMounted(() => {
        varView.cargando = true
        PacientesList.value = pacienteStore.Pacientes;
        MedicosList.value = medicoStore.Medicos;
        varView.cargando = false
    });

    function seleccionarPaciente(paciente) {
        historiaStore.Formulario.HistoriaClinica.type_doc_paciente = paciente.type_doc
        historiaStore.Formulario.HistoriaClinica.No_document_paciente = paciente.No_document
        historiaStore.Formulario.HistoriaClinica.id_paciente = paciente.id_paciente
        id_paciente.value = paciente.id_paciente
    }

    function seleccionarCIE_10(code) {
        historiaStore.Formulario.Diagnosticos.at(-1).descripcion = code.description
        historiaStore.Formulario.Diagnosticos.at(-1).codigo = code.code
    }

    function validarCampo(event) {
        const { name, value } = event.target;
        let mensajeError = '';

        switch (name) {
            case 'ta': // Presión arterial (TA)
                // Se espera formato tipo "120/80"
                if (!/^\d{2,3}\/\d{2,3}$/.test(value)) {
                    mensajeError = 'TA debe tener el formato "120/80"';
                }
                break;

            case 'fc': // Frecuencia cardíaca
                const fc = parseInt(value);
                if (isNaN(fc) || fc < 30 || fc > 100) {
                    mensajeError = 'FC debe estar entre 30 y 100';
                }
                break;

            case 'fr': // Frecuencia respiratoria
                const fr = parseInt(value);
                if (isNaN(fr) || fr < 10 || fr > 250) {
                    mensajeError = 'FR debe estar entre 10 y 250';
                }
                break;

            case 't': // Temperatura
                const t = parseFloat(value);
                if (isNaN(t) || t < 30 || t > 45) {
                    mensajeError = 'Temperatura debe estar entre 30º y 45º';
                }
                break;

            case 'sat': // Saturación de oxígeno
                const sat = parseInt(value);
                if (isNaN(sat) || sat < 70 || sat > 100) {
                    mensajeError = 'Sat O2 debe estar entre 70% y 100%';
                }
                break;

            default:
                console.warn(`No hay validación definida para el campo: ${name}`);
        }

        const errorDiv = document.getElementById(`error-${name}`);
        if (errorDiv) {
            if (mensajeError) {
                errorDiv.innerHTML = `<p>${mensajeError}</p>`;
            } else {
                errorDiv.innerHTML = ''; // Limpia el mensaje si no hay error
            }
        }
    }

    async function pacienteExiste(event) {
        const nombre = event.target.value

        const paciente = PacientesList.value.filter((pacient) => {
            return pacient.name === nombre
        });

        if (paciente.length < 1) {
            notificaciones.options.icono = 'warning'
            notificaciones.options.title = 'Paciente no registrado'
            notificaciones.options.html = '¿Deseas registrar <strong>Paciente</strong>?'
            notificaciones.options.confirmtext = 'Si'
            notificaciones.options.canceltext = 'No, continuar'
            let resp = await notificaciones.alertRespuesta();
            if (resp === 'confirmado') {
                varView.showNuevoPaciente = true
            }
        }
    }

    const builder = new FormularioBuilder()

    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormulariotamaño('LG')
        .setFormularioTituloFormulario('Registrar Consulta')
        .setFormularioShow(show)
        .setFormularioTipo('Wizard')
        .setBotones([
            { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500', type: 'cerrar' },
            { text: 'Siguiente', color: 'bg-blue-500', type: 'enviar' },
        ])

    // Tipo terapia
    if (varView.tipoConsulta?.plantilla === 'Terapia') {
        builder
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
                tamaño: 'w-full md:col-span-2',
                options: [
                    { text: 'Cedula de ciudadania', value: 'cedula' },
                    { text: 'Cedula Extranjera', value: 'extranjera' },
                    { text: 'Tarjeta de Identidad', value: 'Tarjeta de identidad' }
                ],
            })
            // --- Label: Sesión ---
            .addCampo({
                component: 'Label',
                forLabel: 'sesion',
                text: '<i class="fa-solid fa-list-ol text-blue-500 mr-1"></i>Número de sesión',
                tamaño: 'w-full'
            })

            // --- Input: Sesión ---
            .addCampo({
                component: 'Input',
                vmodel: 'Terapia.sesion',
                type: 'number',
                id: 'sesion',
                name: 'sesion',
                placeholder: 'Ej: 1, 2, 3...',
                tamaño: 'w-full',
            })

            //--- Label: Fecha ---
            .addCampo({
                component: 'Label',
                forLabel: 'fechaTerapia',
                text: '<i class="fa-solid fa-calendar-day text-blue-500 mr-1"></i>Fecha de la sesión',
                tamaño: 'w-full md:col-span-2'
            })

            // --- Input: Hora ---
            .addCampo({
                component: 'Input',
                vmodel: 'Terapia.hora',
                type: 'time',
                id: 'horaTerapia',
                name: 'horaTerapia',
                placeholder: 'Selecciona la hora',
                tamaño: 'w-full',
            })

            // --- Input: Fecha ---
            .addCampo({
                component: 'Input',
                vmodel: 'Terapia.fecha',
                type: 'date',
                id: 'fechaTerapia',
                name: 'fechaTerapia',
                placeholder: 'Selecciona la fecha',
                tamaño: 'w-full',
            })


            .nuevaSeccion(varView.tipoConsulta.name)

            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Diagnosticos',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', codigo: '', id_paciente: id_paciente } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Diagnosticos',
                value: [],
                campos: [
                    {
                        name: 'descripcion',
                        id: 'descripcion',
                        typeCampo: 'SelectSearch',
                        placeholder: 'Diagnostico',
                        tamaño: 'w-full md:col-span-1 col-span-2',
                        options: CIE10,
                        opciones: [{ value: 'description' }, { text: 'Codigo', value: 'code' }],
                        seleccionarItem: seleccionarCIE_10,
                    },
                    {
                        name: 'codigo',
                        id: 'cie-10',
                        typeCampo: 'SelectSearch',
                        placeholder: 'CIE-10',
                        tamaño: 'w-full md:col-span-1 col-span-2',
                        options: CIE10,
                        opciones: [{ value: 'description' }, { text: 'Codigo', value: 'code' }],
                        seleccionarItem: seleccionarCIE_10,
                    },
                ],
                containerCampos: 'grid grid-cols-2 gap-1'
            })

            // --- Label: Objetivos ---
            .addCampo({
                component: 'Label',
                forLabel: 'objetivos',
                text: '<i class="fa-solid fa-bullseye text-blue-500 mr-1"></i>Objetivos de la intervención terapéutica',
                tamaño: 'w-full col-span-2 mt-3'
            })
            
            // --- Input: Objetivos ---
            .addCampo({
                component: 'Input',
                vmodel: 'Terapia.objetivos',
                type: 'text',
                id: 'objetivos',
                name: 'objetivos',
                placeholder: 'Describe el objetivo de la sesión terapéutica',
                tamaño: 'w-full col-span-2',
            })
            
            // --- Label: Evolución ---
            .addCampo({
                component: 'Label',
                forLabel: 'evolucion',
                text: '<i class="fa-solid fa-notes-medical text-blue-500 mr-1"></i>Evolución de la sesión',
                tamaño: 'w-full col-span-2'
            })

            // --- TextArea: Evolución ---
            .addCampo({
                component: 'Textarea',
                vmodel: 'Terapia.evolucion',
                id: 'evolucion',
                name: 'evolucion',
                placeholder: 'Describe de manera clara la evolución del paciente durante la sesión',
                tamaño: 'w-full col-span-2'
            })

    } else if (varView.tipoConsulta?.plantilla === 'Evolucion') {
        builder
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
                    { text: 'Tarjeta de Identidad', value: 'Tarjeta de identidad' }
                ],
            })

            // --- Label Acompañante ---
            .addCampo({
                component: 'Label',
                forLabel: 'nombreAcompañante',
                size: 'text-sm',
                text: '<i class="fa-solid fa-users text-blue-700 mr-1"></i>Cuidador (Opcional)',
                tamaño: 'w-full md:col-span-2'
            })

            // --- Nombre Acompañante ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.acompañante',
                type: 'text',
                id: 'nombreAcompañante',
                name: 'nombreAcompañante',
                placeholder: 'Nombre completo del cuidador',
                tamaño: 'w-full'
            })

            // --- Parentesco Acompañante ---
            .addCampo({
                component: 'Select',
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

            .nuevaSeccion(varView.tipoConsulta.name)
            // --- Diagnosticos ---
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Diagnosticos',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', codigo: '', id_paciente: id_paciente } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Diagnosticos',
                value: [],
                campos: [
                    {
                        name: 'descripcion',
                        id: 'cie-10',
                        typeCampo: 'SelectSearch',
                        placeholder: 'CIE-10',
                        tamaño: 'w-full md:col-span-2',
                        options: CIE10,
                        opciones: [{ value: 'description' }, { text: 'Codigo', value: 'code' }],
                        seleccionarItem: seleccionarCIE_10,
                    },

                ]
            })

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

            // --- Label: Evolución ---
            .addCampo({
                component: 'Label',
                forLabel: 'evolucion',
                text: '<i class="fa-solid fa-notes-medical text-blue-500 mr-1"></i>Recomendaciones',
                tamaño: 'w-full md:col-span-2'
            })

            // --- TextArea: Evolución ---
            .addCampo({
                component: 'Textarea',
                vmodel: 'Analisis.analisis',
                id: 'evolucionNutricional',
                name: 'evolucionNutricional',
                placeholder: 'Describe de manera clara la evolución del paciente durante la sesión',
                tamaño: 'w-full md:col-span-2'
            })

    } else if (varView.tipoConsulta?.plantilla === 'Trabajo Social') {
        builder
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
                    { text: 'Tarjeta de Identidad', value: 'Tarjeta de identidad' }
                ],
            })

            // --- Label Acompañante ---
            .addCampo({
                component: 'Label',
                forLabel: 'nombreAcompañante',
                size: 'text-sm',
                text: '<i class="fa-solid fa-users text-blue-700 mr-1"></i>Cuidador (Opcional)',
                tamaño: 'w-full md:col-span-2'
            })

            // --- Nombre Acompañante ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.acompañante',
                type: 'text',
                id: 'nombreAcompañante',
                name: 'nombreAcompañante',
                placeholder: 'Nombre completo del cuidador',
                tamaño: 'w-full'
            })

            // --- Parentesco Acompañante ---
            .addCampo({
                component: 'Select',
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

            .nuevaSeccion(varView.tipoConsulta.name)
            // --- Diagnosticos ---
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Diagnosticos',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', codigo: '', id_paciente: id_paciente } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Diagnosticos',
                value: [],
                campos: [
                    {
                        name: 'descripcion',
                        id: 'cie-10',
                        typeCampo: 'SelectSearch',
                        placeholder: 'CIE-10',
                        tamaño: 'w-full md:col-span-2',
                        options: CIE10,
                        opciones: [{ value: 'description' }, { text: 'Codigo', value: 'code' }],
                        seleccionarItem: seleccionarCIE_10,
                    },

                ]
            })

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

            // --- Label: Tratamiento ---
            .addCampo({
                component: 'Label',
                forLabel: 'rehabilitacion',
                text: '<i class="fa-solid fa-notes-medical text-blue-500 mr-1"></i>Analisis y Tratamiento',
                tamaño: 'w-full col-span-2',
            })

            // --- Select: Tipo de Análisis ---
            .addCampo({
                component: 'Select',
                vmodel: 'Analisis.tipoAnalisis',
                id: 'tipoAnalisis',
                name: 'tipoAnalisis',
                placeholder: 'Tipo de Análisis',
                tamaño: 'w-full md:col-span-1 col-span-2',
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

            // --- Botones: Medicinas, Servicios, Insumos, Equipos ---

            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Equipos (opcional)',
                buttons: [{ icon: 'fa-solid fa-stethoscope', label: 'Agregar', color: 'bg-blue-700', addItem: { descripcion: '', uso: '', id_paciente: id_paciente } },],
                tamaño: 'w-full md:col-span-2',
                vmodel: 'Plan_manejo_equipos',
                value: [],
                campos: [
                    {
                        name: 'descripcion',
                        id: 'descripcionEquipo',
                        typeCampo: 'Input',
                        placeholder: 'Descripcion',
                        tamaño: 'w-full',
                    },
                    {
                        name: 'uso',
                        id: 'usoEquipos',
                        typeCampo: 'Input',
                        placeholder: 'Uso',
                        tamaño: 'w-full',
                    },
                ],
                containerCampos: 'grid grid-cols-2 gap-2'
            })

            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Insumos (opcional)',
                buttons: [{ icon: 'fa-solid fa-syringe', label: 'Agregar', color: 'bg-green-700', addItem: { nombre: '', cantidad: '', id_paciente: id_paciente } },],
                tamaño: 'w-full md:col-span-2',
                vmodel: 'Plan_manejo_insumos',
                value: [],
                campos: [
                    {
                        name: 'nombre',
                        id: 'nombreInsumo',
                        typeCampo: 'Input',
                        placeholder: 'Nombre',
                        tamaño: 'w-full',
                    },
                    {
                        name: 'cantidad',
                        id: 'cantidadInsumo',
                        typeCampo: 'Input',
                        type: 'number',
                        placeholder: 'Cantidad (número)',
                        tamaño: 'w-full',
                    },
                ],
                containerCampos: 'grid grid-cols-2 gap-2'
            })

            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Medicamentos (opcional)',
                buttons: [{ icon: 'fa-solid fa-capsules', label: 'Agregar', color: 'bg-blue-500', addItem: { medicamento: '', dosis: '', cantidad: '', id_paciente: id_paciente } },],
                tamaño: 'w-full md:col-span-2',
                vmodel: 'Plan_manejo_medicamentos',
                value: [],
                campos: [
                    {
                        name: 'medicamento',
                        id: 'Medicamento',
                        typeCampo: 'Input',
                        placeholder: 'Medicamento',
                        tamaño: 'w-full',
                    },
                    {
                        name: 'dosis',
                        id: 'dosis',
                        typeCampo: 'Input',
                        placeholder: 'Dosis',
                        tamaño: 'w-full',
                    },
                    {
                        name: 'cantidad',
                        id: 'cantidad',
                        typeCampo: 'Input',
                        placeholder: 'Cantidad de dias (número)',
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

            .addCampo({
                component: 'Label',
                forLabel: '',
                text: '<i class="fa-solid fa-file-medical text-purple-500 mr-1"></i>Plan de Manejo',
                tamaño: 'w-full col-span-2',
            })

    } else if (varView.tipoConsulta?.plantilla === 'Nota') {
        builder
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
                    { text: 'Tarjeta de Identidad', value: 'Tarjeta de identidad' }
                ],
            })

            .nuevaSeccion(varView.tipoConsulta.name)
            // --- Label: Sesión ---
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
                icon: 'fa-solid fa-comment text-blue-500',
                text: '<i class="fa-solid fa-file text-blue-500 mr-1"></i>Diagnosticos',
                forLabel: 'departamento',
                tamaño: 'md:col-span-2 w-full'
            })
            .addCampo({
                component: 'Textarea',
                vmodel: 'Nota.nota',
                id: 'nota',
                name: 'nota',
                placeholder: 'Escriba aqui las observaciones de la atención, Subjetivo, Objetivo, Actividades, Plan, Intervencion, Evaluacion...',
                tamaño: 'w-full md:col-span-2',
            })
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-note-sticky text-blue-500 mr-1"></i>Nota de enfermeria',
                forLabel: 'tipo',
                tamaño: 'md:col-span-2 w-full'
            })
    } else if (varView.tipoConsulta?.plantilla === 'Medicina'){
        builder
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
                    { text: 'Tarjeta de Identidad', value: 'Tarjeta de identidad' }
                ],
            })

            // --- Label Acompañante ---
            .addCampo({
                component: 'Label',
                forLabel: 'nombreAcompañante',
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
                    { name: 'descripcion', id: 'antecedente', typeCampo: 'Input', placeholder: 'Antecedente', tamaño: 'w-full' },
                ],
                containerCampos: 'w-full'
            })
            .addCampo({
                component: 'GroupCampos',
                type: 'Input',
                labelGroup: 'Antecedentes Registrados',
                tamaño: 'w-full col-span-2',
                vmodel: 'AntecedentesRegistrados',
                value: [],
                disabledCampo: true,
                campos: [
                    { name: 'descripcion', id: 'antecedente', typeCampo: 'Input', placeholder: 'Antecedente', tamaño: 'w-full' },
                    { name: 'tipo', id: 'tipo', typeCampo: 'Input', placeholder: 'Tipo', tamaño: 'w-full' },
                ],
                containerCampos: 'grid grid-cols-2 gap-2'
            })
        if (!puedePostAnalisis.value) {
            builder
                .addCampo({
                    component: 'Input',
                    vmodel: 'Analisis.observacion',
                    type: 'text',
                    id: 'observacion',
                    name: 'observacion',
                    placeholder: 'Observación',
                    tamaño: 'w-full col-span-2',
                    minlength: 5
                })
        }

        builder
            .nuevaSeccion('Examen Fisico')
            .addCampo({
                component: 'Label',
                forLabel: 'ta',
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
                placeholder: 'TA (90-140/60-90 mmHg)',
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
                placeholder: 'FC (60-100 lpm)',
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
                placeholder: 'FR (12-20 rpm)',
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
                placeholder: 'Tº (36.1-37.2°C)',
                max: 50,
                tamaño: 'w-full',
                slot: {
                    tooltip: `<div id="error-t" class="text-red-300 text-xs mt-1"></div>`
                },
                events: {
                    onChange: validarCampo
                }
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

            // --- Label: Medidas Antropométricas ---
            .addCampo({
                component: 'Label',
                forLabel: 'altura',
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
                placeholder: 'Sat O2 (90% - 100%)',
                max: 100,
                tamaño: 'w-full col-span-1',
                slot: {
                    tooltip: `<div id="error-sat" class="text-red-300 text-xs mt-1"></div>`
                },
                events: {
                    onChange: validarCampo
                }
            })

        if (puedePostAnalisis.value) {
            builder
                .nuevaSeccion('Analisis')
                // 📌 Sección: Diagnósticos

                .addCampo({
                    component: 'GroupCampos',
                    labelGroup: 'Diagnosticos',
                    buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', codigo: '', id_paciente: id_paciente } }],
                    tamaño: 'w-full col-span-2',
                    vmodel: 'Diagnosticos',
                    value: [],
                    campos: [
                        {
                            name: 'descripcion',
                            id: 'cie-10',
                            typeCampo: 'SelectSearch',
                            placeholder: 'CIE-10',
                            tamaño: 'w-full md:col-span-2',
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
                    id: 'tipoAnalisis',
                    name: 'tipoAnalisis',
                    placeholder: 'Tipo de Análisis',
                    tamaño: 'w-full md:col-span-1 col-span-2',
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

                // --- Label: Tratamiento ---
                .addCampo({
                    component: 'Label',
                    forLabel: 'rehabilitacion',
                    text: '<i class="fa-solid fa-notes-medical text-blue-500 mr-1"></i>Tratamiento',
                    tamaño: 'w-full col-span-2',
                })

                // --- Botones: Medicinas, Servicios, Insumos, Equipos ---

                .addCampo({
                    component: 'GroupCampos',
                    labelGroup: 'Equipos (opcional)',
                    buttons: [{ icon: 'fa-solid fa-stethoscope', label: 'Agregar', color: 'bg-blue-700', addItem: { descripcion: '', uso: '', id_paciente: id_paciente } },],
                    tamaño: 'w-full md:col-span-2',
                    vmodel: 'Plan_manejo_equipos',
                    value: [],
                    campos: [
                        {
                            name: 'descripcion',
                            id: 'descripcionEquipo',
                            typeCampo: 'Input',
                            placeholder: 'Descripcion',
                            tamaño: 'w-full',
                        },
                        {
                            name: 'uso',
                            id: 'usoEquipos',
                            typeCampo: 'Input',
                            placeholder: 'Uso',
                            tamaño: 'w-full',
                        },
                    ],
                    containerCampos: 'grid grid-cols-2 gap-2'
                })

                .addCampo({
                    component: 'GroupCampos',
                    labelGroup: 'Insumos (opcional)',
                    buttons: [{ icon: 'fa-solid fa-syringe', label: 'Agregar', color: 'bg-green-700', addItem: { nombre: '', cantidad: '', id_paciente: id_paciente } },],
                    tamaño: 'w-full md:col-span-2',
                    vmodel: 'Plan_manejo_insumos',
                    value: [],
                    campos: [
                        {
                            name: 'nombre',
                            id: 'nombreInsumo',
                            typeCampo: 'Input',
                            placeholder: 'Nombre',
                            tamaño: 'w-full',
                        },
                        {
                            name: 'cantidad',
                            id: 'cantidadInsumo',
                            typeCampo: 'Input',
                            type: 'number',
                            placeholder: 'Cantidad (número)',
                            tamaño: 'w-full',
                        },
                    ],
                    containerCampos: 'grid grid-cols-2 gap-2'
                })

                .addCampo({
                    component: 'GroupCampos',
                    labelGroup: 'Medicamentos (opcional)',
                    buttons: [{ icon: 'fa-solid fa-capsules', label: 'Agregar', color: 'bg-blue-500', addItem: { medicamento: '', dosis: '', cantidad: '', id_paciente: id_paciente } },],
                    tamaño: 'w-full md:col-span-2',
                    vmodel: 'Plan_manejo_medicamentos',
                    value: [],
                    campos: [
                        {
                            name: 'medicamento',
                            id: 'Medicamento',
                            typeCampo: 'Input',
                            placeholder: 'Medicamento',
                            tamaño: 'w-full',
                        },
                        {
                            name: 'dosis',
                            id: 'dosis',
                            typeCampo: 'Input',
                            placeholder: 'Dosis',
                            tamaño: 'w-full',
                        },
                        {
                            name: 'cantidad',
                            id: 'cantidad',
                            typeCampo: 'Input',
                            type: 'number',
                            placeholder: 'Cantidad de dias (número)',
                            tamaño: 'w-full',
                        },
                    ],
                    containerCampos: 'grid grid-cols-3 gap-2'
                })

                .addCampo({
                    component: 'GroupCampos',
                    labelGroup: 'Procedimientos (opcional)',
                    buttons: [{ icon: 'fa-solid fa-kit-medical', label: 'Agregar', color: 'bg-green-500', addItem: { procedimiento: '', codigo: '', dias_asignados: '', profesional: '', id_medico: '', id_paciente: id_paciente } },],
                    tamaño: 'w-full md:col-span-2 mb-5',
                    vmodel: 'Plan_manejo_procedimientos',
                    value: [],
                    campos: [
                        {
                            name: 'procedimiento',
                            id: 'descripcionProcedimiento',
                            typeCampo: 'SelectSearch',
                            placeholder: 'Procedimiento',
                            tamaño: 'w-full',
                            UpperCase: true,
                            options: CUPS,
                            opciones: [{ value: 'DESCRIPCION' }, { text: 'Codigo', value: 'CODIGO' }],
                            seleccionarItem: (item) => {
                                historiaStore.Formulario.Plan_manejo_procedimientos.at(-1).procedimiento = item.DESCRIPCION
                                historiaStore.Formulario.Plan_manejo_procedimientos.at(-1).codigo = item.CODIGO
                            },
                        },
                        {
                            name: 'codigo',
                            id: 'codigo',
                            typeCampo: 'SelectSearch',
                            placeholder: 'Codigo',
                            tamaño: 'w-full',
                            UpperCase: true,
                            options: CUPS,
                            opciones: [{ value: 'CODIGO' }, { text: 'Procedimento:', value: 'DESCRIPCION' }],
                            seleccionarItem: (item) => {
                                historiaStore.Formulario.Plan_manejo_procedimientos.at(-1).procedimiento = item.DESCRIPCION
                                historiaStore.Formulario.Plan_manejo_procedimientos.at(-1).codigo = item.CODIGO
                            },
                        },
                        {
                            name: 'dias_asignados',
                            id: 'dias_asignados',
                            typeCampo: 'Input',
                            placeholder: 'Numero de Veces',
                            tamaño: 'w-full',
                        },
                        {
                            name: 'profesional',
                            id: 'profesional',
                            typeCampo: 'SelectSearch',
                            placeholder: 'Profesional asignado',
                            tamaño: 'w-full',
                            options: MedicosList,
                            UpperCase: true,
                            opciones: [{ value: 'name' }, { text: 'Cedula:', value: 'No_document' }],
                            seleccionarItem: (item) => {
                                historiaStore.Formulario.Plan_manejo_procedimientos.at(-1).profesional = item.name
                                historiaStore.Formulario.Plan_manejo_procedimientos.at(-1).id_medico = item.id_profesional
                            },
                        },
                    ],
                    containerCampos: 'grid md:grid-cols-2 grid-cols-1 gap-2'
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

                .addCampo({
                    component: 'Label',
                    forLabel: '',
                    text: '<i class="fa-solid fa-file-medical text-purple-500 mr-1"></i>Plan de Manejo',
                    tamaño: 'w-full col-span-2',
                })
        }
    }
    builder.build()
    return {
        builder,
        PacientesList,
        id_paciente,
    }
}