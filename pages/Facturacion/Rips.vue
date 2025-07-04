<script setup>
import { useVarView } from '~/stores/varview.js';

const varView = useVarView();
console.log(varView.isOnline);
</script>

<template>
    <div class="bg-gray-100 h-[100%] py-8 px-12">
        <h2 class="text-2xl font-bold text-gray-700">Reportes RIPS</h2>
        <p class="text-gray-600 mt-2">Registro Individual de Prestación de Servicios de Salud</p>

        
    </div>
</template>