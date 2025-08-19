<script setup>
const props = defineProps({
  item: { type: Object, required: true },
  componentMap: { type: Object, required: true },
})

const emit = defineEmits(["update:item"])

// Proxy: cada vez que cambie el v-model del hijo, actualiza item.modelValue
function updateValue(value) {
  emit("update:item", { ...props.item, modelValue: value })
}
</script>

<template>
  <component
    :is="componentMap[item.component]"
    v-bind="item"
    :Propiedades="item"
    :modelValue="item.modelValue"
    @update:modelValue="updateValue"
  />
</template>
