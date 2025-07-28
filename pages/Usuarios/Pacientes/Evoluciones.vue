<script setup>
import FondoBlanco from '../../components/Fondos/FondoBlanco.vue'
import InputIcon from '~/components/Inputs/InputIcon.vue';
import Select from '~/components/Selects/Select.vue';
import IngresarNota from '~/components/Forms/Historia/Notas/IngresarNota.vue';
import { ref, computed } from 'vue';
import { useVarView } from '~/stores/varview';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { storeToRefs } from 'pinia';

const varView = useVarView()
const pacienteABuscar = ref('');
const pacientesStore = usePacientesStore();
const { listPacientes } = storeToRefs(pacientesStore);
const pacientes = ref([]);

onMounted(async() => {
    varView.cargando = true
    pacientes.value= await listPacientes.value;
    varView.cargando = false
});

const datos = computed(() => pacientes.filter((paciente, id) => {
    paciente.name === pacienteABuscar.value;
}));

function nuevaNota () {
    varView.showNuevaNota = true;
};
</script>

<template>
    <FondoBlanco>
        <div class="md:py-8 py-4 md:px-12 px-4 flex w-full items-center justify-between border border-gray-200">
            <div>
                <h2 class="text-2xl font-bold">Buscar Paciente</h2>
                <p class="text-gray-600 mt-1">Registre la evolucion del paciente segun Historia clinica</p>
            </div>
            <div class="w-2/5 flex items-center gap-3">
                <InputIcon v-model="pacienteABuscar" placeholder="Buscar Paciente por nombre o cedula..."
                    icon="fa-search" list="listpacientes">
                </InputIcon>
                <datalist id="listpacientes">
                    <option v-for="(paciente, id) in listPacientes" :key="paciente.id" :value="paciente.nombre"></option>
                </datalist>
                <button @click="nuevaNota()" class="bg-blue-500 px-5 py-2 rounded-2xl text-white">Nota</button>
            </div>
        </div>
        <div class="py-5 px-15" v-if="pacienteABuscar !== ''">
            <div class="grid grid-cols-2 justify-between">
                <div>
                    <h2 class="text-xl font-bold">Paciente {{ pacienteABuscar }}</h2>
                    <p class="text-gray-600">Cedula 1099381</p>
                    <p class="text-gray-600">Ultima visita 12-04-2022</p>
                </div>

                <Select tamaño="w-2/3 justify-self-end h-[40px]" id="historial" name="historial"
                    placeholder="Ultima Historia Clinica" :options="[{ text: 'Historia Clinica 23-12-2025' }, { text: 'Historia Clinica 17-06-2025' }, { text: 'Historia Clinica 01-01-2025' }]">
                </Select>
            </div>

            <div class="py-6 px-10 mt-5 flex flex-col gap-3 border border-gray-300 rounded-2xl bg-white">
                <div class="flex gap-3 items-center justify-between mb-3">
                    <h3 class="text-2xl">Historia Clinica</h3>
                    <div class="flex flex-col">
                        <span class="text-sm font-semibold">Dr. Juan Perez</span>
                        <span class="text-sm font-semibold">fecha: 17-06-2025</span>
                    </div>

                </div>

                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-comment text-blue-500"></i>
                    <h3 class="text-xl">Motivo de consulta</h3>
                </div>
                <p class="w-full border border-gray-200 p-2 rounded text-gray-800">
                    El paciente Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, consectetur fugit odit
                    quod quis officiis commodi perspiciatis veritatis rerum delectus. Nisi, obcaecati praesentium illum
                    nihil animi tenetur natus provident aut?
                    El paciente Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, consectetur fugit odit
                    quod quis officiis commodi perspiciatis veritatis rerum delectus. Nisi, obcaecati praesentium illum
                    nihil animi tenetur natus provident aut?
                </p>

                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-file text-green-500"></i>
                    <h3 class="text-xl">Diagnostico</h3>
                </div>

                <p class="w-full border border-gray-200 p-2 rounded text-gray-800">
                    El paciente Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, consectetur fugit odit
                    quod quis officiis commodi perspiciatis veritatis rerum delectus. Nisi, obcaecati praesentium illum
                    nihil animi tenetur natus provident aut?
                    El paciente Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, consectetur fugit odit
                    quod quis officiis commodi perspiciatis veritatis rerum delectus. Nisi, obcaecati praesentium illum
                    nihil animi tenetur natus provident aut?
                </p>

                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-square-virus text-red-500"></i>
                    <h3 class="text-xl">Enfermedades</h3>
                </div>
                <p class="w-full border border-gray-200 p-2 rounded text-gray-800">
                    El paciente Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, consectetur fugit odit
                    quod quis officiis commodi perspiciatis veritatis rerum delectus. Nisi, obcaecati praesentium illum
                    nihil animi tenetur natus provident aut?
                    El paciente Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, consectetur fugit odit
                    quod quis officiis commodi perspiciatis veritatis rerum delectus. Nisi, obcaecati praesentium illum
                    nihil animi tenetur natus provident aut?
                </p>

                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-pills text-green-500"></i>
                    <h3 class="text-xl">Plan de manejo</h3>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <p class="w-full border border-gray-200 p-2 rounded text-gray-800 flex flex-col gap-2">
                        <span class="text-lg font-semibold">Medicamentos Recetados</span>
                        El paciente Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, consectetur fugit
                        odit quod quis officiis commodi perspiciatis veritatis rerum delectus. Nisi, obcaecati
                        praesentium illum nihil animi tenetur natus provident aut?
                        El paciente Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, consectetur fugit
                        odit quod quis officiis commodi perspiciatis veritatis rerum delectus. Nisi, obcaecati
                        praesentium illum nihil animi tenetur natus provident aut?
                    </p>
                    <p class="w-full border border-gray-200 p-2 rounded text-gray-800 flex flex-col gap-2">
                        <span class="text-lg font-semibold">Procedimientos Recetados</span>
                        El paciente Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, consectetur fugit
                        odit quod quis officiis commodi perspiciatis veritatis rerum delectus. Nisi, obcaecati
                        praesentium illum nihil animi tenetur natus provident aut?
                        El paciente Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, consectetur fugit
                        odit quod quis officiis commodi perspiciatis veritatis rerum delectus. Nisi, obcaecati
                        praesentium illum nihil animi tenetur natus provident aut?
                    </p>
                </div>

            </div>
            <div v-if="pacienteABuscar === ''" class="w-full flex flex-col items-center justify-center gap-3 mt-10">
                <p>Busca un paciente para conocer su historia clinica.</p>
            </div>
            <div class="w-full flex justify-end px-5 mt-2 gap-3">
                <h3>Anterior</h3>
                <h3>Subir</h3>
            </div>
        </div>
    </FondoBlanco>
    <IngresarNota  v-if="varView.showNuevaNota"/>
</template>