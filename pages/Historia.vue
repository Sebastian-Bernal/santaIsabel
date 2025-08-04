<script setup>
import VerHistoria from '~/components/Forms/Historia/VerHistoria.vue';
import {useHistoriasStore} from '~/stores/Formularios/historias/Historia'

definePageMeta({
    layout: 'authentication'
});
const historiaStore = useHistoriasStore();
const historia = ref([])

onMounted(() => {
    const paciente = JSON.parse(sessionStorage.getItem('Paciente'))
    historia.value = {id: paciente.id, paciente: paciente.name, cedula: paciente.No_document}
    console.log(historia)
})

</script>

<template>
    <a href="/" class="absolute top-5 right-5 z-100 text-white flex gap-1 items-center">
        <i class="fa-solid fa-user text-lg font-bold"></i>
        <i class="fa-solid fa-right-from-bracket text-2xl font-bold"></i>
    </a>
    <VerHistoria :historia="historia" />
</template>