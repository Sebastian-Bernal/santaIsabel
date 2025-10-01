<template>
    <a href="#" class=" items-center text-sm font-medium hidden md:block">
        <i class="fa-solid text-xl" :class="icon"></i>
    </a>
    <ul class="dropdown absolute top-[50px] ml-[-60px] bg-[var(--color-default-oscuro)] rounded-[5px] p-[10px] shadow-lg z-999">
        <li v-for="item in submenu" class="text-xs">
            <a :href="item.link" class="inline-flex items-center text-sm font-medium text-black md:text-gray-400 hover:text-white">
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