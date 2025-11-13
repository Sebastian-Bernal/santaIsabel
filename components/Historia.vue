<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import Formularios from '~/components/Paciente.vue';

import { useHistoriaBuilder } from '~/build/Historial/useHistoriaBuilder';
import { useVarView } from "~/stores/varview.js";
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';

const varView = useVarView();

function cerrar() {
    varView.showNuevaHistoria = false
}

const { builder, PacientesList, id_paciente } = useHistoriaBuilder({
    storeId: 'RegistrarHistoria',
    storePinia: 'Historias',
    cerrarModal: cerrar,
    show: varView.showNuevaHistoria,
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