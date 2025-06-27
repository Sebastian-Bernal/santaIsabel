<script setup>
import FondoBlanco from '../../components/Fondos/FondoBlanco.vue'
import InputIcon from '~/components/Inputs/InputIcon.vue';
import Select from '~/components/Selects/Select.vue';
import { pacientes } from '../../data/pacientes';
import { ref, computed } from 'vue';

const pacienteABuscar = ref('Juan Perez Perez');

const datos = computed(() => pacientes.filter((paciente, id) => {
    paciente.nombre === pacienteABuscar.value;
}));
</script>

<template>
    <FondoBlanco>
        <div class="py-8 px-12 flex w-full items-center justify-between border border-gray-200">
            <div>
                <h2 class="text-2xl font-bold">Buscar Paciente</h2>
                <p class="text-gray-600 mt-1">Registre la evolucion del paciente segun Historia clinica</p>
            </div>
            <div class="w-2/5">
                <InputIcon v-model="pacienteABuscar" placeholder="Buscar Paciente por nombre o cedula..."
                    icon="fa-search" list="listpacientes">
                </InputIcon>
                <datalist id="listpacientes">
                    <option v-for="(paciente, id) in pacientes" :key="paciente.id" :value="paciente.nombre"></option>
                </datalist>
            </div>
        </div>
        <div class="py-5 px-15">
            <div class="grid grid-cols-2 justify-between">
                <div>
                    <h2 class="text-xl font-bold">Paciente {{ pacienteABuscar }}</h2>
                    <p class="text-gray-600">Cedula 1099381</p>
                    <p class="text-gray-600">Ultima visita 12-04-2022</p>
                </div>

                <Select tamaño="w-2/3 justify-self-end h-[40px]" id="historial" name="historial"
                    placeholder="Ultima Historia Clinica" :options="[{ text: 'Historia Clinica 23-12-2025' }]">
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
            <div class="w-full flex justify-end px-5 mt-2 gap-3">
                <h3>Anterior</h3>
                <h3>Subir</h3>
            </div>
        </div>
    </FondoBlanco>
</template>