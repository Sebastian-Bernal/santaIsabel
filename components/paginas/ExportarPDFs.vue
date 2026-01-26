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
const filtrarAnalisisPorFecha = (analisis, historias, servicio, fechaInicio, fechaFin, id_paciente = '', id_profesional = '') => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999); // incluir todo el último día

    return analisis.filter(item => {
        const fechaCreacion = new Date(item.created_at);

        // Buscar paciente asociado a la historia
        const id_paciente_analisis = historias.find(h => h.id === item.id_historia)?.id_paciente;

        // Condiciones dinámicas
        const condicionFecha = fechaCreacion >= inicio && fechaCreacion <= fin;
        const condicionProfesional = id_profesional ? parseInt(id_profesional) === parseInt(item.id_medico) : true;
        const condicionPaciente = id_paciente ? parseInt(id_paciente) === parseInt(id_paciente_analisis) : true;
        const condicionServicio = servicio === item.servicio

        return condicionFecha && condicionProfesional && condicionPaciente && condicionServicio;
    });
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

        // Filtrar análisis por rango de fechas
        const analisisFiltrados = filtrarAnalisisPorFecha(
            analisisData,
            historiasData,
            file.servicio || varView.servicioPDF,
            file.fechaInicio,
            file.fechaFin,
            file.id_paciente || varView.id_pacientePDF,
            file.id_profesional
        );

        if (analisisFiltrados.length === 0) {
            options.position = 'top-end';
            options.texto = "No se encontraron Notas en el rango de fechas especificado";
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
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg md:w-[50%] md:h-[60%] w-[90%] h-[80%]">
            <div class="py-5 h-full flex flex-col justify-between">
                <h2 class="text-2xl font-semibold text-center py-2">Configuración datos a exportar</h2>
                <div class="h-full pt-5 overflow-y-auto scrollForm px-10">
                    <div class="flex justify-between items-center mb-5">
                        <p class="text-lg text-gray-600"><i class="fa-solid fa-gear"></i> Rango de Fechas</p>
                    </div>

                    <div class="pb-3">
                        <Select v-model="file.servicio" :Propiedades="{
                            placeholder: 'Servicio',
                            id: 'servicio',
                            name: 'servicio',
                            label: 'Elige el Servicio',
                            options: [
                                {
                                    text: 'Nota', value: 'Nota',
                                },
                                {
                                    text: 'Terapia', value: 'Terapia',
                                }
                            ]
                        }" />
                    </div>

                    <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
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

                    <div class="flex justify-between items-center mt-5" v-if="!varView.onlyPaciente">
                        <p class="text-base text-gray-600"><i class="fa-solid fa-user"></i> Filtrar por:</p>
                    </div>
                    <div class="grid md:grid-cols-2 grid-cols-1 gap-3" v-if="!varView.onlyPaciente">
                        <SelectSearch v-model="varView.pacientePDF" :Propiedades="{
                            placeholder: 'Paciente (opcional)',
                            tamaño: 'w-full',
                            id: 'paciente',
                            name: 'paciente',
                            label: 'Filtrar Paciente (opcional)',
                            options: pacientesStore.Pacientes,
                            opciones: [{ value: 'name' }, { text: 'Cedula', value: 'No_document' }],
                            seleccionarItem: (item) => {
                                console.log(item)
                                file.id_paciente = item.id_paciente
                            },
                            upperCase: true,
                        }" />
                        <SelectSearch v-model="file.profesionalPDF" :Propiedades="{
                            placeholder: 'Profesional (opcional)',
                            tamaño: 'w-full',
                            id: 'profesional',
                            name: 'profesional',
                            type: 'date',
                            label: 'Filtrar Profesional (opcional)',
                            options: profesionalStore.Medicos,
                            opciones: [{ value: 'name' }, { text: 'Cedula', value: 'No_document' }],
                            seleccionarItem: (item) => {
                                file.id_profesional = item.id_profesional
                            },
                            upperCase: true,
                        }" />
                    </div>

                    <!-- Mostrar progreso durante la generación -->
                    <div v-if="generandoPDFs" class="mt-6 space-y-3">
                        <div class="flex justify-between items-center">
                            <p class="text-sm font-semibold text-gray-700">Generando PDFs...</p>
                            <span class="text-sm font-bold text-blue-600">{{ progreso }}%</span>
                        </div>
                        <div class="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                            <div class="bg-blue-500 h-full transition-all duration-300"
                                :style="{ width: progreso + '%' }"></div>
                        </div>
                    </div>
                </div>
                <div class="w-full flex justify-center items-center gap-3 px-2">
                    <ButtonForm color="bg-gray-500 md:w-[200px] sm:w-[2/3] w-full" @click="cerrar"
                        :disabled="generandoPDFs">
                        Cancelar
                    </ButtonForm>

                    <ButtonForm color="bg-blue-500 md:w-[200px] sm:w-[2/3] w-full" @click="validarform"
                        :disabled="generandoPDFs">
                        {{ generandoPDFs ? 'Procesando...' : 'Generar' }}
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