<script setup>
import Input from '~/components/Inputs/Input.vue';
import InputContenido from '~/components/Inputs/InputContenido.vue';
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
        'nombre',
        'logo',
        'logoLogin',
        'JPG',
        'no_identificacion',
        'DV',
        'registroMercantil',
        'direccion',
        'telefono',
        'lenguaje',
        'impuesto',
        'pais',
        'tipoDocumento',
        'tipoOperacion',
        'tipoEntorno',
        'tipoMoneda',
        'tipoOrganizacion',
        'municipio',
        'tipoResponsabilidad',
        'tipoRegimen',
];

// Guardar Datos en el localStorage
watch(
    formData,
    (newValue) => {
        guardarDatos(newValue);
        const empresa = newValue.Empresa;
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
            limpiar();
            formData = storeEmpresa.Empresa
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

const logoFile = (obj, key, event) => {
    const file = event.target.files[0]
    obj[key] = file.name
};
</script>

<template>
    <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
        <div>
            <h3 class="text-xl font-semibold">Datos de la Empresa</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input v-model="formData.Empresa.nombre" placeholder="Nombre Comercial" name="nombre" :tamaño="{'incompleto' : camposVacios && formData.Empresa.nombre === ''}"></Input>
            <InputContenido v-model="formData.Empresa.logo" placeholder="Logo" type="text" name="logo" :tamaño="{'incompleto' : camposVacios && formData.Empresa.logo === ''}">
                <label for="logoFile" ><i class="fa-solid fa-image text-blue-500"></i></label>
                <input type="file" accept="image/png, image/jpeg" @change="event => logoFile(formData.Empresa, 'logo', event)" name="logoFile" id="logoFile" class="hidden">
            </InputContenido>
            <InputContenido v-model="formData.Empresa.logoLogin" placeholder="Logo Login" type="text" name="logo" :tamaño="{'incompleto' : camposVacios && formData.Empresa.logo === ''}">
                <label for="logoLoginFile" ><i class="fa-solid fa-image text-blue-500"></i></label>
                <input type="file" accept="image/png, image/jpeg" @change="event => logoFile(formData.Empresa, 'logoLogin', event)" name="logoLoginFile" id="logoLoginFile" class="hidden">
            </InputContenido>
            <InputContenido v-model="formData.Empresa.JPG" placeholder="JPG firmas facturas" type="text" name="firmas" :tamaño="{'incompleto' : camposVacios && formData.Empresa.JPG === ''}">
                <label for="JPGfirmas" ><i class="fa-solid fa-image text-blue-500"></i></label>
                <input type="file" accept="image/png, image/jpeg" @change="event => logoFile(formData.Empresa, 'JPG', event)" name="JPGfirmas" id="JPGfirmas" class="hidden">
            </InputContenido>
        </div>
    </div>

    <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
        <div>
            <h3 class="text-xl font-semibold">Configuracion de la Empresa</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input v-model="formData.Empresa.no_identificacion" placeholder="Numero de identificacion" name="IdEmpresa" :tamaño="{'incompleto' : camposVacios && formData.Empresa.no_identificacion === ''}"></Input>
            <Input v-model="formData.Empresa.DV" placeholder="DV" name="DV" :tamaño="{'incompleto' : camposVacios && formData.Empresa.DV === ''}"></Input>
            <Input v-model="formData.Empresa.registroMercantil" placeholder="Registro Mercantil" name="regitroMercantil" :tamaño="{'incompleto' : camposVacios && formData.Empresa.registroMercantil === ''}"></Input>
            <Input v-model="formData.Empresa.direccion" placeholder="Direccion" name="direccion" :tamaño="{'incompleto' : camposVacios && formData.Empresa.direccion === ''}"></Input>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input v-model="formData.Empresa.telefono" placeholder="Telefono" name="telefono"></Input>
            <Input v-model="formData.Empresa.lenguaje" placeholder="Lenguaje" name="lenguaje"></Input>
            <Input v-model="formData.Empresa.impuesto" placeholder="Impuesto" name="impuesto"></Input>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input v-model="formData.Empresa.pais" placeholder="Pais" name="pais" :tamaño="{'incompleto' : camposVacios && formData.Empresa.pais === ''}"></Input>
            <Input v-model="formData.Empresa.tipoDocumento" placeholder="Tipo de Documento" name="tipodocuemnto" :tamaño="{'incompleto' : camposVacios && formData.Empresa.tipoDocuemnto === ''}"></Input>
            <Input v-model="formData.Empresa.tipoOperacion" placeholder="Tipo de Operacion" name="tipoOperacion" :tamaño="{'incompleto' : camposVacios && formData.Empresa.tipoOperacion === ''}"></Input>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input v-model="formData.Empresa.tipoEntorno" placeholder="Tipo Entorno" name="tipoEntorno"></Input>
            <Input v-model="formData.Empresa.tipoMoneda" placeholder="Tipo Moneda" name="tipoMoneda" :tamaño="{'incompleto' : camposVacios && formData.Empresa.tipoMoneda === ''}"></Input>
            <Input v-model="formData.Empresa.tipoOrganizacion" placeholder="Tipo de Organizacion" name="tipoOrganizacion"></Input>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input v-model="formData.Empresa.municipio" placeholder="Municipio" tipo="municipio" name="municipio"></Input>
            <Input v-model="formData.Empresa.tipoResponsabilidad" placeholder="Tipo de Responsabilidad" name="tipoResponsabilidad"></Input>
            <Input v-model="formData.Empresa.tipoRegimen" placeholder="Tipo de Regimen" name="tipoRegimen" :tamaño="{'incompleto' : camposVacios && formData.Empresa.tipoRegimen === ''}"></Input>
        </div>
        <div class="w-full flex justify-end">
            <button @click="varView.formComplete ? enviar(formData) : validarform()" class="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white text-sm p-3 rounded-2xl flex items-center gap-3">
                <i class="fa-solid fa-download"></i>Guardar
            </button>
        </div>
    </div>
</template>
