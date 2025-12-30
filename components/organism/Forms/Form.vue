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
//     console.log(newValue)
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

    const cerrar = props.Propiedades.formulario.botones.filter(boton => {
        return boton.type === 'cerrar'
    })?.[0]
    cerrar?.accion()

}

</script>
<template>
    <component :is="fondos[Propiedades.formulario.fondo]"
        v-if="!Propiedades.formulario.fondo || unref(Propiedades.formulario.show)">
        <form autocomplete="off" class="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg pb-4"
            :class="[Propiedades.formulario.tamañoForm, Propiedades.formulario.estilos]">

            <div class="pb-5 z-1 flex flex-col items-center h-[90%]">
                <!-- Formulario Wizard -->
                <Wizard
                    v-if="Propiedades.formulario && Propiedades.formulario.tipo !== undefined && Propiedades.formulario.tipo === 'Wizard'"
                    :Propiedades="Propiedades.formulario" :SeccionActual="seccionActual"
                    :key="Propiedades.formulario.soloVer" :cerrar="limpiar" />
                <!-- Body -->
                <div class="w-full h-full py-1">
                    <h2 v-if="Propiedades.formulario && Propiedades.formulario.tipo !== 'Wizard'"
                        class="lg:text-2xl text-xl text-[var(--color-default)] dark:text-white font-bold text-center py-2 pt-5">
                        {{ Propiedades.formulario.secciones[seccionActual].nombre }}
                    </h2>
                    <!-- Formulario -->
                    <div class="w-full h-full flex justify-center">
                        <div class="scrollForm w-full flex flex-col items-center py-3 gap-[15px] h-[95%] overflow-y-auto"
                            :class="{ 'h-[92%]!': Propiedades.formulario.tipo === 'Wizard' }">
                            <!-- Contenido del formulario -->
                            <div class="w-full md:px-10 px-5 pb-8 grid md:grid-cols-2 grid-cols-1 gap-[15px]"
                                :class="Propiedades.formulario.contenedorCampos">
                                <component v-for="(item, index) in camposActuales" :key="index"
                                    :is="componentInstances[item.component]"
                                    :Propiedades="{ ...item, disabled: Propiedades.formulario.soloVer }"
                                    :modelValue="getValue(tablaStore?.Formulario, item.vmodel)"
                                    @update:modelValue="val => setValue(tablaStore?.Formulario, item.vmodel, val)" />
                                <slot></slot>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Botones -->
            <div class="mt-7 w-full flex flex-row-reverse justify-center items-center gap-3 px-2">
                <ButtonForm v-for="item in props.Propiedades.formulario.botones" :color="item.color"
                    @click="(event) => manejarClick(event, item, tablaStore?.Formulario, limpiar)" 
                    class="md:w-[200px] sm:w-[2/3] w-full">
                    {{ props.Propiedades.formulario.botones ? item.text : 'Cancelar' }}
                </ButtonForm>
            </div>
        </form>
        
    </component>
</template>