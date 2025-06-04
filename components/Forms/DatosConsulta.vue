<script setup>
import Input from './Input.vue';
import Wizard from './Wizard.vue';
import { ref } from 'vue';

const formData = ref({
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
    <Wizard :secciones="[
        { numPagina: 1, ruta: '/', color: 'bg-sky-700 text-white' },
        { numPagina: 2, ruta: '/forms/DatosCuidador', color: 'bg-sky-700 text-white' },
        { numPagina: 3, ruta: '/forms/DatosConsulta', color: 'bg-sky-700 text-white' }
    ]"/>

    <div class="lg:w-3/5 md:w-4/5 w-[90%] min-h-3/4 bg-white rounded-lg shadow-lg p-6 py-7 relative">
        <h1 class="text-3xl text-gray-800 font-bold mb-3 text-center">Examenes</h1>
        <!-- Formulario -->
        <form action=""
            class="w-full flex flex-col items-center py-3 gap-[15px] md:overflow-y-none max-h-[80%] overflow-y-auto">


            <div class="md:w-4/5 w-full">
                <label class="block text-sm font-medium text-gray-700">Signos vitales</label>
                <div class="flex items-center gap-3 md:flex-row flex-col">
                    <Input v-model="formData.ta" type="text" id="ta" name="ta" placeholder="TA" tamaño="md:w-1/5 w-full" />
                    <Input v-model="formData.fc" type="text" id="fc" name="fc" placeholder="FC" tamaño="md:w-1/5 w-full" />
                    <Input v-model="formData.fr" type="text" id="fr" name="fr" placeholder="FR" tamaño="md:w-1/5 w-full" />
                    <Input v-model="formData.t" type="text" id="t" name="t" placeholder="Tº" tamaño="md:w-1/5 w-full" />
                    <Input type="text" id="sat" name="sat" placeholder="Sat O2" tamaño="md:w-1/5 w-full" />
                </div>
            </div>

            <div class="md:w-4/5 w-full">
                <label class="block text-sm font-medium text-gray-700">Examen Fisico</label>
                <div class="flex items-center gap-3">
                    <Input v-model="formData.ta" type="text" id="ta" name="ta" placeholder="Peso/ Altura" tamaño="w-full" />
                </div>
            </div>

            <div class="md:w-4/5 w-full">
                <label class="block text-sm font-medium text-gray-700">Analisis/Tratamiento</label>
                <div class="flex items-center gap-3 md:flex-row flex-col">
                    <select v-model="formData.rehabilitacion" name="rehabilitacion" id="rehabilitacion"
                        class="mt-1 block md:w-3/5 w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option value="" selected>Condicion de Rehabilitacion</option>
                        <option value="1">Total o Parcial</option>
                        <option value="2">Sin potencial de rehabilitacion</option>
                        <option value="3">Cuidados paliativos o de mantenimiento</option>
                    </select>

                    <div class="md:w-2/5 w-full flex items-center gap-1">
                        <nuxt-link to="/forms/Datostratamiento" class="w-1/2">
                            <button type="button" @click="añadirAnalisis"
                            class="w-full h-[40px] flex justify-center items-center gap-2 bg-[var(--color-green)] text-white text-sm rounded hover:opacity-75">
                            <i class="fa-solid fa-plus"></i>Medicina
                            </button>
                        </nuxt-link>
                        <nuxt-link to="/forms/Datosservicios" class="w-1/2">
                        <button type="button" @click="añadirAnalisis"
                            class="w-full h-[40px] flex justify-center items-center gap-2 bg-blue-400 text-white text-sm rounded hover:opacity-75">
                            <i class="fa-solid fa-plus"></i>Servicios
                        </button>
                        </nuxt-link>
                    </div>
                </div>
            </div>

            <div class="md:w-4/5 w-full">
                <div class="flex items-center gap-3 md:flex-row flex-col">
                    <textarea v-model="formData.analisis" id="analisis" name="analisis" placeholder="Analisis"
                    class="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm w-full"></textarea>
                </div>
            </div>


            <!-- Botones Formulario -->
            <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[20px] left-auto right-auto">
                <nuxtLink to="/forms/DatosCuidador" class="md:w-2/4 w-full">
                    <button type="submit"
                        class="w-full bg-gray-500 text-white font-semibold py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Atras
                    </button>
                </nuxtLink>
                <nuxtLink class="md:w-2/4 w-full">
                    <button type="submit"
                        class=" w-full bg-[var(--color-primary)] text-white font-semibold py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Finalizar
                    </button>
                </nuxtLink>
            </div>


        </form>
    </div>
</template>