<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { ref, onMounted, unref, toRaw } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';
import { useVarView } from "~/stores/varview.js";
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { PdfBuilder } from '~/build/Constructores/PDFBuilder';
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales';

const varView = useVarView();   
const apiRest = useApiRest()
const historiasStore = useHistoriasStore();
const config = useRuntimeConfig()
const diagnosticos = ref([])
const diagnosticosCIF = ref([])
const refresh = ref(1);

const pacientesStore = usePacientesStore();
const medicoStore = useMedicosStore()
const store = useIndexedDBStore()
const activePdfMedicina = ref(false)
const propiedadesMedicinaPDF = ref([])

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await apiRest.getData('HistoriaClinica', 'historiasClinicas')
    await apiRest.getData('Analisis', 'analisis')
    await apiRest.getData('Diagnosticos', 'diagnosticos')
    await apiRest.getData('Enfermedad', 'enfermedades')
    await apiRest.getData('Plan_manejo_medicamentos', 'planManejoMedicamentos')
    await apiRest.getData('Plan_manejo_procedimientos', 'planManejoProcedimientos')
    await apiRest.getData('Antecedentes', 'antecedentes')
    await apiRest.getData('ExamenFisico', 'examenFisicos')
    await exportarMedicinaPDF(varView.propiedadesPDF)
    varView.cargando = false
});

async function exportarMedicinaPDF(data) {
    varView.cargando = true

    const pacientes = await pacientesStore.listPacientes()
    const profesionales = await medicoStore.listMedicos(false)

    const historia = await historiasStore.listDatos(data.id_historia, 'HistoriaClinica', 'id')
    const id_paciente = historia[0]?.id_paciente

    const dataPaciente = pacientes.find(user => {
        return user.id_paciente === id_paciente || null
    });

    const profesional = profesionales.find(medico => {
        return medico.id_profesional === data.id_medico
    })

    const enfermedad = await historiasStore.listDatos(data.id, 'Enfermedad', 'id_analisis')
    const signosVitalesData = await historiasStore.listDatos(data.id, 'ExamenFisico', 'id_analisis')
    const medicamentosData = await historiasStore.listDatos(data.id, 'Plan_manejo_medicamentos', 'id_analisis')
    const procedimientosData = await historiasStore.listDatos(id_paciente, 'Plan_manejo_procedimientos', 'id_paciente')
    const antecedentesData = await historiasStore.listDatos(id_paciente, 'Antecedentes', 'id_paciente')

    // Diagnosticos
    const allAnalisis = await historiasStore.listDatos(historia[0]?.id, 'Analisis', 'id_historia')
    if (allAnalisis || allAnalisis.length > 0) {
        // Obtener todos los diagnosticos asociados a cada id_analisis de la historia
        const diagnosticosPorAnalisis = await Promise.all(
            allAnalisis.map(async (h) => {

                const diagnostico = await historiasStore.listDatos(h.id, 'Diagnosticos', 'id_analisis') || []
                const diagnosticoCIF = await historiasStore.listDatos(h.id, 'DiagnosticosCIF', 'id_analisis') || []

                return {
                    diagnostico,
                    diagnosticoCIF
                }
            })
        )

        // Unificar todos los medicamentos en un solo array
        diagnosticos.value = diagnosticosPorAnalisis.map(d => d.diagnostico).flat()
        diagnosticosCIF.value = diagnosticosPorAnalisis.map(d => d.diagnosticoCIF).flat()
    } else {
        diagnosticos.value = []
        diagnosticosCIF.value = []
    }
    const diagnosticosMedicina = Array.isArray(unref(diagnosticos.value))
        ? toRaw(diagnosticos.value)
            .filter(diagnostico => diagnostico.id_analisis === data.id) // filtra solo los que aplican
            .map(diagnostico => [
                `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
                `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
            ])
        : [];

    const antecedentes = antecedentesData.map(antecedente => [
        `<p class="text-xs leading-tight text-center py-1">${antecedente.descripcion}</p>`,
    ])

    const medicamentos = medicamentosData.map(medicamento => [
        `<p class="text-xs leading-tight py-1">${medicamento.medicamento}</p>`,
        `<p class="text-xs leading-tight py-1">${medicamento.dosis}</p>`,
        `<p class="text-xs leading-tight py-1">${medicamento.cantidad}</p>`,
    ])

    const procedimientos = procedimientosData.map(procedimiento => [
        `<p class="text-xs leading-tight py-1">${procedimiento.procedimiento}</p>`,
        `<p class="text-xs leading-tight py-1">${procedimiento.codigo}</p>`,
        `<p class="text-xs leading-tight py-1">${procedimiento.dias_asignados}</p>`,
    ])

    propiedadesMedicinaPDF.value = {
        ...data,
        ...dataPaciente,
        nameProfesional: profesional.name, cedulaProfesional: profesional.No_document, sello: profesional.sello,
        diagnosticosMedicina,
        Enfermedad: { ...enfermedad[0] },
        signosVitales: {...signosVitalesData[0].signosVitales},
        Medicamentos: medicamentos,
        Procedimientos: procedimientos,
        Antecedentes: antecedentes,
    };console.log(propiedadesMedicinaPDF)
    activePdfMedicina.value = true
    varView.cargando = false
}

