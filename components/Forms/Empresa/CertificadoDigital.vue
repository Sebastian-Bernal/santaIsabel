<script setup>
import Input from "~/components/Inputs/Input.vue";
import InputContenido from "~/components/Inputs/InputContenido.vue";
// Data
import { useEmpresaStore } from "~/stores/Formularios/empresa/Empresa.js";
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";

const storeEmpresa = useEmpresaStore();
const EmpresaStore = storeEmpresa.createForm("DatosEmpresa");
const varView = useVarView();
const notificacionesStore = useNotificacionesStore();
const camposVacios = ref(false);

// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
    limpiar,
    estado,
    mandarFormulario,
} = EmpresaStore;

const { simple, mensaje, options } = notificacionesStore;

const camposRequeridos = [
    "nombre",
    "logo",
    "logoLogin",
    "JPG",
    "no_identificacion",
    "DV",
    "registroMercantil",
    "direccion",
    "telefono",
    "lenguaje",
    "impuesto",
    "pais",
    "tipoDocumento",
    "tipoOperacion",
    "tipoEntorno",
    "tipoMoneda",
    "tipoOrganizacion",
    "municipio",
    "tipoResponsabilidad",
    "tipoRegimen",
];

// Guardar Datos en el localStorage
watch(
    formData,
    (newValue) => {
        guardarDatos(newValue);
        const empresa = newValue.Empresa;
        // Validacion
        const camposValidos = camposRequeridos.every(
            (campo) => empresa[campo] !== ""
        );
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
            limpiar();
            formData = storeEmpresa.Empresa;
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
    camposVacios.value = true;
};
</script>

<template>
    <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
        <div class="justify-self-start">
            <h3 class="text-xl font-semibold text-start">Certificado Digital</h3>
        </div>
        <div class="flex flex-col items-center gap-3">
            <label for="certificado" class="bg-gray-100 md:w-1/2 w-full flex flex-col items-center p-4 py-6">
                <i class="fa-solid fa-cloud-arrow-up text-6xl text-gray-500"></i>
                <p>
                    Sulta tu archivo aqui o
                    <span class="text-blue-400">haz clic para cargar</span>
                </p>
            </label>
            <input type="file" id="certificado" name="certificado" class="hidden" />
            <Input placeholder="Password Certificado" type="password" name="certificado" tamaño="md:w-1/2 w-full"></Input>
        </div>
        <div class="w-full flex justify-end">
            <button class="bg-blue-500 text-white text-sm p-3 rounded-2xl flex items-center gap-3">
                <i class="fa-solid fa-download"></i>Guardar
            </button>
        </div>
    </div>
</template>