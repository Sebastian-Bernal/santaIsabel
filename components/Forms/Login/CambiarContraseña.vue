<!-- <script setup>
// Componentes
import ModalFormXS from '~/components/Modales/ModalFormXS.vue';
import Formulario from '~/components/Forms/Formulario.vue';
// Data
import { validarYEnviarCambiarContraseña } from '../../../Core/Login/CambiarContraseña';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useVarView } from "../../stores/varview.js";
import { ref } from 'vue';

const varView = useVarView();
const notificacionesStore = useNotificacionesStore();
const props = defineProps(['correo']);

const {
    simple,
    mensaje,
    alertRespuesta,
    options
} = notificacionesStore;

const formData = reactive({
    codigoRecuperacion: '',
    nuevacontraseña: '',
    repetirContraseña: ''
});

const codigoRecuperacion = ref(false);
const codigoGenerado = ref('');

// Enviar formulario -------------------
const enviarRecuperarContraseña = async (formData) => {
    event.preventDefault()
    const estado = await validarYEnviarCambiarContraseña(formData, props.correo)

    if (estado) {
        options.icono = 'success';
        options.titulo = '¡Se ha enviado correctamente!';
        options.texto = 'Contraseña cambiada con exito';
        options.tiempo = 3000
        const res = await simple()
        sessionStorage.removeItem('codigo')
        window.location.href = '/'
    } else {
        options.icono = 'error';
        options.titulo = '¡A ocurrido un problema!';
        options.texto = 'Intenta en otro momento';
        options.tiempo = 2000
        simple()
    }
};

const validarform = () => {
    if (varView.formComplete) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    }
};

function cerrarModal() {
    varView.showCambiarContraseña = false;
};

watch(formData, (newValue) => {
    if(formData.codigoRecuperacion === parseInt(codigoGenerado.value)){
        codigoRecuperacion.value = true
    } else {
        codigoRecuperacion.value = false
    }
    
    if (formData.codigoRecuperacion !== "") {
        varView.formComplete = true
    } else {
        varView.formComplete = false
    }
}, { deep: true });

onMounted(() => {
    codigoGenerado.value = sessionStorage.getItem('codigo')
});

const validarContraseña = (valor) => {
    // Al menos 3 letras (mayúsculas o minúsculas)
    const letras = valor?.match(/[a-zA-Z]/g) || [];
    // Al menos 2 números
    const numeros = valor?.match(/[0-9]/g) || [];
    // Al menos 1 símbolo (cualquier cosa que no sea letra o número)
    const simbolos = valor?.match(/[^a-zA-Z0-9]/g) || [];

    return letras.length >= 3 && numeros.length >= 2 && simbolos.length >= 1;
}

</script>

<template>
    <ModalFormXS :cerrarModal="cerrarModal" :enviarFormulario="enviarRecuperarContraseña" :formData="formData"
        :formComplete="varView.formComplete" :validarform="validarform"
        :botones="{ cancelar: 'Volver', enviar: 'Restablecer' }">
        <Formulario :datos="{
            titulo: 'Cambiar Contraseña',
        }">
            <div class="mb-5 md:w-2/4 w-full flex flex-col gap-3">
                <label class="text-lg">Ingresa el codigo enviado a tu Correo</label>
                <div class="relative">
                    <input v-model="formData.codigoRecuperacion" type="number" id="codigo" name="codigo" required :disabled="codigoRecuperacion"
                        placeholder="Codigo Recuperacion"
                        class="bg-inherit text-gray-900 mt-1 pr-8 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <i class="fa-solid fa-key absolute text-gray-900 right-[3%] top-[33%] text-lg"></i>
                </div>
            </div>
            <div class="md:w-2/4 w-full flex flex-col gap-3" v-if="codigoRecuperacion">
                <div class="relative">
                    <input v-model="formData.nuevacontraseña" type="text" id="contraseña" name="contraseña" required
                        placeholder="Nueva Contraseña"
                        class="bg-inherit text-gray-900 mt-1 pr-8 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <i class="fa-solid fa-eye absolute text-gray-900 right-[3%] top-[33%] text-lg"></i>
                </div>
            </div>
            <div class="mb-2 md:w-2/4 w-full flex flex-col gap-3" v-if="codigoRecuperacion">
                <div class="relative">
                    <input v-model="formData.repetirContraseña" type="password" id="repetirContraseña" name="repetirContraseña" required
                        placeholder="Repetir Contraseña"
                        class="bg-inherit text-gray-900 mt-1 pr-8 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <i class="fa-solid fa-eye-slash absolute text-gray-900 right-[3%] top-[33%] text-lg"></i>
                </div>
            </div>

        </Formulario>
    </ModalFormXS>
</template>

<style scoped>
.autocomplete-list li {
    padding: 10px 15px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #eee;
}

.autocomplete-list li:last-child {
    border-bottom: none;
}

.autocomplete-list li:hover {
    background-color: #e5f0ff;
}
</style> -->