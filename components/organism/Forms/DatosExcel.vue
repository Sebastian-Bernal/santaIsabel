<script setup>
import ModalXS from '~/components/molecules/Modals/ModalXS.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import SelectMultiple from '~/components/atoms/Selects/SelectMultiple.vue';
import ButtonForm from '~/components/atoms/Buttons/ButtonForm.vue';
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
                    <Select v-model="tablaInsert.tabla" :Propiedades="{
                            placeholder: 'Tabla de datos',
                            id: 'datos',
                            name: 'datos',
                            options: Tablas,
                        }"/>
                    <Select v-model="tablaInsert.id_comparar" :Propiedades="{
                            placeholder: 'Campo a comparar',
                            id: 'campoComparar',
                            name: 'campoComparar',
                            options: datosOptions,
                        }">
                    </Select>
                    <Select v-model="tablaInsert.id_compararTabla" :Propiedades="{
                            placeholder: 'Campo de Tabla a insertar',
                            id: 'campoCompararTabla',
                            name: 'campoCompararTabla',
                            options: datosOptionsTabla,
                        }"/>
                </div>   
                <div class="flex md:flex-row flex-col gap-3 pt-3">
                    <Input v-model="excel.nombreArchivo" :Propiedades="{
                            placeholder: 'Nombre Archivo',
                            id: 'nombre',
                            name: 'nombre',
                            type: 'text',
                        }" />
                    <Select v-model="excel.tipoArchivo" :Propiedades="{
                            placeholder: 'Formato Hoja de calculo',
                            id: 'tipoArchivo',
                            name: 'tipoArchivo',
                            options: [{ text: 'xlsx', value: 'xlsx' }, { text: 'xls', value: 'xls' }, { text: 'csv', value: 'csv' }],
                        }">
                    </Select>
                    <Input v-model="excel.worksheet" :Propiedades="{
                            placeholder: 'Worksheet',
                            id: 'worksheet',
                            name: 'worksheet',
                            type: 'text',
                        }" />
                </div>
                <div class="flex md:flex-row pt-5 relative">
                    <SelectMultiple  v-model="excel.opciones" :Propiedades="{
                            placeholder: 'Seleccione los campos que deseas',
                            id: 'campos',
                            name: 'campos',
                            options: datos,
                            opciones: [{text: '', value:''}]
                        }" />
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