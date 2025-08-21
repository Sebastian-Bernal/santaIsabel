<script setup>
const props = defineProps({
    Propiedades: {
        type: Object,
        default: {}
    }
});

const isHtml = computed(() => /<\/?[a-z][\s\S]*>/i.test(props.Propiedades.text))
</script>
<template>
    <label :for="Propiedades.forLabel" class="block font-medium text-gray-700 dark:text-gray-200 pointer-events-none" 
    :class="Propiedades.tamaño"
    @click="Propiedades.events?.onClick"
    @change="Propiedades.events?.onChange"
    @blur="Propiedades.events?.onBlur"
    @keyup.enter="Propiedades.events?.onKeyUp">
        <slot></slot>
        <span v-if="isHtml" v-html="Propiedades.text"></span>
        <span v-else>{{ text }}</span>
    </label>
</template>