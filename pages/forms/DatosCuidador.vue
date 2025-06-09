<script setup>
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Forms/Input.vue';
import Wizard from '../components/Forms/Wizard.vue';
import { ref, watch, onMounted } from 'vue';
definePageMeta({
    layout: 'authentication'
});

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
    enfermedad: [{valor:''}],
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
    const ultimoAntecedente = formData.value.Antecedentes.at(-1).valor;
    if (ultimoAntecedente === '') {
        console.log('Por favor, ingrese un antecedente antes de agregar.');
        return;
    }
    formData.value.Antecedentes.push({ 
        id: '',
        valor: '',
        id_paciente: ''
    });
};

const eliminarAntecedente = (index) => {
    if (formData.value.Antecedentes.length > 1) {
        formData.value.Antecedentes.splice(index, 1);
    } else {
        console.log('Debe haber al menos un antecedente.');
    }
};

const agregarEnfermedad = () => {
    const ultimoAntecedente = formData.value.Enfermedad.at(-1).valor;
    if (ultimoAntecedente === '') {
        console.log('Por favor, ingrese un valor antes de agregar.');
        return;
    }
    formData.value.Enfermedad.push({ 
        valor: '',
        fecha_diagnostico: '',
        fecha_rehabilitacion: '',
    });
};

const eliminarEnfermedad = (index) => {
    if (formData.value.Enfermedad.length > 1) {
        formData.value.Enfermedad.splice(index, 1);
    } else {
        console.log('Debe haber al menos un valor.');
    }
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
                    <textarea v-model="formData.HistoriaClinica.motivo" id="motivo" name="motivo" placeholder="Motivo de consulta"
                        rows="3"
                        class="w-full mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                </div>
            </div>

            <div class="md:w-4/5 w-full flex flex-col gap-3">
                    <div class="flex items-center justify-between">
                        <label class="block text-sm font-medium text-gray-700">Antecedentes</label>
                        <button type="button" @click="agregarAntecedente()"
                            class="w-[25px] h-[25px] flex justify-center items-center bg-blue-500 text-white rounded-full hover:bg-blue-600">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    <div class="flex flex-col items-center gap-1 mb-2 w-full max-h-[100px] overflow-y-auto">
                        <div class="flex items-center gap-3 w-full" v-for="(antecedente, i) in formData.Antecedentes" :key="id">
                            <Input v-model="antecedente.valor" type="text" id="antecedentes" name="antecedentes"
                                placeholder="Antecedentes" tamaño="w-full" />
                            <i v-if="i > 0" class="fa-solid fa-close text-gray-500" @click="eliminarAntecedente(i)"></i>
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
                        <button type="button" @click="agregarEnfermedad()"
                            class="w-[25px] h-[25px] flex justify-center items-center bg-blue-500 text-white rounded-full hover:bg-blue-600">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    <div class="flex flex-col items-center gap-1 mb-2 w-full max-h-[100px] overflow-y-auto">
                        <div class="flex items-center gap-3 w-full" v-for="(enfermedad, i) in formData.Enfermedad" :key="id">
                            <Input v-model="enfermedad.valor" type="text" id="enfermedad" name="enfermedad"
                                placeholder="Enfermedad Actual" tamaño="w-full" />
                            <i v-if="i > 0" class="fa-solid fa-close text-gray-500" @click="eliminarEnfermedad(i)"></i>
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