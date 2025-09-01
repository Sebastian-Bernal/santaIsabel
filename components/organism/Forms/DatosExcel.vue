<script setup>
import ModalXS from '~/components/molecules/Modals/ModalXS.vue';
import Input from '~/components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import SelectMultiple from '~/components/Selects/SelectMultiple.vue';
import ButtonForm from '~/components/Buttons/ButtonForm.vue';
import { watch, reactive } from 'vue'
import { Tablas } from '~/data/Tablas';

const varView = useVarView()
const notificacionesStore = useNotificacionesStore();
const storeExcel = useExcelExport();

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

const datosAExportar = ref(props.datos)
const showInsertar = ref(false)
const insertarTabla = ref(false)
const datos = ref(Object.keys(datosAExportar.value[0]))
const datosOptions = ref([])
const datosOptionsTabla = ref([])

const excel = reactive({
    nombreArchivo: '',
    tipoArchivo: '',
    worksheet: '',
    opciones: []
});
const tablaInsert = reactive({
    tabla: '',
    id_comparar: '',
    id_compararTabla: '',
})

const camposRequeridos = [
    'nombreArchivo', 'tipoArchivo', 'worksheet'
];

const camposRequeridosInsert = [
    'tabla', 'id_comparar', 'id_compararTabla'
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

watch(tablaInsert, async(newValue) => {
    tablaInsert.value = newValue

    if(newValue.tabla !== ''){
        datosOptionsTabla.value = await storeExcel.obtenerCamposTabla(newValue.tabla)
    }
    // Validacion
    const camposValidos = camposRequeridosInsert.every((campo) => tablaInsert.value[campo] !== '');
    showInsertar.value = camposValidos;
});

function agregarDB () {
    insertarTabla.value = !insertarTabla.value
    datosOptions.value = datos.value.map((dato) => {
        return {text: dato, value: dato}
    })
    console.log(datosOptions.value)
}

async function InsertarTabla(tabla, id_comparar, id_compararTabla) {
    const datosCombinados = await storeExcel.obtenerTabla(props.datos, tabla, id_comparar, id_compararTabla);
    datosAExportar.value = datosCombinados
    datos.value = Object.keys(datosAExportar.value[0])
};

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

function mostrar() {
    console.log(datosAExportar)
}
</script>

<template>
    <ModalXS>
        <div class="py-5 h-full flex flex-col justify-between">
            <h2 class="text-2xl font-semibold text-center py-2">Configuracion Datos a exportarr</h2>
            <div class="h-full pt-5 overflow-y-auto scrollForm px-10">
                <div class="flex justify-between items-center">
                    <p class="text-lg text-gray-600">{{ props.tabla }} <i class="fa-solid fa-gear"></i></p>
                    <p class="text-lg text-blue-500 cursor-pointer" @click="agregarDB">
                        <i v-if="showInsertar" class="fa-solid fa-download mr-3 text-green-700" @click="InsertarTabla(tablaInsert.tabla, tablaInsert.id_comparar, tablaInsert.id_compararTabla)"></i>  
                        <i class="fa-solid fa-plus"></i> <i
                            class="fa-solid fa-database"></i></p>
                </div>
                <div v-if="insertarTabla" class="flex md:flex-row flex-col gap-3 pt-3">
                    <Select v-model="tablaInsert.tabla" placeholder="Tabla de datos"
                        name="tabla" :options="Tablas"/>
                    <Select v-model="tablaInsert.id_comparar" placeholder="Campo a comparar" name="campoComparar"
                        :options="datosOptions">
                    </Select>
                    <Select v-model="tablaInsert.id_compararTabla" placeholder="Campo de Tabla a insertar" name="campoCompararTabla" 
                    :options="datosOptionsTabla"/>
                </div>   
                <div class="flex md:flex-row flex-col gap-3 pt-3">
                    <Input v-model="excel.nombreArchivo" placeholder="Nombre Archivo" type="text"
                        name="nombreArchivo" />
                    <Select v-model="excel.tipoArchivo" placeholder="Formato Hoja de calculo" name="tipoArchivo"
                        :options="[{ text: 'xlsx', value: 'xlsx' }, { text: 'xls', value: 'xls' }, { text: 'csv', value: 'csv' }]">
                    </Select>
                    <Input v-model="excel.worksheet" placeholder="Worksheet" type="text" name="worksheet" />
                </div>
                <div class="flex md:flex-row pt-5 relative">
                    <!-- <Select placeholder="Seleccione los campos que desea" name="campos" @click="mostrarOptions()">
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
                    </ul> -->
                    <SelectMultiple  v-model="excel.opciones" :options="datos"
                        name="campos" id="campos" placeholder="Seleccione los campos que deseas" />
                </div>
            </div>
            <div class="flex ">
                <div class="w-full flex justify-center items-center gap-3">
                    <ButtonForm color="bg-gray-500 " @click="cerrar">
                        Cancelar
                    </ButtonForm>

                    <ButtonForm color="bg-blue-500" @click="validarform">
                        <download-excel v-if="varView.formComplete" :data="datosAExportar" :name="excel.nombreArchivo"
                            :type="excel.tipoArchivo" :fields="jsonfields" :worksheet="excel.worksheet"
                            :before-finish="cerrar" :before-generate="mostrar">
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