<template>
    <button :class="{ 'active': data.active }"
        class="border-none cursor-pointer text-[var(--color-gris-claro)] p-[15px] flex relative rounded-l-full hover:text-[var(--color-blanco)] hover:bg-[var(--color-rojo-claro)]">
        <!-- Icono boton -->
        <NuxtLink class="link w-[24px] h-[24px] pointer-events-none md:pointer-events-all">
            <i class="fa-solid text-xl" :class="data.icon"></i>
        </NuxtLink>
        <!-- Desplegable nombre de seccion, "right" -->
        <div class="right z-999 absolute top-[50%] left-full flex justify-center items-center pointer-events-none bg-[var(--color-rojo-claro)] p-[10px] w-[150px] rounded-r-3xl" @click="activeButton(data.id)">
            <NuxtLink :to="`/${data.nombre}/index`" @click="footer.cambiarSecciones(null)">
                <h3 class="text-[var(--color-rojo)] p-[5px_10px] cursor-pointer text-base font-bold">{{ data.nombre }}</h3>
            </NuxtLink>
            <!-- Desplegable submenu, "down" -->
            <div class="down absolute top-full left-[-10%] flex flex-col justify-center items-center z-1 pointer-events-none p-[10px] w-[150px] rounded-br-3xl" :class="{ 'ocultar': data.secciones.length == 0 }">
                <h3 class="p-[5px_10px] cursor-pointer text-base font-bold text-[var(--color-gris-claro)] hover:text-[var(--color-naranja)]" v-for="seccion in data.secciones">
                    <NuxtLink :to="`/${data.nombre}/${seccion.titulo}`"
                        @click="footer.cambiarSecciones(seccion.subSecciones)">
                        {{ seccion.titulo }}
                    </NuxtLink>
                </h3>
            </div>
            
        </div>
    </button>
</template>

<script setup>
import { activeButton, sessionActive } from '../../stores/ButtonActive';
import { useSeccionFooter } from '../../stores/NavigationFooter';
const titulo = defineProps(['data']);
const footer = useSeccionFooter();

onMounted(() => {
    sessionActive()
});
</script>

<style scoped>
button {
    transition: background-color 0.3s ease, color 0.3s ease;
}

button .active {
    background-color: var(--color-rojo);
    color: var(--color-blanco);
    transition: background-color 0.3s ease, color 0.3s ease;
}

.right {
    opacity: 0;
    transform: translateX(-10px) translateY(-50%);
    transition: all 0.3s ease;
}

.right h3 {
    transition: all 0.3s ease;
}

.left button:hover .right {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(0) translateY(-50%);
}

.ocultar {
    display: none;
}

/* Lista Submenu */

.down {
    opacity: 0;
    transform: translateX(-50%) translateY(-5);
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(20px);
    transition: all 0.3s ease;
}

.right:hover .down {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(10%) translateY(0);
}

.right:hover {
    border-radius: 0 30px 0 0;
}

/* .show-navbar {
    pointer-events: none;
} */

@media screen and (max-width: 768px) {

    button {
        justify-content: center;
        font-size: 16px;
        border-radius: 50%;
    }

    .right {
        position: fixed;
        top: 11%;
        right: -20px;
        left: 20%;
        width: 50vh;
        border-radius: 10px 10px 0 0;
        padding: 10px;
    }

    .right:hover {
        border-radius: 10px 10px 0 0;
    }

    .left:hover .down {
        opacity: 1;
        transform: translateX(0) translateY(0);
    }

    .left button:hover .right {
        transform: translate(-60px, 28%);
    }

    .down {
        left: 0;
        width: 50vh;
        border-radius: 0 0 10px 10px;
    }

    .down:hover {
        pointer-events: all;
    }

    .down h3 {
        width: 100%;
    }

    .down h3 a {
        padding: 5px;
    }
}
</style>