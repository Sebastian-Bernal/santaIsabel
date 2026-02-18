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
const refresh = ref(1);

const pacientesStore = usePacientesStore();
const medicoStore = useMedicosStore()
const activePdfMedicina = ref(false)
const propiedadesMedicinaPDF = ref({})

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await apiRest.getData('Plan_manejo_medicamentos', 'planManejoMedicamentos')
    await exportarMedicinaPDF(varView.propiedadesPDF)
    varView.cargando = false
});

// PDF
async function exportarMedicinaPDF(data) {
    varView.cargando = true
    console.log(data)
    const pacientes = await pacientesStore.listPacientes()
    const profesionales = await medicoStore.listMedicos(false)

    const dataPaciente = pacientes.find(user => {
        return user.id_paciente === data.id_paciente
    });

    const profesional = profesionales.find(medico => {
        return medico.id_profesional === data.id_medico
    })

    const medicamentosData = await historiasStore.listDatos(data.id_analisis, 'Plan_manejo_medicamentos', 'id_analisis')

    const medicamentos = medicamentosData
        ? medicamentosData
            .map(medicina => [
                `<p class="text-xs leading-tight py-1">${medicina.medicamento}</p>`,
                `<p class="text-xs leading-tight py-1">${medicina.dosis}</p>`,
                `<p class="text-xs leading-tight py-1">${medicina.dosis}</p>`,
                `<p class="text-xs leading-tight py-1">${medicina.cantidad}</p>`,
                `<p class="text-xs leading-tight py-1">${medicina.dosis}</p>`,
            ])
        : [];

    propiedadesMedicinaPDF.value = { 
        ...data, 
        ...dataPaciente, 
        nameProfesional: profesional?.name, 
        cedulaProfesional: profesional?.No_document, 
        sello: profesional?.sello,
        medicamentos
    }

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

            // Terapias
            .addComponente('PDFTemplate', pdfMedicina
                .setElementId('Medicina')
                .setIsActive(activePdfMedicina)
                .setFileName(`FORMULA_MEDICA ${propiedadesMedicinaPDF.value.name} ${fechaFormateada()}`)
                .setSello(`${config.public.api}/storage/${propiedadesMedicinaPDF.value.sello}`)
                // ENCABEZADO PRINCIPAL
                .addComponente('Tabla', {
                    container: 'border-b-2 pb-3',
                    border: true,
                    columnas: [
                        '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                        `
                            <p class="text-sm border-b-1">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1">Registro</p></br>
                            <p class="text-sm">Fórmula Médica</p></br>
                        `,
                        `
                            <p class="w-full text-start text-xs border-b-1 pb-2">Codigo: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">version: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">Fecha: ${propiedadesMedicinaPDF.value.created_at?.slice(0,10)}</p>
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
                    ],
                })

                .addComponente('Espacio', { alto: 16 })

                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Nombre del Medicamento', 'Presentacion', 'Concentracion', 'Cantidad', 'Dosis'],
                    filas: propiedadesMedicinaPDF.value.medicamentos?.length > 0
                        ? propiedadesMedicinaPDF.value.medicamentos
                        : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
                })
                // .addComponente('Tabla', {
                //     container: 'space-y-2 rounded-xl py-3!',
                //     filas: [
                //         [
                //             '<p class="text-sm w-full font-bold">Nombre del Medicamento</p>',
                //             '<p class="text-sm w-full font-bold">Presentacion</p>',
                //             '<p class="text-sm w-full font-bold">Concentracion</p>',
                //             '<p class="text-sm w-full font-bold">Cantidad</p>',
                //             '<p class="text-sm w-full font-bold">Dosis</p>',
                //         ],
                //         [
                //             `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.medicamento}</p>`,
                //             `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.dosis}</p>`,
                //             `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.dosis}</p>`,
                //             `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.cantidad}</p>`,
                //             `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.dosis}</p>`,
                //         ],
                //     ],
                // })

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