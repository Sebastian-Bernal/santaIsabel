<script setup>
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import SelectMultiple from '~/components/atoms/Selects/SelectMultiple.vue';
import SelectSearch from '~/components/atoms/Selects/SelectSearch.vue';
// Propiedades
const props = defineProps({
    Propiedades: {
        type: Object,
        default: () => ({})
    },
    modelValue: [String, Number, Object]
});

const campos = { Input, SelectSearch, Select, SelectMultiple }; // Distitntos tipos de Inputs
const items = ref([...props.modelValue]) // Variable reactiva array
const showCampos = ref(false)

watch(() => props.modelValue, (newVal) => {
    items.value = [...newVal]
})

// Funciones para manejar Inputs
const addItem = (newItem = null) => {
    showCampos.value = true
    items.value.push(newItem || props.Propiedades.addItem || {})
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
    <div class="flex flex-col col-span-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-xl">
    <!-- Header -->
    <div class="flex justify-between">
        <label v-if="Propiedades.labelGroup" :for="Propiedades.name" @click="showCampos = !showCampos"
            class="flex gap-2 font-medium text-gray-700 dark:text-gray-200 w-fit mb-2">
            {{ Propiedades.labelGroup }}
            <div class="w-[30px] h-[30px] flex justify-center items-center hover:bg-gray-200 hover:dark:bg-gray-700 cursor-pointer rounded-full">
                <i class="fa-solid text-blue-700 font-bold" :class="{'fa-angle-up':showCampos, 'fa-angle-down': !showCampos}"></i>
            </div>
        </label>
        <div v-if="Propiedades.buttons && !Propiedades.disabled" class="flex gap-2 items-center">
            <a v-for="button in Propiedades.buttons" @click="() => addItem(button.addItem)" class="flex items-center cursor-pointer">
                <span v-if="button.label" class="mr-1">{{ button.label }}</span>
                <ButtonRounded :color="button.color">
                    <i :class="button.icon"></i>
                </ButtonRounded>
            </a>
        </div>
    </div>
    
    <!-- Campos -->
    <div v-if="showCampos || showCampos && items.length > 0" :class="[Propiedades.tamaño]" class="max-h-[200px] overflow-y-auto">
        <div v-for="(input, index) in items" :key="index" class="relative my-2 pt-5" :class="Propiedades.containerCampos">

            <div class="w-full flex justify-between absolute top-0">
                <label class="text-xs text-gray-600">Bloque {{ index + 1 }}</label>
                <i v-if="!Propiedades.disabled" class="fa-solid fa-close text-red-500 hover:text-red-700 cursor-pointer"
                @click="() => removeItem(index)"></i>
            </div>
            <div v-for="campoDef in Propiedades.campos" :key="campoDef.name" class="">
                <component :is="campos[campoDef.typeCampo]" :modelValue="input[campoDef.name]" :Propiedades="{...campoDef, disabled: Propiedades.disabled}"
                    @input="e => updateField(index, campoDef.name, e.target.value)" />
            </div>

        </div>


        <div v-if="items.length < 1" class="flex justify-center pb-4">
            <p class="text-gray-400 dark:text-gray-600 text-base font-medium">No hay Datos, Agrega un campo.</p>
        </div>
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