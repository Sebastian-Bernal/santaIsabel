<script setup>
import ModalXS from '~/components/Modales/ModalXS.vue';
import { useVarView } from '~/stores/varview';

const varView = useVarView();
const props = defineProps({
    consulta: {
        type: [Array, Object],
        default: [],
    }
});
function cerrar () {
    varView.showConsultaInfo = false
};
</script>

<template>
    <ModalXS color="bg-gray-200">
        <div class="p-10 relative h-full">
            <h2 class="text-2xl font-semibold text-center mb-4">Consulta</h2>
            <div class="grid grid-cols-2 py-5 gap-3">
                <div>
                    <h3>Paciente</h3>
                    <p class="p-3 border border-gray-300 rounded-2xl bg-white ">
                        {{ props.consulta.name_paciente }}
                    </p>
                </div>
                <div class="flex flex-col">
                    <h3>Fecha</h3>
                    <p class="p-3 border border-gray-200 rounded-2xl bg-white ">
                        {{ props.consulta.fecha_historia }}
                    </p>
                </div>
            </div>
            <div>
                <h3>Motivo</h3>
                <p class="p-3 border border-gray-200 rounded-2xl bg-white ">
                    {{ props.consulta.motivo }}
                </p>
            </div>
            <div class="grid grid-cols-2 py-5 gap-3">
                <div>
                    <h3>Signos Vitales</h3>
                    <p class="bg-blue-200 p-3 border border-gray-200 rounded-2xl grid grid-cols-3 items-center justift-between gap-1">
                        <p v-for="(item, valor) in props.consulta.signosVitales" class="text-blue-500">{{ valor.toUpperCase() }} : <span class="text-gray-600">{{ item }}</span></p>
                    </p>
                </div>
                <div class="flex flex-col">
                    <h3>Profesional</h3>
                    <p class="p-3 border border-gray-200 rounded-2xl bg-white ">
                        {{ props.consulta.name_profesional}}
                    </p>
                </div>
            </div>

            <div class="absolute bottom-0 right-10 flex justify-center" @click="cerrar">
                <button class="px-10 py-2 bg-[var(--color-default-500)] text-white font-semibold rounded-2xl">
                    <i class="fa-solid fa-rotate-left"></i>
                </button>
            </div>
        </div>
    </ModalXS>
</template>