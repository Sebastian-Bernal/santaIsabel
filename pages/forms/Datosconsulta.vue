<script setup>
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Forms/Input.vue';
import Wizard from '../components/Forms/Wizard.vue';
import { ref, watch } from 'vue';

const formData = ref({
    HistoriaClinica: {
        motivo: '',
        signosVitales: {
            ta: '',
            fc: '',
            fr: '',
            t: '',
            SATo2: '',
        },
        fecha_historia: '',
        id_paciente: '',
        id_profesional: ''
    },
    examenFisico: {
        Peso: '',
        altura: '',
        otros: '',
        id_historiaClinica: ''
    },
    AnalisisTratamiento: {
        analisis: '',
        tratamiento: ''
    },
});
const formComplete = ref(false);

definePageMeta({
    layout: 'authentication'
});


// Guardar los datos en localStorage
watch(formData, (newValue) => {
    localStorage.setItem('formData', JSON.stringify(newValue));

    if (formData.value.HistoriaClinica.signosVitales.ta !== "" && formData.value.HistoriaClinica.signosVitales.fc !== "" && formData.value.HistoriaClinica.signosVitales.fr !== "" && formData.value.HistoriaClinica.signosVitales.t !== "" && formData.value.HistoriaClinica.signosVitales.SATo2 !== "" 
    && formData.value.examenFisico.otros !== "" && formData.value.AnalisisTratamiento.analisis !== "" && formData.value.AnalisisTratamiento.tratamiento !== "") {
        formComplete.value = true
    } else {
        formComplete.value = false
    }
}, { deep: true });

onMounted(() => {
    traerDatos();
});

const traerDatos = () => {
    const datosGuardados = localStorage.getItem('formData');
    if (datosGuardados) {
        formData.value = JSON.parse(datosGuardados);
    } else {
        console.log('No hay datos guardados en localStorage.');
    }
};
</script>

<template>
    <!-- Indicador de seccion, form wizard -->
    <Wizard :secciones="[
        { numPagina: 1, ruta: '/', color: 'bg-sky-700 text-white' },
        { numPagina: 2, ruta: '/forms/DatosCuidador', color: 'bg-sky-700 text-white' },
        { numPagina: 3, ruta: '/forms/DatosConsulta', color: 'bg-sky-700 text-white' }
    ]" />

    <Formulario :datos="{
        titulo: 'Datos de la consulta',
        botones: [
            { texto: 'Atras', ruta: '/forms/DatosCuidador', color: 'bg-gray-500' },
            { texto: 'Finalizar', ruta: '', color: 'bg-[var(--color-primary)]', submit: formComplete ? true : false }
        ],
        formData: formData.value
    }">
        <div class="md:w-4/5 w-full">
            <label class="block text-sm font-medium text-gray-700">Signos vitales</label>
            <div class="flex items-center gap-3 md:flex-row flex-col">
                <Input v-model="formData.HistoriaClinica.signosVitales.ta" type="number" id="ta" name="ta"
                    placeholder="TA" tamaño="md:w-1/5 w-full" />
                <Input v-model="formData.HistoriaClinica.signosVitales.fc" type="number" id="fc" name="fc"
                    placeholder="FC" tamaño="md:w-1/5 w-full" />
                <Input v-model="formData.HistoriaClinica.signosVitales.fr" type="number" id="fr" name="fr"
                    placeholder="FR" tamaño="md:w-1/5 w-full" />
                <Input v-model="formData.HistoriaClinica.signosVitales.t" type="number" id="t" name="t" placeholder="Tº"
                    tamaño="md:w-1/5 w-full" />
                <Input v-model="formData.HistoriaClinica.signosVitales.SATo2" type="number" id="sat" name="sat"
                    placeholder="Sat O2" tamaño="md:w-1/5 w-full" />
            </div>
        </div>

        <div class="md:w-4/5 w-full">
            <label class="block text-sm font-medium text-gray-700">Examen Fisico</label>
            <div class="flex items-center gap-3">
                <Input v-model="formData.examenFisico.otros" type="text" id="examenFisico" name="examenFisico"
                    placeholder="Peso/ Altura" tamaño="w-full" />
            </div>
        </div>

        <div class="md:w-4/5 w-full">
            <div class="flex items-center gap-3 md:flex-row flex-col">
                <textarea v-model="formData.AnalisisTratamiento.analisis" id="analisis" name="analisis"
                    placeholder="Analisis"
                    class="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm w-full"></textarea>
            </div>
        </div>

        <div class="md:w-4/5 w-full">
            <label class="block text-sm font-medium text-gray-700">Tratamiento</label>
            <div class="flex items-center gap-3 md:flex-row flex-col">
                <select v-model="formData.AnalisisTratamiento.tratamiento" name="rehabilitacion" id="rehabilitacion"
                    class="mt-1 block md:w-3/5 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option value="" selected>Condicion de Rehabilitacion</option>
                    <option value="Total o parcial">Total o Parcial</option>
                    <option value="Sin potencial de rehabilitacion">Sin potencial de rehabilitacion</option>
                    <option value="Cuidados paliativos o de mantenimiento">Cuidados paliativos o de mantenimiento</option>
                </select>

                <div class="md:w-2/5 w-full flex items-center gap-1">
                    <nuxt-link to="/forms/Datostratamiento" class="w-1/2">
                        <button type="button"
                            class="w-full h-[40px] flex justify-center items-center gap-2 bg-[var(--color-green)] text-white text-sm rounded hover:opacity-75">
                            <i class="fa-solid fa-plus"></i>Medicina
                        </button>
                    </nuxt-link>
                    <nuxt-link to="/forms/Datosservicios" class="w-1/2">
                        <button type="button"
                            class="w-full h-[40px] flex justify-center items-center gap-2 bg-blue-400 text-white text-sm rounded hover:opacity-75">
                            <i class="fa-solid fa-plus"></i>Servicios
                        </button>
                    </nuxt-link>
                </div>
            </div>
        </div>
    </Formulario>
</template>