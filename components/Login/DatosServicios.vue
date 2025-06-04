<script setup>
import Input from './Input.vue';
import { ref } from 'vue';

const formData = ref([
    {
        descripcion: 'e',
        cantidad: '',
        mes: ''
    }
]);

const añadirServicio = () => {
    formData.value.push({
        descripcion: 'e',
        cantidad: '',
        mes: ''
    });
};
</script>

<template>
    <!-- Indicador de seccion, form wizard -->
    <div class="w-[66%] flex justify-center items-center gap-2 py-5">
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-sky-700 ">
            <nuxtLink to="/">1</nuxtLink>
        </button>
        <div class="md:w-[100px] h-[5px] bg-sky-700 rounded-lg"></div>
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-sky-700 ">
            <nuxtLink to="/login/DatosCuidador">2</nuxtLink>
        </button>
        <div class="md:w-[100px] h-[5px] bg-sky-700 rounded-lg"></div>
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-sky-700">
            <nuxtLink to="">3</nuxtLink>
        </button>
        <div class="md:w-[100px] h-[5px] bg-sky-700 rounded-lg"></div>
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-sky-700">
            <nuxt-link to="/login/Datostratamiento">4</nuxt-link>    
        </button>
        <div class="md:w-[100px] h-[5px] bg-sky-700 rounded-lg"></div>
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-sky-700">
            <nuxt-link to="/login/Datosservicios">5</nuxt-link>
        </button>
    </div>
    <!-- Formulario -->
    <div class="lg:min-w-3/5 md:min-w-4/5 min-w-[90%] min-h-3/4 bg-white rounded-lg shadow-lg p-6 py-7 relative">
        <h1 class="text-3xl text-gray-800 font-bold mb-3 text-center">Servicios Medicos</h1>

        <form action="" class="w-full flex flex-col items-center py-3 gap-[15px] md:overflow-y-none max-h-[80%] overflow-y-auto">

            <div class="md:w-4/5 w-full">
                <label class="block text-sm font-medium text-gray-700">Plan de manejo</label>
                <div class="flex items-center gap-3">
                    <Input v-model="formData.descripcion" type="text" id="descripcion" name="descripcion" placeholder="Descripcion" tamaño="w-full" />
                </div>
            </div>

            <div class="md:w-4/5 w-full">
                <div class="flex items-center gap-3">
    
                    <Input type="text" id="cantidad" name="cantidad" placeholder="Cantidad"
                        tamaño="w-1/2" />
                    <Input type="text" id="mes" name="mes" placeholder="Mes"
                        tamaño="w-1/2" />
                </div>
            </div>

            <div class="md:w-4/5 w-full flex justify-end">
                <button type="button" @click="añadirServicio"
                    class="bg-gray-500 text-white text-xs font-semibold mt-2 py-2 px-3 rounded cursor-pointer hover:opacity-75">
                    Añadir servicio
                </button>
            </div>

            <div class="md:w-4/5 w-full max-h-[300px] overflow-y-auto">
                <div class="grid grid-cols-3 text-center text-xs justify-between items-center gap-3">
                    <h4>Descripcion</h4>
                    <h4>Cantidad</h4>
                    <h4>Mes</h4>
                </div>
                <div class="grid grid-cols-3 text-center justify-between items-center gap-3">
                    <div v-for="(medicamento, index) in formData" :key="index" class="flex items-center gap-3">
                        <p tamaño="text-xs">{{ medicamento.medicamento }}</p>
                        <p tamaño="text-xs">{{ medicamento.presentacion }}</p>
                        <p tamaño="text-xs">{{ medicamento.concentracion }}</p>
                    </div>
                </div>
            </div>

            <!-- Botones Formulario -->
            <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[20px] left-auto right-auto">
                <button type="submit"
                    class="md:w-2/3 w-full bg-gray-500 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200">
                    <nuxtLink to="/login/Datostratamiento">Atras</nuxtLink>
                </button>
                <button type="submit"
                    class="md:w-2/3 w-full bg-[var(--color-primary)] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200">
                    <nuxtLink>Finalizar</nuxtLink>
                </button>
            </div>


        </form>
    </div>
</template>