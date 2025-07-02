<template>
    <button class="border-none text-white text-center rounded-full w-[24px] h-[24px] text-xs hover:opacity-80" :class="botonClase">
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
        default:
            return '';
    }
});

const botonClase = computed(() => {
    switch (props.tipo) {
        case 'ver':
            return 'bg-sky-600';
        case 'actualizar':
            return 'bg-[var(--color-warning)]';
        case 'borrar':
            return 'bg-red-600';
        default:
            return '';
    }
});
</script>