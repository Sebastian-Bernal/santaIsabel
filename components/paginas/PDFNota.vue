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
const activePdfNotas = ref(false)
const propiedadesNotaPDF = ref({})

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await apiRest.getData('HistoriaClinica', 'historiasClinicas')
    await apiRest.getData('Analisis', 'analisis')
    await apiRest.getData('Diagnosticos', 'diagnosticos')
    await apiRest.getData('Descripcion_nota', 'descripcionNotas')
    await exportarNotaPDF(varView.propiedadesPDF)
    varView.cargando = false
});

// PDF
const exportarNotaPDF = async(data) => {
    varView.cargando = true
    const pacientes = await pacientesStore.listPacientes()
    const profesionales = await medicoStore.listMedicos(false)

    const dataPaciente = pacientes.find(user => {
        return user.id_paciente === data.id_paciente
    })

    const profesional = profesionales.find(medico => {
        return medico.id_profesional === data.id_profesional
    });

    store.almacen = 'Descripcion_nota'
    const descripcion = await store.leerdatos()

    const tiposOrden = ["subjetivo", "objetivo", "actividades", "plan", "intervencion", "evaluacion"];

    const descripcionesNota = (descripcion || []).filter(d => d.id_nota === data.id);

    // Agrupar por tipo
    const agrupadoPorTipo = descripcionesNota.reduce((acc, nota) => {
        if (!acc[nota.tipo]) acc[nota.tipo] = [];
        acc[nota.tipo].push(nota);
        return acc;
    }, {});

    // Construir filas ordenadas
    const filasNotas = tiposOrden.map(tipo => {
        const notasTipo = (agrupadoPorTipo[tipo] || []).sort((a, b) => {
            // Ordenar por hora ascendente
            return (a.hora || "").localeCompare(b.hora || "");
        });

        if (notasTipo.length === 0) return ""; // si no hay notas de ese tipo, no mostrar nada

        // Encabezado con el nombre del tipo
        let contenido = `<p class="text-start text-xs py-1"><strong>${tipo.toUpperCase()}:</strong></p>`;

        // Filas de cada nota
        contenido += notasTipo.map(nota => `
            <div class="flex">
                <p class="text-xs border-r-1 px-3 py-1">${nota.hora || ''}</p>
                <p class="text-xs w-full px-1">${nota.descripcion || ''}</p>
            </div>
        `).join("");

        // Separador visual
        contenido += `<hr class="w-full h-1"/>`;

        return contenido;
    }).join("");

    const historia = await pacientesStore.listDatos(data.id_paciente, 'HistoriaClinica', 'id')
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

    const diagnosticosNota = Array.isArray(unref(diagnosticos.value))
        ? toRaw(diagnosticos.value)
            .filter(diagnostico => diagnostico.id_analisis === data.id_analisis) // filtra solo los que aplican
            .map(diagnostico => [
                `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
                `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
            ])
        : [];

    propiedadesNotaPDF.value = { ...data, ...dataPaciente, nameProfesional: profesional.name, cedulaProfesional: profesional.No_document, sello: profesional.sello, filasNotas, diagnosticosNota }
    activePdfNotas.value = true
    varView.showPDFNota = true
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
    const pdfNotas = new PdfBuilder()

    pagina
        .setFondo('FondoDefault')
        .setEstilos('')
        .setContenedor('w-full')
        //  notas
        .addComponente('PDFTemplate', pdfNotas
            .setElementId('Nota')
            .setIsActive(activePdfNotas)
            .setFileName(`Nota_${propiedadesNotaPDF.value.name}`)
            // ENCABEZADO PRINCIPAL
            .addComponente('Tabla', {
                container: 'border-b-2 pb-3',
                border: true,
                columnas: [
                    '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                    `
                            <p class="text-sm border-b-1 uppercase">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 uppercase">Registro</p></br>
                            <p class="text-sm uppercase">Nota de enfermeria de atencion domiciliaria</p>
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
                        `<p class="text-xs w-full">Nombre completo: <span class="text-xs">${propiedadesNotaPDF.value.name}</span></p>`,
                        ``,
                    ],
                    [
                        [`<p class="text-xs ">No documento: <span class="text-xs">${propiedadesNotaPDF.value.No_document}</span></p>
                            <p class="text-xs ">Tipo de documento: <span class="text-xs">${propiedadesNotaPDF.value.type_doc}</span></p>`],
                        [`<p class="text-xs ">Edad: <span class="text-xs">${calcularEdad(propiedadesNotaPDF.value.nacimiento)}</span></p>
                            <p class="text-xs ">Sexo: <span class="text-xs">${propiedadesNotaPDF.value.sexo}</span></p>`],
                    ],
                    [
                        `<p class="text-xs ">EPS: <span class="text-xs">${propiedadesNotaPDF.value.Eps}</span></p>`,
                        `<p class="text-xs ">Zona: <span class="text-xs">${propiedadesNotaPDF.value.zona}</span></p>`
                    ],
                ],
            })

            // SECCIÓN: DIAGNÓSTICOS
            .addComponente('Tabla', {
                container: 'w-full p-3',
                columnas: ['Diagnostico', 'CIE-10'],
                filas: propiedadesNotaPDF.value.diagnosticosNota?.length > 0
                    ? propiedadesNotaPDF.value.diagnosticosNota
                    : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
            })

            .addComponente('Espacio', { alto: 16 })

            // SECCIÓN: NOTA DE ENFERMERÍA
            .addComponente('Texto', {
                texto: 'Nota de Enfermería',
            })

            .addComponente('Tabla', {
                container: 'space-y-2 rounded-xl py-3!',
                styles: { border: '1px solid #DBEAFE' },
                filas: [
                    [
                        `
                            <div class="w-full flex justify-between"> 
                                <p class="text-xs w-[80px]">Fecha:</p>
                                <div class="w-full text-center border-l-1">
                                    <p class="text-xs w-full">Nota</p>
                                </div>
                            </div>
                            `,
                    ],
                    [
                        `
                            <div class="w-full flex justify-between">
                                <p class="text-xs w-[80px]">${propiedadesNotaPDF.value.fecha_nota ?? ''}</p>
                                <div class="w-full flex flex-col gap-2 border-l-1 pl-3">
                                    ${propiedadesNotaPDF.value.filasNotas ?? ''}
                                </div>
                            </div>`,
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
                                <p class="text-xs text-center pt-9">${propiedadesNotaPDF.value.nameProfesional}</p> </hr>
                                <p class="text-xs text-center pt-3">${propiedadesNotaPDF.value.cedulaProfesional}</p>
                            <div>
                            `,
                    `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Firma y sello</p>
                                <div class="flex justify-center items-center" id="selloProfesional"><img src="${config.public.api}/storage/${propiedadesNotaPDF.value.sello}" class="w-[100px] h-[100px] pt-1"/></div>
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