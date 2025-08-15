<script setup>
import { computed, ref } from 'vue';
import { useSeccionFooter } from '~/stores/NavigationFooter';
const footer = useSeccionFooter();
const subSeccion = computed(() => footer.secciones)

// Traer secciones del footer y boton activo
onMounted(() => {
    footer.seccionesGuardadas();
    footer.idActivoDefault
});

</script>

<template>
    <div class="containerNavFooter flex w-full items-center">
        <h2 v-for="(pagina, key) in subSeccion"
            class="subSeccion cursor-pointer text-gray-500 py-[10px] min-w-[200px] flex justify-center text-xs md:text-base hover:bg-[rgba(0,0,0,0.3)] hover:text-white"
            :class="{ 'active': footer.idActivo == pagina }" @click="footer.cambiarIdActivo(pagina)">
            <nuxt-link :to="pagina.ruta">{{ pagina.titulo }}</nuxt-link>
        </h2>
    </div>
</template>

<style scoped>
.subSeccion {
    clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
}

.active {
    background-color: rgba(0, 0, 0, 0.3);
    color: #fff;
    clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
}
</style>