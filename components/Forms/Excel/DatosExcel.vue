<script setup>
import ModalXS from '~/components/Modales/ModalXS.vue';
import Input from '~/components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import ButtonForm from '~/components/Buttons/ButtonForm.vue';
import { watch, reactive } from 'vue'

const varView = useVarView()
const notificacionesStore = useNotificacionesStore();

const {
    mensaje,
    options
} = notificacionesStore;

const props = defineProps({
    datos: {
        type: [Object],
    },
    tabla: String,
});

const showOptions = ref(true)
const datos = ref(Object.keys(props.datos[0]))
const excel = reactive({
    nombreArchivo: '',
    tipoArchivo: '',
    worksheet: '',
    opciones: []
});


function mostrarOptions() {
    showOptions.value = !showOptions.value
}

const camposRequeridos = [
    'nombreArchivo', 'tipoArchivo', 'worksheet'
];

watch(excel, (newValue) => {
    excel.value = newValue

    // Validacion
    const camposValidos = camposRequeridos.every((campo) => excel.value[campo] !== '') && excel.opciones?.length > 0;
    varView.formComplete = camposValidos;
});

const jsonfields = computed(() => {
    return excel.opciones.reduce((obj, dato) => {
        obj[dato] = dato
        return obj
    }, {})
})

function añadirDato(dato) {
    const index = excel.opciones.indexOf(dato);
    if (index !== -1) {
        // Elimina el dato si ya existe
        excel.opciones.splice(index, 1);
        return
    }
    // Agrega el dato al final del array
    excel.opciones.push(dato);
}

function seleccionarTodos() {
    // Verifica si todos los datos ya están seleccionados
    const todosSeleccionados = datos.value.length === excel.opciones.length &&
        datos.value.every(valor => excel.opciones.includes(valor));

    if (todosSeleccionados) {
        // Si ya están todos seleccionados, deselecciona todo
        excel.opciones = [];
    } else {
        // Si no, selecciona todos
        excel.opciones = [...datos.value];
    }
}

function cerrar() {
    varView.showDatosExcel = false
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    }
};
</script>

<template>
    <ModalXS>
        <div class="p-10 h-full flex flex-col justify-between">
            <h2 class="text-2xl font-semibold text-center ">Configuracion Datos a exportar</h2>
            <div class="h-full pt-10">
                <p class="text-lg text-gray-600">{{ props.tabla }} <i class="fa-solid fa-gear"></i></p>
                <div class="flex md:flex-row flex-col gap-3 pt-3">
                    <Input v-model="excel.nombreArchivo" placeholder="Nombre Archivo" type="text"
                        name="nombreArchivo" />
                    <Select v-model="excel.tipoArchivo" placeholder="Formato Hoja de calculo" name="tipoArchivo"
                        :options="[{ text: 'xlsx', value: 'xlsx' }, { text: 'xls', value: 'xls' }, { text: 'csv', value: 'csv' }]">
                    </Select>
                    <Input v-model="excel.worksheet" placeholder="Worksheet" type="text" name="worksheet" />
                </div>
                <div class="flex md:flex-row pt-5 relative">
                    <Select placeholder="Seleccione los campos que desea" name="campos" @click="mostrarOptions()">
                    </Select>
                    <ul v-show="showOptions"
                        class="autocomplete-list absolute top-full left-0 right-0 max-h-[180px] overflow-y-auto bg-white border border-[#d0d7de] rounded-lg z-9 p-0 mt-1">
                        <div class="flex gap-3" @click="seleccionarTodos">
                            <label class="font-semibold w-full px-3 py-2 hover:bg-blue-100">Seleccionar Todos</label>                    
                        </div>
                        <li v-for="dato in datos" class="flex gap-3" @click="añadirDato(dato)">
                            <input v-model="excel.opciones" :value="dato" type="checkbox" :id="dato" />
                            <label>{{ dato }}</label>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="flex ">
                <div class="w-full flex justify-center items-center gap-3">
                    <ButtonForm color="bg-gray-500 " @click="cerrar">
                        Cancelar
                    </ButtonForm>

                    <ButtonForm color="bg-blue-500" @click="validarform">
                        <download-excel v-if="varView.formComplete" :data="props.datos" :name="excel.nombreArchivo" :type="excel.tipoArchivo"
                            :fields="jsonfields" :worksheet="excel.worksheet" :before-finish="cerrar">
                            Generar
                        </download-excel>
                        <div v-if="!varView.formComplete">
                            Generar
                        </div>
                    </ButtonForm>
                </div>
            </div>
        </div>
    </ModalXS>
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