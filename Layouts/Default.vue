<template>
    <div class="containerMain">
        <Loader v-if="varView.cargando"></Loader>
        <Navbar></Navbar>
        <Aside></Aside>
        <div class="section-content">
            <div class="container-content">
                <slot></slot>
            </div>
        </div>
        <Footer></Footer>
    </div>
</template>

<script setup>
import { useVarView } from '~/stores/varview';
const varView = useVarView();

</script>

<style scoped>
.containerMain {
    display: grid;
    grid-template-areas:
        "navbar navbar"
        "aside main"
        "footer footer";
    grid-template-rows: 60px 1fr 40px;
    grid-template-columns: 80px 1fr;
    height: 100vh;
    background: radial-gradient(at left top, var(--color-default), var(--color-default-oscuro));
    overflow-y: none;
}

@media screen and (max-width: 768px) {
    .containerMain {
        grid-template-areas: "navbar" "aside" "main" "footer";
        grid-template-rows: 45px 60px 1fr 40px;
        grid-template-columns: 1fr;
        max-height: 100%;
    }

    .section-content {
        padding: 5px 15px;
    }
}

.section-content {
    grid-area: main;
    overflow-y: hidden;
    margin: 0 10px;
    padding: 0 0 10px 0;
    border-radius: 15px 15px 15px 0;
    background-color: rgba(0,0,0,0.3);
}

.container-content {
    height: 100%;
    /* height: 98%;
    margin-bottom: 2%; */
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