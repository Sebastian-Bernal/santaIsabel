<script setup>
import FondoBlur from '../atoms/Fondos/FondoBlur.vue';

import { onMounted } from 'vue';
import { useVarView } from "~/stores/varview.js";
import { decryptData } from '~/composables/Formulario/crypto';

const varView = useVarView();
const nombrePDF = ref('');
let blobGuardado = '';
// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await exportarNutricionPDF(varView.propiedadesPDF)
    varView.cargando = false
});

// PDF
async function exportarNutricionPDF(data) {
    try {
        varView.cargando = true
        const config = useRuntimeConfig()
        const token = decryptData(sessionStorage.getItem('token'))
        const res = await fetch(`${config.public.api}/api/v1/${data.servicio}/${data.id}/pdf`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf'
            }
        });
        if (!res.ok) {
            throw new Error(`Error en la petición: ${res.status}`);
        }

        const blob = await res.blob();
        blobGuardado = blob
        const url = window.URL.createObjectURL(blob);

        // Leer el nombre desde el header
        const disposition = res.headers.get('Content-Disposition');
        let fileName = `${varView.propiedadesPDF.servicio}`;
        if (disposition) {
            const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/);
            if (match && match[1]) {
                fileName = decodeURIComponent(match[1]);
            }
        }

        nombrePDF.value = fileName

        // Opcion de abrimos el PDF en una nueva pestaña sin descargar
        document.getElementById('visorPDF').src = url;

        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        varView.cargando = false
    } catch (err) {
        console.error("Error al obtener el PDF:", err);
        varView.cargando = false
    }
}

async function descargarPDF() {
    if (!blobGuardado) return;
    const url = window.URL.createObjectURL(blobGuardado);

    const a = document.createElement("a");
    a.href = url;
    a.download = nombrePDF.value;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

const cerrarPDF = () => {
    varView.showPDFServicio = false
}

</script>

<template>
    <FondoBlur>
        <div class="bg-white rounded-xl overflow-hidden shadow-2xl w-4/5 max-w-4xl relative">

            <!-- Encabezado -->
            <div class="bg-[var(--color-default)] px-5 py-3 flex justify-between">
                <h3 class="text-white text-lg font-semibold">Vista previa del documento PDF</h3>

                <div class="flex gap-1">
                    <!-- Botón de descarga -->
                    <div @click="descargarPDF"
                        class="w-10 h-10 flex justify-center items-center rounded-xl text-gray-200 hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer transition">
                        <i class="fa-solid fa-download hover:text-white"></i>
                    </div>
                    <!-- Botón de cierre -->
                    <div @click="cerrarPDF"
                        class="w-10 h-10 flex justify-center items-center rounded-xl text-gray-200 hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer transition">
                        <i class="fa-solid fa-close hover:text-white"></i>
                    </div>
                </div>
            </div>

            <!-- Contenedor del visor -->
            <iframe id="visorPDF" class="w-full h-[600px] border-0"></iframe>

            <!-- Pie de página -->
            <div class="bg-gray-100 px-5 py-2 text-right text-sm text-gray-600">
                📄 Documento cargado para vista previa
            </div>
        </div>

    </FondoBlur>

</template>