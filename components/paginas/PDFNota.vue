<script setup>
import FondoBlur from '../atoms/Fondos/FondoBlur.vue';
import { decryptData } from '~/composables/Formulario/crypto';
import { onMounted} from 'vue';

const varView = useVarView();

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await exportarNotaPDF(varView.propiedadesPDF)
    varView.cargando = false
});

// PDF
async function exportarNotaPDF(data) {
    try {
        varView.cargando = true
        const config = useRuntimeConfig()
        const token = decryptData(sessionStorage.getItem('token'))
        const res = await fetch(`${config.public.api}/api/v1/Nota/${data.id_analisis}/pdf`, {
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
        const url = window.URL.createObjectURL(blob);

        // Opcion de abrimos el PDF en una nueva pestaña sin descargar
        document.getElementById('visorPDF').src = url;


        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        varView.cargando = false
    } catch (err) {
        console.error("Error al obtener el PDF:", err);
        varView.cargando = false
    }
}

const cerrarPDF = () => {
    varView.showPDFNota = false
}

</script>

<template>
    <FondoBlur>
        <div class="bg-white rounded-xl overflow-hidden shadow-2xl w-4/5 max-w-4xl relative">

            <!-- Botón de cierre -->
            <div @click="cerrarPDF"
                class="absolute top-2 right-2 w-10 h-10 flex justify-center items-center rounded-xl text-gray-200 hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer transition">
                <i class="fa-solid fa-close hover:text-white"></i>
            </div>

            <!-- Encabezado -->
            <div class="bg-[var(--color-default)] text-white px-5 py-3 text-lg font-semibold">
                Vista previa del documento PDF
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