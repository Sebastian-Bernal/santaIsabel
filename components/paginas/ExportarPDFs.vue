<script setup>
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import ButtonForm from '~/components/atoms/Buttons/ButtonForm.vue';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import { watch, reactive, ref } from 'vue'
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales';

const varView = useVarView()
const notificacionesStore = useNotificacionesStore();
const historiasStore = useHistoriasStore();
const pacientesStore = usePacientesStore();
const medicoStore = useMedicosStore();
const store = useIndexedDBStore();
const apiRest = useApiRest();
const config = useRuntimeConfig();

const {
    mensaje,
    options
} = notificacionesStore;

const props = defineProps({
    datos: {
        type: [Object],
    },
    tabla: String,
});

const datos = ref()
const generandoPDFs = ref(false);
const progreso = ref(0);

const file = reactive({
    fechaInicio: '',
    fechaFin: '',
    worksheet: '',
    opciones: []
});

const camposRequeridos = [
    'fechaInicio', 'fechaFin', 'worksheet'
];

watch(file, (newValue) => {
    file.value = newValue

    // Validacion
    const camposValidos = camposRequeridos.every((campo) => file.value[campo] !== '');
    varView.formComplete = camposValidos;
});

function cerrar() {
    varView.showExportarPDFs = false
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    } else {
        enviarPDFs()
    }
};

// Filtrar análisis por rango de fechas
const filtrarAnalisisPorFecha = (analisis, fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999); // Incluir todo el último día

    return analisis.filter(analisis => {
        const fechaCreacion = new Date(analisis.created_at);
        return fechaCreacion >= inicio && fechaCreacion <= fin;
    });
};

// Formatear fecha
const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
};

// Calcular edad
const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    return edad;
};

