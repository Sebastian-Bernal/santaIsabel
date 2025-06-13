<script setup>
import { useApiRest } from '../stores/apiRest';
import Navbar from '~/components/Navbar/Navbar.vue';
import Aside from '~/components/Aside/Aside.vue';
const estado = useApiRest();
</script>

<template>
    <div class="containerMain">
        <Loader v-if="estado.cargando"></Loader>
        <Navbar></Navbar>
        <Aside></Aside>
        <div class="section-content">
            <div class="container-content">
                <slot></slot>
                <Footer></Footer>
            </div>
        </div>
    </div>
</template>

<style scoped>
.containerMain {
    display: grid;
    grid-template-areas:
        "aside main";
    grid-template-rows: 1fr;
    grid-template-columns: 120px 1fr;
    height: 100vh;
    overflow-y: none;
}

@media screen and (max-width: 768px) {
    .containerMain {
        grid-template-areas: "navbar" "aside" "main";
        grid-template-rows: 40px 60px 1fr;
        grid-template-columns: 1fr;
    }

    .section-content {
        padding: 5px 15px;
    }
}

.section-content {
    grid-area: main;
    overflow-y: hidden;
}

.container-content {
    height: 98%;
    margin-bottom: 2%;
    overflow-y: scroll;
}

/* Scroll */
.container-content::-webkit-scrollbar {
    width: 5px;
    height: 2px;
    display: none;
}

.container-content::-webkit-scrollbar-thumb:hover {
    display: flex;
}

.container-content::-webkit-scrollbar-track {
    backdrop-filter: blur(10px);
    border-radius: 4px;
}
</style>