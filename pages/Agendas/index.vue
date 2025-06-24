<script setup>
import FondoBlanco from '../../components/Fondos/FondoBlanco'
import Calendario from '~/components/Calendario/Calendario.vue'
import Citas from '~/components/Calendario/Citas.vue'
import Reloj from '~/components/Calendario/Reloj'
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
                        <div class="flex gap-2 items-center">
                            <i class="fa-solid fa-plus text-blue-500"></i>
                            Agregar
                        </div>
                    </div>
                </nuxt-link>
            </div>

            <div class="grid md:grid-cols-[0.6fr_1fr] grid-cols-1 mx-20">
                <Calendario></Calendario>
                <Citas />
            </div>


        </div>
    </FondoBlanco>
</template>