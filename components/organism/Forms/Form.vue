<script setup>
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
import ButtonForm from '~/components/atoms/Buttons/ButtonForm.vue';
import Wizard from './Wizard.vue';

import { useFormulario } from './useFormulario';

const props = defineProps({
    Propiedades: {
        default: {}
    }
});

const {
    transformarFormData,
    traerDatos,
    guardarDatos,
    getValue,
    setValue,
    manejarClick,
    seccionActual,
    camposActuales,
    componentInstances,
} = useFormulario(props)

const varView = useVarView();
const fondos = {
    true: FondoBlur,
    false: 'div'
}

// Inicializa formData con las claves de vmodel
const formData = ref(transformarFormData(props.Propiedades.formulario.secciones));

// Guardar y validar Datos
watch(
    formData.value,
    (newValue) => {
        guardarDatos(newValue);
        // Detectar inputs inválidos
        const hayCamposInvalidos = document.querySelectorAll('input:invalid').length > 0;
        varView.formComplete = !hayCamposInvalidos;
    },
    { deep: true }
);

// Traer datos del localStorage
onMounted(() => {
    const datosGuardados = traerDatos();
    if (datosGuardados) Object.assign(formData.value, datosGuardados)
});



</script>
<template>
    <component :is="fondos[Propiedades.formulario.fondo]"
        v-if="!Propiedades.formulario.fondo || Propiedades.formulario.show.value">
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg pb-7" :class="Propiedades.formulario.tamañoForm">

            <div class="pb-5 z-1 flex flex-col items-center h-[90%]  rounded-2xl">
                <!-- Formulario Wizard -->
                <Wizard
                    v-if="Propiedades.formulario && Propiedades.formulario.tipo !== undefined && Propiedades.formulario.tipo === 'Wizard'"
                    :secciones="Propiedades.formulario.secciones" :titulo="Propiedades.formulario.tituloFormulario"
                    :cerrar="Propiedades.formulario.cerrar" />
                <!-- Body -->
                <div class="w-full h-full px-6 pt-2">
                    <h1 v-if="Propiedades.formulario && Propiedades.formulario.titulo !== undefined"
                        class="text-3xl text-[var(--color-default)] dark:text-white font-bold mb-3 text-center pt-5">
                        {{ Propiedades.formulario.secciones[seccionActual].nombre }}
                    </h1>
                    <!-- Formulario -->
                    <form action="" class="w-full h-full flex justify-center">
                        <div
                            class="scrollForm w-full flex flex-col items-center py-3 gap-[15px] h-[73%] overflow-y-auto">
                            <!-- Contenido del formulario -->
                            <div class="w-full px-10 grid grid-cols-2 gap-[15px]">
                                <component v-for="(item, index) in camposActuales" :key="index"
                                    :is="componentInstances[item.component]" :Propiedades="item"
                                    :modelValue="getValue(formData, item.vmodel)"
                                    @update:modelValue="val => setValue(formData, item.vmodel, val)" />
                                <slot></slot>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <!-- Botones -->
            <div class="mt-2 w-full flex justify-center items-center gap-3">
                <ButtonForm v-for="item in props.Propiedades.formulario.botones" :color="item.color"
                    @click="manejarClick(item, formData)"
                    class="md:w-[200px] w-1/3 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    {{ props.Propiedades.formulario.botones ? item.text : 'Cancelar' }}
                </ButtonForm>
            </div>
        </div>
    </component>
</template>