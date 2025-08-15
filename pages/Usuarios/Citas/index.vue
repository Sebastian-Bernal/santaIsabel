<script setup>
import Citas from '~/components/molecules/Calendario/Citas.vue'
import Calendario from '~/components/molecules/Calendario/Calendario.vue'
import IngresarNuevaCita from '~/components/Forms/Citas/IngresarNuevaCita.vue'
import { useVarView } from '~/stores/varview.js'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { storeToRefs } from '#imports'
import { ref, watch } from 'vue'
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'

const citasStore = useCitasStore();
const { listCitas } = storeToRefs(citasStore);
const varView = useVarView();
const refresh = ref(1);

watch(()=> varView.showNuevaCita, ()=>{
    listCitas.value
    refresh.value++
})
// Funciones para manejar la visibilidad de los formularios
const agregarCita = () => {
    varView.showNuevaCita = true;
};
</script>

<template>
    <FondoDefault>
        <div>
            <div class="md:pb-8 pb-4 flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-semibold">Calendario de citas</h2>
                    <p class="text-gray-600 dark:text-gray-200 mt-1">Visualiza y administra la agenda de citas.</p>
                </div>

                <div class="flex gap-3 items-center cursor-pointer" @click="agregarCita">

                    <div class="flex gap-2 items-center bg-blue-500 p-3 rounded-2xl text-white font-semibold">
                        <i class="fa-solid fa-plus"></i>
                        <p class="md:flex hidden">Agregar Cita</p>
                    </div>

                </div>

            </div>

            <div
                class="grid lg:grid-cols-[1fr_0.6fr] md:grid-cols-[1fr_1fr] grid-cols-1 lg:gap-10 gap-3 justify-between">
                <Citas/>
                <Calendario></Calendario>
            </div>


        </div>
    </FondoDefault>
    <IngresarNuevaCita v-if="varView.showNuevaCita" />
</template>