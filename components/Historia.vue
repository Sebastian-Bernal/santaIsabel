<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import Formularios from '~/components/Paciente.vue';

import { useHistoriaBuilder } from '~/build/Historial/useHistoriaBuilder';
import { useVarView } from "~/stores/varview.js";
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';

const varView = useVarView();
const storeCodigos = useCodigos()

const CIE10 = ref([])
const medicamentos = ref([])

onMounted(async () => {
    CIE10.value = await storeCodigos.leerdatos();

    // const response = await fetch('/data/medicamentos.json.gz')
    // const data = await response.json()
    // medicamentos.value = data
})

function cerrar() {
    varView.showNuevaHistoria = false
}

const { builder, PacientesList, id_paciente } = useHistoriaBuilder({
    storeId: 'RegistrarHistoria',
    storePinia: 'Historias',
    cerrarModal: cerrar,
    show: varView.showNuevaHistoria,
    medicamentos,
    CIE10

});

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()

    pagina
        .setFondo('FondoDefault')
        .addComponente('Form', builder)
    return pagina.build()
})


</script>

<template>
    <Pagina :Propiedades="propiedades" />
    <Formularios v-if="varView.showNuevoPaciente" />
</template>