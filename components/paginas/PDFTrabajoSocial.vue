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
const activePdfTrabajoSocial = ref(false)
const propiedadesTrabajoSocialPDF = ref([])

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await apiRest.getData('HistoriaClinica', 'historiasClinicas')
    await apiRest.getData('Analisis', 'analisis')
    await apiRest.getData('Diagnosticos', 'diagnosticos')
    await exportarTrabajoSocialPDF(varView.propiedadesPDF)
    varView.cargando = false
});

async function exportarTrabajoSocialPDF(data) {
    varView.cargando = true

    const pacientes = await pacientesStore.listPacientes()
    const profesionales = await medicoStore.listMedicos(false)

    const historia = await historiasStore.listDatos(data.id_historia, 'HistoriaClinica', 'id')
    const id_paciente = historia[0]?.id_paciente

    const dataPaciente = pacientes.filter(user => {
        return user.id_paciente === id_paciente || null
    });

    const profesional = profesionales.find(medico => {
        return medico.id_profesional === data.id_medico
    })

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

    const diagnosticosTrabajoS = Array.isArray(unref(diagnosticos.value))
        ? toRaw(diagnosticos.value)
            .filter(diagnostico => diagnostico.id_analisis === data.id) // filtra solo los que aplican
            .map(diagnostico => [
                `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
                `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
            ])
        : [];

    propiedadesTrabajoSocialPDF.value = { ...data, ...dataPaciente[0], nameProfesional: profesional.name, cedulaProfesional: profesional.No_document, sello: profesional.sello, diagnosticosTrabajoS }
    activePdfTrabajoSocial.value = true
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
    const pdfTrabajoSocial = new PdfBuilder()

    pagina
        .setFondo('FondoDefault')
        .setEstilos('')
        .setContenedor('w-full')
        .addComponente('PDFTemplate', pdfTrabajoSocial
            .setElementId('TrabajoSocial')
            .setIsActive(activePdfTrabajoSocial)
            .setFileName(`TRABAJO_SOCIAL ${propiedadesTrabajoSocialPDF.value.name} ${fechaFormateada()}`)

            // ENCABEZADO PRINCIPAL
            .addComponente('Tabla', {
                container: 'border-b-2 pb-3',
                border: true,
                columnas: [
                    '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                    `
                            <p class="text-sm border-b-1 uppercase">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 uppercase">Registro</p></br>
                            <p class="text-sm uppercase">Historia Clinica </br> Trabajo Social</p>
                        `,
                    `
                            <p class="w-full text-end text-xs border-b-1 pb-2">Codigo:</p>
                            <p class="w-full text-end text-xs border-b-1 pb-2">version:</p>
                            <p class="w-full text-end text-xs border-b-1 pb-2">Fecha: ${propiedadesTrabajoSocialPDF.value.created_at?.slice(0,10)}</p>
                            <p class="w-full text-end text-xs">Pagina:</p>
                        `
                ],
            })

            // DATOS DEL PACIENTE
            .addComponente('Texto', { texto: 'Datos del paciente' })
            .addComponente('Tabla', {
                container: 'space-y-2 rounded-xl py-3',
                filas: [
                    [
                        `<p class="text-xs w-full">Nombre completo: <span class="text-xs">${propiedadesTrabajoSocialPDF.value.name}</span></p>`,
                        ``,
                    ],
                    [
                        [`<p class="text-xs">No documento: <span class="text-xs">${propiedadesTrabajoSocialPDF.value.No_document}</span></p>
                            <p class="text-xs">Tipo de documento: <span class="text-xs">${propiedadesTrabajoSocialPDF.value.type_doc}</span></p>`],
                        [`<p class="text-xs">Edad: <span class="text-xs">${calcularEdad(propiedadesTrabajoSocialPDF.value.nacimiento)}</span></p>
                            <p class="text-xs">Sexo: <span class="text-xs">${propiedadesTrabajoSocialPDF.value.sexo}</span></p>`],
                    ],
                    [
                        `<p class="text-xs">EPS: <span class="text-xs">${propiedadesTrabajoSocialPDF.value.Eps}</span></p>`,
                        `<p class="text-xs">Zona: <span class="text-xs">${propiedadesTrabajoSocialPDF.value.zona}</span></p>`
                    ],
                ],
            })

            // SECCIÓN: DIAGNÓSTICOS
            .addComponente('Tabla', {
                container: 'w-full p-3',
                columnas: ['Diagnostico', 'CIE-10'],
                filas: propiedadesTrabajoSocialPDF.value.diagnosticosTrabajoS?.length > 0
                    ? propiedadesTrabajoSocialPDF.value.diagnosticosTrabajoS
                    : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
            })

            .addComponente('Espacio', { alto: 16 })

            // SECCIÓN: NOTA DE ENFERMERÍA
            .addComponente('Tabla', {
                filas: [
                    [
                        `<p class="text-sm font-bold  text-center py-1">Motivo de consulta</p>`,
                    ],
                    [
                        `<p class="text-sm text-center py-2">${propiedadesTrabajoSocialPDF.value.motivo}</p>`
                    ],
                ],
            })

            .addComponente('Tabla', {
                container: 'space-y-2 rounded-xl py-3!',
                filas: [
                    [
                        '<p class="text-sm font-bold w-full text-center py-1">Analisis/Tratamiento</p>',
                    ],
                    [
                        `<p class="text-sm w-full text-center py-2">${propiedadesTrabajoSocialPDF.value.analisis}</p>`,
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
                                <p class="text-xs text-center py-1 border-1">Nombre del Profesional</p> </hr>
                                <p class="text-xs text-center pt-9">${propiedadesTrabajoSocialPDF.value.nameProfesional}</p> </hr>
                                <p class="text-xs text-center pt-3">${propiedadesTrabajoSocialPDF.value.cedulaProfesional}</p>
                            <div>
                            `,
                    `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Firma o sello del Profesional</p>
                                <div class="flex justify-center items-center" id="selloProfesional"><img src="${config.public.api}/storage/${propiedadesTrabajoSocialPDF.value.sello}" class="w-[100px] h-[100px] pt-1"/></div>
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