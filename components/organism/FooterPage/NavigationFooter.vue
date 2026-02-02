<script setup>
import { computed, watch } from 'vue';
import { useSeccionFooter } from '~/stores/NavigationFooter';
const footer = useSeccionFooter();
const subSeccion = computed(() => footer.secciones)
// Traer secciones del footer y boton activo
onMounted(() => {
    footer.seccionesGuardadas();
    const idGuardado = sessionStorage.getItem('seccionIdActivo');
    if (idGuardado) {
        footer.cambiarIdActivo(idGuardado);
    } else {
        footer.cambiarIdActivo(0)
    }
});

</script>

<template>
    <div class=" flex w-full items-center">
        <nuxt-link v-for="(pagina, key) in subSeccion" :to="pagina.ruta"
            class="subSeccion cursor-pointer py-[8px] md:min-w-[200px] min-w-[80px] flex justify-center text-xs bg-[var(--color-default-800)] text-white md:text-base hover:bg-[var(--color-default-600)] hover:text-white"
            :class="{ 'active': footer.idActivo === key }" @click="footer.cambiarIdActivo(key)">
            {{ pagina.titulo }}
        </nuxt-link>
    </div>
</template>

<style scoped>
.subSeccion {
    clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
}

.active {
    background-color: var(--color-default-600);
    color: #fff;
    clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
}
</style>