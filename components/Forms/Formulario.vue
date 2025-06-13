<script setup>
import { onMounted, defineProps } from 'vue';
import { useIndexedDBStore } from '../../stores/indexedDB.js'
import { useFormPendiente } from '../../stores/formularioPendiente.js'
import { useFormulario } from '~/composables/Formulario/useFormulario.js';
const { $swal } = useNuxtApp();

// DEfinicion de variables
const props = defineProps({
    datos: {
        type: [Object, Array],
        required: true
    }
});

const { formData, validarYEnviar } = useFormulario();
const form = useFormPendiente();


const alertValidacion = (ruta) => {
    if (ruta === '') {
        $swal.fire({
            position: "top-end",
            text: "Falta campos por llenar, por favor ingrese valores",
            showConfirmButton: false,
            timer: 1500,
            background: '#d33',
            color: '#fff'
        });
    }
};


// Funcion para formulario pendiente 
onMounted(() => {
    const isOnline = navigator.onLine
    if (isOnline) {
        formPendiente();
    }
});

const formPendiente = async () => {
    const store = useIndexedDBStore();

    store.almacen = 'HistoriaClinica'
    const result = await store.buscar_no_enviados();

    if (result[0] && !form.subirDespues) {
        enviarFormularioPendiente()
    }
};

const enviarFormularioPendiente = () => {
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
            console.log('subir despues');
            form.subirDespues = true
        }
    });
};

</script>

<template>
    <div
        class="lg:w-3/5 md:w-4/5 w-[90%] h-3/4 bg-white rounded-lg shadow-lg p-6 py-7 relative flex flex-col items-center">
        <h1 class="text-3xl text-gray-800 font-bold mb-3 text-center">{{ datos.titulo }}</h1>
        <!-- Formulario -->
        <form action="" class="w-full h-full flex justify-center">
            <div class="w-full flex flex-col items-center py-3 gap-[15px] max-h-[80%] md:overflow-y-none overflow-y-auto">
                <!-- Contenido del formulario -->
                <slot></slot>
            </div>
        </form>
        <!-- Botones Formulario -->
        <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[20px] left-auto right-auto">
            <nuxtLink v-for="boton in datos.botones" :to="boton.ruta" class="md:w-2/4 w-full">
                <button :class="boton.color" @click="boton.submit ? validarYEnviar() : alertValidacion(boton.ruta)"
                    class="w-full text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    {{ boton.texto }}
                </button>
            </nuxtLink>
        </div>
    </div>
</template>