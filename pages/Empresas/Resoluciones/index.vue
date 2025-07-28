<script setup>
import FondoBlanco from '~/components/Fondos/FondoBlanco.vue';
import Resoluciones from '~/components/Forms/Empresa/Resoluciones.vue'
</script>

<template>
    <FondoBlanco>
        <div class="md:py-8 py-4 md:px-12 px-4">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-2xl font-bold text-gray-700">Configuracion de Resolucion</h2>
                    <p class="text-gray-600 mt-2">Registra y configura segun los datos de tu Empresa.</p>
                </div>
                <div class="flex gap-4">
                    <!-- <button class="bg-gray-200 p-3 rounded-2xl flex items-center gap-3">
                        <i class="fa-solid fa-check-double"></i>
                        Validar todo
                    </button>
                    <button class="bg-blue-500 text-white p-3 rounded-2xl flex items-center gap-3">
                        <i class="fa-solid fa-download"></i>
                        Registrar
                    </button> -->
                    <i class="fa-solid fa-file text-2xl text-blue-600"></i>
                </div>
            </div>

            <Resoluciones/>
        </div>
    </FondoBlanco>
</template>