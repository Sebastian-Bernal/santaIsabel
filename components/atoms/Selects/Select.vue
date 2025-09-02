<script setup>
const props = defineProps({
    Propiedades: {
        dafault: {}
    },
    modelValue: {
        default: () => ""
    },
});

const emit = defineEmits(['update:modelValue']);

</script>
<template>
    <select :value="modelValue" 
        :name="Propiedades.name" 
        :id="Propiedades.id" 
        @input="$emit('update:modelValue', $event.target.value)" 
        @click="Propiedades.events?.onClick"
        @change="Propiedades.events?.onChange" 
        @blur="Propiedades.events?.onBlur"
        @keyup.enter="Propiedades.events?.onKeyUp"
        :class="Propiedades.tamaño"
        class="mt-1 text-gray-900 block px-3 py-2 border border-gray-300 dark:text-white dark:border-blue-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option value="" selected disabled hidden>{{ Propiedades.placeholder }}</option>
            <option v-for="option in unref(Propiedades.options)" :value="option.value"
                class="text-black dark:bg-gray-900 dark:text-white">   
                {{ option.text }}
            </option>
    </select>
</template>

<style scoped>
.incompleto {
    border: 1px solid var(--color-red-500);
}
</style>