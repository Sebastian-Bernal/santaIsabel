<template>
    <!-- Color de fondo gradient -->
    <div class="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-negro-rojizo)] absolute inset-0 z-0"></div>
    <!-- Imagen de fondo -->
    <div class="bg-[url('/assets/img/freepik3.jpeg')] bg-cover bg-center absolute inset-0 z-10 opacity-50"></div>
    <!-- Imagen sombra-->
    <div class="bg-[rgba(0,0,0,0.7)] absolute inset-0 z-20"></div>

    <div class="relative z-30 flex flex-col justify-center items-center h-[100vh]">
        <slot></slot>
    </div>

</template>