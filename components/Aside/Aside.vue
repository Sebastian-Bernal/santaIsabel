<template>
    <div class="section-asidebar">
        <div class="section-asidebar__content">

            <div class="left" @click="cambiarEstadoFalse()">
                <ButtonAside v-for="button in buttons" :data="button" />
            </div>

        </div>
    </div>
</template>

<script setup>
import ButtonAside from './ButtonAside.vue';
import { buttons } from '../../data/Buttons.js';

</script>

<style scoped>
.section-asidebar {
    margin: 10px;
    margin-left: 15px;
    display: flex;
    align-items: center;
    grid-area: aside;
}

.section-asidebar__content {
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 10px;
    height: 60%;
    background-color: var(--color-rojo-suave);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 16px;
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