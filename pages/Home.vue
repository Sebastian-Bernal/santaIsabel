<script setup>
import Dashboard from '~/components/organism/Dashboard/Dashboard.vue';
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { ComponenteBuilder } from '~/composables/Formulario/ClassFormulario';

</script>

<template>
    <FondoDefault>
        <Dashboard></Dashboard>
    </FondoDefault>
</template>