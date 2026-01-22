<script setup>
import { ref, watch } from 'vue';

import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import SelectMultiple from '~/components/atoms/Selects/SelectMultiple.vue';
import SelectSearch from '~/components/atoms/Selects/SelectSearch.vue';
import Textarea from '~/components/atoms/Textareas/Textarea.vue';

const props = defineProps({
    Propiedades: { type: Object, required: true },
    modelValue: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:modelValue']);

const campos = { Input, Select, SelectMultiple, SelectSearch, Textarea };

// Registro actual del formulario
const form = ref({ ...props.Propiedades.addItem });

// Listado
const items = ref([...props.modelValue]);
const showCampos = ref(false);
const draftIndex = ref(null);

// Índice en edición
const editIndex = ref(null);

watch(() => props.modelValue, val => {
    // Mantener el draft al sincronizar desde el padre
    if (draftIndex.value !== null && items.value.length > 0) {
        const draft = items.value[draftIndex.value];
        items.value = [...val];
        if (draft && Object.keys(draft).some(k => draft[k])) {
            items.value.push(draft);
        }
    } else {
        items.value = [...val];
    }
});

// Estado para controlar si los datos deben mostrarse en la tabla
const isSaved = ref(false);

// Crear un nuevo registro vacío automáticamente al guardar
const createDraftItem = () => {
    if (draftIndex.value === null) {
        const nuevoDraft = { ...props.Propiedades.addItem };
        draftIndex.value = items.value.length; // Índice del draft
        items.value.push(nuevoDraft);
    }
};

// Agregar o actualizar
const saveItem = () => {
    if (!isFormValid()) return;

    if (editIndex.value !== null) {
        // Actualizar un registro existente
        items.value[editIndex.value] = { ...form.value };
        editIndex.value = null;
    } else {
        // Guardar un nuevo registro
        items.value.push({ ...form.value });
    }

    form.value = { ...props.Propiedades.addItem }; // Reiniciar el formulario
    isSaved.value = true; // Marcar como guardado

    // Emitir solo los registros válidos (excluir el draft)
    const validItems = draftIndex.value !== null ? items.value.slice(0, -1) : items.value;
    emit('update:modelValue', validItems);
    
    // Crear un nuevo draft vacío después de emitir
    createDraftItem();
};
// Validacion al agregar
const isFormValid = () => {
    if (props.Propiedades.liveUpdate) {
        // Validar directamente el último item
        const lastIndex = items.value.length - 1;
        if (lastIndex < 0) return false;
        return props.Propiedades.campos.every(campo => {
            const value = items.value[lastIndex][campo.name];
            return value !== null && value !== undefined && value !== '';
        });
    } else {
        // Validar contra form en modo normal
        return props.Propiedades.campos.every(campo => {
            const value = form.value[campo.name];
            return value !== null && value !== undefined && value !== '';
        });
    }
};

// Editar
const editItem = (index) => {
    form.value = { ...items.value[index] };
    editIndex.value = index;
    showCampos.value = true;
};

// Eliminar
const removeItem = (index) => {
    items.value.splice(index, 1);
    // Ajustar el índice del draft si es necesario
    if (draftIndex.value !== null && index < draftIndex.value) {
        draftIndex.value--;
    }
    // Emitir solo los registros válidos (sin el draft)
    const validItems = draftIndex.value !== null ? items.value.slice(0, -1) : items.value;
    emit('update:modelValue', validItems);
};

// Reset
const resetForm = () => {
    form.value = { ...props.Propiedades.addItem };
    editIndex.value = null;
    showCampos.value = false;

    // Eliminar el draft si existe
    if (draftIndex.value !== null) {
        items.value.splice(draftIndex.value, 1);
        draftIndex.value = null;
    }

    isSaved.value = false; // Reiniciar el estado de guardado
};

const ensureDraftItem = () => {
    if (draftIndex.value !== null) return;

    const draft = { ...props.Propiedades.addItem };
    draftIndex.value = items.value.length;
    items.value.push(draft);

    // No emitir aquí, solo crear el draft localmente
};

const updateField = (field, value, campoDef) => {
    // Si se edita, mover al final
    if (editIndex.value !== null) {
        const editedItem = items.value[editIndex.value];
        items.value.splice(editIndex.value, 1);

        const newDraft = { ...editedItem };
        items.value.push(newDraft);

        draftIndex.value = items.value.length - 1;
        editIndex.value = null;
    }

    // Asegurar draft
    ensureDraftItem();

    const lastIndex = items.value.length - 1;

    // 👉 Si liveUpdated está activo, siempre escribir en items
    if (props.Propiedades.liveUpdated) {
        if (campoDef.typeCampo === 'SelectSearch') {
            if (value && typeof value === 'object') {
                // Selección de objeto
                Object.keys(value).forEach(key => {
                    items.value[lastIndex][key] = value[key];
                });
            } else {
                // Texto libre escrito en el input
                items.value[lastIndex][field] = value;
            }
        } else {
            items.value[lastIndex][field] = value;
        }
    } else {
        // Modo normal: mantener en form y draft
        if (campoDef.typeCampo === 'SelectSearch' && value && typeof value === 'object') {
            Object.keys(value).forEach(key => {
                items.value[lastIndex][key] = value[key];
                form.value[key] = value[key];
            });
        } else {
            items.value[lastIndex][field] = value;
            form.value[field] = value;
        }
    }

    // Solo actualizar localmente, no emitir
    // La emisión ocurrirá cuando se guarde el item en saveItem()
};

</script>

<template>
    <div class="col-span-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-4">

        <!-- Título -->
        <div class="flex justify-between items-center">
            <label class="flex gap-2 font-medium text-gray-700 dark:text-gray-200 w-fit">

                {{ Propiedades.labelGroup }}

            </label>

            <div class="flex items-center gap-1">
                <div v-if="Propiedades.labelGroup && !Propiedades.disabled" @click="showCampos = !showCampos" class="w-[30px] h-[30px] flex justify-center items-center gap-1 hover:bg-gray-200 
                            hover:dark:bg-gray-700 cursor-pointer rounded-full">
                    <i class="fa-solid text-blue-700 font-bold"
                        :class="{ 'fa-angle-up': showCampos, 'fa-angle-down': !showCampos }">
                    </i>
                </div>
                <span v-if="items.length > 0" class="text-sm text-blue-700">{{ items.length }}</span>
            </div>
        </div>

        <!-- FORMULARIO ÚNICO -->
        <div v-if="showCampos" class="grid gap-3 bg-white dark:bg-gray-900 p-4 rounded-lg">

            <div :class="Propiedades.containerCampos">
                <div v-for="campo in Propiedades.campos" :key="campo.name">
                    <component 
                        :is="campos[campo.typeCampo]" 
                        :modelValue="Propiedades.liveUpdate 
                                        ? items.at(-1)?.[campo.name] 
                                        : form[campo.name]"
                        :Propiedades="campo"
                        @update:modelValue="value => updateField(campo.name, value, campo)"
                    />
                </div>
            </div>

            <!-- Acciones -->
            <div class="flex grid-cols-2 justify-end gap-2 pt-2">
                <button type="button" v-if="editIndex !== null" @click="resetForm"
                    class="px-4 py-2 text-sm bg-gray-300 dark:bg-gray-700 rounded-lg">
                    Cancelar
                </button>

                <button type="button" @click="saveItem"
                    class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 cursor-pointer active:scale-95">
                    <i class="fa-solid fa-plus"></i>
                    {{ editIndex !== null ? 'Actualizar' : 'Guardar' }}
                </button>
            </div>
        </div>

        <!-- TABLA -->
        <div v-if="items.length && isSaved" class="overflow-x-auto">
            <table class="w-full text-sm rounded-lg overflow-hidden" border="0" >
                <thead class="bg-gray-200 dark:bg-gray-600">
                    <tr>
                        <th v-for="campo in Propiedades.campos" :key="campo.name" class="px-3 py-2 text-left">
                            {{ campo.placeholder }}
                        </th>
                        <th v-if="!Propiedades.disabled" class="px-3 py-2 text-center">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(item, index) in items.slice(0, -1)" :key="index"
                        class="border-t border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">

                        <td v-for="campo in Propiedades.campos" :key="campo.name" class="px-3 py-2">
                            {{ item[campo.name] }}
                        </td>

                        <td v-if="!Propiedades.disabled" class="px-3 py-2 text-center flex justify-center gap-2">
                            <ButtonRounded v-if="!Propiedades.ocultarEditar" color="bg-yellow-500" @click="editItem(index)">
                                <i class="fa-solid fa-pen"></i>
                            </ButtonRounded>

                            <ButtonRounded v-if="!Propiedades.ocultarEliminar" color="bg-red-500" @click="removeItem(index)">
                                <i class="fa-solid fa-trash"></i>
                            </ButtonRounded>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Vacío -->
        <p v-else class="text-center text-gray-400 py-4">
            No hay registros agregados.
        </p>

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
