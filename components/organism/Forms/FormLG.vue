<script setup>
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
import ButtonForm from "~/components/Buttons/ButtonForm.vue";
import Wizard from '~/components/Forms/Wizard.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import Label from '~/components/atoms/Labels/Label.vue';

import { computed } from 'vue';
import CampoForm from './CampoForm.vue';


const props = defineProps({
    Propiedades: {
        default: {}
    }
});
const formData = defineModel('formData');
const varView = useVarView();

watch(
    formData.value,
    (newValue) => {
        props.Propiedades.content.guardarDatos(newValue);
        // const User = newValue.User;
        // Validacion
        // const camposValidos = camposRequeridos.every((campo) => User[campo] !== '');

        // Detectar inputs inválidos
        const hayCamposInvalidos = document.querySelectorAll('input:invalid').length > 0;
        varView.formComplete = false
        varView.formComplete = !hayCamposInvalidos;
    },
    { deep: true }
);

// Traer datos del localStorage
onMounted(() => {
    props.Propiedades.content.traerDatos();
});

const componentMap = {
    Input: Input,
    Select: Select,
    Label: Label
}


</script>
<template>
    <FondoBlur>
        <div
            class="lg:w-[70%] md:w-[85%] md:h-[85%] w-[90%] h-[90%] bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg pb-7">

            <div class="pb-5 z-1 flex flex-col items-center h-[90%]  rounded-2xl">
                <Wizard :secciones="Propiedades.formulario.secciones" :titulo="Propiedades.formulario.tituloFormulario"
                    :cerrar="Propiedades.formulario.cerrar" />
                <div class="w-full h-full px-6 pt-2">
                    <h1 class="text-3xl text-[var(--color-default)] dark:text-white font-bold mb-3 text-center pt-5">{{
                        Propiedades.formulario.titulo }}</h1>
                    <!-- Formulario -->
                    <form action="" class="w-full h-full flex justify-center">
                        <div
                            class="scrollForm w-full flex flex-col items-center py-3 gap-[15px] h-[73%] overflow-y-auto">
                            <!-- Contenido del formulario -->
                            <div class="w-full px-10 grid grid-cols-2 gap-[15px]">
                                <CampoForm v-for="(item, index) in Propiedades.campos" :key="index" :item="item"
                                    :componentMap="componentMap"
                                    @update:item="val => Propiedades.campos[index] = val" />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <!-- Botones -->
            <div class="mt-2 w-full flex justify-center items-center gap-3">
                <ButtonForm v-for="item in props.Propiedades.botones" color="bg-gray-500 " @click="item.accion"
                    class="md:w-[200px] w-1/3 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    {{ props.Propiedades.botones ? item.text : 'Cancelar' }}
                </ButtonForm>

                <!-- <ButtonForm v-if="props.Propiedades.botones.cancelar" color="bg-gray-500 " @click="props.Propiedades.cerrarModal"
                    class="md:w-[200px] w-1/3 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    {{ props.Propiedades.botones ? props.Propiedades.botones.cancelar : 'Cancelar' }}
                </ButtonForm>

                <ButtonForm v-if="props.Propiedades.botones.enviar" color="bg-blue-500"
                    @click="props.Propiedades.formComplete ? props.Propiedades.enviarFormulario(props.Propiedades.formData) : props.Propiedades.validarform()"
                    class="md:w-[200px] w-1/3 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    {{ props.Propiedades.botones ? props.Propiedades.botones.enviar : 'Registrar' }}
                </ButtonForm> -->
            </div>
        </div>
    </FondoBlur>
</template>