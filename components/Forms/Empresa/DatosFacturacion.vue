<script setup>
import Input from '~/components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import InputContenido from '~/components/Inputs/InputContenido.vue';
// Data
import { useFacturacionStore } from '~/stores/Formularios/empresa/Facturacion.js';
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";

const props = defineProps(['tabla', 'datos'])

const storeFacturacion = useFacturacionStore();
const FacturacionStore = storeFacturacion.createForm("DatosFacturacion");
const varView = useVarView();
const notificacionesStore = useNotificacionesStore();
const camposVacios = ref(false)

// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
    limpiar,
    estado,
    mandarFormulario,
} = FacturacionStore;

const { simple, mensaje, options } = notificacionesStore;

const camposRequeridos = [
        'tipoDocumento',
        'prefijo',
        'no_resolucion',
        'numeroInicial',
        'numeroHasta',
        'claveTecnica',
];

// Guardar Datos en el localStorage
watch(
    formData,
    (newValue) => {
        guardarDatos(newValue);
        const empresa = newValue.Facturacion;
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
            location.reload()
            storeFacturacion.listResoluciones
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
    camposVacios.value = true
};
</script>

<template>
    <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
        <div>
            <h3 class="text-xl font-semibold">Resolucion de Facturacion</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select v-model="formData.Facturacion.tipoDocumento" placeholder="Tipo de Documento" 
            :options="[
                {text: 'Factura de Venta Nacional', value: 'Factura de Venta Naciona'},
                {text: 'Nota Crédito', value: 'Nota Crédito'},
                {text: 'Nota Débito', value: 'Nota Débito'},
                {text: 'Zip', value: 'Zip'},
                {text: 'Nomina Individual', value: 'Nomina Individual'},
                {text: 'Nomina Individual de Ajuste', value: 'Nomina Individual de Ajuste'},
                {text: 'Documento Soporte Electronico', value: 'Documento Soporte Electronico'},
                {text: 'Nota de Ajuste al Documento Soporte Electronico', value: 'Nota de Ajuste al Documento Soporte Electronico'},
                {text: 'Nota de crédito al Documento Equivalente', value: 'Nota de crédito al Documento Equivalente'},
                {text: 'Nota de crédito al Documento Equivalente POS', value: 'Nota de crédito al Documento Equivalente POS'},
                ]" name="tipoDocumento" :tamaño="{'incompleto' : camposVacios && formData.Facturacion.tipoDocuemnto === ''}"></Select>
            <Input v-model="formData.Facturacion.prefijo" placeholder="Prefijo de la resolucion" name="prefijo" :tamaño="{'incompleto' : camposVacios && formData.Facturacion.prefijo === ''}"></Input>
            <Input v-model="formData.Facturacion.no_resolucion" placeholder="numero de resolucion" name="no_resolucion" :tamaño="{'incompleto' : camposVacios && formData.Facturacion.no_resolucion === ''}"></Input>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InputContenido v-model="formData.Facturacion.fechaResolucion" type="text" placeholder="Fecha de Resolucion: 'AAAA-MM-DD'" name="fechaResolucion">
                <input type="date" v-model="formData.Facturacion.fechaResolucion" class="w-[20px] cursor-pointer">
            </InputContenido>
            <InputContenido v-model="formData.Facturacion.fechaInicial" type="text" placeholder="Fecha Inicial: 'AAAA-MM-DD'" name="fechaInicial">
                <input type="date" v-model="formData.Facturacion.fechaInicial" class="w-[20px] cursor-pointer">
            </InputContenido>
            <InputContenido v-model="formData.Facturacion.fechaHasta" type="text" placeholder="Fecha Hasta: 'AAAA-MM-DD'" name="fechaDesde">
                <input type="date" v-model="formData.Facturacion.fechaHasta" class="w-[20px] cursor-pointer">
            </InputContenido>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input v-model="formData.Facturacion.numeroInicial" placeholder="Numero Inicial" name="numeroInicial" :tamaño="{'incompleto' : camposVacios && formData.Facturacion.numeroInicial === ''}"></Input>
            <Input v-model="formData.Facturacion.numeroHasta" placeholder="Numero Hasta" name="numeroHasta" :tamaño="{'incompleto' : camposVacios && formData.Facturacion.numeroHasta === ''}"></Input>
            <Input v-model="formData.Facturacion.claveTecnica" placeholder="Clave Tecnica" name="claveTecnica" :tamaño="{'incompleto' : camposVacios && formData.Facturacion.claveTecnica === ''}"></Input>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input v-model="formData.Facturacion.descripcion" placeholder="Descripcion" name="descripcion"></Input>
        </div>
        <div class="w-full flex justify-end">
            <button @click="varView.formComplete ? enviar(formData) : validarform()" class="bg-blue-500 text-white text-sm p-3 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-blue-600">
                <i class="fa-solid fa-download"></i>Guardar
            </button>
        </div>
    </div>
</template>