// Propiedades calculadas
const fechaFormateada = () => {
    const fecha = new Date()
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const año = fecha.getFullYear();
    const fechaActual = `${dia}/${mes}/${año}`

    return fechaActual
}

function calcularEdad(fechaNacimiento) {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)

    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()

    // Ajustar si aún no ha cumplido años este año
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--
    }

    return edad
}

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()
    const pdfMedicina = new PdfBuilder()

    pagina
        .setFondo('FondoDefault')
        .setEstilos('')
        .setContenedor('w-full')

        .addComponente('PDFTemplate', pdfMedicina
            .setElementId('Medicina')
            .setIsActive(activePdfMedicina)
            .setFileName(`MEDICINA ${propiedadesMedicinaPDF.value.name} ${fechaFormateada()}`)
            .setSello(`${config.public.api}/storage/${propiedadesMedicinaPDF.value.sello}`)
            // ENCABEZADO PRINCIPAL
            .addComponente('Tabla', {
                container: 'border-b-1 pb-3',
                border: true,
                columnas: [
                    '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                    `
                            <p class="text-sm border-b-1 pb-1 uppercase">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 pb-1 uppercase">Registro</p></br>
                            <p class="text-sm uppercase">Historia Clinica </br> Medicina general domiciliaria</p></br>
                        `,
                    `
                            <p class="w-full text-start text-xs border-b-1 pb-2">Codigo: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">version: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">Fecha: ${fechaFormateada()}</p>
                            <p class="w-full text-start text-xs">Pagina: 1 de 1</p>
                        `
                ],
            })

            // DATOS DEL PACIENTE
            .addComponente('Texto', { texto: 'Datos del paciente' })
            .addComponente('Tabla', {
                container: 'space-y-2 rounded-xl py-3',
                filas: [
                    [
                        `<p class="text-xs w-full">Nombre completo: <span class="text-xs">${propiedadesMedicinaPDF.value.name}</span></p>`,
                        `<p class="text-xs w-full"></p>`,
                    ],
                    [
                        [`<p class="text-xs">No documento: <span class="text-xs">${propiedadesMedicinaPDF.value.No_document}</span></p>
                            <p class="text-xs">Tipo de documento: <span class="text-xs">${propiedadesMedicinaPDF.value.type_doc}</span></p>`],
                        [`<p class="text-xs">Edad: <span class="text-xs">${calcularEdad(propiedadesMedicinaPDF.value.nacimiento)}</span></p>
                            <p class="text-xs">Sexo: <span class="text-xs">${propiedadesMedicinaPDF.value.sexo}</span></p>`],
                    ],
                    [
                        `<p class="text-xs">EPS: <span class="text-xs">${propiedadesMedicinaPDF.value.Eps}</span></p>`,
                        `<p class="text-xs">Zona: <span class="text-xs">${propiedadesMedicinaPDF.value.zona}</span></p>`
                    ],
                    [
                        `<p class="text-xs">Regimen: <span class="text-xs">${propiedadesMedicinaPDF.value.regimen}</span></p>`,
                        `<p class="text-xs">Direccion: <span class="text-xs">${propiedadesMedicinaPDF.value.direccion}</span></p>`
                    ],
                    [
                        `<p class="text-xs">Vulnerabilidad: <span class="text-xs">${propiedadesMedicinaPDF.value.vulnerabilidad}</span></p>`,
                        `<p class="text-xs">Celular: <span class="text-xs">${propiedadesMedicinaPDF.value.celular}</span></p>`
                    ],
                ],
            })

            // SECCIÓN: DIAGNÓSTICOS
            .addComponente('Tabla', {
                container: 'w-full p-3',
                columnas: ['Diagnósticos', 'CIE-10'],
                filas: propiedadesMedicinaPDF.value.diagnosticosMedicina?.length > 0
                    ? propiedadesMedicinaPDF.value.diagnosticosMedicina
                    : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
            })

            .addComponente('Espacio', { alto: 16 })

            // SECCIÓN: NOTA DE ENFERMERÍA
            .addComponente('Tabla', {
                filas: [
                    [
                        `<p class="text-sm text-center py-1 font-bold">Motivo de consulta</p>`,
                    ],
                    [
                        `<p class="text-sm text-center py-2">${propiedadesMedicinaPDF.value.motivo}</p>`
                    ],
                ],
            })
            .addComponente('Tabla', {
                filas: [
                    [
                        `<p class="text-sm text-center py-1 font-bold">Enfermedad Actual</p>`,
                    ],
                    [
                        `<p class="text-sm text-center py-2">${propiedadesMedicinaPDF.value.Enfermedad?.valor}</p>`
                    ],
                ],
            })
            .addComponente('Tabla', {
                container: 'w-full p-3',
                columnas: ['Antecedentes'],
                filas: propiedadesMedicinaPDF.value.Antecedentes?.length > 0
                    ? propiedadesMedicinaPDF.value.Antecedentes
                    : [['<p class="text-xs text-center">Sin antecedentes registrados</p>']]
            })

            .addComponente('Titulo', { texto: 'EXAMEN FISICO' })
            .addComponente('Tabla', {
                container: 'space-y-2 rounded-xl py-3!',
                filas: [
                    [
                        '<p class="text-sm w-full">TA</p>',
                        '<p class="text-sm w-full">FC</p>',
                        '<p class="text-sm w-full">FR</p>',
                        '<p class="text-sm w-full">T</p>',
                        '<p class="text-sm w-full">SAT O2</p>',
                    ],
                    [
                        `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.signosVitales?.ta}</p>`,
                        `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.signosVitales?.fc}</p>`,
                        `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.signosVitales?.fr}</p>`,
                        `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.signosVitales?.t}</p>`,
                        `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.signosVitales?.SATo2}</p>`,
                    ],

                ],
            })

            .addComponente('Espacio', { alto: 32 })
            .addComponente('Tabla', {
                filas: [
                    [
                        `<p class="text-sm text-center py-1 font-bold">Analsis/Tratamiento</p>`,
                    ],
                    [
                        `<p class="text-sm text-center py-2">${propiedadesMedicinaPDF.value.analisis}</p>`
                    ],
                ],
            })

            .addComponente('Texto', { texto: 'PLAN DE MANEJO' })
            .addComponente('Espacio', { alto: 16 })
            .addComponente('Titulo', { texto: 'Medicamentos' })
            .addComponente('Tabla', {
                container: 'w-full p-3',
                columnas: ['Nombre del Medicamento', 'Dosis', 'Cantidad de dias'],
                filas: propiedadesMedicinaPDF.value.Medicamentos?.length > 0
                    ? propiedadesMedicinaPDF.value.Medicamentos
                    : [['<p class="text-xs">Sin Medicamentos registrados</p>']]
            })

            .addComponente('Titulo', { texto: 'Procedimientos' })
            .addComponente('Tabla', {
                container: 'w-full p-3',
                columnas: ['Descripcion', 'CUPS', 'Dias asignados'],
                filas: propiedadesMedicinaPDF.value.Procedimientos?.length > 0
                    ? propiedadesMedicinaPDF.value.Procedimientos
                    : [['<p class="text-xs">Sin Tratamientos registrados</p>']]
            })

            .addComponente('Espacio', { alto: 32 })
            // PIE DE FIRMA
            .addComponente('Tabla', {
                container: 'pt-5',
                border: false,
                columnas: [
                    `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Nombre del Profesional</p> </hr>
                                <p class="text-xs text-center pt-9">${propiedadesMedicinaPDF.value.nameProfesional}</p> </hr>
                                <p class="text-xs text-center pt-3">${propiedadesMedicinaPDF.value.cedulaProfesional}</p>
                            <div>
                            `,
                    `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Firma o sello del Profesional</p>
                                <div class="flex justify-center items-center" id="selloProfesional"><img src="${config.public.api}/storage/${propiedadesMedicinaPDF.value.sello}" class="w-[100px] h-[100px] pt-1"/></div>
                            </div>
                            `
                ],
            })
        )
    return pagina.build()
});

</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
</template>