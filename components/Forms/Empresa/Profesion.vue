<script setup>
import Input from '~/components/Inputs/Input.vue';
import Button from '~/components/Buttons/Button.vue';
import Label from '~/components/Labels/Label.vue'
// Data
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion.js';
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";

const props = defineProps(['tabla', 'datos']);

const storeDatosEmpresa = useDatosProfesionStore();
const DatosEmpresaStore = storeDatosEmpresa.createForm("Profesion");
const varView = useVarView();
const notificacionesStore = useNotificacionesStore();
const camposVacios = ref(false)

// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
    limpiar,
    agregarItem,
    eliminarItem,
    estado,
    mandarFormulario,
} = DatosEmpresaStore;

const { simple, mensaje, options } = notificacionesStore;

const camposRequeridos = [
    'nombre',
];

// Guardar Datos en el localStorage
watch(
    formData,
    (newValue) => {
        guardarDatos(newValue);
        const empresa = newValue.Profesion;
        // Validacion
        const camposValidos = empresa.length > 0 && camposRequeridos.every((campo) => empresa.at(-1)[campo] !== '');
        varView.formComplete = camposValidos;
        console.log(camposValidos)
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
            window.location.href = '/Empresas/Resoluciones'
            storeDatosEmpresa.listResoluciones
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
    options.position = "top-end";
    options.texto = "Falta campos por llenar, por favor ingrese valores";
    options.tiempo = 1500;
    mensaje();
    camposVacios.value = true
};

const cerrarModal = () => {
    limpiar()
}
</script>

<template>
    <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
        <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">Profesion Registradas</h3>
            <div class="w-full flex justify-end">
                <button @click="varView.formComplete ? enviar(formData) : validarform()"
                    class="bg-blue-500 text-white text-sm p-3 rounded-2xl flex items-center gap-3">
                    <i class="fa-solid fa-user-doctor"></i>Registrar
                </button>
            </div>
        </div>
        <div>
            <div class="flex justify-between items-center">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-user-doctor text-purple-500"></i>
                    <Label forLabel="Profesion" size="text-sm">Agregar Nueva Profesion</Label>
                </div>
                <div class="flex gap-2 items-center">
                    <a @click="agregarItem('Profesion', { nombre: '', codigo: '' }, 'nombre')">
                        <Button color="bg-purple-500"><i class="fa-solid fa-plus"></i></Button>
                    </a>
                </div>
            </div>
            <div class="flex items-center gap-3" v-for="(Profesion, i) in formData.Profesion" :key="i">
                <Input v-model="Profesion.nombre" placeholder="Nombre Profesion" name="Profesion" id="Profesion"></Input>
                <Input v-model="Profesion.codigo" placeholder="Nombre Profesion" name="ProfesionCodigo" id="ProfesionCodigo"></Input>
                <i class="fa-solid fa-close text-red-400" @click="eliminarItem('Profesion', i)"></i>
            </div>
        </div>
        <div class="border border-gray-300 rounded-2xl px-7 py-5 flex flex-col gap-3">
            <div class="grid grid-cols-3 gap-3 text-center text-gray-500">
                <p>Nombre</p>
                <p>Codigo</p>
                <p>Acciones</p>
            </div>
            <div class="grid grid-cols-3 gap-3 text-center text-sm font-semibold" v-for="item in 5">
                <p>Medico</p>
                <p>001</p>
                <p class="flex items-center justify-center gap-3">
                    <i class="fa-solid fa-pencil"></i>
                    <i class="fa-solid fa-trash text-red-500"></i>
                </p>
            </div>
        </div>
    </div>
</template>
