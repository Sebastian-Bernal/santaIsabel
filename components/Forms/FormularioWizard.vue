<script setup>
import Wizard from './Wizard.vue';
import { onMounted, defineProps } from 'vue';
import { useIndexedDBStore } from '../../stores/indexedDB.js'
import { useFormPendiente } from '../../stores/formularioPendiente.js'
const { $swal } = useNuxtApp();

// DEfinicion de variables
const props = defineProps({
    datos: {
        type: [Object, Array],
        required: true
    },
    tamaño: {
        type: String,
        default: "lg:w-3/5 md:w-4/5 w-[90%] h-3/4"
    },
    cerrar: {
        type: Function,
        default: () => {}
    }
});

const form = useFormPendiente();

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
        class="pb-5 z-1 flex flex-col items-center h-[90%] bg-gray-50 rounded-2xl">
            <Wizard :secciones="datos.secciones" :titulo="datos.tituloFormulario" :cerrar="props.cerrar"/>
        <h1 class="text-3xl text-[var(--color-default)] font-bold mb-3 text-center pt-5">{{ datos.titulo }}</h1>
        <!-- Formulario -->
        <form action="" class="w-full h-full flex justify-center">
            <div class="scrollForm w-full flex flex-col items-center py-3 gap-[15px] h-[50vh] overflow-y-auto">
                <!-- Contenido del formulario -->
                <slot></slot>
            </div>
        </form>
    </div>
</template>