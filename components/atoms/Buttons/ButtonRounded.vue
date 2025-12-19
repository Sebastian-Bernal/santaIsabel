<script setup>
const props = defineProps({
    color: 'String',
    tooltip: {
        type: String,
        default: null
    },
    tooltipPosition: {
        type: String,
        default: 'top' // top | bottom | left | right
    }
});
</script>

<template>
    <div class="relative inline-flex group">
        <button
            type="button"
            :class="[color, 'transition-all duration-300 cursor-pointer active:scale-95']"
            class="w-[30px] h-[30px] flex justify-center items-center text-white rounded-full hover:opacity-75"
        >
            <slot />
        </button>

        <!-- Tooltip -->
        <div
            v-if="tooltip"
            class="absolute z-50 px-2 py-1 text-xs text-white font-semibold bg-[var(--color-default-600)] rounded-lg shadow-lg 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
            :class="{
                'bottom-full mb-1 left-1/2 -translate-x-1/2': tooltipPosition === 'top',
                'top-full mt-1 left-1/2 -translate-x-1/2': tooltipPosition === 'bottom',
                'right-full mr-1 top-1/2 -translate-y-1/2': tooltipPosition === 'left',
                'left-full ml-1 top-1/2 -translate-y-1/2': tooltipPosition === 'right'
            }"
        >
            {{ tooltip }}
        </div>
    </div>
</template>