<script setup>
import EPS from './EPS.vue';
import Profesion from './Profesion.vue';
import { useFacturacionStore } from '~/stores/Formularios/empresa/Facturacion';
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';

const storeFacturacion = useFacturacionStore();
const { listResoluciones } = storeToRefs(storeFacturacion);
const Resoluciones = ref([]);

onMounted(async () => {
    Resoluciones.value = await listResoluciones.value
});

watch(listResoluciones, (newValue) => {
    Resoluciones.value = newValue
});
</script>

<template>
    <div class="w-full grid md:grid-cols-2 grid-cols-1 gap-6">
        <EPS />
        <Profesion />
    </div>

</template>