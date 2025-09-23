<script setup>
const props = defineProps({
    cerrar: {
        type: Function,
        default: () => { }
    },
    Propiedades: {
        type: [Object]
    },
    SeccionActual: {
        default: 0
    }
});
const varView = useVarView()

function editar() {
    varView.soloVer = !varView.soloVer
}
</script>

<template>
    <div
        class="relative w-full flex md:flex-row justify-between items-center gap-2 py-4 px-8 bg-[var(--color-default)] rounded-t-lg">
        <h2 class="text-white font-bold text-2xl">{{ Propiedades.tituloFormulario }}</h2>
        <div class="flex items-center">
            <nuxtLink v-for="(seccion, index) in Propiedades.secciones" :key="index" class="flex items-center">
                <button class="md:w-[40px] md:h-[40px] w-[30px] h-[30px] rounded-full bg-gray-300 text-black"
                    :class="{ 'bg-blue-500': index === props.SeccionActual }">
                    {{ index + 1 }}
                </button>
                <div v-if="index + 1 !== props.Propiedades.secciones.length"
                    class="md:w-[30px] w-[8px] h-[5px] rounded-lg bg-gray-300"></div>
            </nuxtLink>
            <div class="flex items-center ml-5">
                <div v-if="props.Propiedades?.editarFormulario"
                    class="w-10 h-10 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)]">
                    <i class="fa-solid fa-trash text-gray-100 text-xl cursor-pointer"></i>
                </div>
                <div v-if="props.Propiedades?.editarFormulario" @click="editar"
                    class="w-10 h-10 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)]">

                    <i class="fa-solid fa-pencil text-gray-100 text-xl cursor-pointer"></i>
                </div>
                <div @click="props.cerrar"
                    class="w-10 h-10 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)]">

                    <i class="fa-solid fa-close text-gray-100 hover:text-white text-xl cursor-pointer"></i>
                </div>
            </div>
        </div>
    </div>
</template>