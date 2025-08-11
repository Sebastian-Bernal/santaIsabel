<script setup>
import Input from '~/components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import Button from '~/components/Buttons/Button.vue';
import Label from '~/components/Labels/Label.vue'
// Data
import { secciones } from '~/data/Buttons.js';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion.js';
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";

const props = defineProps(['tabla', 'datos', 'Profesiones']);

const storeDatosEmpresa = useDatosProfesionStore();
const DatosEmpresaStore = storeDatosEmpresa.createForm("Profesion");
const varView = useVarView();
const notificacionesStore = useNotificacionesStore();
const camposVacios = ref(false);
const showOptions = ref(false);

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
        // Detectar inputs inválidos
        const hayCamposInvalidos = document.querySelectorAll('input:invalid').length > 0;
        varView.formComplete = camposValidos && !hayCamposInvalidos;
    },
    { deep: true }
);

// Traer datos del localStorage
onMounted(() => {
    traerDatos();
});

function mostrarOptions() {
    showOptions.value = !showOptions.value
};

function añadirDato(dato) {
    const index = formData.Profesion.at(-1).permisos.indexOf(dato);
    if (index !== -1) {
        // Elimina el dato si ya existe
        formData.Profesion.at(-1).permisos.splice(index, 1);
        return
    }
    // Agrega el dato al final del array
    formData.Profesion.at(-1).permisos.push(dato);
};

function seleccionarTodos() {
    // Verifica si todos los datos ya están seleccionados
    const todosSeleccionados = secciones.length === formData.Profesion.at(-1).permisos.length &&
        secciones.every(valor => formData.Profesion.at(-1).permisos.includes(valor));

    if (todosSeleccionados) {
        // Si ya están todos seleccionados, deselecciona todo
        formData.Profesion.at(-1).permisos = [];
    } else {
        // Si no, selecciona todos
        formData.Profesion.at(-1).permisos = [...secciones];
    }
};

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
            location.reload();
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

function modificarProfesion (data) {
    console.log('hola')
    agregarItem('Profesion', { nombre: data.nombre, codigo: data.codigo, permisos: data.permisos}, 'nombre')
}

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
            <i class="fa-solid fa-user-doctor"></i>
        </div>
        <div>
            <div class="flex justify-between items-center">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-user-doctor text-purple-500"></i>
                    <Label forLabel="Profesion" size="text-sm">Agregar Nueva Profesion</Label>
                </div>
                <div class="flex gap-2 items-center" v-if="formData.Profesion.length < 1">
                    <a @click="agregarItem('Profesion', { nombre: '', codigo: '', permisos: [] }, 'nombre')">
                        <Button color="bg-purple-500"><i class="fa-solid fa-plus cursor-pointer"></i></Button>
                    </a>
                </div>
                <div class="w-full flex justify-end" v-if="formData.Profesion.length > 0">
                    <Button @click="varView.formComplete ? enviar(formData) : validarform()" color="bg-blue-600"><i
                            class="fa-solid fa-download cursor-pointer"></i></Button>
                </div>
            </div>
            <div v-for="(Profesion, i) in formData.Profesion" :key="i" class="">
                <div class="flex items-center gap-3 mx-2" >
                    <Input v-model="Profesion.nombre" placeholder="Nombre Profesion" name="Profesion" id="Profesion"
                        minlength="5"></Input>
                    <Input v-model="Profesion.codigo" placeholder="Codigo" name="ProfesionCodigo" id="ProfesionCodigo"
                        minlength="2"></Input>
                    <i class="fa-solid fa-close text-red-400" @click="eliminarItem('Profesion', i)"></i>
                </div>
                <div class="flex items-center gap-3 relative mx-2 my-2">
                    <Select placeholder="Seleccione los permisos" name="permisos" id="permisos"
                    @click="mostrarOptions"></Select>
                        <ul v-show="showOptions"
                            class="autocomplete-list absolute top-full left-0 right-0 max-h-[180px] overflow-y-auto bg-white border border-[#d0d7de] rounded-lg z-9 px-3 mt-1">
                            <div class="flex gap-3" @click="seleccionarTodos">
                                <label class="font-semibold w-full px-3 py-2 hover:bg-blue-100">Seleccionar Todos</label>                    
                            </div>
                            <li v-for="dato in secciones" class="flex gap-3" @click="añadirDato(dato)">
                                <input v-model="Profesion.permisos" :value="dato" type="checkbox" :id="dato" />
                                <label>{{ dato }}</label>
                            </li>
                        </ul>
                    <Select placeholder="Tipo" name="tipo" id="tipo"
                    :options="[{text: 'Medico', value: 'Medico'},{text: 'Enfermero', value: 'Enfermero'},{text: 'Fisioterapeuta', value: 'Fisioterapeuta'},{text: 'Optómetra', value: 'Optómetra'},{text: 'Ortopedista', value: 'Ortopedista'},]"></Select>
                </div>
            </div>
        </div>
        <div class="border border-gray-300 rounded-2xl px-7 py-5 flex flex-col gap-3">
            <div class="grid grid-cols-3 gap-3 text-center text-gray-500">
                <p>Nombre</p>
                <p>Codigo</p>
                <p>Acciones</p>
            </div>
            <div class="grid grid-cols-3 gap-3 text-center text-sm font-semibold" v-for="item in props.Profesiones">
                <p>{{ item.nombre }}</p>
                <p>{{ item.codigo }}</p>
                <p class="flex items-center justify-center gap-3">
                    <i @click="modificarProfesion(item)" class="fa-solid fa-pencil hover:text-gray-500"></i>
                    <i class="fa-solid fa-trash text-red-500"></i>
                </p>
            </div>
        </div>
    </div>
</template>
