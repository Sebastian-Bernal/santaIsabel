<script setup>
import { ref, watch, computed } from 'vue';

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

// Listado de items confirmados
const items = ref([...props.modelValue]);
const showCampos = ref(false);

// Borrador temporal para liveUpdate (NO aparece en tabla hasta guardar)
const draftForm = ref({ ...props.Propiedades.addItem });

// Índice en edición
const editIndex = ref(null);

// Items mostrados en tabla (solo confirmados)
const displayItems = computed(() => items.value);

// Flag para evitar ejecución duplicada de seleccionarItem
const isExecutingSelect = ref(false);

watch(() => props.modelValue, val => {
    items.value = [...val];
});

// Función para envolver seleccionarItem en campos y evitar ejecución duplicada
const wrapSelectItem = () => {
    // Buscar seleccionarItem dentro de los campos
    if (props.Propiedades.campos && Array.isArray(props.Propiedades.campos)) {
        props.Propiedades.campos.forEach(campo => {
            if (campo.seleccionarItem && typeof campo.seleccionarItem === 'function') {
                const originalSelectFunction = campo.seleccionarItem;
                
                campo.seleccionarItem = (item) => {
                    // Evitar ejecución duplicada
                    if (isExecutingSelect.value) return;
                    
                    isExecutingSelect.value = true;
                    
                    try {
                        // Actualizar draftForm automáticamente con los datos del item
                        const formTarget = props.Propiedades.liveUpdate ? draftForm : form;
                        
                        if (item && typeof item === 'object') {
                            Object.keys(item).forEach(key => {
                                if (key in formTarget.value) {
                                    formTarget.value[key] = item[key];
                                }
                            });
                        }
                        
                        // Ejecutar la función original solo una vez
                        return originalSelectFunction(item);
                    } finally {
                        isExecutingSelect.value = false;
                    }
                };
            }
        });
    }
};

// Envolver la función al montar el componente
wrapSelectItem();

// Agregar o actualizar
const saveItem = () => {
    if (!isFormValid()) return;

    if (props.Propiedades.liveUpdate) {
        // En liveUpdate, guardar el borrador al items
        items.value.push({ ...draftForm.value });
        // Reiniciar el borrador
        draftForm.value = { ...props.Propiedades.addItem };
        form.value = { ...props.Propiedades.addItem };
    } else {
        // Modo normal
        if (editIndex.value !== null) {
            // Actualizar item existente
            items.value[editIndex.value] = { ...form.value };
            editIndex.value = null;
        } else {
            // Agregar nuevo item
            items.value.push({ ...form.value });
        }
        form.value = { ...props.Propiedades.addItem };
    }

    emit('update:modelValue', [...items.value]);
};

// Validacion al agregar
const isFormValid = () => {
    const formToValidate = props.Propiedades.liveUpdate ? draftForm.value : form.value;
    
    return props.Propiedades.campos.every(campo => {
        const value = formToValidate[campo.name];
        return value !== null && value !== undefined && value !== '';
    });
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
    // Asegurar que items siempre es un array reactivo
    items.value = [...items.value];
    emit('update:modelValue', [...items.value]);
};

// Reset
const resetForm = () => {
    if (props.Propiedades.liveUpdate) {
        // Limpiar el borrador
        draftForm.value = { ...props.Propiedades.addItem };
    } else {
        // Modo normal
        if (editIndex.value !== null) {
            editIndex.value = null;
        }
    }
    form.value = { ...props.Propiedades.addItem };
};

const updateField = (field, value, campoDef) => {
    if (props.Propiedades.liveUpdate) {
        // En liveUpdate, escribir en draftForm (no aparece en tabla)
        if (campoDef.typeCampo === 'SelectSearch') {
            if (value && typeof value === 'object') {
                Object.keys(value).forEach(key => {
                    draftForm.value[key] = value[key];
                });
            } else {
                draftForm.value[field] = value;
            }
        } else {
            draftForm.value[field] = value;
        }
    } else {
        // Modo normal: escribir en form
        if (editIndex.value !== null) {
            // Si estamos editando, escribir en form
            if (campoDef.typeCampo === 'SelectSearch') {
                if (value && typeof value === 'object') {
                    Object.keys(value).forEach(key => {
                        form.value[key] = value[key];
                    });
                } else {
                    form.value[field] = value;
                }
            } else {
                form.value[field] = value;
            }
        } else {
            // Si es nuevo registro, escribir en form
            if (campoDef.typeCampo === 'SelectSearch') {
                if (value && typeof value === 'object') {
                    Object.keys(value).forEach(key => {
                        form.value[key] = value[key];
                    });
                } else {
                    form.value[field] = value;
                }
            } else {
                form.value[field] = value;
            }
        }
    }
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
                                        ? draftForm[campo.name]
                                        : (editIndex !== null ? form[campo.name] : form[campo.name])"
                        :Propiedades="campo"
                        @update:modelValue="value => updateField(campo.name, value, )"
                    />
                </div>
            </div>

            <!-- Acciones -->
            <div class="flex grid-cols-2 justify-end gap-2 pt-2">
                <button type="button" v-if="editIndex !== null || (Propiedades.liveUpdate && Object.values(draftForm).some(v => v !== '' && v !== null && v !== undefined))" @click="resetForm"
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
        <div v-if="displayItems.length" class="overflow-x-auto">
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
                    <tr v-for="(item, index) in displayItems" :key="index"
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