<script setup>
const props = defineProps({
    Propiedades: {
        dafault: {}
    }
});

const isHtml = computed(() => /<\/?[a-z][\s\S]*>/i.test(props.Propiedades.text))
</script>
<template>
    <label :for="Propiedades.forLabel" class="block font-medium text-gray-700 dark:text-gray-200" :class="Propiedades.tamaño">
        <slot></slot>
        <span v-if="isHtml" v-html="Propiedades.text"></span>
        <span v-else>{{ text }}</span>
    </label>
</template>