<script setup>
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Forms/Input.vue';
import Wizard from '../components/Forms/Wizard.vue';
import { ref } from 'vue';
definePageMeta({
    layout: 'authentication'
});

const formData = ref({
    motivo: '',
    enfermedad: '',
    antecedentes: '',
});

const antecedentes = ['Hipertensión', 'Diabetes', 'Asma', 'Enfermedad cardíaca'];
const enfermedades = ['Gripe', 'Resfriado', 'Infección urinaria', 'Dolor de cabeza'];

const añadirDiagnostico = () => {
    const ultimoDiagnostico = formData.value.diagnosticos[formData.value.diagnosticos.length - 1];
    if (ultimoDiagnostico.tipo === '' || ultimoDiagnostico.cie10 === '') {
        console.log('Por favor, complete el diagnóstico actual antes de añadir uno nuevo.');
        return;
    } else {
        formData.value.diagnosticos.push({ tipo: '', cie10: '' });
    }

};

const agregarAntecedente = () => {
    if (formData.value.antecedentes.trim() === '') {
        console.log('Por favor, ingrese un antecedente antes de agregar.');
        return;
    }
    antecedentes.push(formData.value.antecedentes);
    formData.value.antecedentes = ''; // Limpiar el campo de entrada
};
</script>

<template>
    <Wizard :secciones="[
        { numPagina: 1, ruta: '/', color: 'bg-sky-700 text-white' },
        { numPagina: 2, ruta: '/forms/DatosCuidador', color: 'bg-sky-700 text-white' },
        { numPagina: 3, ruta: '/forms/DatosConsulta', color: 'bg-gray-300' }
    ]"/>
    <Formulario :datos="{
        titulo: 'Datos del cuidador',
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

            <div class="md:w-4/5 w-full flex md:flex-row flex-col gap-3">
                <div class="md:w-2/4">
                    <div class="flex items-center gap-1 h-[40px] mb-2 w-full">
                        <div class="flex items-center gap-3 w-full">
                            <Input v-model="formData.antecedentes" type="text" id="antecedentes" name="antecedentes"
                                placeholder="Antecedentes" tamaño="w-full" />
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
                            <p v-for="antecedente in antecedentes" class="text-gray-500 text-sm">{{ antecedente }}</p>
                        </div>
                    </div>
                </div>

                <div class="md:w-2/4">
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

            </div>

    </Formulario>>
</template>