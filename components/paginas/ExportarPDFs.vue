<script setup>
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import ButtonForm from '~/components/atoms/Buttons/ButtonForm.vue';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import SelectSearch from '../atoms/Selects/SelectSearch.vue';
import Select from '../atoms/Selects/Select.vue';

import { watch, reactive, ref } from 'vue'
import { decryptData } from '~/composables/Formulario/crypto';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales';

const varView = useVarView()
const notificacionesStore = useNotificacionesStore();
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

const generandoPDFs = ref(false);
const progreso = ref(0);
const pacientesStore = usePacientesStore()
const profesionalStore = useMedicosStore()
const calendarioCitasStore = useCalendarioCitas();

const file = reactive({
    fechaInicio: '',
    fechaFin: '',
    id_paciente: varView.id_pacientePDF,
    id_profesional: '',
    servicio: varView.servicioPDF,
});

const camposRequeridos = [
    'fechaInicio', 'fechaFin'
];

onMounted(() => {
    // Obtener la fecha actual desde el store
    const [dia, mes, año] = calendarioCitasStore.fechaActual.split('/');
    const fechaActual = new Date(`${año}-${mes}-${dia}`);

    // Fecha fin = hoy
    file.fechaFin = fechaActual.toISOString().split('T')[0];

    // Fecha inicio = un mes antes
    const fechaInicio = new Date(fechaActual);
    fechaInicio.setMonth(fechaInicio.getMonth() - 1);
    file.fechaInicio = fechaInicio.toISOString().split('T')[0];

})

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
const filtrarAnalisisPorFecha = (analisis, historias, notas, terapias, servicio, fechaInicio, fechaFin, id_paciente = '', id_profesional = '') => {
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0); // incluir desde el inicio del día

    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999); // incluir hasta el final del día

    const resultado = [];
    for (const item of analisis) {
        let fechaCreacion = '';

        if (servicio === 'Nota') {
            const nota = notas.find(n => n.id_analisis === item.id);
            if (!nota) continue;
            fechaCreacion = new Date(nota.fecha_nota);
        } else if (servicio === 'Terapia') {
            const terapia = terapias.find(n => n.id_analisis === item.id);
            if (!terapia) continue;
            fechaCreacion = new Date(terapia.fecha);
        } else {
            fechaCreacion = new Date(item.created_at);
        }

        const id_paciente_analisis = historias.find(h => h.id === item.id_historia)?.id_paciente;

        const condicionFecha = fechaCreacion >= inicio && fechaCreacion <= fin;
        const condicionProfesional = id_profesional ? parseInt(id_profesional) === parseInt(item.id_medico) : true;
        const condicionPaciente = id_paciente ? parseInt(id_paciente) === parseInt(id_paciente_analisis) : true;
        const condicionServicio = servicio === item.servicio;

        if (condicionFecha && condicionProfesional && condicionPaciente && condicionServicio) {
            resultado.push(item);
        }
    }
    return resultado;

};

