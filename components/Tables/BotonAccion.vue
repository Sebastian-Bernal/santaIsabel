<template>
    <button class="border-none text-white text-center rounded-full w-[24px] h-[24px] text-xs hover:opacity-75" :class="botonClase">
        <i :class="iconoClase"></i>
    </button>
</template>

<script setup>
const props = defineProps({
    tipo: String, // 'ver', 'actualizar', 'borrar'
});

const iconoClase = computed(() => {
    switch (props.tipo) {
        case 'ver':
            return 'fa-solid fa-eye';
        case 'actualizar':
            return 'fa-solid fa-pencil';
        case 'borrar':
            return 'fa-solid fa-trash';
        case 'agregar':
            return 'fa-solid fa-plus';
        default:
            return '';
    }
});

const botonClase = computed(() => {
    switch (props.tipo) {
        case 'ver':
            return 'bg-sky-700';
        case 'actualizar':
            return 'bg-[var(--color-warning)]';
        case 'borrar':
            return 'bg-red-600';
        case 'agregar':
            return 'bg-blue-500';
        default:
            return '';
    }
});
</script>