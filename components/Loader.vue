<template>
    <div class="cargando">
        <div class="w-full h-full flex items-center justify-center flex-col relative">
            <p></p>
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
}

.cargando img {
    width: 20%;
    height: 20%;
    object-fit: contain;
}

.logo, .lanza {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
}

.lanza {
    animation: lanzarYdesaparecer 3s infinite;
}

.logo {
    animation: aparecerLogo 3s infinite;
}

@keyframes lanzarYdesaparecer {
    0% {
        transform: translate(-50%, -50%) translateY(20vh);
        opacity: 1;
    }
    25% {
        transform: translate(-50%, -50%) translateY(-50vh);
        opacity: 0;
    }
    50%, 100% {
        opacity: 0;
    }
}

@keyframes aparecerLogo {
    0%, 49% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1);
    }
    50% {
        opacity: 0;
    }
    75% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1);
    }
}
</style>