<script setup>
import Input from './Input.vue';
import { ref } from 'vue';

const formData = ref({
    motivo: '',
    enfermedad: '',
    antecedentes: '',
    ta: '',
    fc: '',
    fr: '',
    t: '',
    rehabilitacion: '',
    analisis: ''
});

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
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-gray-300">
            <nuxt-link to="/login/Datostratamiento">4</nuxt-link>    
        </button>
        <div class="md:w-[100px] h-[5px] bg-gray-300 rounded-lg"></div>
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-gray-300">5</button>
    </div>

    <div class="lg:min-w-3/5 md:min-w-4/5 min-w-[90%] min-h-3/4 bg-white rounded-lg shadow-lg p-6 py-7 relative">
        <h1 class="text-3xl text-gray-800 font-bold mb-3 text-center">Examenes</h1>
        <!-- Formulario -->
        <form action="" class="w-full flex flex-col items-center py-3 gap-[15px] md:overflow-y-none max-h-[80%] overflow-y-auto">

            <div class="md:w-4/5 w-full">
                <label class="block text-sm font-medium text-gray-700">Consulta</label>
                <div class="flex items-center gap-3">
                    <Input v-model="formData.motivo" type="text" id="motivo" name="motivo" placeholder="Motivo de consulta" tamaño="w-full" />
                </div>
            </div>

            <div class="md:w-4/5 w-full">
                <div class="flex items-center gap-3">
                    <Input v-model="formData.enfermedad" type="text" id="enfermedad" name="enfermedad" placeholder="Enfermedad actual"
                        tamaño="w-2/4" />
                    <Input v-model="formData.antecedentes" type="text" id="antecedentes" name="antecedentes" placeholder="Antecedentes"
                        tamaño="w-2/4" />
                </div>
            </div>

            <div class="md:w-4/5 w-full">
                <label class="block text-sm font-medium text-gray-700">Signos vitales</label>
                <div class="flex items-center gap-3">
                    <Input v-model="formData.ta" type="text" id="ta" name="ta" placeholder="TA" tamaño="w-1/5" />
                    <Input v-model="formData.fc" type="text" id="fc" name="fc" placeholder="FC" tamaño="w-1/5" />
                    <Input v-model="formData.fr" type="text" id="fr" name="fr" placeholder="FR" tamaño="w-1/5" />
                    <Input v-model="formData.t" type="text" id="t" name="t" placeholder="Tº" tamaño="w-1/5" />
                    <!-- <Input type="text" id="sat" name="sat" placeholder="Sat o2" tamaño="w-1/5" /> -->
                </div>
            </div>

            <div class="md:w-4/5 w-full">
                <label class="block text-sm font-medium text-gray-700">Analisis/Tratamiento</label>
                <div class="flex items-center gap-3">
                    <select v-model="formData.rehabilitacion" name="rehabilitacion" id="rehabilitacion"
                        class="mt-1 block w-2/4 px-3 py-2 border text-gray-500 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option value="" selected>Condicion de Rehabilitacion</option>
                        <option value="1">Total o Parcial</option>
                        <option value="2">Sin potencial de rehabilitacion</option>
                        <option value="3">Cuidados paliativos o de mantenimiento</option>
                    </select>
                    <Input v-model="formData.analisis" type="text" id="analisis" name="analisis" placeholder="Analisis" tamaño="w-2/4" />
                </div>
            </div>


            <!-- Botones Formulario -->
            <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[20px] left-auto right-auto">
                <button type="submit"
                    class="md:w-2/3 w-full bg-gray-500 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200">
                    <nuxtLink to="/login/DatosCuidador">Atras</nuxtLink>
                </button>
                <button type="submit"
                    class="md:w-2/3 w-full bg-[var(--color-primary)] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200">
                    <nuxtLink to="/login/Datostratamiento">Siguiente</nuxtLink>
                </button>
            </div>


        </form>
    </div>
</template>