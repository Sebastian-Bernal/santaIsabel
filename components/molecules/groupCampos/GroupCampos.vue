<script setup>
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import SelectSearch from '~/components/atoms/Selects/SelectSearch.vue';
// Propiedades
const props = defineProps({
    Propiedades: {
        type: Object,
        default: () => ({})
    },
    modelValue: [String, Number, Object]
});

// Distitntos tipos de Inputs
const campos = { Input, SelectSearch };

// Variable reactiva array
const items = ref([...props.modelValue])

watch(() => props.modelValue, (newVal) => {
    items.value = [...newVal]
})


// Funciones para manejar Inputs
const addItem = () => {
    items.value.push({ descripcion: '', codigoCIE10: '', id_paciente: '' })
    emit('update:modelValue', items.value)
}

const removeItem = (index) => {
    items.value.splice(index, 1)
    emit('update:modelValue', items.value)
}

const updateField = (index, field, value) => {

    const updatedItems = [...items.value]
    // Actualizar el campo específico
    updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
    }
    items.value = updatedItems

    // Emitir el array completo al padre
    emit('update:modelValue', updatedItems)
}

const emit = defineEmits(['update:modelValue']);
</script>
<template>
    <div class="flex justify-between col-span-2">
        <label v-if="Propiedades.label" :for="Propiedades.name"
            class="block font-medium text-gray-700 dark:text-gray-200 w-fit mb-2">
            {{ Propiedades.label }}
        </label>
        <div v-if="Propiedades.buttons" class="flex gap-2 items-center">
            <a v-for="button in Propiedades.buttons" @click="button.action">
                <ButtonRounded :color="button.color">
                    <i :class="button.icon" @click="addItem"></i>
                </ButtonRounded>
            </a>
        </div>
    </div>
    <div :class="[{ relative: !!props.Propiedades.icon }, Propiedades.tamaño]" class="max-h-[200px] overflow-y-auto">
        <div v-for="(input, index) in items" :key="index" class="relative my-2">
            <component :is="campos[Propiedades.type]" :modelValue="input.descripcion"
                :Propiedades="Propiedades" @input="e => updateField(index, 'descripcion', e.target.value)" />

            <i class="fa-solid fa-close absolute right-2 top-2 text-red-500 hover:text-red-700"
                @click="() => removeItem(index)"></i>
        </div>
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