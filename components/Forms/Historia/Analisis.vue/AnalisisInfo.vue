<script setup>
import ModalXS from '~/components/Modales/ModalXS.vue';

const varView = useVarView();
const props = defineProps({
    historiaAnalisis: {
        type: [Object],
    }
});

function cerrar () {
    varView.showAnalisisInfo = false
}
console.log(props.historiaAnalisis)
</script>

<template>
    <ModalXS color="bg-gray-200">
        <div class="p-10 relative h-full">
            <h2 class="text-2xl font-semibold text-center mb-4">Análisis</h2>
            <div class="grid grid-cols-2 py-5 gap-3">
                <div>
                    <h3>Descripcion</h3>
                    <p class="p-3 border border-gray-300 rounded-2xl bg-white ">
                        El paciente ingresa a urgencias por accidente en via
                    </p>
                </div>
                <div class="flex flex-col">
                    <h3>Fecha</h3>
                    <p class="p-3 border border-gray-200 rounded-2xl bg-white ">
                        {{props.historiaAnalisis[0].fecha_historia}}
                    </p>
                </div>
            </div>
            <div>
                <h3>Analisis</h3>
                <p class="p-3 border border-gray-200 rounded-2xl bg-white ">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Corporis eveniet praesentium minus ducimus cupiditate sit, officia, deserunt quam expedita, debitis at alias labore dolores. Blanditiis perspiciatis nam qui necessitatibus? Maiores!
                </p>
            </div>
            <div class="grid grid-cols-2 py-5 gap-3">
                <div>
                    <h3>Estado</h3>
                    <p class="p-3 border border-gray-200 rounded-2xl bg-red-100"
                    :class="{'bg-red-100' : props.historiaAnalisis[0].tipoAnalisis === 'Cambios criticos', 'bg-orange-100': props.historiaAnalisis[0].tipoAnalisis === 'Recomendaciones Adicionales', 'bg-green-300': props.historiaAnalisis[0].tipoAnalisis === 'Estado clinico sin cambios'}">
                        {{props.historiaAnalisis[0].tipoAnalisis}}
                    </p>
                </div>
                <div class="flex flex-col">
                    <h3>Profesional</h3>
                    <p class="p-3 border border-gray-200 rounded-2xl bg-white ">
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