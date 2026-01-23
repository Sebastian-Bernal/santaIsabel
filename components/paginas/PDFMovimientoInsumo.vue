<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { ref, onMounted, unref, toRaw } from 'vue';
import { useVarView } from "~/stores/varview.js";
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { PdfBuilder } from '~/build/Constructores/PDFBuilder';
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales';

const varView = useVarView();
const config = useRuntimeConfig()
const refresh = ref(1);

const medicoStore = useMedicosStore()
const activePdfInsumo = ref(false)
const propiedadesInsumoPDF = ref({})

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await exportarMedicinaPDF(varView.propiedadesPDF)
    varView.cargando = false
});

// PDF
async function exportarMedicinaPDF(data) {
    varView.cargando = true
    const profesionales = await medicoStore.listMedicos(false)

    const profesional = profesionales.find(medico => {
        return medico.id_profesional === data.id_medico
    })

    const movimientos = [[
                `<p class="text-xs leading-tight py-1">${data.fechaMovimiento}</p>`,
                `<p class="text-xs leading-tight py-1">${profesional.name}</p>`,
                `<p class="text-xs leading-tight py-1">${data.cantidadMovimiento}</p>`,
                `<p class="text-xs leading-tight py-1">Descripcion</p>`,
        ]]

    propiedadesInsumoPDF.value = { 
        ...data,
        nameProfesional: profesional.name, 
        cedulaProfesional: profesional.No_document, 
        sello: profesional.sello,
        movimientos: movimientos
    }
    console.log('propiedadesInsumoPDF.value', propiedadesInsumoPDF.value);
    activePdfInsumo.value = true
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
    const pdfInsumo = new PdfBuilder()

    pagina
        .setFondo('FondoDefault')
        .setEstilos('')
        .setContenedor('w-full')

// Movimiento de insumo
.addComponente('PDFTemplate', pdfInsumo
    .setElementId('Insumo')
    .setIsActive(activePdfInsumo)
    .setFileName(`MOVIMIENTO_INSUMO ${propiedadesInsumoPDF.value.nombreInsumo} ${fechaFormateada()}`)
    .setSello(`${config.public.api}/storage/${propiedadesInsumoPDF.value.sello}`)

    // ENCABEZADO PRINCIPAL
    .addComponente('Tabla', {
        container: 'border-b-2 pb-3',
        border: true,
        columnas: [
            '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
            `
                <p class="text-sm border-b-1">Proceso: Gestión de Insumos</p></br>
                <p class="text-sm border-b-1">Registro</p></br>
                <p class="text-sm">Movimiento de Insumo</p></br>
            `,
            `
                <p class="w-full text-start text-xs border-b-1 pb-2">Código: </p>
                <p class="w-full text-start text-xs border-b-1 pb-2">Versión:</p>
                <p class="w-full text-start text-xs border-b-1 pb-2">Fecha: 12/11/1998</p>
                <p class="w-full text-start text-xs">Página: 1 de 1</p>
            `
        ],
    })

    // DATOS DEL INSUMO
    .addComponente('Texto', { texto: 'Datos del Insumo' })
    .addComponente('Tabla', {
        container: 'space-y-2 rounded-xl py-3',
        filas: [
            [
                `<p class="text-xs w-full">Nombre del Insumo: <span class="text-xs">${propiedadesInsumoPDF.value.nombreInsumo}</span></p>`,
                `<p class="text-xs w-full">Código: <span class="text-xs">${propiedadesInsumoPDF.value.codigoInsumo}</span></p>`,
            ],
            [
                `<p class="text-xs">Tipo de Movimiento: <span class="text-xs">${propiedadesInsumoPDF.value.tipoMovimiento}</span></p>`,
                `<p class="text-xs">Cantidad: <span class="text-xs">${propiedadesInsumoPDF.value.cantidadMovimiento}</span></p>`,
            ],
            [
                `<p class="text-xs">Unidad de Medida: <span class="text-xs">${propiedadesInsumoPDF.value.unidad}</span></p>`,
                `<p class="text-xs">Área destino: <span class="text-xs">${propiedadesInsumoPDF.value.areaDestino}</span></p>`,
            ],
        ],
    })

    .addComponente('Espacio', { alto: 16 })

    // DETALLE DEL MOVIMIENTO
    .addComponente('Tabla', {
        container: 'w-full p-3',
        columnas: ['Fecha Movimiento', 'Responsable', 'Cantidad', 'Observaciones'],
        filas: propiedadesInsumoPDF.value.movimientos?.length > 0
            ? propiedadesInsumoPDF.value.movimientos
            : [['<p class="text-xs">Sin movimientos registrados</p>', '', '', '']]
    })

    .addComponente('Espacio', { alto: 32 })

    // PIE DE FIRMA
    .addComponente('Tabla', {
        container: 'pt-5',
        border: false,
        columnas: [
            `
                <div class="min-h-[150px]">
                    <p class="text-xs text-center py-1 border-1">Nombre del Responsable</p> </hr>
                    <p class="text-xs text-center pt-9">${propiedadesInsumoPDF.value.nameProfesional}</p> </hr>
                    <p class="text-xs text-center pt-3">${propiedadesInsumoPDF.value.cedulaProfesional}</p>
                <div>
            `,
            `
                <div class="min-h-[150px]">
                    <p class="text-xs text-center py-1 border-1">Firma o sello del Responsable</p>
                    <div class="flex items-center justify-center gap-2 py-5">
                        <input type="checkbox" id="firmar" name="firmar" checked="modelValue" />
                        <label for="firmar" class="text-black dark:text-white">Firmar</label>
                    </div>
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