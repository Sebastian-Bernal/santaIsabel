<script setup>
import Input from './Input.vue';
import {ref} from 'vue';

const formData = ref({
    eps: '',
    regimen: '',
    poblacion: '',
    tipo: '',
    cuidador: '',
    parentesco: '',
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
    <div class="w-[66%] flex justify-center items-center gap-2 py-5">
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-sky-700 ">
            <nuxtLink to="/">1</nuxtLink>
        </button>
        <div class="md:w-[100px] h-[5px] bg-sky-700 rounded-lg"></div>
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-sky-700 ">
            <nuxtLink to="/login/DatosCuidador">2</nuxtLink>
        </button>
        <div class="md:w-[100px] h-[5px] bg-sky-700 rounded-lg"></div>
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-gray-300 ">
            <nuxtLink to="/login/Datosconsulta">3</nuxtLink>
        </button>
        <div class="md:w-[100px] h-[5px] bg-gray-300 rounded-lg"></div>
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-gray-300">
            4
        </button>
        <div class="md:w-[100px] h-[5px] bg-gray-300 rounded-lg"></div>
        <button class="md:w-[50px] md:h-[50px] w-[30px] h-[30px] rounded-full bg-gray-300">5</button>
    </div>

    <div class="lg:min-w-3/5 md:min-w-4/5 min-w-[90%] min-h-3/4 bg-white rounded-lg shadow-lg p-6 py-7 relative">
        <h1 class="text-3xl text-gray-800 font-bold mb-3 text-center">Consulta</h1>
        <!-- Formulario -->
        <form action="" class="w-full flex flex-col items-center py-3 gap-[15px] md:overflow-y-none max-h-[80%] overflow-y-auto">

            <div class="md:w-4/5 w-full">
                <label class="block text-sm font-medium text-gray-700">Paciente</label>
                <div class="md:flex items-center gap-3 grid grid-cols-2">
                    <Input v-model="formData.eps" type="text" id="eps" name="eps" placeholder="Eps" tamaño="md:w-1/4 w-full"/>
                    <Input v-model="formData.regimen" type="text" id="regimen" name="regimen" placeholder="Regimen" tamaño="md:w-1/4 w-full"/>
                    <Input v-model="formData.poblacion" type="text" id="poblacion" name="poblacion" placeholder="Poblacion vulnerable" tamaño="md:w-1/4 w-full"/>
                    <Input v-model="formData.tipo" type="text" id="tipo" name="tipo" placeholder="Tipo" tamaño="md:w-1/4 w-full"/>
                </div>
            </div>

            <div class="md:w-4/5 w-full">
                <label class="block text-sm font-medium text-gray-700">Cuidador</label>
                <div class="md:flex items-center gap-3 grid grid-cols-1">
                    <Input v-model="formData.ciudador" type="text" id="cuidador" name="cuidador" placeholder="Nombres y Apellidos" tamaño="md:w-3/5" />
                    <Input v-model="formData.parentesco" type="text" id="parentesco" name="parentesco" placeholder="Parentesco" tamaño="md:w-2/5" />
                </div>
            </div>

            <div class="md:w-4/5 w-full">
                <div class="flex justify-between">
                    <label class="block text-sm font-medium text-gray-700">Diagnosticos</label>
                    <button type="button" @click="añadirDiagnostico"
                        class="w-[25px] h-[25px] flex justify-center items-center bg-blue-500 text-white rounded-full hover:bg-blue-600">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>

                <div class="scrollDiagnosticos flex flex-col items-center gap-3 max-h-[100px] overflow-y-auto">
                    <div class="w-full flex gap-3" v-for="diagnostico in formData.diagnosticos" :key="diagnostico.id">
                        <Input v-model="formData.diagnosticos[formData.diagnosticos.length - 1].tipo" type="text" id="tipo" name="tipo" placeholder="Tipo" tamaño="w-4/5" />
                        <Input v-model="formData.diagnosticos[formData.diagnosticos.length - 1].cie10" type="text" id="cie10" name="cie10" placeholder="CIE-10" tamaño="w-1/5" />
                    </div>
                </div>
            </div>
            <!-- Botones Formulario -->
            <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[20px] left-auto right-auto">
                <button type="submit"
                    class="md:w-2/4 w-full bg-gray-500 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200">
                    <nuxtLink to="/">Atras</nuxtLink>
                </button>
                <button type="submit"
                    class="md:w-2/4 w-full bg-[var(--color-primary)] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200">
                    <nuxtLink to="/login/Datosconsulta">Siguiente</nuxtLink>
                </button>
            </div>


        </form>
    </div>
</template>

<style scoped>
.scrollDiagnosticos {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
}
</style>