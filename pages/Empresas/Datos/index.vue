<script setup>
import FondoBlanco from '~/components/Fondos/FondoBlanco.vue';
import DatosAsociados from '~/components/Forms/Empresa/DatosAsociados.vue';

</script>

<template>
    <FondoBlanco>
        <div class="md:py-8 py-4 md:px-12 px-4">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-2xl font-bold text-gray-700">Datos Asociados a la Empresa</h2>
                    <p class="text-gray-600 mt-2">Registra y configura segun los datos de tu Empresa.</p>
                </div>
                <div class="flex gap-4">
                    <!-- <button class="bg-gray-200 p-3 rounded-2xl flex items-center gap-3">
                        <i class="fa-solid fa-check-double"></i>
                        Validar todo
                    </button>
                    <button class="bg-blue-500 text-white p-3 rounded-2xl flex items-center gap-3" @click="nuevaEPS">
                        <i class="fa-solid fa-download"></i>
                        Registrar
                    </button> -->
                    <i class="fa-solid fa-database text-2xl text-blue-600"></i>
                </div>
            </div>

            <DatosAsociados/>
        </div>
    </FondoBlanco>
</template>