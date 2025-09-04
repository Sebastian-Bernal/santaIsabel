<script setup>
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
import FondoTransparent from '~/components/atoms/Fondos/FondoTransparent.vue';
import ButtonForm from '~/components/atoms/Buttons/ButtonForm.vue';
import Wizard from './Wizard.vue';

import { useFormulario, mapCamposLimpios } from './useFormulario';
import { cargarStore } from './componentLoader';

const props = defineProps({
    Propiedades: {
        default: {}
    }
});

const tablaStore = await cargarStore(props.Propiedades.content.storePinia) || {}

const {
    traerDatos,
    getValue,
    setValue,
    manejarClick,
    seccionActual,
    camposActuales,
    componentInstances,
} = useFormulario(props)

const fondos = {
    true: FondoBlur,
    false: 'div',
    FondoTransparent,
};

// Traer datos del localStorage
onMounted(() => {
    const datosGuardados = traerDatos();
    if (datosGuardados) Object.assign(tablaStore?.Formulario, datosGuardados)
});

function limpiar () {
    mapCamposLimpios(tablaStore?.Formulario)
    localStorage.removeItem(props.Propiedades.content.storeId)
    props.Propiedades.formulario.show.value = false
}

</script>
<template>
    <component :is="fondos[Propiedades.formulario.fondo]"
        v-if="!Propiedades.formulario.fondo || unref(Propiedades.formulario.show)">
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg pb-7" :class="[Propiedades.formulario.tamañoForm, Propiedades.formulario.estilos]">

            <div class="pb-5 z-1 flex flex-col items-center h-[90%] rounded-2xl">
                <!-- Formulario Wizard -->
                <Wizard
                    v-if="Propiedades.formulario && Propiedades.formulario.tipo !== undefined && Propiedades.formulario.tipo === 'Wizard'"
                    :Propiedades="Propiedades.formulario" :SeccionActual="seccionActual"
                    :cerrar="limpiar" />
                <!-- Body -->
                <div class="w-full h-full px-6 pt-2">
                    <h1 v-if="Propiedades.formulario && Propiedades.formulario.titulo !== undefined"
                        class="text-3xl text-[var(--color-default)] dark:text-white font-bold mb-3 text-center pt-5">
                        {{ Propiedades.formulario.secciones[seccionActual].nombre }}
                    </h1>
                    <!-- Formulario -->
                    <form autocomplete="off" class="w-full h-full flex justify-center">
                        <div
                            class="scrollForm w-full flex flex-col items-center py-3 gap-[15px] h-[90%] overflow-y-auto" :class="{'h-[75%]!' : Propiedades.formulario.tipo === 'Wizard'}">
                            <!-- Contenido del formulario -->
                            <div class="w-full px-10 grid grid-cols-2 gap-[15px]">
                                <component v-for="(item, index) in camposActuales" :key="index"
                                    :is="componentInstances[item.component]" :Propiedades="{...item, disabled: props.Propiedades.formulario.soloVer}"
                                    :modelValue="getValue(tablaStore?.Formulario, item.vmodel)"
                                    @update:modelValue="val => setValue(tablaStore?.Formulario, item.vmodel, val)" />
                                <slot></slot>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <!-- Botones -->
            <div class="mt-2 w-full flex justify-center items-center gap-3">
            <!-- <button @click="limpiar">Cerrar</button> -->
                <ButtonForm v-for="item in props.Propiedades.formulario.botones" :color="item.color"
                    @click="manejarClick(item, tablaStore?.Formulario, limpiar)" @keyup.enter="manejarClick(item, tablaStore?.Formulario, limpiar)"
                    class="md:w-[200px] w-1/3 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    {{ props.Propiedades.formulario.botones ? item.text : 'Cancelar' }}
                </ButtonForm>
            </div>
        </div>
    </component>
</template>