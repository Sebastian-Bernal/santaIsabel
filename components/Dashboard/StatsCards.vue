<script setup>

const props = defineProps({
    data: {
        type: [Object],
    },
});


</script>
<template>
    <div class="medical-card p-6 bg-white">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600">{{ data.title }}</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{{ data.value }}</p>
            </div>
            <div class="p-3 rounded-full">
                <Icon class="h-6 w-6" />
            </div>
        </div>
        <div class="mt-4 flex items-center">
            <i v-if="data.changeType === 'positive'" class="h-4 w-4 text-green-500 mr-1 fa-solid fa-arrow-trend-up"></i>
            <i v-else class="h-4 w-4 text-red-500 mr-1 fa-solid fa-arrow-trend-down"></i>
            <span :class="`text-sm font-medium ${ data.changeType==='positive' ? 'text-green-600' : 'text-red-600' }`">
                {{ data.change }}
            </span>
            <span class="text-sm text-gray-500 ml-2">vs. mes anterior</span>
        </div>
    </div>
</template>