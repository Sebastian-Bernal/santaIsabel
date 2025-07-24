<script setup>
import EPS from './EPS.vue';
import Profesion from './Profesion.vue';
import { useFacturacionStore } from '~/stores/Formularios/empresa/Facturacion';
import { useDatosEPSStore } from '~/stores/Formularios/empresa/EPS';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion';
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';

const storeFacturacion = useFacturacionStore();
const storeEPS = useDatosEPSStore();
const storeProfesion = useDatosProfesionStore();
const varView = useVarView();
const { listResoluciones } = storeToRefs(storeFacturacion);

const Resoluciones = ref([]);
const EPSdata = ref([]);
const Profesiones = ref([]);

onMounted(async () => {
    varView.cargando = true
    Resoluciones.value = await listResoluciones.value
    EPSdata.value = await storeEPS.listEPS
    Profesiones.value = await storeProfesion.listProfesion
    varView.cargando = false
});

watch(listResoluciones, (newValue) => {
    Resoluciones.value = newValue
});
</script>

<template>
    <div class="w-full grid md:grid-cols-2 grid-cols-1 gap-6">
        <EPS :EPS="EPSdata"/>
        <Profesion :Profesiones="Profesiones"/>
    </div>

</template>