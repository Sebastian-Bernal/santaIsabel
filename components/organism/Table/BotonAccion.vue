<template>
    <button class="border-none text-white text-center rounded-full text-xs hover:opacity-75 transition-all duration-300 cursor-pointer active:scale-95" :class="botonClase">
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
        case 'completar':
            return 'fa-solid fa-check';
        case 'agregar':
            return 'fa-solid fa-plus';
        case 'download':
            return 'fa-solid fa-download';
        case 'observacion eliminada':
            return 'fa-solid fa-info';
        case 'observacion editada':
            return 'fa-solid fa-info';
        case 'observacion completada':
            return 'fa-solid fa-info';
        case 'pdf':
            return 'fa-solid fa-file-pdf text-xl text-gray-700 dark:text-gray-200';
        case 'movimiento':
            return 'fa-solid fa-cart-plus text-xs text-white dark:text-gray-700';
        default:
            return '';
    }
});

const botonClase = computed(() => {
    switch (props.tipo) {
        case 'ver':
            return 'bg-sky-700 w-[24px] h-[24px] cursor-pointer';
        case 'actualizar':
            return 'bg-amber-500 w-[24px] h-[24px] cursor-pointer';
        case 'borrar':
            return 'bg-danger w-[24px] h-[24px] cursor-pointer';
        case 'completar':
            return 'bg-green-500 w-[24px] h-[24px] cursor-pointer';
        case 'agregar':
            return 'bg-blue-500 w-[24px] h-[24px] cursor-pointer';
        case 'download':
            return 'bg-blue-700 w-[24px] h-[24px] cursor-pointer';
        case 'observacion eliminada':
            return 'bg-danger w-[24px] h-[24px] cursor-pointer';
        case 'observacion editada':
            return 'bg-amber-500 w-[24px] h-[24px] cursor-pointer';
        case 'observacion completada':
            return 'bg-blue-600 w-[24px] h-[24px] cursor-pointer';
        case 'pdf':
            return 'w-[24px] h-[24px] cursor-pointer md:bg-inherit bg-gray-200 dark:bg-gray-700';
        case 'movimiento':
            return 'w-[24px] h-[24px] cursor-pointer bg-amber-600 dark:bg-amber-700';
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