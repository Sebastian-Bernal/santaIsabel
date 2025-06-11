<script setup>
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Forms/Input.vue';
import Wizard from '../components/Forms/Wizard.vue';
import { ref, watch, onMounted } from 'vue';
definePageMeta({
    layout: 'authentication'
});

// Declaracion de variables
const {formData, traerDatos, guardarDatos, agregarItem, eliminarItem} = useFormData();
const antecedentesDatos = ref(['Hipertensión', 'Diabetes', 'Enfermedad cardíaca']);
const enfermedades = ref(['Gripe', 'Resfriado', 'Dolor de cabeza']);
const formComplete = ref(false);
const seccion = ref('Antecedentes');


// Guardar los datos en localStorage
watch(formData, (newValue) => {
    guardarDatos(newValue)

    if (formData.HistoriaClinica.motivo !== "" && formData.Enfermedad.at(-1).valor !== "") {
        formComplete.value = true
    } else {
        formComplete.value = false
    }
}, { deep: true });

onMounted(() => {
    traerDatos();
});

</script>

<template>
    <Wizard :secciones="[
        { numPagina: 1, ruta: '/', color: 'bg-sky-700 text-white' },
        { numPagina: 2, ruta: '/forms/DatosCuidador', color: 'bg-sky-700 text-white' },
        { numPagina: 3, ruta: '/forms/DatosConsulta', color: 'bg-gray-300' }
    ]" />
    <Formulario :datos="{
        titulo: 'Datos de la consulta',
        botones: [
            { texto: 'Atras', ruta: '/', color: 'bg-gray-500' },
            { texto: 'Siguiente', ruta: formComplete ? '/forms/Datosconsulta' : '', color: 'bg-[var(--color-primary)]' }
        ]
    }">
        <div class="md:w-4/5 w-full">
            <label class="block text-sm font-medium text-gray-700">Consulta</label>
            <div class="flex items-center gap-3">
                <textarea v-model="formData.HistoriaClinica.motivo" id="motivo" name="motivo"
                    placeholder="Motivo de consulta" rows="3"
                    class="w-full mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>
        </div>

        <div v-if="seccion === 'Antecedentes'" class="md:w-4/5 w-full flex flex-col gap-3">
            <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700">Antecedentes</label>
                <button type="button" @click="agregarItem('Antecedentes',{id: '',valor: '',id_paciente: '',}, 'valor')"
                    class="w-[25px] h-[25px] flex justify-center items-center bg-blue-500 text-white rounded-full hover:bg-blue-600">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
            <div class="flex flex-col items-center gap-1 mb-2 w-full max-h-[100px] overflow-y-auto">
                <div class="flex items-center gap-3 w-full" v-for="(antecedente, i) in formData.Antecedentes" :key="id">
                    <Input v-model="antecedente.valor" type="text" id="antecedentes" name="antecedentes"
                        placeholder="Antecedentes" tamaño="w-full" />
                    <i v-if="i > 0" class="fa-solid fa-close text-gray-500" @click="eliminarItem('Antecedentes',i)"></i>
                </div>
            </div>

            <div class="flex flex-col gap-3 border border-gray-300 rounded-md p-2">
                <div class="flex items-center w-full justify-center">
                    <p class="block text-sm font-medium text-gray-700">Antecedentes del paciente</p>
                </div>
                <div class="flex flex-col items-center w-full">
                    <p v-for="antecedente in antecedentesDatos" class="text-gray-500 text-sm">{{ antecedente }}</p>
                </div>
            </div>
        </div>

        <div class="md:w-4/5 w-full flex flex-col gap-3">
            <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700">Enfermedades</label>
                <button type="button" @click="agregarItem('Enfermedad',{valor: '',fecha_diagnostico: '',fecha_rehabilitacion: '',}, 'valor')"
                    class="w-[25px] h-[25px] flex justify-center items-center bg-blue-500 text-white rounded-full hover:bg-blue-600">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
            <div class="flex flex-col items-center gap-1 mb-2 w-full max-h-[100px] overflow-y-auto">
                <div class="flex items-center gap-3 w-full" v-for="(enfermedad, i) in formData.Enfermedad" :key="id">
                    <Input v-model="enfermedad.valor" type="text" id="enfermedad" name="enfermedad"
                        placeholder="Enfermedad Actual" tamaño="w-full" />
                    <i v-if="i > 0" class="fa-solid fa-close text-gray-500" @click="eliminarItem('Enfermedad',i)"></i>
                </div>
            </div>

            <div class="flex flex-col gap-3 border border-gray-300 rounded-md p-2">
                <div class="flex items-center w-full justify-center">
                    <p class="block text-sm font-medium text-gray-700">Enfermedades</p>
                </div>
                <div class="flex flex-col items-center w-full">
                    <p v-for="enfermedad in enfermedades" class="text-gray-500 text-sm">{{ enfermedad }}</p>
                </div>
            </div>
        </div>

    </Formulario>>
</template>