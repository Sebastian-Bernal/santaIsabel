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
    <div :class="[{ 'relative': props.Propiedades.icon || Propiedades.slot }, Propiedades.tamaño]">
        <!-- Label (opcional) -->
        <label v-if="Propiedades.label" :for="Propiedades.name"
            class="block font-medium text-xs text-gray-700 dark:text-gray-200 w-fit mb-1">
            {{ Propiedades.label }}
        </label>

        <!-- Input -->
        <input :value="modelValue" autocomplete="off" 
            :type="Propiedades.type" 
            :id="Propiedades.id"
            :name="Propiedades.name"
            :maxlength="Propiedades.maxlength" :minlength="Propiedades.minlength"
            :min="Propiedades.min" :max="Propiedades.max"
            :placeholder="Propiedades.placeholder"
            @input="handleInput($event); Propiedades.events?.onInput?.($event)"
            @click="Propiedades.events?.onClick"
            @change="Propiedades.events?.onChange?.($event)"
            @blur="Propiedades.events?.onBlur"
            @keyup.enter="Propiedades.events?.onKeyUp"
            :disabled="Propiedades.disabled"
            :class="[{ 'inputIcon': Propiedades.icon, 'inputSlot': Propiedades.slot && Propiedades.slot.label, 'input-disabled': Propiedades.disabled }, Propiedades.estilo]" 
            class="mt-1 w-full h-[35px] block px-3 py-2 border text-black border-gray-300 dark:text-white dark:border-blue-900 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />

        <!-- Icono (opcional) -->
        <i v-if="Propiedades.icon" :class="Propiedades.icon"
            class="iconInput absolute left-[10px] top-[55%] text-gray-600 dark:text-gray-200"></i>
        <!-- Slot (opcional) -->
        <div v-if="Propiedades.slot" class="absolute right-5 top-2.5">
            <label v-html="Propiedades.slot.label" @click="Propiedades.slot.action?.()"></label>
            <input v-if="Propiedades.slot.input"
                :type="Propiedades.slot.input.type"
                :accept="Propiedades.slot.input.accept"
                :id="Propiedades.slot.input.id"
                :name="Propiedades.slot.input.name"
                @input="handleInput($event)"
                :class="Propiedades.slot.inputClass || 'hidden'"
            />
        </div>

        <div v-html="Propiedades.slot?.tooltip"></div>

    </div>
</template>

<style scoped>
.incompleto {
    border: 1px solid var(--color-red-500);
}

input:invalid {
    border: 1px solid var(--color-red-500);
}

.inputIcon {
    padding: 5px 10px 5px 35px;
}

.inputSlot {
    padding: 5px 35px 5px 10px;
}

.iconInput {
    transform: translateY(-50%);
}

.input-disabled {
    background-color: var(--color-gray-100);
    cursor: not-allowed;
}

@layer utilities {
  /* Calendario y reloj */
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="datetime-local"]::-webkit-calendar-picker-indicator,
  input[type="month"]::-webkit-calendar-picker-indicator,
  input[type="week"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator {
    @apply dark:invert dark:brightness-0 dark:sepia dark:hue-rotate-180;
  }

  /* Botón de limpiar en search */
  input[type="search"]::-webkit-search-cancel-button {
    @apply dark:invert dark:brightness-0;
  }
}


</style>