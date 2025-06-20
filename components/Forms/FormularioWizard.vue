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
    <div class="bg-white rounded-3xl shadow-lg relative flex flex-col items-center" :class="tamaño">
        <Wizard :secciones="props.datos.secciones" :titulo="props.datos.tituloFormulario" />
        <div class="scrollForm p-10 flex flex-col items-center w-full max-h-[75%] overflow-y-auto">
            <h1 class="text-3xl text-gray-800 font-bold mb-3 text-center">{{ datos.titulo }}</h1>
            <!-- Formulario -->
            <form action="" class="w-full h-full flex justify-center">
                <div class="w-full flex flex-col items-center py-3 gap-[15px]">
                    <!-- Contenido del formulario -->
                    <slot></slot>
                </div>
            </form>
            <!-- Botones Formulario -->
            <!-- <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[10px] left-auto right-auto">
                <nuxtLink v-for="boton in datos.botones" :to="boton.ruta">
                    <button :class="boton.color" @click="boton.submit ? validarYEnviar() : alertValidacion(boton.ruta)"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        {{ boton.texto }}
                    </button>
                </nuxtLink>
            </div> -->
        </div>
    </div>
</template>

<style scoped>
/* Scroll */

.scrollForm::-webkit-scrollbar {
    height: 7px;
    width: 7px;
}

.scrollForm::-webkit-scrollbar-track {
    border-radius: 2px;
    background-color: #DFE9EB;
}

.scrollForm::-webkit-scrollbar-track:hover {
    background-color: #B8C0C2;
}

.scrollForm::-webkit-scrollbar-track:active {
    background-color: #B8C0C2;
}

.scrollForm::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: #326872;
}

.scrollForm::-webkit-scrollbar-thumb:hover {
    background-color: #576A72;
}

.scrollForm::-webkit-scrollbar-thumb:active {
    background-color: #107072;
}
</style>