<script setup>
const props = defineProps({
    formData: {
        type: Object,
        required: true
    },
    datos: {
        type: [Object, Array],
        required: true
    }
});
</script>

<template>

    <div class="lg:w-3/5 md:w-4/5 w-[90%] min-h-3/4 max-h-3/4 bg-white rounded-lg shadow-lg p-6 py-7 relative flex flex-col items-center">
        <h1 class="text-3xl text-gray-800 font-bold mb-3 text-center">{{ datos.titulo }}</h1>
        <!-- Formulario -->
        <form action=""
            class="w-full flex flex-col items-center py-3 gap-[15px] md:overflow-y-none max-h-[80%] overflow-y-auto">
            
            <!-- Contenido del formulario -->
            <slot></slot>

        </form>
        <!-- Botones Formulario -->
        <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[20px] left-auto right-auto">
            <nuxtLink v-for="boton in datos.botones" :to="boton.ruta" class="md:w-2/4 w-full">
                <button type="submit" :class="boton.color"
                    class="w-full text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    {{ boton.texto }}
                </button>
            </nuxtLink>
        </div>
    </div>
</template>