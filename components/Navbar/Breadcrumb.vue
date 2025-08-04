<script setup>
import { computed } from 'vue';

const props = defineProps(['usuarioRol'])
// Rutas actuales
const route = useRoute();
// Retorna array con cada ruta
const breadCrumbs = computed(() => {
    const path = route.path
    const segments = path.split('/').filter(Boolean)

    const links = []
    for (let i = 0; i < segments.length; i++) {
        const to = '/' + segments.slice(0, i + 1).join('/')
        links.push({
            name: decodeURIComponent(segments[i]),
            to
        })
    }
    return links
});

</script>

<template>
    <a :href="props.usuarioRol === 'Admin' ? '/Home' : ''" class="hidden md:block">
        <i class="fa-solid fa-house"></i>
    </a>
    <div class="dropdown">
        <div class="flex text-white borde rounded-lg" aria-label="Breadcrumb">
            <ol class="flex items-center">
                <li class="flex items-center">
                    <a :href="props.usuarioRol === 'Admin' ? '/Home' : ''"
                        class="flex items-center text-sm font-medium text-black hover:text-blue-600 md:text-gray-400 dark:hover:text-white">
                        <i class="fa-solid fa-house me-2 text-xs"></i>
                        Inicio
                    </a>
                </li>
                <li v-for="(crumb, index) in breadCrumbs">
                    <div class="flex items-center">
                        <i class="fa-solid fa-angle-right text-gray-500"></i>
                        <nuxt-link :to="crumb.to !== '/Usuarios' && crumb.to !== '/Empresas' && crumb.to !== '/Historial' && crumb.to !== '/Facturacion' ? crumb.to : ''" 
                            class="text-sm ms-1 font-medium text-black md:text-gray-400 dark:hover:text-white">
                            {{ crumb.name }}
                        </nuxt-link>
                    </div>
                </li>
            </ol>
        </div>
    </div>
</template>

<style scoped>
li:hover .dropdown {
    display: block;
}

.dropdown {
    display: none;
    position: absolute;
    top: 50px;
    margin-left: -35px;
    background-color: var(--color-default-oscuro);
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 999;
    max-width: 200px;
    overflow-x: auto;
    user-select: none;
}

.dropdown::-webkit-scrollbar {
    height: 7px;
    width: 3px;
}

.dropdown::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: var(--color-default-100);
}

.dropdown li {
    color: var(--color-blanco);
    padding: 5px 10px;
    cursor: pointer;
}

.dropdown li:hover {
    background-color: var(--color-gris-oscuro);
}

.dropdown::after {
    content: '';
    position: absolute;
    top: -10px;
    left: 20px;
}

@media screen and (max-width: 768px) {
    .dropdown {
        background-color: inherit;
        display: block;
        position: static;
        margin: 0;
        max-width: 100%;
    }

}
</style>