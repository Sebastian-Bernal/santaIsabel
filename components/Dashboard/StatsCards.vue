<script setup>

const props = defineProps({
    data: {
        type: [Object],
    },
});

const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
};
</script>
<template>
    <div class="medical-card p-6">
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
            <i v-if="changeType" class="h-4 w-4 text-green-500 mr-1 fa-solid fa-arrow-trend-up"></i>
            <i v-else class="h-4 w-4 text-red-500 mr-1 fa-solid fa-arrow-trend-down"></i>
            <!-- <span :class=`text-sm font-medium ${ changeType==='positive' ? 'text-green-600' : 'text-red-600' }`>
                {change}
            </span> -->
            <span class="text-sm text-gray-500 ml-2">vs. mes anterior</span>
        </div>
    </div>
</template>