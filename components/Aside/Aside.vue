<script setup>
import ButtonAside from './ButtonAside.vue';
import { useShowNavbar } from '../../stores/navbarResponsive.js';
import { useButtonsAside } from '../../stores/ButtonActive';

const storeAside = useButtonsAside();
const buttons = ref([]);

onMounted(() => {
    const permisosStore = sessionStorage.getItem("Permisos");
    buttons.value = storeAside.getbuttons(JSON.parse(permisosStore));
});

// Funcion para Responsive, si aside esta activo se oculta navbar
const { showNavbarBurguer, cambiarEstado } = useShowNavbar();
const cambiarEstadoFalse = () => {
    if (showNavbarBurguer.value) {
        cambiarEstado(false);
    }
};
</script>

<template>
    <div class="section-asidebar m-[10px] ml-[15px] flex items-center">
        <div class="section-asidebar__content flex flex-col items-center rounded-2xl h-[60%]">

            <div class="left" @click="cambiarEstadoFalse()">
                <ButtonAside v-for="button in buttons" :data="button" />
            </div>

        </div>
    </div>
</template>

<style scoped>
.section-asidebar {
    grid-area: aside;
}

.section-asidebar__content {
    background-color: var(--color-default-claro);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    padding-left: 3px;
}

/* Contenedores botones */

.left {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}

button .active {
    background: #000;
    color: #fff;
    transition: background-color 0.3s ease, color 0.3s ease;
}

@media screen and (max-width: 768px) {
    .section-asidebar {
        width: 100%;
        height: 30px;
        margin: 0;
    }

    .section-asidebar__content {
        width: 100%;
        height: 60px;
        flex-direction: row;
        justify-content: space-between;
        border-radius: 0;
        background-color: transparent;
    }

    .left {
        width: 100%;
        flex-direction: row;
        padding: 0;
    }
}
</style>