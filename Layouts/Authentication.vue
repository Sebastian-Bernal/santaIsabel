<template>
    <!-- Color de fondo gradient -->
    <div class="bg-gradient-to-r from-[var(--color-default)] to-[var(--color-default-400)] absolute inset-0 z-0"></div>
    <!-- Imagen de fondo -->
    <div class="bg-[url('/assets/img/freepik3.jpeg')] bg-cover bg-center absolute inset-0 z-10 opacity-50"></div>
    <!-- Imagen sombra-->
    <!-- <div class="bg-[rgba(0,0,0,0.7)] absolute inset-0 z-20"></div> -->

    <Loader v-if="varView.cargando"></Loader>
    <div class="relative z-30 flex flex-col justify-center items-center h-[100vh]">
        <slot></slot>
    </div>

</template>

<script setup>
import { useVarView } from '~/stores/varview';
import Loader from '~/components/molecules/Spinner/Loader.vue';
const varView = useVarView();

</script>