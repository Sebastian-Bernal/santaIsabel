<script setup>
import Input from './Input.vue';
import { ref, watch } from 'vue';

const formData = ref({
    nombre: '',
    nacimiento: '',
    tipoDocumento: '',
    documento: '',
    sexo: '',
    direccion: '',
    municipio: '',
    zona: '',
    barrio: '',
    celular: '',
    telefono: ''
});

watch(formData, (newValue) => {
    console.log(newValue);
}, { deep: true });

</script>

<template>
    <!-- Indicador de seccion, form wizard -->
    <div class="w-[66%] flex justify-center items-center gap-2 py-5">
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-sky-700 ">
            1
        </button>
        <div class="md:w-[100px] h-[5px] bg-sky-700 rounded-lg"></div>
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-gray-300 ">
            <nuxtLink to="/login/DatosCuidador">2</nuxtLink>
        </button>
        <div class="md:w-[100px] h-[5px] bg-gray-300 rounded-lg"></div>
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-gray-300 ">3</button>
        <div class="md:w-[100px] h-[5px] bg-gray-300 rounded-lg"></div>
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-gray-300">4</button>
        <div class="md:w-[100px] h-[5px] bg-gray-300 rounded-lg"></div>
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-gray-300">5</button>
    </div>

    <div class="lg:min-w-3/5 md:min-w-4/5 min-w-[90%] min-h-3/4 max-h-3/4 bg-white rounded-lg shadow-lg p-6 py-7 relative">
        <h1 class="text-3xl text-gray-800 font-bold mb-3 text-center">Datos del paciente</h1>
        <!-- Formulario -->
        <form action="" class="w-full flex flex-col items-center py-3 gap-[15px] md:overflow-y-none max-h-[80%] overflow-y-auto">

            <div class="md:w-4/5 w-full">
                <label for="email" class="block text-sm font-medium text-gray-700">Paciente</label>
                <div class="grid grid-cols-1 md:flex items-center gap-3">
                    <Input v-model="formData.nombre" type="text" id="nombre" name="nombre" placeholder="Nombres y Apellidos" tamaño="md:w-4/5 w-full"/>
                    <Input v-model="formData.nacimiento" type="date" id="nacimiento" name="nacimiento" placeholder="Nacimiento" tamaño="md:w-1/5 w-full text-gray-500"/>             
                </div>
            </div>

            <div class="md:w-4/5 w-full flex items-center gap-3 flex-col md:flex-row">
                <select v-model="formData.tipoDocumento" name="tipoDocumento" id="tipoDocumento"
                    class="mt-1 text-gray-500 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option value="" selected>Tipo de documento</option>
                    <option value="cedula">Cedula de ciudadania</option>
                    <option value="extranjera">Cedula Extranjera</option>
                </select>
                <Input v-model="formData.documento" type="number" id="documento" name="documento" placeholder="Número de documento" tamaño="w-full"/>                
                <select name="sexo" id="sexo" v-model="formData.sexo"
                    class="mt-1 text-gray-500 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option value="" selected>Sexo</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Femenino</option>
                    <option value="otro">Otro</option>
                </select>
            </div>

            <div class="md:w-4/5 w-full">
                <label for="email" class="block text-sm font-medium text-gray-700">Direccion</label>
                <div class="items-center gap-3 md:flex grid grid-cols-2">
                    <Input v-model="formData.direccion" type="text" id="direccion" name="direccion" placeholder="Direccion" tamaño="md:w-1/4 w-full"/>
                    <Input v-model="formData.municipio" type="text" id="municipio" name="municipio" placeholder="Municipio" tamaño="md:w-1/4 w-full"/>
                    <Input v-model="formData.zona" type="text" id="zona" name="zona" placeholder="Zona" tamaño="md:w-1/4 w-full"/>
                    <Input v-model="formData.barrio" type="text" id="barrio" name="barrio" placeholder="Barrio" tamaño="md:w-1/4 w-full"/>
                </div>
            </div>

            <div class="md:w-4/5 w-full flex items-center gap-3">
                <Input v-model="formData.celular" type="number" id="celular" name="celular" placeholder="Celular" tamaño="w-1/2"/>
                <Input v-model="formData.telefono" type="number" id="telefono" name="telefono" placeholder="Telefono" tamaño="w-1/2"/>
            </div>

        </form>
        <!-- Botones Formulario -->
        <div class="w-full flex justify-center items-center gap-3 absolute bottom-[20px] left-0 right-0 ">
            <button type="submit"
                class="md:w-2/3 w-3/4 bg-[var(--color-primary)] text-white font-semibold mt-2 py-2 px-4 rounded hover:opacity-75">
                <nuxtLink to="/login/DatosCuidador">Siguiente</nuxtLink>
            </button>
        </div>
    </div>
</template>