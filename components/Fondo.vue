<template>
    <!-- Color de fondo gradient -->
    <!-- <div class="bg-gradient-to-r pointer-events-none from-[var(--color-primary)] to-[var(--color-negro-rojizo)] absolute inset-0 z-0"></div> -->
    <!-- sombra-->
    <div class="backdrop-blur-lg bg-[rgba(0,0,0,0.7)] pointer-events-none absolute inset-0 z-20"></div>

    <div class="absolute z-30 inset-0 flex flex-col justify-center items-center h-[100vh]">
        <slot></slot>
    </div>

</template>