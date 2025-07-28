<script setup>
import DatosFacturacion from './DatosFacturacion.vue';
import { useFacturacionStore } from '~/stores/Formularios/empresa/Facturacion';
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';

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
    <div class="flex flex-col gap-6">
        <DatosFacturacion />
        <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
            <div>
                <h3 class="text-xl font-semibold">Resoluciones registradas</h3>
            </div>
            <div class="border border-gray-300 rounded-2xl px-7 py-5 flex md:flex-col flex-row overflow-x-auto gap-3">
                <div class="grid md:grid-cols-8 grid-cols-1 gap-3 text-center text-gray-500">
                    <p>Tipo de documento</p>
                    <p>Prefijo</p>
                    <p>Numero</p>
                    <p>Fecha Desde</p>
                    <p>Fecha Hasta</p>
                    <p>Desde</p>
                    <p>Hasta</p>
                    <p>Seleccionar</p>
                </div>
                <div class="grid md:grid-cols-8 grid-cols-1 gap-3 text-center text-sm font-semibold" v-for="resolucion in Resoluciones">
                    <p>{{ resolucion.tipoDocumento }}</p>
                    <p>{{ resolucion.prefijo }}</p>
                    <p>{{ resolucion.no_resolucion }}</p>
                    <p>{{ resolucion.fechaInicial }}</p>
                    <p>{{ resolucion.fechaHasta }}</p>
                    <p>{{ resolucion.numeroInicial }}</p>
                    <p>{{ resolucion.numeroHasta }}</p>
                    <p></p>
                </div>
            </div>
        </div>
    </div>
</template>