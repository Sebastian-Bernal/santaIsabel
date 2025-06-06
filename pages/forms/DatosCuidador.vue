<script setup>
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Forms/Input.vue';
import Wizard from '../components/Forms/Wizard.vue';
import { ref, watch, onMounted } from 'vue';
definePageMeta({
    layout: 'authentication'
});

const formData = ref({
    motivo: '',
    enfermedad: '',
    antecedentes: [{ valor: ''}]
});

const antecedentesDatos = ref(['Hipertensión', 'Diabetes', 'Enfermedad cardíaca']);
const enfermedades = ref(['Gripe', 'Resfriado', 'Dolor de cabeza']);

// Guardar los datos en localStorage
watch(formData, (newValue) => {
    localStorage.setItem('formData', JSON.stringify(newValue));
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


// Funciones para manejar los antecedentes y enfermedades
const agregarAntecedente = () => {
    ultimoAntecedente = formData.value.antecedentes[formData.value.antecedentes.length - 1];
    if (ultimoAntecedente.valor === '') {
        console.log('Por favor, ingrese un antecedente antes de agregar.');
        return;
    }
    formData.value.diagnosticos.push({ valor: '' });
};

const agregarEnfermedad = () => {
    if (formData.value.enfermedad === '') {
        console.log('Por favor, ingrese un antecedente antes de agregar.');
        return;
    }
    enfermedades.value.push(formData.value.enfermedad);
    formData.value.enfermedad = ''; // Limpiar el campo de entrada
};
</script>

<template>
    <Wizard :secciones="[
        { numPagina: 1, ruta: '/', color: 'bg-sky-700 text-white' },
        { numPagina: 2, ruta: '/forms/DatosCuidador', color: 'bg-sky-700 text-white' },
        { numPagina: 3, ruta: '/forms/DatosConsulta', color: 'bg-gray-300' }
    ]"/>
    <Formulario :datos="{
        titulo: 'Datos de la consulta',
        botones: [
            { texto: 'Atras', ruta: '/', color: 'bg-gray-500' },
            { texto: 'Siguiente', ruta: '/forms/Datosconsulta', color: 'bg-[var(--color-primary)]' }
        ]
    }">
        <div class="md:w-4/5 w-full">
                <label class="block text-sm font-medium text-gray-700">Consulta</label>
                <div class="flex items-center gap-3">
                    <textarea v-model="formData.motivo" id="motivo" name="motivo" placeholder="Motivo de consulta"
                        rows="3"
                        class="w-full mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                </div>
            </div>

            <div class="md:w-4/5 w-full flex flex-col gap-3">
                    <div class="flex items-center gap-1 h-[40px] mb-2 w-full">
                        <div class="flex items-center gap-3 w-full" v-for="(antecedente, i) in formData.antecedentes" :key="id">
                            <Input v-model="antecedente.valor" type="text" id="antecedentes" name="antecedentes"
                                placeholder="Antecedentes" tamaño="w-full" />
                            <i v-if="i > 0" class="fa-solid fa-close text-gray-500" @click="eliminarDiagnostico(i)"></i>
                        </div>
                        <button type="button" @click="agregarAntecedente()"
                            class="w-[25px] h-[25px] flex justify-center items-center bg-blue-500 text-white rounded-full hover:bg-blue-600">
                            <i class="fa-solid fa-plus"></i>
                        </button>
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
                    <div class="flex items-center gap-1 h-[40px] mb-2 w-full">
                        <div class="flex items-center gap-3 w-full">
                            <Input v-model="formData.enfermedad" type="text" id="enfermedad" name="enfermedad"
                                placeholder="Enfermedad Actual" tamaño="w-full" />
                        </div>
                        <button type="button" @click="agregarEnfermedad()"
                            class="w-[25px] h-[25px] flex justify-center items-center bg-blue-500 text-white rounded-full hover:bg-blue-600">
                            <i class="fa-solid fa-plus"></i>
                        </button>
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