<template>
    <a href="#" class="flex items-center text-sm font-medium hidden md:block">
        <!-- <img :src="icon" class="w-5 h-5 me-2.5"> -->
        <i class="fa-solid text-xl" :class="icon"></i>
    </a>
    <ul class="dropdown">
        <li v-for="item in submenu" class="text-xs">
            <a :href="item.link" class="inline-flex items-center text-sm font-medium text-black md:text-gray-400 dark:hover:text-white">
                <i class="fa-solid text-sm me-2.5" :class="item.icon"></i>
                {{ item.nombre }}
            </a>
        </li>
    </ul>
</template>

<script setup>
const titulo = defineProps(['nombre', 'icon','submenu']);

</script>

<style scoped>
.dropdown {
    display: none;
    position: absolute;
    top: 50px;
    margin-left: -60px;
    background-color: var(--color-default-oscuro);
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 9999;
}

.navbar__content__list li:hover .dropdown {
    display: block;
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
        color: #000;
        display: block;
        position: static;
        margin: 0;
        width: 100%;
    }

}
</style>