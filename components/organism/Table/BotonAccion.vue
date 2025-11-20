<template>
    <button class="border-none text-white text-center rounded-full text-xs hover:opacity-75" :class="botonClase">
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
        case 'download':
            return 'fa-solid fa-download';
        case 'pdf':
            return 'fa-solid fa-file-pdf text-xl text-gray-700 dark:text-gray-200';
        default:
            return '';
    }
});

const botonClase = computed(() => {
    switch (props.tipo) {
        case 'ver':
            return 'bg-sky-700 w-[24px] h-[24px] cursor-pointer';
        case 'actualizar':
            return 'bg-[var(--color-warning)] w-[24px] h-[24px] cursor-pointer';
        case 'borrar':
            return 'bg-red-600 w-[24px] h-[24px] cursor-pointer';
        case 'agregar':
            return 'bg-blue-500 w-[24px] h-[24px] cursor-pointer';
        case 'download':
            return 'bg-blue-700 w-[24px] h-[24px] cursor-pointer';
        case 'pdf':
            return 'w-[24px] h-[24px] cursor-pointer';
        case 'Rojo':
            return 'bg-red-500 w-[10px] h-[10px]';        
        case 'Naranja':
            return 'bg-orange-500 w-[10px] h-[10px]';
        case 'Verde':
            return 'bg-green-500 w-[10px] h-[10px]';
        default:
            return '';
    }
});
</script>