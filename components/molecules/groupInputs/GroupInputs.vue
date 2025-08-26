<script setup>
// Propiedades
const props = defineProps({
    Propiedades: {
        type: Object,
        default: () => ({})
    },
    modelValue: [String, Number, Object]
});

function handleInput(event) {
  let value = event.target.value;

  // Aplica transformación solo si se especifica
  if (props.Propiedades.upperCase === true) {
    value = value.toUpperCase();
  } else if (props.Propiedades.lowerCase === true) {
    value = value.toLowerCase();
  }

  // Emitimos el valor transformado (o sin transformar)
  emit('update:modelValue', value);
}



const emit = defineEmits(['update:modelValue']);
</script>
<template>
    <div>
        <label for="">
            {{ Propiedades.label }}
        </label>
        <div v-if="Propiedades.buttons" class="flex gap-2 items-center">
            <a v-for="button in Propiedades.buttons" @click="button.action">
                <ButtonRounded :color="button.color"><i :class="button.icon"></i></ButtonRounded>
            </a>
        </div>
    </div>
    <div :class="[{ relative: !!props.Propiedades.icon }, Propiedades.tamaño]">
        <label v-if="Propiedades.label" :for="Propiedades.name"
            class="block font-medium text-gray-700 dark:text-gray-200 w-fit mb-2">
            
        </label>
        <input :value="modelValue" autocomplete="off" 
            :type="Propiedades.type" 
            :id="Propiedades.id"
            :name="Propiedades.name" 
            :maxlength="Propiedades.maxlength" :minlength="Propiedades.minlength"
            :min="Propiedades.min" :max="Propiedades.max" 
            :placeholder="Propiedades.placeholder"
            @input="handleInput($event)"
            @click="Propiedades.events?.onClick"
            @change="Propiedades.events?.onChange"
            @blur="Propiedades.events?.onBlur"
            @keyup.enter="Propiedades.events?.onKeyUp"
            :disabled="Propiedades.disabled"
            :class="{ 'inputFondo': Propiedades.icon }" 
            class="mt-1 w-full block px-3 py-2 border text-black border-gray-300 dark:text-white dark:border-blue-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />

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