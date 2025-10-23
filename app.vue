<script setup>
import { iniciarSincronizacionPeriodica } from './composables/Formulario/sincronizarDatos';

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

<template>
      <NuxtLayout>
            <NuxtPage/>
      </NuxtLayout>
</template>
