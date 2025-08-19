<script setup>
// Propiedades
const props = defineProps({
    Propiedades: {
        dafault: () => ({})
    }
});
const emit = defineEmits(['update:modelValue']);
</script>
<template>
    <div :class="[{ relative: !!props.Propiedades.icon }, Propiedades.tamaño]">
        <label v-if="Propiedades.label" :for="Propiedades.name" class="block font-medium text-gray-700 dark:text-gray-200 w-fit mb-2">{{Propiedades.label}}</label>
        <input :value="Propiedades.modelValue" autocomplete="off" :type="Propiedades.type" :id="Propiedades.id"
            :name="Propiedades.name" :maxlength="Propiedades.maxlength" :minlength="Propiedades.minlength"
            :placeholder="Propiedades.placeholder"
            @input="$emit('update:modelValue', Propiedades.mayuscula ? $event.target.value.toUpperCase() : $event.target.value)"
            :class="{ 'inputFondo': Propiedades.icon }" :disabled="Propiedades.disabled"
            class="mt-1 w-full block px-3 py-2 border text-black border-gray-300 dark:text-white dark:border-blue-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        
            <i v-if="Propiedades.icon" :class="Propiedades.icon"
            class="iconInput absolute left-[10px] top-[55%] text-gray-600 dark:text-gray-200"></i>
    </div>
</template>

<style scoped>
.incompleto {
    border: 1px solid var(--color-red-500);
}

input:invalid {
    border: 1px solid var(--color-red-500);
}

.inputFondo {
    padding: 5px 10px 5px 35px;
}

.iconInput {
    transform: translateY(-50%);
}
</style>