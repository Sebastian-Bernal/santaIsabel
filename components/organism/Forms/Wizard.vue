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
});console.log(props.SeccionActual)
const varView = useVarView()

function editar() {
    varView.soloVer = !varView.soloVer
}
</script>

<template>
    <div
        class="relative w-full flex md:flex-row justify-between items-center gap-2 py-4 px-8 bg-[var(--color-default)] rounded-t-lg">
        <div class="flex flex-col">
            <h2 class="text-white font-bold text-2xl">{{ Propiedades.tituloFormulario }}</h2>
            <div class="flex gap-3 pt-1">
                <p class="flex items-center text-gray-200 text-sm gap-1" v-for="(seccion, index) in Propiedades.secciones"
                :class="{ 'text-white font-medium': index === props.SeccionActual }">
                    {{ seccion.nombre }}
                    <i class="fa-solid fa-angle-right text-gray-300" v-if="index + 1 !== props.Propiedades.secciones.length"></i>
                </p>
            </div>
        </div>
        <div class="flex items-center">
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