// Generar PDF individual de una nota
const generarPDFNota = async (data, dataPaciente, profesional, descripcion, diagnosticos, diagnosticosCIF) => {
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
            return (a.hora || "").localeCompare(b.hora || "");
        });

        if (notasTipo.length === 0) return "";

        let contenido = `<p class="text-start text-xs py-1"><strong>${tipo.toUpperCase()}:</strong></p>`;

        contenido += notasTipo.map(nota => `
            <div class="flex">
                <p class="text-xs border-r-1 px-3 py-1">${nota.hora || ''}</p>
                <p class="text-xs w-full px-1">${nota.descripcion || ''}</p>
            </div>
        `).join("");

        contenido += `<hr class="w-full h-1"/>`;

        return contenido;
    }).join("");

    // Filtrar diagnósticos para esta nota
    const diagnosticosNota = Array.isArray(diagnosticos)
        ? diagnosticos
            .filter(diagnostico => diagnostico.id_analisis === data.id_analisis)
            .map(diagnostico => [
                `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
                `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
            ])
        : [];

    // Crear contenido HTML para el PDF
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <!-- ENCABEZADO -->
            <div style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="text-align: center; flex: 1;">
                        <img src="/logo.png" style="width: 60px; height: auto;" />
                        <p style="margin: 5px 0; font-size: 12px;"><strong>Santa Isabel IPS</strong></p>
                    </div>
                    <div style="flex: 2; padding-left: 20px;">
                        <p style="font-size: 11px; margin: 5px 0; border-bottom: 1px solid #000; padding-bottom: 5px;">
                            <strong>Proceso:</strong> Programa de Atención Domiciliaria
                        </p>
                        <p style="font-size: 11px; margin: 5px 0; border-bottom: 1px solid #000; padding-bottom: 5px;">
                            <strong>Registro</strong>
                        </p>
                        <p style="font-size: 11px; margin: 5px 0;">
                            <strong>Nota de Enfermería de Atención Domiciliaria</strong>
                        </p>
                    </div>
                    <div style="flex: 1; text-align: right; font-size: 10px;">
                        <p style="margin: 5px 0; border-bottom: 1px solid #000; padding-bottom: 5px;">Código: </p>
                        <p style="margin: 5px 0; border-bottom: 1px solid #000; padding-bottom: 5px;">Versión: </p>
                        <p style="margin: 5px 0; border-bottom: 1px solid #000; padding-bottom: 5px;">Fecha: ${data.fecha_nota || formatearFecha(new Date())}</p>
                        <p style="margin: 5px 0;">Página: 1 de 1</p>
                    </div>
                </div>
            </div>

            <!-- DATOS DEL PACIENTE -->
            <div style="margin-bottom: 20px;">
                <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px;">
                    DATOS DEL PACIENTE
                </h3>
                <table style="width: 100%; font-size: 10px; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 5px; border: 1px solid #ddd;">
                            <strong>Nombre completo:</strong> ${dataPaciente.name}
                        </td>
                        <td style="padding: 5px; border: 1px solid #ddd;"></td>
                    </tr>
                    <tr>
                        <td style="padding: 5px; border: 1px solid #ddd;">
                            <strong>No. documento:</strong> ${dataPaciente.No_document}<br/>
                            <strong>Tipo de documento:</strong> ${dataPaciente.type_doc}
                        </td>
                        <td style="padding: 5px; border: 1px solid #ddd;">
                            <strong>Edad:</strong> ${calcularEdad(dataPaciente.nacimiento)}<br/>
                            <strong>Sexo:</strong> ${dataPaciente.sexo}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 5px; border: 1px solid #ddd;" colspan="2">
                            <strong>EPS:</strong> ${dataPaciente.Eps} | <strong>Zona:</strong> ${dataPaciente.zona || 'N/A'}
                        </td>
                    </tr>
                </table>
            </div>

            <!-- DIAGNÓSTICOS -->
            <div style="margin-bottom: 20px;">
                <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px;">
                    DIAGNÓSTICOS
                </h3>
                <table style="width: 100%; font-size: 10px; border-collapse: collapse;">
                    <tr style="background-color: #f0f0f0;">
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Diagnóstico</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left; width: 15%;">CIE-10</th>
                    </tr>
                    ${diagnosticosNota.length > 0 
                        ? diagnosticosNota.map(diag => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">${diag[0]}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${diag[1]}</td>
                            </tr>
                        `).join('')
                        : '<tr><td colspan="2" style="padding: 8px; border: 1px solid #ddd;">Sin diagnósticos registrados</td></tr>'
                    }
                </table>
            </div>

            <!-- NOTA DE ENFERMERÍA -->
            <div style="margin-bottom: 20px;">
                <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px;">
                    NOTA DE ENFERMERÍA
                </h3>
                <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 15px;">
                    <div style="display: flex; gap: 10px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                        <strong style="font-size: 10px; width: 80px;">Fecha:</strong>
                        <div style="flex: 1; border-left: 1px solid #ddd; padding-left: 10px;">
                            <strong style="font-size: 10px;">Nota</strong>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <p style="font-size: 10px; width: 80px; margin: 0;">${data.fecha_nota || formatearFecha(new Date())}</p>
                        <div style="flex: 1; border-left: 1px solid #ddd; padding-left: 10px; font-size: 9px;">
                            ${filasNotas}
                        </div>
                    </div>
                </div>
            </div>

            <!-- FIRMA Y SELLO -->
            <div style="margin-top: 40px;">
                <table style="width: 100%; font-size: 10px;">
                    <tr>
                        <td style="text-align: center; padding: 20px; border-top: 1px solid #000; width: 50%;">
                            <p style="margin: 20px 0 0 0;">
                                <strong>${profesional.name}</strong>
                            </p>
                            <p style="margin: 5px 0 0 0;">
                                ${profesional.No_document}
                            </p>
                        </td>
                        <td style="text-align: center; padding: 20px; border-top: 1px solid #000; width: 50%;">
                            ${profesional.sello ? `<img src="${config.public.api}/storage/${profesional.sello}" style="width: 100px; height: 100px; object-fit: contain;" />` : '<p>Firma y Sello</p>'}
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    `;

    return htmlContent;
};

// Convertir HTML a PDF usando html2canvas y jsPDF
const htmlToPDF = async (html, filename) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Crear un elemento temporal para renderizar el HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '210mm';
            tempDiv.style.background = 'white';
            document.body.appendChild(tempDiv);

            // Convertir a canvas
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            // Limpiar elemento temporal
            document.body.removeChild(tempDiv);

            // Crear PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= 297;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= 297;
            }

            resolve(pdf.output('arraybuffer'));
        } catch (error) {
            console.error('Error al generar PDF:', error);
            reject(error);
        }
    });
};

