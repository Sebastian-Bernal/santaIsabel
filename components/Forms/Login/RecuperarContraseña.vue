<script setup>
// Componentes
import ModalFormXS from '~/components/Modales/ModalFormXS.vue';
import Formulario from '~/components/Forms/Formulario.vue';
// Data
import { validarYEnviarRecuperarContraseña } from '../../../Core/RecuperarContraseña';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useVarView } from "../../stores/varview.js";
import { reactive } from 'vue';

const varView = useVarView();
const notificacionesStore = useNotificacionesStore();


const {
    simple,
    mensaje,
    alertRespuesta,
    options
} = notificacionesStore;

const formData = reactive({
    correo: '',
    codigoRecuperacion: '',
});

// Enviar formulario -------------------
const enviarRecuperarContraseña = async (formData) => {
    event.preventDefault()
    const estado = await validarYEnviarRecuperarContraseña(formData)

    if (estado) {
        options.icono = 'success';
        options.titulo = '¡Se ha enviado correctamente!';
        options.texto = 'Verifica tu correo electronico';
        options.tiempo = 3000
        const res = await simple()
        varView.showCambiarContraseña = true;
    } else {
        options.icono = 'error';
        options.titulo = '¡A ocurrido un problema!';
        options.texto = 'Intenta en otro momento';
        options.tiempo = 2000
        simple()
    }
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    }
};

function cerrarModal() {
    varView.showRecuperarContraseña = false;
};

watch(formData, (newValue) => {
    if (formData.correo !== "") {
        varView.formComplete = true
    } else {
        varView.formComplete = false
    }
}, { deep: true });


</script>

<template>
    <ModalFormXS :cerrarModal="cerrarModal" :enviarFormulario="enviarRecuperarContraseña" :formData="formData"
        :formComplete="varView.formComplete" :validarform="validarform"
        :botones="{ cancelar: 'Cancelar', enviar: 'Restablecer' }">
        <Formulario :datos="{
            titulo: 'Recuperar contraseña',
        }">
            <div class="mb-5 md:w-2/4 w-full flex flex-col gap-3">
                <label class="text-center text-xl flex items-center">Introduce tu dirección de correo electrónico para restablecer la contraseña</label>
                <div class="relative">
                    <input v-model="formData.correo" type="email" id="text" name="email" required
                        placeholder="Correo Electronico"
                        class="bg-inherit text-gray-900 mt-1 pr-8 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <i class="fa-solid fa-envelope absolute text-gray-900 right-[3%] top-[33%] text-lg"></i>
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
</style>