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
const historiasStore = useHistoriasStore();
const apiRest = useApiRest();
const config = useRuntimeConfig()
const diagnosticos = ref([])
const diagnosticosCIF = ref([])
const refresh = ref(1);

const pacientesStore = usePacientesStore();
const medicoStore = useMedicosStore()
const store = useIndexedDBStore()
const activePdfEvolucion = ref(false)
const propiedadesEvolucionPDF = ref({})

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await apiRest.getData('HistoriaClinica', 'historiasClinicas')
    await apiRest.getData('Analisis', 'analisis')
    await apiRest.getData('Diagnosticos', 'diagnosticos')
    await exportarEvolucionPDF(varView.propiedadesPDF)
    varView.cargando = false
});

// PDF
async function exportarEvolucionPDF(data) {
    varView.cargando = true

    const pacientes = await pacientesStore.listPacientes()
    const profesionales = await medicoStore.listMedicos(false)

    const dataPaciente = pacientes.find(user => {
        return user.id_paciente === data.id_paciente
    });

    const profesional = profesionales.find(medico => {
        return medico.id_profesional === data.id_profesional
    })

    const historia = await pacientesStore.listDatos(data.id_paciente, 'HistoriaClinica', 'id_paciente')
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

    const diagnosticosTerapia = Array.isArray(unref(diagnosticos.value))
        ? toRaw(diagnosticos.value)
            .filter(diagnostico => diagnostico.id_analisis === data.id_analisis) // filtra solo los que aplican
            .map(diagnostico => [
                `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
                `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
            ])
        : [];

    propiedadesEvolucionPDF.value = { ...data, ...dataPaciente, nameProfesional: profesional.name, cedulaProfesional: profesional.No_document, sello: profesional.sello, diagnosticosTerapia }
    activePdfEvolucion.value = true
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
    const pdfEvolucion = new PdfBuilder()



    const diagnosticosCIFs = Array.isArray(unref(diagnosticosCIF.value))
        ? toRaw(diagnosticosCIF.value).map(diagnostico => [
            `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
            `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
        ])
        : [];

    pagina
        .setFondo('FondoDefault')
        .setEstilos('')
        .setContenedor('w-full')

            // Terapias
            .addComponente('PDFTemplate', pdfEvolucion
                .setElementId('Evolucion')
                .setIsActive(activePdfEvolucion)
                .setFileName(`Tratamiento_${propiedadesEvolucionPDF.value.name}`)
                .setSello(`${config.public.api}/storage/${propiedadesEvolucionPDF.value.sello}`)
                // ENCABEZADO PRINCIPAL
                .addComponente('Tabla', {
                    container: 'border-b-2 pb-3',
                    border: true,
                    columnas: [
                        '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                        `
                            <p class="text-sm border-b-1 pb-1">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 pb-1">Registro</p></br>
                            <p class="text-sm">Reporte de la atencion terapeutica realizada por especialidad</p></br>
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
                            `<p class="text-xs w-full">Nombre completo: <span class="text-xs">${propiedadesEvolucionPDF.value.name}</span></p>`,
                            `<p class="text-xs w-full"></p>`,
                        ],
                        [
                            [`<p class="text-xs">No documento: <span class="text-xs">${propiedadesEvolucionPDF.value.No_document}</span></p>
                            <p class="text-xs">Tipo de documento: <span class="text-xs">${propiedadesEvolucionPDF.value.type_doc}</span></p>`],
                            [`<p class="text-xs">Edad: <span class="text-xs">${calcularEdad(propiedadesEvolucionPDF.value.nacimiento)}</span></p>
                            <p class="text-xs">Sexo: <span class="text-xs">${propiedadesEvolucionPDF.value.sexo}</span></p>`],
                        ],
                        [
                            `<p class="text-xs">EPS: <span class="text-xs">${propiedadesEvolucionPDF.value.Eps}</span></p>`,
                            `<p class="text-xs">Zona: <span class="text-xs">${propiedadesEvolucionPDF.value.zona}</span></p>`
                        ],
                    ],
                })

                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Diagnósticos', 'CIE-10'],
                    filas: propiedadesEvolucionPDF.value.diagnosticosTerapia?.length > 0
                        ? propiedadesEvolucionPDF.value.diagnosticosTerapia
                        : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
                })
                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Diagnósticos', 'CIF'],
                    filas: diagnosticosCIFs?.length > 0
                        ? diagnosticosCIFs
                        : [['<p class="text-xs">Sin diagnósticos CIF registrados</p>', '']]
                })

                .addComponente('Espacio', { alto: 16 })

                // SECCIÓN: NOTA DE ENFERMERÍA
                .addComponente('Tabla', {
                    filas: [
                        [
                            `<p class="text-sm font-bold text-center py-1">Objetivos de la intervencion terapeutica</p>`,
                        ],
                        [
                            `<p class="text-sm text-center py-2">${propiedadesEvolucionPDF.value.objetivos}</p>`
                        ],
                    ],
                })

                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3!',
                    filas: [
                        [
                            '<p class="text-sm w-full">Sesion</p>',
                            '<p class="text-sm w-full">Fecha y hora:</p>',
                            '<p class="text-sm w-full">Evolucion (condición inicial, objetivo de la sesión, técnica método y/o intervención que se realice, condicion final)</p>'
                        ],
                        [
                            `<p class="text-sm w-full">${propiedadesEvolucionPDF.value.sesion}</p>`,
                            `<p class="text-sm w-full">${propiedadesEvolucionPDF.value.fecha}</p> </hr> <p class="text-sm w-full">${propiedadesEvolucionPDF.value.hora}</p>`,
                            `<p class="text-sm w-full">${propiedadesEvolucionPDF.value.evolucion}</p>`,
                        ],

                    ],
                })

                .addComponente('Espacio', { alto: 32 })

                // PIE DE FIRMA
                .addComponente('Tabla', {
                    container: 'pt-5',
                    border: false,
                    columnas: [
                        `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Nombre y Apellido</p> </hr>
                                <p class="text-xs text-center pt-9">${propiedadesEvolucionPDF.value.nameProfesional}</p> </hr>
                                <p class="text-xs text-center pt-3">${propiedadesEvolucionPDF.value.cedulaProfesional}</p>
                            <div>
                            `,
                        `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Firma y sello</p>
                                <div class="flex justify-center items-center" id="selloProfesional"><img src="${config.public.api}/storage/${propiedadesEvolucionPDF.value.sello}" class="w-[100px] h-[100px] pt-1"/></div>
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