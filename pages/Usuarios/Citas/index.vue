<script setup>
import FondoBlanco from '~/components/Fondos/FondoBlanco'
import Calendario from '~/components/Calendario/Calendario.vue'
import Citas from '~/components/Calendario/Citas.vue'
import IngresarNuevaCita from '~/components/Forms/Citas/IngresarNuevaCita.vue'
import { useVarView } from '~/stores/varview.js'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { storeToRefs } from '#imports'
import { ref, watch } from 'vue'

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
    <FondoBlanco>
        <div>
            <div class="py-8 px-12 flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-semibold">Calendario de citas</h2>
                    <p class="text-gray-600 mt-1">Visualiza y administra la agenda de citas.</p>
                </div>

                <div class="flex gap-3 items-center cursor-pointer" @click="agregarCita">

                    <div class="flex gap-2 items-center bg-blue-500 p-3 rounded-2xl text-white font-semibold">
                        <i class="fa-solid fa-plus"></i>
                        Agregar Cita
                    </div>

                </div>

            </div>

            <div :key="refresh"
                class="grid lg:grid-cols-[1fr_0.6fr] md:grid-cols-[1fr_1fr] grid-cols-1 mx-10 lg:gap-10 gap-3 justify-between">
                <Citas />
                <Calendario></Calendario>
            </div>


        </div>
    </FondoBlanco>
    <IngresarNuevaCita v-if="varView.showNuevaCita" />
</template>