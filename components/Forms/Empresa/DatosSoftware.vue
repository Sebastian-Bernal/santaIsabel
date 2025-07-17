<script setup>
import Input from '~/components/Inputs/Input.vue';
import InputContenido from '~/components/Inputs/InputContenido.vue';
// Data
import { useSoftwareStore } from '~/stores/Formularios/empresa/Software.js';
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";

const props = defineProps(['tabla', 'datos'])


const storeSoftware = useSoftwareStore();
const estructura = {
    Software: {
        [props.tabla]: {
            id: '',
            pin: '',
            testID: '',
        }
    },
}
const SoftwareStore = storeSoftware.createForm("DatosSoftware");
const varView = useVarView();
const notificacionesStore = useNotificacionesStore();

// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
    limpiar,
    estado,
    mandarFormulario,
} = SoftwareStore;

const { simple, mensaje, options } = notificacionesStore;

const camposRequeridos = [
    'id',
    'pin',
    'testID',
];

// Guardar Datos en el localStorage
watch(
    formData,
    (newValue) => {
        guardarDatos(newValue);
        const empresa = newValue.Software;
        // Validacion
        const camposValidos = camposRequeridos.every((campo) => empresa[campo] !== '');
        varView.formComplete = camposValidos;
    },
    { deep: true }
);

// Traer datos del localStorage
onMounted(() => {
    traerDatos();
});

// Enviar formulario -------------------
const enviar = async (formData) => {
    event.preventDefault();

    const estado = await mandarFormulario(formData);
    if (estado) {
        options.icono = "success";
        options.titulo = "¡Se ha enviado correctamente!";
        options.texto = "Datos de Empresa registrados";
        options.tiempo = 3000;
        const respuesta = await simple();
        if (respuesta.isConfirmed || respuesta.dismiss) {
            limpiar()
            formData.Software[props.tabla].id = ''
            formData.Software[props.tabla].pin = ''
            formData.Software[props.tabla].testID = ''
        }
    } else {
        options.icono = "error";
        options.titulo = "¡A ocurrido un problema!";
        options.texto = "No se pudo registrar datos de Empresa";
        options.tiempo = 2000;
        simple();
    }
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = "top-end";
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500;
        mensaje();
    }
};
</script>

<template>
    <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
        <div>
            <h3 class="text-xl font-semibold">{{ props.datos.titulo }}</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input v-model="formData.Software[props.tabla].id" :placeholder="props.datos.inputID" name="idDIAN"></Input>
            <InputContenido v-model="formData.Software[props.tabla].pin" :placeholder="props.datos.inputPin" name="pinSoftware" maxlength="5">
                <div class="flex text-gray-500">
                    <p>{{ formData.Software[props.tabla].pin.length }}</p>/<p>5</p>
                </div>
            </InputContenido>
            <Input v-model="formData.Software[props.tabla].testID" :placeholder="props.datos.inputTestID" name="set"></Input>
        </div>
        <div class="w-full flex justify-end">
            <button @click="varView.formComplete ? enviar(formData) : validarform()" class="bg-blue-500 text-white text-sm p-3 rounded-2xl flex items-center gap-3">
                <i class="fa-solid fa-download"></i>Guardar
            </button>
        </div>
    </div>
</template>
