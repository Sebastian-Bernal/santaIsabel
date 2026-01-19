<template>
    <!-- sombra-->
    <div class="backdrop-blur-lg bg-[rgba(0,0,0,0.7)] absolute inset-0 z-20"></div>

    <div class="absolute z-30 inset-0 flex flex-col justify-center items-center h-[100dvh]">
        <slot></slot>
    </div>

</template>