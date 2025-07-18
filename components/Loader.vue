<template>
    <div class="cargando">
        <div class="w-full h-full flex items-center justify-center flex-col relative">
            <i class="fa-solid fa-spinner text-3xl text-blue-300 logo"></i>
        </div>
    </div>
</template>

<style scoped>
.cargando {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    backdrop-filter: blur(10px);
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
    animation: desaparecerCargando 1.5s forwards ease-in-out;
}

.logo {
    position: absolute;
    top: 50%;
    left: 50%;
    animation: aparecerLogo 2s infinite;
}


@keyframes aparecerLogo {
    25% {
        transform: rotate(0deg);
    }
    50% {
        transform: rotate(80deg);
    }
    75% {
        transform: rotate(180deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

@keyframes desaparecerCargando {
    0% { opacity: 1; }
    100% { opacity: 0; visibility: hidden; }
}

</style>