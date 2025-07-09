<script setup>
import {useCodigos} from '~/stores/CIE10';

const storeCodigos = useCodigos();

onMounted(async() => {
      await storeCodigos.initialize();
      await storeCodigos.guardardatos()
});

</script>

<template>
      <NuxtLayout>
            <NuxtPage/>
      </NuxtLayout>
</template>
