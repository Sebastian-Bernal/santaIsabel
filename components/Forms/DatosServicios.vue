<script setup>
import Input from './Input.vue';
import Wizard from './Wizard.vue';
import { ref } from 'vue';

const formData = ref({
    servicios: [],
});

const nuevoServicio = ref({
    descripcion: '',
    cantidad: '',
    mes: ''
});

const añadirServicio = () => {
    const servicio = nuevoServicio.value;
    if (!servicio.descripcion || !servicio.cantidad || !servicio.mes) {
        console.log('Por favor, complete el servicio actual antes de añadir uno nuevo.');
        return;
    }

    formData.value.servicios.push({ ...servicio });

    // Reiniciar el objeto nuevoServicio
    nuevoServicio.value = {
        descripcion: '',
        cantidad: '',
        mes: ''
    };
};

</script>

<template>
    <!-- Formulario -->
    <div class="lg:min-w-3/5 md:min-w-4/5 min-w-[90%] min-h-3/4 bg-white rounded-lg shadow-lg p-6 py-7 relative">
        <h1 class="text-3xl text-gray-800 font-bold mb-3 text-center">Servicios Medicos</h1>

        <form action=""
            class="w-full flex flex-col items-center py-3 gap-[15px] md:overflow-y-none max-h-[80%] overflow-y-auto">

            <div class="md:w-4/5 w-full">
                <label class="block text-sm font-medium text-gray-700">Plan de manejo</label>
                <div class="flex items-center gap-3">
                    <Input v-model="nuevoServicio.descripcion" type="text" id="descripcion" name="descripcion"
                        placeholder="Descripcion" tamaño="w-full" />
                </div>
            </div>

            <div class="md:w-4/5 w-full">
                <div class="flex items-center gap-3">

                    <Input v-model="nuevoServicio.cantidad" type="text" id="cantidad" name="cantidad"
                        placeholder="Cantidad" tamaño="w-1/2" />
                    <Input v-model="nuevoServicio.mes" type="text" id="mes" name="mes" placeholder="Mes"
                        tamaño="w-1/2" />
                </div>
            </div>

            <div class="md:w-4/5 w-full flex justify-end">
                <button type="button" @click="añadirServicio"
                    class="bg-gray-500 text-white text-xs font-semibold mt-2 py-2 px-3 rounded cursor-pointer hover:opacity-75">
                    Añadir servicio
                </button>
            </div>

            <div v-if="formData.servicios.length > 0" class="md:w-4/5 w-full max-h-[300px] overflow-y-auto border border-gray-300 rounded-md p-2">
                <div class="grid grid-cols-3 text-center text-xs justify-between items-center gap-3">
                    <h4>Descripcion</h4>
                    <h4>Cantidad</h4>
                    <h4>Mes</h4>
                </div>
                <div v-for="(servicio, index) in formData.servicios" :key="index"
                    class="grid grid-cols-3 text-center justify-between items-center gap-3 mt-3">
                    <p tamaño="text-xs">{{ servicio.descripcion }}</p>
                    <p tamaño="text-xs">{{ servicio.cantidad }}</p>
                    <p tamaño="text-xs">{{ servicio.mes }}</p>
                </div>
            </div>

            <!-- Botones Formulario -->
            <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[20px] left-auto right-auto">
                <nuxtLink to="/forms/Datosconsulta" class="md:w-2/4 w-full">
                    <button type="submit"
                        class="w-full bg-gray-500 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Atras
                    </button>
                </nuxtLink>
                <nuxtLink to="/forms/Datosconsulta" class="md:w-2/4 w-full">
                    <button type="submit"
                        class="w-full bg-[var(--color-primary)] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Registrar
                    </button>
                </nuxtLink>
            </div>


        </form>
    </div>
</template>