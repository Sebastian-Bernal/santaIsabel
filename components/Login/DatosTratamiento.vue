<script setup>
import Input from './Input.vue';
import { ref } from 'vue';

const formData = ref({
    medicamentos: [
    {
        medicamento: '',
        presentacion: '',
        concentracion: '',
        cantidad: '',
        dosis: ''
    }
]});

const añadirMedicamento = () => {
    if (formData.medicamentos.value.length === 0 || formData.value[0].medicamentos.medicamento === '') {
        console.log('Por favor, complete el medicamento actual antes de añadir uno nuevo.');
        return;
    } else {
        formData.value.push({
            medicamento: formData.medicamentos.value[0].medicamento,
            presentacion: formData.medicamentos.value[0].presentacion,
            concentracion: formData.medicamentos.value[0].concentracion,
            cantidad: formData.medicamentos.value[0].cantidad,
            dosis: formData.medicamentos.value[0].dosis
        });
    }

    console.log(formData.value);
};

watch(formData, (newValue) => {
    console.log(newValue);
}, { deep: true });
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
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-gray-300">
            <nuxt-link to="/login/Datosservicios">5</nuxt-link>
        </button>
    </div>

    <div class="lg:min-w-3/5 md:min-w-4/5 min-w-[90%] min-h-3/4 bg-white rounded-lg shadow-lg p-6 py-7 relative">
        <h1 class="text-3xl text-gray-800 font-bold mb-3 text-center">Medicamentos</h1>
        <!-- Formulario -->
        <form action=""
            class="w-full flex flex-col items-center py-3 gap-[15px] md:overflow-y-none max-h-[80%] overflow-y-auto">

            <div class="md:w-4/5 w-full">
                <label class="block text-sm font-medium text-gray-700">Plan de manejo</label>
                <div class="flex items-center gap-3">
                    <Input v-model="formData.medicamentos.medicamento" type="text" id="medicamento" name="medicamento"
                        placeholder="Nombre del medicamento" tamaño="w-3/4" />
                    <Input v-model="formData.medicamentos.presentacion" type="text" id="presentacion" name="presentacion"
                        placeholder="Presentacion" tamaño="w-1/4" />
                </div>
            </div>

            <div class="md:w-4/5 w-full">
                <div class="flex items-center gap-3">
                    <Input v-model="formData.medicamentos.concentracion" type="text" id="concentracion" name="concentracion"
                        placeholder="Concentracion" tamaño="w-1/3" />

                    <Input v-model="formData.medicamentos.cantidad" type="text" id="cantidad" name="cantidad" placeholder="Cantidad"
                        tamaño="w-1/3" />

                    <Input v-model="formData.medicamentos.dosis" type="text" id="dosis" name="dosis" placeholder="Dosis"
                        tamaño="w-1/3" />
                </div>
            </div>

            <div class="md:w-4/5 w-full flex justify-end">
                <button type="button" @click="añadirMedicamento()"
                    class="bg-gray-500 text-white text-xs font-semibold mt-2 py-2 px-3 rounded cursor-pointer hover:opacity-75">
                    Añadir medicamento
                </button>
            </div>

            <div class="scrollMedicamentos md:w-4/5 w-full max-h-[100px] overflow-y-auto">
                <div class="grid grid-cols-5 text-center text-xs justify-between items-center gap-3">
                    <h4>Medicamento</h4>
                    <h4>Presentacion</h4>
                    <h4>Concentracion</h4>
                    <h4>Cantidad</h4>
                    <h4>Dosis</h4>
                </div>
                <div v-for="(medicamento, index) in formData.medicamentos" :key="index" class="grid grid-cols-5 text-center gap-3">
                    <p tamaño="text-xs">{{ medicamento.medicamento }}l</p>
                    <p tamaño="text-xs">{{ medicamento.presentacion }}l</p>
                    <p tamaño="text-xs">{{ medicamento.concentracion }}l</p>
                    <p tamaño="text-xs">{{ medicamento.cantidad }}l</p>
                    <p tamaño="text-xs">{{ medicamento.dosis }}l</p>
                </div>
            </div>

            <!-- Botones Formulario -->
            <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[20px] left-auto right-auto">
                <button type="submit"
                    class="md:w-2/3 w-full bg-gray-500 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200">
                    <nuxtLink to="/login/Datosconsulta">Atras</nuxtLink>
                </button>
                <button type="submit"
                    class="md:w-2/3 w-full bg-[var(--color-primary)] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200">
                    <nuxtLink to="/login/Datosservicios">Siguiente</nuxtLink>
                </button>
            </div>


        </form>
    </div>
</template>

<style scoped>
.scrollMedicamentos {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
}
</style>