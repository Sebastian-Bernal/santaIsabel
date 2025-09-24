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
    guardarDatos,
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

// watch(tablaStore.Formulario, (newValue) => {
//    console.log(newValue)
// }, {deep: true})

// Traer datos del localStorage
onMounted(() => {
    const datosGuardados = traerDatos();
    if (datosGuardados) Object.assign(tablaStore?.Formulario, datosGuardados)
});

function limpiar() {
    mapCamposLimpios(tablaStore?.Formulario)
    localStorage.removeItem(props.Propiedades.content.storeId)
    
    const show = props.Propiedades.formulario.show
    if (unref(show)) {
        // Si es ref
        if (show && typeof show === 'object' && 'value' in show) {
            show.value = false
        } else {
            props.Propiedades.formulario.show = false
        }
    }
}

</script>
<template>
    <component :is="fondos[Propiedades.formulario.fondo]"
        v-if="!Propiedades.formulario.fondo || unref(Propiedades.formulario.show)">
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg pb-7"
            :class="[Propiedades.formulario.tamañoForm, Propiedades.formulario.estilos]">

            <div class="pb-5 z-1 flex flex-col items-center h-[90%] rounded-2xl">
                <!-- Formulario Wizard -->
                <Wizard
                    v-if="Propiedades.formulario && Propiedades.formulario.tipo !== undefined && Propiedades.formulario.tipo === 'Wizard'"
                    :Propiedades="Propiedades.formulario" :SeccionActual="seccionActual"
                    :key="Propiedades.formulario.soloVer" :cerrar="limpiar" />
                <!-- Body -->
                <div class="w-full h-full md:px-6 px-2 pt-2">
                    <h2 v-if="Propiedades.formulario && Propiedades.formulario.titulo !== undefined && Propiedades.formulario.tipo !== 'Wizard'"
                        class="lg:text-2xl text-xl text-[var(--color-default)] dark:text-white font-bold text-center py-2">
                        {{ Propiedades.formulario.secciones[seccionActual].nombre }}
                    </h2>
                    <!-- Formulario -->
                    <form autocomplete="off" class="w-full h-full flex justify-center">
                        <div class="scrollForm w-full flex flex-col items-center py-3 gap-[15px] h-[90%] overflow-y-auto"
                            :class="{ 'h-[80%]!': Propiedades.formulario.tipo === 'Wizard' }">
                            <!-- Contenido del formulario -->
                            <div class="w-full md:px-10 px-3 grid md:grid-cols-2 grid-cols-1 gap-[15px]"
                                :class="Propiedades.formulario.contenedorCampos">
                                <component v-for="(item, index) in camposActuales" :key="index"
                                    :is="componentInstances[item.component]"
                                    :Propiedades="{ ...item, disabled: Propiedades.formulario.soloVer }"
                                    :modelValue="getValue(tablaStore?.Formulario, item.vmodel)"
                                    @update:modelValue="val => setValue(tablaStore?.Formulario, item.vmodel, val)" />
                                <slot></slot>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <!-- Botones -->
            <div class="mt-2 w-full flex justify-center items-center gap-3" role="button" tabindex="0"
                @keydown.enter="limpiar">
                <ButtonForm v-for="item in props.Propiedades.formulario.botones" :color="item.color"
                    @click="manejarClick(item, tablaStore?.Formulario, limpiar)"
                    class="md:w-[200px] w-1/3 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    {{ props.Propiedades.formulario.botones ? item.text : 'Cancelar' }}
                </ButtonForm>
            </div>
        </div>
    </component>
</template>