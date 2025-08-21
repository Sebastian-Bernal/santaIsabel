<script setup>
import FondoBlur from '../atoms/Fondos/FondoBlur.vue';
import ButtonForm from "~/components/Buttons/ButtonForm.vue";

const props = defineProps({
    formData: {
        type: Object,
    },
    botones: {
        type: Object,
    },
    validarform: {
        type: Function,
    },
    cerrarModal: {
        type: Function,
    },
    formComplete: {
        type: Boolean,
    },
    enviarFormulario: {
        type: Function,
    }
});
</script>
<template>
    <FondoBlur>
        <div class="lg:w-[70%] md:w-[85%] md:h-[85%] w-[90%] h-[90%] bg-gray-50 rounded-2xl shadow-lg pb-7">
            <slot></slot>
            <!-- Botones -->
            <div class="mt-2 w-full flex justify-center items-center gap-3">
                <ButtonForm v-if="props.botones.cancelar" color="bg-gray-500 " @click="props.cerrarModal"
                    class="md:w-[200px] w-1/3 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    {{ props.botones ? props.botones.cancelar : 'Cancelar' }}
                </ButtonForm>

                <ButtonForm v-if="props.botones.enviar" color="bg-blue-500"
                    @click="props.formComplete ? props.enviarFormulario(props.formData) : props.validarform()"
                    class="md:w-[200px] w-1/3 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    {{ props.botones ? props.botones.enviar : 'Registrar' }}
                </ButtonForm>
            </div>
        </div>
    </FondoBlur>
</template>