<script setup>
import ModalXS from '~/components/Modales/ModalXS.vue';

const varView = useVarView();
const props = defineProps({
    notaInfo: {
        type: [Object],
    }
});

function cerrar () {
    varView.showNotasInfo = false
}
</script>

<template>
    <ModalXS color="bg-gray-200">
        <div class="p-10 relative h-full">
            <h2 class="text-2xl font-semibold text-center mb-4">Nota</h2>
            <div class="grid grid-cols-2 py-5 gap-3">
                <div>
                    <h3>Prioridad</h3>
                    <p class="p-3 border border-gray-200 rounded-2xl"
                    :class="{'bg-red-100' : props.notaInfo.tipoAnalisis === 'Cambios criticos', 'bg-orange-100': props.notaInfo.tipoAnalisis === 'Recomendaciones Adicionales', 'bg-green-300': props.notaInfo.tipoAnalisis === 'Estado clinico sin cambios'}">
                        {{props.notaInfo.tipoAnalisis}}
                    </p>
                </div>
                <div class="flex flex-col">
                    <h3>Profesional</h3>
                    <p class="p-3 border border-gray-200 rounded-2xl bg-white ">
                        Juan Perez Perez
                    </p>
                </div>
            </div>
            <div class="grid grid-cols-[100px_100px_1fr] gap-3">
                <p>Fecha</p>
                <p>Hora</p>
                <p>Nota</p>
            </div>
            <div class="grid grid-cols-[100px_100px_1fr] py-5 gap-3">
                <div>
                    <p class="p-2 border border-gray-300 rounded-2xl bg-white ">
                        {{ props.notaInfo.fecha_nota}}
                    </p>
                </div>
                <div>
                    <p class="p-2 border border-gray-200 rounded-2xl bg-white ">
                        {{props.notaInfo.hora_nota}}
                    </p>
                </div>
                <div>
                    <p class="p-2 border border-gray-300 rounded-2xl bg-white ">
                        {{ props.notaInfo.nota}}
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