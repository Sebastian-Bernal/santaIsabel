<script setup>
import FormularioWizard from '../../components/Forms/FormularioWizard.vue';
import Input from '../../components/Inputs/Input.vue';
import Textarea from '~/components/Textareas/Textarea.vue';
import Section from '~/components/Forms/Section.vue';
import Label from '~/components/Labels/Label.vue';
import Button from '~/components/Buttons/Button.vue';
import ButtonForm from '~/components/Buttons/ButtonForm.vue';
import { useHistoriaClinicaStore } from '~/composables/Formulario/HistoriaClinica';
import { ref, watch, onMounted } from 'vue';

// Declaracion de variables
const historiaClinicaStore = useHistoriaClinicaStore();

const {
    formData,
    traerDatos,
    guardarDatos,
    agregarItem,
    eliminarItem,
} = historiaClinicaStore;

const antecedentesDatos = ref(['Hipertensión', 'Diabetes', 'Enfermedad cardíaca']);
const enfermedades = ref(['Gripe', 'Resfriado', 'Dolor de cabeza']);
const formComplete = ref(false);
const { $swal } = useNuxtApp();


// Guardar los datos en localStorage
watch(formData, (newValue) => {
    guardarDatos(newValue)

    if (formData.HistoriaClinica.motivo !== "" && formData.Enfermedad.valor !== "" && formData.Antecedentes.at(-1).valor !== "") {
        formComplete.value = true
    } else {
        formComplete.value = false
    }
}, { deep: true });

onMounted(() => {
    traerDatos();
});

// Funciones
const validarform = () => {
    if (!formComplete.value) {
        $swal.fire({
            position: "top-end",
            text: "Falta campos por llenar, por favor ingrese valores",
            showConfirmButton: false,
            timer: 1500,
            background: '#d33',
            color: '#fff'
        });
    }
};
</script>

<template>
    <div class="w-full h-full flex flex-col items-center">
        <FormularioWizard class="mt-3" :datos="{
            titulo: 'Consulta Medica',
            tituloFormulario: 'Nueva Historia Clinica',
            secciones: [
                { numPagina: 1, ruta: '/Historias/Ingresar', color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 2, ruta: '/Historias/Paso2', color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 3, ruta: '/Historias/Paso3', color: 'bg-gray-300' }
            ]
        }" tamaño="w-[90%] h-[97%]">

            <Section styles="flex-col">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-comment text-blue-500"></i>
                    <Label forLabel="motivo">Consulta</Label>
                </div>
            </Section>
            <Section>
                <Textarea v-model="formData.HistoriaClinica.motivo" id="motivo" name="motivo"
                    placeholder="Describa el motivo principal de la consulta..." rows="3"></Textarea>
            </Section>


            <Section>
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-clock text-red-300"></i>
                    <Label forLabel="enfermedad">Enfermedad Actual</Label>
                </div>
            </Section>

            <Section styles="flex-col gap-1 mb-2 w-full max-h-[100px] overflow-y-auto">
                <div class="w-full flex gap-3 items-center">
                    <Input v-model="formData.Enfermedad.valor" type="text" id="enfermedad" name="enfermedad"
                        placeholder="Describa la evolucion de la enfermedad actual, sintomas, duracion, factores, desencadenantes..."
                        tamaño="w-full" />
                </div>
            </Section>

            <Section class="mt-3">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-folder text-blue-500"></i>
                    <Label forLabel="antecedentes">Antecedentes</Label>
                </div>
                <Button color="bg-blue-500"
                    @click="agregarItem('Antecedentes', { id: '', valor: '', id_paciente: '', }, 'valor')">
                    <i class="fa-solid fa-plus"></i>
                </Button>
            </Section>
            <Section styles="flex-col gap-1 mb-2 w-full max-h-[100px] overflow-y-auto">
                <div class="w-full flex gap-3 items-center" v-for="(antecedente, i) in formData.Antecedentes" :key="id">
                    <Input v-model="antecedente.valor" type="text" id="antecedentes" name="antecedentes"
                        placeholder="Antecedentes" tamaño="w-full" />
                    <i v-if="i > 0" class="fa-solid fa-close text-gray-500"
                        @click="eliminarItem('Antecedentes', i)"></i>
                </div>
            </Section>
            <!-- Registro de antecedentes -->
            <Section>
                <div class="w-full md:w-4/5 flex flex-col gap-3 border border-gray-300 rounded-md py-5">
                    <div class="flex items-center w-full justify-center">
                        <p class="block text-sm font-medium text-gray-700">Antecedentes Personales</p>
                    </div>
                    <div class="flex flex-col items-center w-full">
                        <p v-for="antecedente in antecedentesDatos" class="text-gray-500 text-sm">{{ antecedente }}</p>
                    </div>
                </div>
                <div class="w-full md:w-4/5 flex flex-col gap-3 border border-gray-300 rounded-md py-5">
                    <div class="flex items-center w-full justify-center">
                        <p class="block text-sm font-medium text-gray-700">Enfermedades Recientes</p>
                    </div>
                    <div class="flex flex-col items-center w-full">
                        <p v-for="antecedente in enfermedades" class="text-gray-500 text-sm">{{ antecedente }}</p>
                    </div>
                </div>
            </Section>

            <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[10px] left-auto right-auto">
                <nuxtLink to="/Historias/Ingresar">
                    <ButtonForm color="bg-gray-500"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Atras
                    </ButtonForm>
                </nuxtLink>
                <nuxtLink :to="formComplete ? '/Historias/Paso3' : ''">
                <ButtonForm color="bg-blue-500" @click="validarform"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Registrar
                </ButtonForm>
                </nuxtLink>
            </div>

        </FormularioWizard>
        </div>
</template>