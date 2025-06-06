<script setup>
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Forms/Input.vue';
import { ref, onMounted } from "vue";
import Wizard from '../components/Forms/Wizard.vue';
import { pacientes } from '../data/pacientes.js';
import { useIndexedDBStore } from '../stores/indexedDB.js';

// Delcaracionde variables y funciones
const { $swal } = useNuxtApp();

const indexedDBStore = useIndexedDBStore();

const formData = ref({
    nombre: '',
    tipoDocumento: '',
    documento: '',
    diagnosticos: [{ tipo: '', cie10: '' }]
});

const fechaModificacion = ref('');

definePageMeta({
    layout: 'authentication'
});


// Gueardar los datos en localStorage
watch(formData, (newValue) => {
    localStorage.setItem('formData', JSON.stringify(newValue));
}, { deep: true });

onMounted(() => {
    traerDatos();
});

const traerDatos = () => {
    const datosGuardados = localStorage.getItem('formData');
    if (datosGuardados) {
        formData.value = JSON.parse(datosGuardados);
    } else {
        console.log('No hay datos guardados en localStorage.');
    }
};



// Funciones para manejar los diagnosticos
const añadirDiagnostico = () => {
    const ultimoDiagnostico = formData.value.diagnosticos[formData.value.diagnosticos.length - 1];
    if (ultimoDiagnostico.tipo === '' || ultimoDiagnostico.cie10 === '') {
        console.log('Por favor, complete el diagnóstico actual antes de añadir uno nuevo.');
        return;
    } else {
        formData.value.diagnosticos.push({ tipo: '', cie10: '' });
    }
};

const eliminarDiagnostico = (index) => {
    if (formData.value.diagnosticos.length > 1) {
        formData.value.diagnosticos.splice(index, 1);
    } else {
        console.log('Debe haber al menos un diagnóstico.');
    }
};



// Funcion para autocompletar el paciente
const pacienteExistente = () => {
    const paciente = pacientes.value.find(
        p => p.nombre.toLowerCase() === formData.value.nombre.toLowerCase()
    )

    if (paciente) {
        formData.value.tipoDocumento = paciente.tipoDocumento
        formData.value.documento = paciente.documento
        fechaModificacion.value = paciente.fechaModificacion

        onSubmit();
    } else {
        $swal.fire({
            icon: 'warning',
            title: 'Paciente no encontrado',
            text: 'El paciente ingresado no está registrado.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: '<a href="/forms/DatosPacienteNuevo">Registrar</a>',
            cancelButton: 'Cancelar',
            cancelButtonColor: '#d33',
            showCancelButton: true
        })
    }
};

const onSubmit = async() => {
    await indexedDBStore.initialize();

    indexedDBStore.almacen = 'Paciente';
    indexedDBStore.guardardatos({
        id: 2,
        nombre: formData.value.nombre,
        tipoDocumento: formData.value.tipoDocumento,
        documento: formData.value.documento,
        diagnosticos: formData.value.diagnosticos,
        fechaModificacion: new Date().toLocaleDateString()
    });
};

</script>

<template>
    <Wizard :secciones="[
        { numPagina: 1, ruta: '/', color: 'bg-sky-700 text-white' },
        { numPagina: 2, ruta: '/forms/DatosCuidador', color: 'bg-gray-300' },
        { numPagina: 3, ruta: '/forms/DatosConsulta', color: 'bg-gray-300' }
    ]"></Wizard>
    <Formulario :datos="{
        titulo: 'Datos del paciente',
        botones: [
            { texto: 'Salir', ruta: '/', color: 'bg-gray-500' },
            { texto: 'Siguiente', ruta: '/forms/DatosCuidador', color: 'bg-[var(--color-primary)]' }
        ]
    }">
        <div class="md:w-4/5 w-full">
            <div class="flex justify-between items-center mb-2">
                <label for="email" class="block text-sm font-medium text-gray-700">Paciente</label>
                <div class="flex gap-2 items-center">
                    <p class="text-xs">{{ fechaModificacion }}</p>
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
                <Input v-model="formData.nombre" type="text" id="nombre" name="nombre" list="nombreList" @blur="pacienteExistente"
                    placeholder="Nombre del paciente" tamaño="w-full" autocomplete="none"/>
                <datalist id="nombreList">
                    <option v-for="(paciente, id) in pacientes" :key="id" :value="paciente.nombre">
                    </option>
                </datalist>
            </div>
        </div>

        <div class="md:w-4/5 w-full flex items-center gap-3 flex-col md:flex-row">
            <select v-model="formData.tipoDocumento" name="tipoDocumento" id="tipoDocumento"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="" selected>Tipo de documento</option>
                <option value="cedula">Cedula de ciudadania</option>
                <option value="extranjera">Cedula Extranjera</option>
            </select>
            <Input v-model="formData.documento" type="number" id="documentoList" name="documento"
                placeholder="Número de documento" tamaño="w-full" />
            <datalist id="documentoList">
                <option v-for="(paciente, id) in pacientes" :key="id" :value="paciente.documento"></option>
            </datalist>
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
                <div class="w-full flex gap-3 items-center" v-for="(diagnostico, i) in formData.diagnosticos" :key="id">
                    <Input v-model="diagnostico.tipo" type="text" id="tipo"
                        name="tipo" placeholder="Tipo" tamaño="w-4/5" />
                    <Input v-model="diagnostico.cie10" type="text"
                        id="cie10" name="cie10" placeholder="CIE-10" tamaño="w-1/5" />
                    <i v-if="i > 0" class="fa-solid fa-close text-gray-500" @click="eliminarDiagnostico(i)"></i>
                </div>
            </div>
        </div>
    </Formulario>
</template>