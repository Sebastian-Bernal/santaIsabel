<script setup>
import ModalXS from '~/components/Modales/ModalXS.vue';

const varView = useVarView();
const props = defineProps({
    medicacionInfo: {
        type: [Object],
    }
});

function cerrar () {
    varView.showMedicacionInfo = false
}
</script>

<template>
    <ModalXS color="bg-gray-200">
        <div class="p-10 relative h-full">
            <h2 class="text-2xl font-semibold text-center mb-4">Medicacion</h2>
            <div class="grid grid-cols-2 py-2 gap-3">
                <div class="flex flex-col">
                    <h3>Medicamento</h3>
                    <p class="p-3 border border-gray-200 rounded-2xl bg-white ">
                        {{props.medicacionInfo.medicamento}}
                    </p>
                </div>
                <div>
                    <h3>Dosis</h3>
                    <p class="p-3 border border-gray-300 rounded-2xl bg-white ">
                        {{ props.medicacionInfo.dosis}}
                    </p>
                </div>
            </div>
            <div class="grid grid-cols-3 py-2 gap-3">
                <div>
                    <h3>Presentacion</h3>
                    <p class="p-3 border border-gray-300 rounded-2xl bg-white ">
                        {{ props.medicacionInfo.presentacion}}
                    </p>
                </div>
                <div class="flex flex-col">
                    <h3>Concentracion</h3>
                    <p class="p-3 border border-gray-200 rounded-2xl bg-white ">
                        {{props.medicacionInfo.concentracion}}
                    </p>
                </div>
                <div class="flex flex-col">
                    <h3>Cantidad</h3>
                    <p class="p-3 border border-gray-200 rounded-2xl bg-white ">
                        {{props.medicacionInfo.cantidad}}
                    </p>
                </div>
            </div>
            <div>
                <h3>Analisis</h3>
                <p class="p-3 border border-gray-200 rounded-2xl bg-white ">
                    {{props.medicacionInfo.analisis}}
                </p>
            </div>
            <div class="grid grid-cols-2 py-5 gap-3">
                <div>
                    <h3>Observacion de la consulta</h3>
                    <p class="p-3 border border-gray-200 rounded-2xl bg-white">
                        {{props.medicacionInfo.observacion}}
                    </p>
                </div>
                <div class="flex flex-col">
                    <h3>Profesional</h3>
                    <p class="p-3 border border-gray-200 rounded-2xl bg-white">
                        Juan Perez Perez
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