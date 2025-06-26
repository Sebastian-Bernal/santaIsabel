<script setup>
import FondoBlanco from '../../components/Fondos/FondoBlanco'
import Calendario from '~/components/Calendario/Calendario.vue'
import Citas from '~/components/Calendario/Citas.vue'
</script>

<template>
    <FondoBlanco>
        <div>
            <div class="py-5 px-10 flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-semibold">Calendario de citas</h2>
                    <p>Visualiza y administra la agenda de citas.</p>
                </div>
                <nuxt-link to="/Agendas/Registrar">
                    <div class="flex gap-3 items-center">

                        <div class="flex gap-2 items-center bg-blue-500 p-3 rounded-2xl text-white font-semibold">
                            <i class="fa-solid fa-plus"></i>
                            Agregar Cita
                        </div>

                    </div>
                </nuxt-link>
            </div>

            <div class="grid lg:grid-cols-[1fr_0.6fr] md:grid-cols-[1fr_1fr] grid-cols-1 mx-10 lg:gap-10 gap-3 justify-between">
                <Citas />
                <Calendario></Calendario>
            </div>


        </div>
    </FondoBlanco>
</template>