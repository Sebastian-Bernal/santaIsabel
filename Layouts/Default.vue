<template>
    <div class="containerMain transition-[grid-template-columns] duration-300 ease-in-out" :class="{'grid-cols-[180px_1fr]': varView.expandido, 'grid-cols-[20px_1fr]': !varView.expandido}">
        <Loader v-if="varView.cargando"></Loader>
        <Navbar></Navbar>
        <Aside></Aside>
        <div class="section-content">
            <div class="container-content">
                <slot></slot>
                <FooterPage></FooterPage>
            </div>
        </div>
        <Footer></Footer>
    </div>
</template>

<script setup>
import { useVarView } from '~/stores/varview';
import Navbar from '~/components/organism/Navbar/Navbar.vue';
import Aside from '~/components/organism/Sidebar/Aside.vue';
import FooterPage from '~/components/organism/FooterPage/FooterPage.vue';
import Footer from '~/components/organism/Footer/Footer.vue';
import Loader from '~/components/molecules/Spinner/Loader.vue';
import { iniciarSincronizacionPeriodica } from '~/composables/Formulario/sincronizarDatos';

const varView = useVarView();

function manejarCambioRed() {
  const ahora = Date.now();
  const ultima = localStorage.getItem('ultimaSincronizacion');
  const LIMITE_TIEMPO = 60 * 60 * 1000;

  if (navigator.onLine && (!ultima || ahora - parseInt(ultima) > LIMITE_TIEMPO)) {
    localStorage.setItem('ultimaSincronizacion', ahora.toString());
    iniciarSincronizacionPeriodica();
    console.log('Sincronización iniciada por cambio de red');
  }
}

onMounted(() => {
  window.addEventListener('online', manejarCambioRed);
  // Opcional: iniciar si ya está en línea al cargar
  if (navigator.onLine) {
    manejarCambioRed();
  }
});

onUnmounted(() => {
  window.removeEventListener('online', manejarCambioRed);
});

</script>

<style scoped>
.containerMain {
    display: grid;
    grid-template-areas:
        "navbar navbar"
        "aside main"
        "footer footer";
    grid-template-rows: 60px 1fr 30px;
    min-height: 100dvh;
    max-height: 100dvh;
    background: radial-gradient(at left top, var(--color-default), var(--color-default-oscuro));
}

@media screen and (max-width: 768px) {
    .containerMain {
        grid-template-areas: "navbar" "aside" "main" "footer";
        grid-template-rows: 45px 40px 1fr 10px;
        grid-template-columns: 1fr;
    }

    .section-content {
        padding: 5px;
        margin: 0;
    }
}

.section-content {
    grid-area: main;
    overflow-y: hidden;
    margin: 0 10px;
    border-radius: 5px;
}

.container-content {
    height: 100%;
    display: flex;
    flex-direction: column;
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