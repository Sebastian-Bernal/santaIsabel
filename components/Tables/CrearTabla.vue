<script setup>
import ModalLG from '~/components/Modales/ModalLG.vue';
import Input from '~/components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import SelectMultiple from '~/components/Selects/SelectMultiple.vue';
import ButtonForm from '~/components/Buttons/ButtonForm.vue';
import { watch, reactive } from 'vue'
import { Tablas } from '~/data/Tablas';
import { TablaBuilder, TablaDirector } from '~/composables/Formulario/ClassTablas';

const varView = useVarView()
const notificacionesStore = useNotificacionesStore();
const storeExcel = useExcelExport();
const emit = defineEmits(['tabla-creada']);

const {
    mensaje,
    options
} = notificacionesStore;


const showInsertar = ref(false)
const insertarTabla = ref(false)
const datos = ref()
const datosOptions = ref([])
const datosOptionsTabla = ref([])
const columnas = ref([])
const datosTabla = ref([])

const tabla = reactive({
    tabla: '',
    titulo: '',
    descripcion: '',
    color: '',
    accionAgregar: '', // puede ser una función o nombre de acción
    acciones: {
        icons: [{
            icon: '',
            action: ''
        }],
        botones: false
    },
    datos: '',
    columnas: []

});

const tablaInsert = reactive({
    tabla: '',
    id_comparar: '',
    id_compararTabla: '',
})

const camposRequeridos = [
    'datos', 'tabla', 'titulo', 'descripcion', 'color'
];

const camposRequeridosInsert = [
    'tabla', 'id_comparar', 'id_compararTabla'
];

watch(tabla, async (newValue) => {
    tabla.value = newValue

    if (newValue.tabla !== '') {
        datosOptions.value = await storeExcel.obtenerCamposTabla(newValue.tabla)
        datosTabla.value = await storeExcel.obtenerDatos(newValue.tabla)
    }

    datos.value = datosOptions.value.map(dato => dato.value)
    // Validacion
    const camposValidos = camposRequeridos.every((campo) => tabla.value[campo] !== '') && tabla.columnas?.length > 0;
    varView.formComplete = camposValidos;
});

// traer campos de tabla a insertar
watch(tablaInsert, async (newValue) => {
    tablaInsert.value = newValue

    if (newValue.tabla !== '') {
        datosOptionsTabla.value = await storeExcel.obtenerCamposTabla(newValue.tabla)
    }
    // Validacion
    const camposValidos = camposRequeridosInsert.every((campo) => tablaInsert.value[campo] !== '');
    showInsertar.value = camposValidos;
});

watch(
    () => columnas.value,
    (newVal) => {
        // Si los elementos son strings, transformarlos en objetos
        if (newVal.length && typeof newVal[0] === 'string') {
            tabla.columnas = newVal.map(val => ({
                titulo: val,
                value: val,
                tamaño: '',
                ordenar: false
            }));
        }
    }
);


function agregarDB() {
    insertarTabla.value = !insertarTabla.value
    datosOptions.value = datos.value.map((dato) => {
        return { text: dato, value: dato }
    })
    console.log(datosOptions.value)
}

async function InsertarTabla(tabla, id_comparar, id_compararTabla) {
    const datosCombinados = await storeExcel.obtenerTabla(props.datos, tabla, id_comparar, id_compararTabla);
    datosAExportar.value = datosCombinados
    datos.value = Object.keys(datosAExportar.value[0])
};

function cerrar() {
    varView.showCrearTabla = false
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    }
};

function construirTabla() {
    const builder = new TablaBuilder();
    const director = new TablaDirector(builder);

    const tablaFinal = director.construirDesdeFormulario({
        columnas: tabla.columnas.map(col => ({
            titulo: col.titulo,
            value: col.value,
            tamaño: parseInt(col.tamaño) || 100,
            ordenar: !!col.ordenar
        })),
        titulo: tabla.titulo,
        descripcion: tabla.descripcion,
        color: tabla.color,
        accionAgregar: () => console.log(tabla.accionAgregar),
        acciones: tabla.acciones,
        datos: datosTabla.value
    });

    console.log('Tabla construida:', tablaFinal);
    console.log('Tabla datos:', datosTabla.value);
    emit('tabla-creada', tablaFinal);
}

const colores = ref([
    { text: 'Default', value: 'bg-[var(--color-default)] text-white' },
    { text: 'Azul', value: 'bg-blue-500 text-white' },
    { text: 'Verde', value: 'bg-green-500 text-white' }
]);