const enviarPDFs = async () => {
    try {

        generandoPDFs.value = true;
        progreso.value = 0;

        // Cargar datos necesarios
        varView.cargando = true;
        await apiRest.getData('Analisis', 'analisis');
        await apiRest.getData('HistoriaClinica', 'historiasClinicas');
        varView.cargando = false;

        store.almacen = 'Analisis';
        let analisisData = await store.leerdatos();

        store.almacen = 'HistoriaClinica';
        let historiasData = await store.leerdatos();
        let notas = []
        let terapias = []

        if (file.servicio === 'Nota' || varView.servicioPDF === 'Nota') {
            notas = await apiRest.getData('Nota', 'notas');
        } else if (file.servicio === 'Terapia' || varView.servicioPDF === 'Terapia') {
            terapias = await apiRest.getData('Terapia', 'terapias');
        }

        // Filtrar análisis por rango de fechas
        const analisisFiltrados = filtrarAnalisisPorFecha(
            analisisData,
            historiasData,
            notas,
            terapias,
            file.servicio || varView.servicioPDF,
            file.fechaInicio,
            file.fechaFin,
            file.id_paciente || varView.id_pacientePDF,
            file.id_profesional
        );

        if (analisisFiltrados.length === 0) {
            options.position = 'top-end';
            options.background = '#d33'
            options.texto = "No se encontraron registros en el rango de fechas especificado";
            options.tiempo = 2000;
            mensaje();
            generandoPDFs.value = false;
            return;
        }

        const totalAnalisis = analisisFiltrados.length;
        const token = decryptData(sessionStorage.getItem('token'))
        // Generar y descargar PDFs secuencialmente
        for (let i = 0; i < analisisFiltrados.length; i++) {
            const analisis = analisisFiltrados[i];


            try {
                const res = await fetch(`${config.public.api}/api/v1/${file.servicio}/${analisis.id}/pdf`, {
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
                // window.open(url, '_blank');

                // Descargar
                const a = document.createElement('a');
                a.href = url;
                a.download = `${varView.servicioPDF || file.servicio}_${analisis.id}.pdf`; // nombre dinámico
                document.body.appendChild(a);
                a.click();
                a.remove();

                setTimeout(() => window.URL.revokeObjectURL(url), 10000);

                // Pausa entre descargas
                await new Promise(resolve => setTimeout(resolve, 500));

                progreso.value = Math.round(((i + 1) / totalAnalisis) * 100);
            } catch (err) {
                console.error("Error al obtener el PDF:", err);
            }
        }

        // Mensaje de éxito
        options.position = 'top-end';
        options.texto = `${totalAnalisis} PDFs generados y descargados exitosamente`;
        options.background = '#22c55e'
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
        <div class="bg-[rgba(0,0,0,0.5)] w-full h-full flex justify-center items-center">
            <div
                class="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 md:w-[55%] md:h-[65%] w-[90%] h-[80%] transform transition-all duration-300">
                <div class="py-6 h-full flex flex-col justify-between">
                    <!-- Título -->
                    <h2 class="text-2xl font-bold text-center py-3 text-gray-800 dark:text-gray-100 tracking-wide">
                        Configuración de Exportación
                    </h2>

                    <!-- Contenido scrollable -->
                    <div class="h-full pt-5 overflow-y-auto scrollForm px-10 space-y-6">
                        <!-- Sección rango de fechas -->
                        <div class="flex items-center gap-2 mb-5">
                            <i class="fa-solid fa-calendar-days text-blue-500"></i>
                            <p class="text-lg font-medium text-gray-700 dark:text-gray-300">Rango de Fechas</p>
                        </div>

                        <!-- Select servicio -->
                        <div class="pb-3" v-if="!varView.onlyPaciente">
                            <Select v-model="file.servicio" :Propiedades="{
                                placeholder: 'Servicio',
                                id: 'servicio',
                                name: 'servicio',
                                label: 'Elige el Servicio',
                                options: [
                                    { text: 'Nota', value: 'Nota' },
                                    { text: 'Terapia', value: 'Terapia' },
                                    { text: 'Evolución', value: 'Evolucion' },
                                    { text: 'Trabajo Social', value: 'Trabajo Social' },
                                    { text: 'Medicina', value: 'Medicina' }
                                ]
                            }" />
                        </div>

                        <!-- Inputs fechas -->
                        <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
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

                        <!-- Filtros -->
                        <div v-if="!varView.onlyPaciente">
                            <div class="flex items-center gap-2 mt-5">
                                <i class="fa-solid fa-filter text-green-500"></i>
                                <p class="text-base font-medium text-gray-700 dark:text-gray-300">Filtrar por:</p>
                            </div>
                            <div class="grid md:grid-cols-2 grid-cols-1 gap-4 mt-3">
                                <SelectSearch v-model="varView.pacientePDF" :Propiedades="{
                                    placeholder: 'Paciente (opcional)',
                                    tamaño: 'w-full',
                                    id: 'paciente',
                                    name: 'paciente',
                                    label: 'Filtrar Paciente (opcional)',
                                    options: pacientesStore.Pacientes,
                                    opciones: [{ value: 'name' }, { text: 'Cédula', value: 'No_document' }],
                                    seleccionarItem: (item) => {
                                        file.id_paciente = item.id_paciente
                                    },
                                    upperCase: true,
                                }" />
                                <SelectSearch v-model="file.profesionalPDF" :Propiedades="{
                                    placeholder: 'Profesional (opcional)',
                                    tamaño: 'w-full',
                                    id: 'profesional',
                                    name: 'profesional',
                                    label: 'Filtrar Profesional (opcional)',
                                    options: profesionalStore.Medicos,
                                    opciones: [{ value: 'name' }, { text: 'Cédula', value: 'No_document' }],
                                    seleccionarItem: (item) => {
                                        file.id_profesional = item.id_profesional
                                    },
                                    upperCase: true,
                                }" />
                            </div>
                        </div>

                        <!-- Progreso -->
                        <div v-if="generandoPDFs" class="mt-6 space-y-3">
                            <div class="flex justify-between items-center">
                                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">Generando PDFs...</p>
                                <span class="text-sm font-bold text-blue-600">{{ progreso }}%</span>
                            </div>
                            <div class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all duration-500 ease-out"
                                    :style="{ width: progreso + '%' }"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Botones -->
                    <div class="w-full flex justify-center items-center gap-4 px-4 mt-6">
                        <ButtonForm
                            color="bg-gray-500 hover:bg-gray-600 text-white font-semibold md:w-[200px] sm:w-[2/3] w-full shadow-md transition-all duration-300"
                            @click="cerrar" :disabled="generandoPDFs">
                            <i class="fa-solid fa-xmark mr-2"></i> Cancelar
                        </ButtonForm>

                        <ButtonForm
                            color="bg-blue-600 hover:bg-blue-700 text-white font-semibold md:w-[200px] sm:w-[2/3] w-full shadow-md transition-all duration-300"
                            @click="validarform" :disabled="generandoPDFs">
                            <i class="fa-solid fa-file-export mr-2"></i> {{ generandoPDFs ? 'Procesando...' : 'Generar'
                            }}
                        </ButtonForm>
                    </div>
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