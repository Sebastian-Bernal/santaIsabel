<script setup>
// import CardRips from '~/components/molecules/Cards/CardRips.vue';
const { $html2canvas, $jsPDF } = useNuxtApp()

const generatePDF = async () => {
    const element = document.getElementById('pdf-content')
    const canvas = await $html2canvas(element, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new $jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('documento.pdf')
}


</script>

<template>
    <div class="bg-gray-100 h-[100%] py-8 px-12">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h2 class="text-2xl font-bold text-gray-700">Reportes RIPS</h2>
                <p class="text-gray-600 mt-2">Registro Individual de Prestación de Servicios de Salud</p>
            </div>
            <div class="flex gap-4">
                <button class="bg-gray-200 p-3 rounded-2xl flex items-center gap-3">
                    <i class="fa-solid fa-check-double"></i>
                    Validar todo
                </button>
                <button class="bg-blue-500 text-white p-3 rounded-2xl flex items-center gap-3">
                    <i class="fa-solid fa-download"></i>
                    Generar RIPS
                </button>
            </div>
        </div>
        
        <div>
            <div id="pdf-content">
                <h1>Hola Nuxt</h1>
                <p>Este contenido se exportará como PDF.</p>
            </div>
            <button @click="generatePDF">Exportar a PDF</button>
        </div>

        <!-- <CardRips /> -->
    </div>
</template>