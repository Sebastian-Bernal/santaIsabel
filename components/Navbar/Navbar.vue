<template>
    <div class="navbar w-full px-5 fixed backdrop-blur bg-[rgba(0,0,0,0.1)]">
        <div class="flex justify-between items-center h-[40px]">
            <h2 class="text-white">Santa Isabel</h2>
            <div class="flex gap-5">
                <nuxt-link to="/forms/HistoriaClinica/Paso1"><p>Historias Clinicas</p></nuxt-link>
                <nuxt-link to="/forms/DatosPacienteNuevo"><p>Pacientes</p></nuxt-link>
                <p>Ingresar</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.navbar {
    grid-area: navbar;
}
</style>