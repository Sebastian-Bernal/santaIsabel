<script setup>
const props = defineProps({
    color: {
        type: String,
        default: 'bg-blue-500'
    },
    icon: {
        type: String,
        default: 'fa-file'
    },
    title : {
        type: String,
        default: 'Accion'
    },
    description: {
        type: String,
        default: 'descripcion'
    },
    action: {
        type: Function,
        dafault: () => {}
    }
});
</script>


<template>
    <button class="w-full max-h-[76px] p-4 rounded-lg text-white transition-colors duration-200" :class="props.color">
        <a>
            <div class="flex items-center space-x-3">
                <i class="fa-solid" :class="props.icon"></i>
                <div class="text-left">
                    <div class="font-medium">{{ props.title }}</div>
                    <div class="text-sm opacity-90">{{ props.description }}</div>
                </div>
            </div>
        </a>
    </button>
</template>