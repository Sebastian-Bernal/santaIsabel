<script setup>
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Inputs/Input.vue';
import Textarea from '~/components/Textareas/Textarea.vue';
import Wizard from '../components/Forms/Wizard.vue';
import Section from '~/components/Forms/Section.vue';
import Label from '~/components/Labels/Label.vue';
import Button from '~/components/Buttons/Button.vue';
import { ref, watch, onMounted } from 'vue';
definePageMeta({
    layout: 'authentication'
});

// Declaracion de variables
const { formData, traerDatos, guardarDatos, agregarItem, eliminarItem } = useFormData();
const antecedentesDatos = ref(['Hipertensión', 'Diabetes', 'Enfermedad cardíaca']);
const enfermedades = ref(['Gripe', 'Resfriado', 'Dolor de cabeza']);
const formComplete = ref(false);


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
        { numPagina: 1, ruta: '/forms/HistoriaClinica/Paso1', color: 'bg-sky-700 text-white' },
        { numPagina: 2, ruta: '/forms/HistoriaClinica/Paso2', color: 'bg-sky-700 text-white' },
        { numPagina: 3, ruta: '/forms/HistoriaClinica/Paso3', color: 'bg-gray-300' }
    ]" />

    <Formulario :datos="{
        titulo: 'Datos de la consulta',
        botones: [
            { texto: 'Atras', ruta: '/forms/HistoriaClinica/Paso1', color: 'bg-gray-500' },
            { texto: 'Siguiente', ruta: formComplete ? '/forms/HistoriaClinica/Paso3' : '', color: 'bg-[var(--color-primary)]' }
        ]
    }">

        
        <Section styles="flex-col">
            <Label forLabel="motivo">Consulta</Label>
            <Textarea v-model="formData.HistoriaClinica.motivo" id="motivo" name="motivo"
                placeholder="Motivo de consulta" rows="3"></Textarea>
        </Section>



        <Section>
            <Label forLabel="antecedentes">Antecedentes</Label>
            <Button color="bg-blue-500"
                @click="agregarItem('Antecedentes', { id: '', valor: '', id_paciente: '', }, 'valor')">
                <i class="fa-solid fa-plus"></i>
            </Button>
        </Section>
        <Section styles="flex-col gap-1 mb-2 w-full max-h-[100px] overflow-y-auto">
            <div class="w-full flex gap-3 items-center" v-for="(antecedente, i) in formData.Antecedentes" :key="id">
                <Input v-model="antecedente.valor" type="text" id="antecedentes" name="antecedentes"
                    placeholder="Antecedentes" tamaño="w-full" />
                <i v-if="i > 0" class="fa-solid fa-close text-gray-500" @click="eliminarItem('Antecedentes', i)"></i>
            </div>
        </Section>
        <!-- Registro de antecedentes -->
        <div class="w-full md:w-4/5 flex flex-col gap-3 border border-gray-300 rounded-md">
            <div class="flex items-center w-full justify-center">
                <p class="block text-sm font-medium text-gray-700">Antecedentes del paciente</p>
            </div>
            <div class="flex flex-col items-center w-full">
                <p v-for="antecedente in antecedentesDatos" class="text-gray-500 text-sm">{{ antecedente }}</p>
            </div>
        </div>



        <Section>
            <Label forLabel="enfermedad">Enfermedades</Label>
            <Button color="bg-color-500"
                @click="agregarItem('Enfermedad', { valor: '', fecha_diagnostico: '', fecha_rehabilitacion: '', }, 'valor')">
                <i class="fa-solid fa-plus"></i>
            </Button>
        </Section>
        <Section styles="flex-col gap-1 mb-2 w-full max-h-[100px] overflow-y-auto">
            <div class="w-full flex gap-3 items-center" v-for="(enfermedad, i) in formData.Enfermedad" :key="id">
                <Input v-model="enfermedad.valor" type="text" id="enfermedad" name="enfermedad"
                    placeholder="Enfermedad Actual" tamaño="w-full" />
                <i v-if="i > 0" class="fa-solid fa-close text-gray-500" @click="eliminarItem('Enfermedad', i)"></i>
            </div>
        </Section>
        <!-- Registro de enfermedades -->
        <div class="w-full md:w-4/5 flex flex-col gap-3 border border-gray-300 rounded-md ">
            <div class="flex items-center w-full justify-center">
                <p class="block text-sm font-medium text-gray-700">Enfermedades</p>
            </div>
            <div class="flex flex-col items-center w-full">
                <p v-for="enfermedad in enfermedades" class="text-gray-500 text-sm">{{ enfermedad }}</p>
            </div>
        </div>

    </Formulario>
</template>