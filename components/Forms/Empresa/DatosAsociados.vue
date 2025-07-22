<script setup>
import EPS from './EPS.vue';
import { useFacturacionStore } from '~/stores/Formularios/empresa/Facturacion';
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';

const varView = useVarView();
const storeFacturacion = useFacturacionStore();
const { listResoluciones } = storeToRefs(storeFacturacion);
const Resoluciones = ref([]);

onMounted(async() => {
    Resoluciones.value = await listResoluciones.value
});

watch(listResoluciones, (newValue) => {
    Resoluciones.value = newValue
});
</script>

<template>
    <div class="w-full grid md:grid-cols-2 grid-cols-1 gap-6">
        <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold">EPS Registradas</h3>
            </div>
            <div class="border border-gray-300 rounded-2xl px-7 py-5 flex flex-col gap-3">
                <div class="grid grid-cols-2 gap-3 text-center text-gray-500">
                    <p>Nombre</p>
                    <p>Acciones</p>
                </div>
                <div class="grid grid-cols-2 gap-3 text-center text-sm font-semibold" v-for="item in 5">
                    <p>Coosalud</p>
                    <p class="flex items-center justify-center gap-3">
                        <i class="fa-solid fa-pencil"></i>
                        <i class="fa-solid fa-trash text-red-500"></i>
                    </p>
                </div>
            </div>
        </div>
        <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold">Profesiones Medicos</h3>
            </div>
            <div class="border border-gray-300 rounded-2xl px-7 py-5 flex flex-col gap-3">
                <div class="grid grid-cols-2 gap-3 text-center text-gray-500">
                    <p>Nombre</p>
                    <p>Acciones</p>
                </div>
                <div class="grid grid-cols-2 gap-3 text-center text-sm font-semibold" v-for="item in 7">
                    <p>Medico</p>
                    <p class="flex items-center justify-center gap-3">
                        <i class="fa-solid fa-pencil"></i>
                        <i class="fa-solid fa-trash text-red-500"></i>
                    </p>
                </div>
            </div>
        </div>
    </div>
    <EPS v-if="varView.showNuevoEPS"/>
</template>