</script>

<template>
    <ModalLG>
        <div class="py-5 h-full flex flex-col justify-between">
            <h2 class="text-2xl font-semibold text-center py-2">Configuracion Tabla</h2>
            <div class="h-full pt-5 overflow-y-auto scrollForm px-10">

                <div class="flex justify-between items-center">
                    <p class="text-lg text-gray-600">Tablas <i class="fa-solid fa-gear"></i></p>
                    <p class="text-lg text-blue-500 cursor-pointer" @click="agregarDB">
                        <i v-if="showInsertar" class="fa-solid fa-download mr-3 text-green-700"
                            @click="InsertarTabla(tablaInsert.tabla, tablaInsert.id_comparar, tablaInsert.id_compararTabla)"></i>
                        <i class="fa-solid fa-plus"></i> <i class="fa-solid fa-database"></i>
                    </p>
                </div>

                <!-- Insertar tabla -->
                <div v-if="insertarTabla" class="flex md:flex-row flex-col gap-3 pt-3">
                    <Select v-model="tablaInsert.tabla" placeholder="Tabla de datos" name="tabla" :options="Tablas" />
                    <Select v-model="tablaInsert.id_comparar" placeholder="Campo a comparar" name="campoComparar"
                        :options="datosOptions">
                    </Select>
                    <Select v-model="tablaInsert.id_compararTabla" placeholder="Campo de Tabla a insertar"
                        name="campoCompararTabla" :options="datosOptionsTabla" />
                </div>

                <div>
                    <!-- Selección de tabla y campos -->
                    <div class="flex md:flex-row flex-col gap-3 pt-3">
                        <Select v-model="tabla.tabla" placeholder="Tabla de datos" :options="Tablas" name="tabla" />
                        <SelectMultiple v-model="columnas" :options="datos" placeholder="Seleccione los campos"
                            name="columnas" id="columnas" />

                    </div>

                    <!-- Configuración de columnas -->
                    <div class="grid grid-cols-3 gap-5 p-3 my-5 max-h-[200px] overflow-y-auto">
                        <div v-for="(col, index) in tabla.columnas" :key="index" class="flex flex-col gap-2 mb-2">
                            <label class="text-gray-600">{{ col.titulo }}</label>
                            <Input v-model="col.value" placeholder="Título visible" :mayuscula="false" />
                            <Input v-model="col.tamaño" placeholder="Tamaño en px (opcional)" type="number" max="500" />
                            <label class="flex items-center gap-2">
                                <input type="checkbox" v-model="col.ordenar" />
                                Boton de Ordenar
                            </label>
                        </div>
                    </div>

                    <!-- Header de la tabla -->
                    <div class="flex items-center gap-3 pt-5">
                        <i class="fa-solid fa-folder text-blue-500"></i>
                        <Label forLabel="header">Header (opcional)</Label>
                    </div>

                    <div class="flex md:flex-row flex-col gap-3 pt-3">
                        <Input v-model="tabla.titulo" placeholder="Título" :mayuscula="false" />
                        <Input v-model="tabla.descripcion" placeholder="Descripción" :mayuscula="false" />
                        <Select v-model="tabla.color" placeholder="Color" :options="colores" />
                    </div>

                    <!-- Acciones -->
                    <div class="flex items-center gap-3 pt-5">
                        <i class="fa-solid fa-folder text-blue-500"></i>
                        <Label forLabel="header">Acciones (opcional)</Label>
                    </div>
                    <div class="flex flex-col gap-3 pt-5">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" v-model="tabla.acciones.botones" />
                            Mostrar botones
                        </label>
                        <div class="flex gap-2" v-if="tabla.acciones.botones">
                            <Input v-model="tabla.acciones.icons.at(-1).icon" placeholder="Icono (ej. ver)" />
                            <Input v-model="tabla.acciones.icons[0].action" placeholder="Acción (ej. verPaciente)" />
                        </div>
                    </div>

                </div>


            </div>
            <div class="flex ">
                <div class="w-full flex justify-center items-center gap-3">
                    <ButtonForm color="bg-gray-500 " @click="cerrar">
                        Cancelar
                    </ButtonForm>

                    <ButtonForm color="bg-blue-500" @click="!varView.formComplete ? construirTabla() : validarform()">
                        Generar
                    </ButtonForm>
                </div>
            </div>
        </div>
    </ModalLG>
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