const enviarPDFs = async () => {
    try {
        generandoPDFs.value = true;
        progreso.value = 0;

        // Cargar datos necesarios
        varView.cargando = true;
        await apiRest.getData('HistoriaClinica', 'historiasClinicas');
        await apiRest.getData('Analisis', 'analisis');
        await apiRest.getData('Diagnosticos', 'diagnosticos');
        await apiRest.getData('Descripcion_nota', 'descripcionNotas');
        varView.cargando = false;

        // Obtener datos
        const pacientes = await pacientesStore.listPacientes();
        const profesionales = await medicoStore.listMedicos(false);

        store.almacen = 'Descripcion_nota';
        const descripcionesNotas = await store.leerdatos();

        store.almacen = 'Analisis';
        let analisisData = await store.leerdatos();

        store.almacen = 'Diagnosticos';
        const diagnosticosData = await store.leerdatos();

        // Filtrar análisis por rango de fechas
        const analisisFiltrados = filtrarAnalisisPorFecha(
            analisisData,
            file.fechaInicio,
            file.fechaFin
        );

        if (analisisFiltrados.length === 0) {
            options.position = 'top-end';
            options.texto = "No se encontraron análisis en el rango de fechas especificado";
            options.tiempo = 2000;
            mensaje();
            generandoPDFs.value = false;
            return;
        }

        const totalAnalisis = analisisFiltrados.length;

        // Generar y descargar PDFs secuencialmente
        for (let i = 0; i < analisisFiltrados.length; i++) {
            const analisis = analisisFiltrados[i];

            // Obtener datos del paciente asociado a esta nota
            const paciente = pacientes.find(p => p.id_paciente === analisis.id_paciente);
            if (!paciente) continue;

            const profesional = profesionales.find(med => med.id_profesional === analisis.id_profesional);
            if (!profesional) continue;

            // Obtener diagnósticos para este análisis
            const diagnosticosPorAnalisis = (diagnosticosData || []).filter(d => d.id_analisis === analisis.id);

            // Generar HTML del PDF
            const htmlContent = await generarPDFNota(
                analisis,
                paciente,
                profesional,
                descripcionesNotas,
                diagnosticosPorAnalisis,
                []
            );

            // Convertir a PDF
            const pdfBuffer = await htmlToPDF(
                htmlContent,
                `NOTA_${paciente.name}_${formatearFecha(new Date(analisis.created_at))}`
            );

            // Descargar PDF individual
            const nombreArchivo = `NOTA_${paciente.name.replace(/\s+/g, '_')}_${formatearFecha(new Date(analisis.created_at))}.pdf`;
            const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nombreArchivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Pequeña pausa entre descargas (500ms)
            await new Promise(resolve => setTimeout(resolve, 500));

            progreso.value = Math.round(((i + 1) / totalAnalisis) * 100);
        }

        // Mensaje de éxito
        options.position = 'top-end';
        options.texto = `${totalAnalisis} PDFs generados y descargados exitosamente`;
        options.tiempo = 2000;
        mensaje();

        cerrar();
    } catch (error) {
        console.error('Error al exportar PDFs:', error);
        options.position = 'top-end';
        options.texto = "Error al generar los PDFs. Por favor intente nuevamente.";
        options.tiempo = 2000;
        mensaje();
    } finally {
        generandoPDFs.value = false;
        progreso.value = 0;
    }
}
</script>

<template>
    <FondoBlur>
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg pb-7 md:w-[50%] md:h-[50%] w-[90%] h-[80%]">
            <div class="py-5 h-full flex flex-col justify-between">
                <h2 class="text-2xl font-semibold text-center py-2">Configuración datos a exportar</h2>
                <div class="h-full pt-5 overflow-y-auto scrollForm px-10">
                    <div class="flex justify-between items-center mb-5">
                        <p class="text-lg text-gray-600"><i class="fa-solid fa-gear"></i> Rango de Fechas</p>
                    </div>

                    <div class="grid md:grid-cols-2 grid-cols-1 gap-3 pt-3">
                        <Input v-model="file.fechaInicio" :Propiedades="{
                            placeholder: 'Fecha de inicio',
                            id: 'fechaInicio',
                            name: 'fechaInicio',
                            label: 'Fecha de Inicio',
                            type: 'date',
                        }" />
                        <Input v-model="file.fechaFin" :Propiedades="{
                            placeholder: 'Fecha de fin',
                            id: 'fechaFin',
                            name: 'fechaFin',
                            type: 'date',
                            label: 'Fecha de Fin',
                        }" />
                    </div>

                    <!-- Mostrar progreso durante la generación -->
                    <div v-if="generandoPDFs" class="mt-6 space-y-3">
                        <div class="flex justify-between items-center">
                            <p class="text-sm font-semibold text-gray-700">Generando PDFs...</p>
                            <span class="text-sm font-bold text-blue-600">{{ progreso }}%</span>
                        </div>
                        <div class="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                            <div 
                                class="bg-blue-500 h-full transition-all duration-300"
                                :style="{ width: progreso + '%' }"
                            ></div>
                        </div>
                    </div>
                </div>
                    <div class="w-full flex justify-center items-center gap-3 px-2">
                        <ButtonForm 
                            color="bg-gray-500 md:w-[200px] sm:w-[2/3] w-full" 
                            @click="cerrar"
                            :disabled="generandoPDFs"
                        >
                            Cancelar
                        </ButtonForm>

                        <ButtonForm 
                            color="bg-blue-500 md:w-[200px] sm:w-[2/3] w-full" 
                            @click="validarform"
                            :disabled="generandoPDFs"
                        >
                            {{ generandoPDFs ? 'Procesando...' : 'Generar' }}
                        </ButtonForm>
                    </div>
            </div>
        </div>
    </FondoBlur>
</template>

<style scoped>
.autocomplete-list li {
    padding: 10px 15px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #eee;
}

.autocomplete-list li:last-child {
    border-bottom: none;
}

.autocomplete-list li:hover {
    background-color: #e5f0ff;
}
</style>