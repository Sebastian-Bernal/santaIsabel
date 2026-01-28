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
    <div :class="Propiedades.tamaño">
        <label v-if="Propiedades.label" :for="Propiedades.name"
            class="block font-medium text-xs text-gray-700 dark:text-gray-200 w-fit mb-1">
            {{ Propiedades.label }}
        </label>
        <select :value="modelValue" :name="Propiedades.name" :id="Propiedades.id" :disabled="Propiedades.disabled"
            @input="$emit('update:modelValue', $event.target.value)" @click="Propiedades.events?.onClick"
            @change="Propiedades.events?.onChange" @blur="Propiedades.events?.onBlur"
            @keyup.enter="Propiedades.events?.onKeyUp" :class="[Propiedades.estilo, {'cursor-not-allowed': Propiedades.disabled}]"
            class="mt-1 h-[35px] w-full text-gray-900 block px-3 py-1 border border-gray-300 dark:text-white dark:border-blue-900 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option value="" selected disabled hidden>{{ Propiedades.placeholder }}</option>
            <option v-for="option in unref(Propiedades.options)" :value="option.value"
                class="text-black dark:bg-gray-900 dark:text-white">
                {{ option.text }}
            </option>
        </select>

        <!-- Slot (opcional) -->
        <div v-html="Propiedades.slot?.tooltip"></div>

    </div>

</template>

<style scoped>
.incompleto {
    border: 1px solid var(--color-red-500);
}
</style>