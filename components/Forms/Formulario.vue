<script setup>
import { ref, onMounted, defineProps } from 'vue';
import { useIndexedDBStore } from '../../stores/indexedDB.js'
const { $swal } = useNuxtApp();

// DEfinicion de variables
const props = defineProps({
    datos: {
        type: [Object, Array],
        required: true
    }
});

const formData = ref();

const enviarForm = async () => {
    traerDatos();
    console.log('Formulario enviado:', formData.value);

    const isOnline = navigator.onLine;

    // if(isOnline){
    //     console.log('Hay internet')
    // } else {
    //     console.log('no hay internet')
    // }

    if (isOnline) {
        try {
            // await enviarApi(formData.value); Función para api
            await guardarIndexedDB(formData.value);
            alert('Formulario enviado exitosamente a la API.');
        } catch (error) {
            console.error('Error enviando a la API. Guardando localmente:', error);
            await guardarIndexedDB(formData.value);
        }
    } else {
        $swal.fire({
            title: "No hay conexion hay internet",
            text: "El formulario se guardara localmente",
            icon: "warning"
        }).then(async () => {
            await guardarIndexedDB(JSON.parse(JSON.stringify(formData.value)));
            // localStorage.removeItem('formData');
            // window.location.href = '/'
        })
    }
};

const traerDatos = () => {
    const datosGuardados = localStorage.getItem('formData');
    if (datosGuardados) {
        formData.value = JSON.parse(datosGuardados);
    } else {
        console.log('No hay datos guardados en localStorage.');
    }
};

async function guardarIndexedDB(data) {

    const store = useIndexedDBStore();
    await store.initialize();

    // Paciente
    if (data.Paciente) {
        store.almacen = 'Paciente';
        await store.guardardatos({ ...data.Paciente, id: generarId() });
    }

    // Diagnosticos
    if (Array.isArray(data.Diagnosticos)) {
        store.almacen = 'Diagnosticos';
        for (const diag of data.Diagnosticos) {
            await store.guardardatos({ ...diag, id: diag.id || generarId() });
        }
    }

    // Antecedentes
    if (Array.isArray(data.Antecedentes)) {
        store.almacen = 'Antecedentes';
        for (const ant of data.Antecedentes) {
            await store.guardardatos({ ...ant, id: ant.id || generarId() });
        }
    }

    // Enfermedad
    if (Array.isArray(data.Enfermedad)) {
        store.almacen = 'Enfermedad';
        for (const enf of data.Enfermedad) {
            await store.guardardatos({ ...enf, id: generarId() });
        }
    }

    // HistoriaClinica
    if (data.HistoriaClinica) {
        console.log(data.HistoriaClinica)
        store.almacen = 'HistoriaClinica';
        await store.guardardatos({ ...data.HistoriaClinica, id: generarId() });
    }

    // Examen Fisico
    if (data.examenFisico) {
        store.almacen = 'ExamenFisico';
        await store.guardardatos({ ...data.examenFisico, id: generarId() });
    }

    // AnalisisTratamiento
    if (data.AnalisisTratamiento) {
        store.almacen = 'AnalisisTratamiento';
        await store.guardardatos({ ...data.AnalisisTratamiento, id: generarId() });
    }

    // Plan manejo medicamentos
    if (Array.isArray(data.Plan_manejo_medicamentos)) {
        store.almacen = 'Plan_manejo_medicamentos';
        for (const med of data.Plan_manejo_medicamentos) {
            await store.guardardatos({ ...med, id: generarId() });
        }
    }

    // Plan manejo procedimientos
    if (Array.isArray(data.Plan_manejo_procedimietos)) {
        store.almacen = 'Plan_manejo_procedimientos';
        for (const proc of data.Plan_manejo_procedimietos) {
            await store.guardardatos({ ...proc, id: generarId() });
        }
    }
}

// Generar ID único simple
function generarId() {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
};
</script>

<template>

    <div
        class="lg:w-3/5 md:w-4/5 w-[90%] min-h-3/4 max-h-3/4 bg-white rounded-lg shadow-lg p-6 py-7 relative flex flex-col items-center">
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
                <button :class="boton.color" @click="boton.submit ? enviarForm() : null"
                    class="w-full text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    {{ boton.texto }}
                </button>
            </nuxtLink>
        </div>
    </div>
</template>