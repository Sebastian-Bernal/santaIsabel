<script setup>
import Input from './Input.vue';
import Wizard from './Wizard.vue';
import { ref, watch } from 'vue';

const formData = ref({
    nombre: '',
    tipoDocumento: '',
    documento: '',
    diagnosticos: [{ tipo: '', cie10: '' }]
});

const añadirDiagnostico = () => {
    const ultimoDiagnostico = formData.value.diagnosticos[formData.value.diagnosticos.length - 1];
    if (ultimoDiagnostico.tipo === '' || ultimoDiagnostico.cie10 === '') {
        console.log('Por favor, complete el diagnóstico actual antes de añadir uno nuevo.');
        return;
    } else {
        formData.value.diagnosticos.push({ tipo: '', cie10: '' });
    }

};

watch(formData, (newValue) => {
    console.log(newValue);
}, { deep: true });

</script>

<template>
    <!-- Indicador de seccion, form wizard -->
    <Wizard :secciones="[
        { numPagina: 1, ruta: '/', color: 'bg-sky-700 text-white' },
        { numPagina: 2, ruta: '/forms/DatosCuidador', color: 'bg-gray-300' },
        { numPagina: 3, ruta: '/forms/DatosConsulta', color: 'bg-gray-300' }
    ]"/>

    <div
        class="lg:min-w-3/5 md:min-w-4/5 min-w-[90%] min-h-3/4 max-h-3/4 bg-white rounded-lg shadow-lg p-6 py-7 relative">
        <h1 class="text-3xl text-gray-800 font-bold mb-3 text-center">Datos del paciente</h1>
        <!-- Formulario -->
        <form action=""
            class="w-full flex flex-col items-center py-3 gap-[15px] md:overflow-y-none max-h-[80%] overflow-y-auto">

            <div class="md:w-4/5 w-full">
                <div class="flex justify-between items-center mb-2">
                    <label for="email" class="block text-sm font-medium text-gray-700">Paciente</label>
                    <div class="flex gap-2">
                    <nuxt-link to="/forms/DatosPacienteNuevo">
                        <button type="button"
                            class="w-[25px] h-[25px] flex justify-center items-center bg-[var(--color-green)] text-white rounded-full hover:opacity-75">
                            <i class="fa-solid fa-pencil text-xs"></i>
                        </button>
                    </nuxt-link>
                    <nuxt-link to="/forms/DatosPacienteNuevo">
                        <button type="button"
                            class="w-[25px] h-[25px] flex justify-center items-center bg-blue-500 text-white rounded-full hover:bg-blue-600">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </nuxt-link>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:flex items-center gap-3">
                    <Input v-model="formData.nombre" type="text" id="nombre" name="nombre"
                        placeholder="Nombres y Apellidos" tamaño="w-full" />
                </div>
            </div>

            <div class="md:w-4/5 w-full flex items-center gap-3 flex-col md:flex-row">
                <select v-model="formData.tipoDocumento" name="tipoDocumento" id="tipoDocumento"
                    class="mt-1 text-gray-500 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option value="" selected>Tipo de documento</option>
                    <option value="cedula">Cedula de ciudadania</option>
                    <option value="extranjera">Cedula Extranjera</option>
                </select>
                <Input v-model="formData.documento" type="number" id="documento" name="documento"
                    placeholder="Número de documento" tamaño="w-full" />
            </div>

            <div class="md:w-4/5 w-full">
                <div class="flex justify-between items-center mb-2">
                    <label class="block text-sm font-medium text-gray-700">Diagnosticos</label>
                    <button type="button" @click="añadirDiagnostico"
                        class="w-[25px] h-[25px] flex justify-center items-center bg-blue-500 text-white rounded-full hover:bg-blue-600">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>

                <div class="scrollDiagnosticos flex flex-col items-center gap-3 max-h-[100px] overflow-y-auto">
                    <div class="w-full flex gap-3" v-for="diagnostico in formData.diagnosticos" :key="diagnostico.id">
                        <Input v-model="formData.diagnosticos[formData.diagnosticos.length - 1].tipo" type="text"
                            id="tipo" name="tipo" placeholder="Tipo" tamaño="w-4/5" />
                        <Input v-model="formData.diagnosticos[formData.diagnosticos.length - 1].cie10" type="text"
                            id="cie10" name="cie10" placeholder="CIE-10" tamaño="w-1/5" />
                    </div>
                </div>
            </div>

        </form>
        <!-- Botones Formulario -->
        <div class="w-full flex justify-center items-center gap-3 absolute bottom-[20px] left-0 right-0 ">
            <nuxtLink to="/forms/DatosCuidador" class="md:w-2/3 w-3/4">
                <button type="submit"
                    class=" w-full bg-[var(--color-primary)] text-white font-semibold mt-2 py-2 px-4 rounded hover:opacity-75 cursor-pointer">
                    Siguiente
                </button>
            </nuxtLink>
        </div>
    </div>
</template>