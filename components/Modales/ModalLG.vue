<script setup>
import Fondo from '../Fondos/Fondo.vue';
import ButtonForm from "~/components/Buttons/ButtonForm.vue";

const props = defineProps({
    formData: {
        type: Object,
        required: true
    },
    botones: {
        type: Object,
    },
    validarform: {
        type: Function,
        required: true
    },
    cerrarModal: {
        type: Function,
        required: true
    },
    formComplete: {
        type: Boolean,
        required: true
    },
    enviarFormulario: {
        type: Function,
        required: true
    }
});
</script>
<template>
    <Fondo>
        <div class="md:w-[70%] md:h-[85%] w-[90%] h-[90%] bg-gray-50 rounded-2xl shadow-lg pb-7">
            <slot></slot>
            <!-- Botones -->
            <div class="mt-2 w-full flex justify-center items-center gap-3">
                <ButtonForm color="bg-gray-500 " @click="props.cerrarModal"
                    class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    Cancelar
                </ButtonForm>

                <ButtonForm color="bg-blue-500"
                    @click="props.formComplete ? props.enviarFormulario(props.formData) : props.validarform()"
                    class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    Registrar
                </ButtonForm>
            </div>
        </div>
    </Fondo>
</template>