<script setup>
const props = defineProps({
    type: {
        type: String,
        default: 'text'
    },
    id: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    placeholder: {
        type: String,
        default: ''
    },
    tamaño: {
        type: [String, Object, Array],
        default: 'w-full'
    },
    modelValue: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    maxlength: {
        type: String
    },
    minlength: {
        type: String
    }
});
const emit = defineEmits(['update:modelValue']);
</script>
<template>
    <div :class="tamaño" class="relative">
    <input :value="modelValue" autocomplete="off" :type="type" :id="id" :name="name" :maxlength="maxlength" :minlength="minlength" :placeholder="placeholder" @input="$emit('update:modelValue', $event.target.value)" :disabled="disabled"
        class="w-full mt-1 block px-3 py-2 h-[37px] border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        <div class="absolute right-5 top-3">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.incompleto {
    border: 1px solid var(--color-red-500);
}
</style>