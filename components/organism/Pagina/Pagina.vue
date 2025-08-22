<script setup>
import Tabla from '~/components/organism/Table/Tabla.vue'
import Form from '~/components/organism/Forms/Form.vue';
import Calendario from '~/components/molecules/Calendario/Calendario.vue';
import Citas from '~/components/molecules/Calendario/Citas.vue';
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';

const props = defineProps({
    Propiedades: {
        default: {}
    }
});console.log(props.Propiedades.componentes)


const fondos = {
    FondoDefault,
    FondoBlur
}

const components = {
    Tabla,
    Form,
    Calendario,
    Citas,
}

</script>

<template>
    <component :is="fondos[Propiedades.fondo]" :class="Propiedades.estilos">
        <div class="md:pb-8 pb-4 flex items-center justify-between">
            <h2 class="text-2xl font-semibold">
                {{ Propiedades.header }}
            </h2>
        </div>
        <div :class="Propiedades.contenedor">

            <component v-for="(component, index) in props.Propiedades.componentes" 
                :key="index"
                :is="components[component.tipo]" 
                :Propiedades="component"
            />
            <slot></slot>
        </div>
    </component>
</template>