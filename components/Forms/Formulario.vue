<script setup>
import { ref, onMounted, onUnmounted, defineProps } from 'vue';
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

// Funcion para enviar formulario
const enviarForm = async () => {
    const isOnline = navigator.onLine;

    if (isOnline) {
        try {
            // await enviarApi(formData.value); Función para enviar a la API
            await guardarIndexedDB(JSON.parse(JSON.stringify(formData.value)));
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
            localStorage.removeItem('formData');
            window.location.href = '/'
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


// Validar datos
const validarForm = async () => {
    traerDatos();

    if (formData.value.Plan_manejo_medicamentos < 1) {
        const result = await $swal.fire({
            icon: 'warning',
            title: 'Historia sin plan de manejo de Medicamentos',
            html: `Deseas registrar plan de manejo de <strong><a href="/forms/Datostratamiento">Medicamentos</a></strong>?`,
            confirmButtonColor: '#3085d6',
            confirmButtonText: '<a href="/forms/Datostratamiento">Medicamentos</a>',
            cancelButtonText: 'No, continuar',
            cancelButtonColor: '#d33',
            showCancelButton: true,
        })
        if (result.isConfirmed) {
            return
        }
    }

    if (formData.value.Plan_manejo_procedimientos < 1) {
        const result = await $swal.fire({
            icon: 'warning',
            title: 'Historia sin plan de manejo de Procedimientos',
            html: `Deseas registrar plan de manejo de <strong><a href="/forms/Datosservicios">Procedimientos</a></strong>?`,
            confirmButtonColor: '#3085d6',
            confirmButtonText: '<a href="/forms/Datosservicios">Procedimientos</a>',
            cancelButtonText: 'No, continuar',
            cancelButtonColor: '#d33',
            showCancelButton: true,
        })
        if (result.isConfirmed) {
            return
        }
    }

    await enviarForm();
};

// Funcion para guardar en indexedDB
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
            await store.guardardatos({ ...diag });
        }
    }

    // Antecedentes
    if (Array.isArray(data.Antecedentes)) {
        store.almacen = 'Antecedentes';
        for (const ant of data.Antecedentes) {
            await store.guardardatos({ ...ant });
        }
    }

    // Enfermedad
    if (Array.isArray(data.Enfermedad)) {
        store.almacen = 'Enfermedad';
        for (const enf of data.Enfermedad) {
            await store.guardardatos({ ...enf });
        }
    }

    // HistoriaClinica
    if (data.HistoriaClinica) {
        store.almacen = 'HistoriaClinica';
        await store.guardardatos({ ...data.HistoriaClinica });
    }

    // Examen Fisico
    if (data.examenFisico) {
        store.almacen = 'ExamenFisico';
        await store.guardardatos({ ...data.examenFisico });
    }

    // AnalisisTratamiento
    if (data.AnalisisTratamiento) {
        store.almacen = 'AnalisisTratamiento';
        await store.guardardatos({ ...data.AnalisisTratamiento });
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
};

// Generar ID único simple
function generarId() {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
};



// Funcion para formulario pendiente 

const formularioPendiente = false;

const enviarFormulario = () => {
    if (formularioPendiente) {

        $swal.fire({
            title: "Ha vuelto la conexion!",
            html: "Hay un formulario pendiente por enviar, deseas enviarlo?",
            timer: 5000,
            timerProgressBar: true,
            showCancelButton: true,
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: "Si, Registrar",
            confirmButtonColor: '#3085d6',
        }).then((result) => {
            if (result.isConfirmed) {
                console.log("registrando..");
                // enviarApi()
            } else {
                console.log('subir despues')
            }
        });
    }
};

onMounted(() => {
    const isOnline = navigator.onLine
    if (isOnline) {
        enviarFormulario()
    }
});
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
                <button :class="boton.color" @click="boton.submit ? validarForm() : null"
                    class="w-full text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    {{ boton.texto }}
                </button>
            </nuxtLink>
        </div>
    </div>
</template>