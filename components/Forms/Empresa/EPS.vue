<script setup>
import Input from '~/components/Inputs/Input.vue';
import ModalFormXS from '~/components/Modales/ModalFormXS.vue';
import Button from '~/components/Buttons/Button.vue';
// Data
import { useDatosEmpresaStore } from '~/stores/Formularios/empresa/Datos.js';
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";

const props = defineProps(['tabla', 'datos']);

const storeDatosEmpresa = useDatosEmpresaStore();
const DatosEmpresaStore = storeDatosEmpresa.createForm("EPS");
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
        const empresa = newValue.DatosEmpresa;
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
    if (!varView.formComplete) {
        options.position = "top-end";
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500;
        mensaje();
    }
    camposVacios.value = true
};

const cerrarModal = () => {
    limpiar()
    varView.showNuevoEPS = false
}
</script>

<template>
    <ModalFormXS :cerrarModal="cerrarModal" :enviarFormulario="enviar" :formData="formData"
        :formComplete="varView.formComplete" :validarform="validarform"
        :botones="{ cancelar: 'Atras', enviar: 'Registrar' }">
        <div class="flex flex-col justify-center bg-white p-4 rounded-2xl gap-4 h-[80%] ">
            <div>
                <h3 class="text-xl font-semibold">Registar EPS</h3>
            </div>
            <div class="flex justify-between">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-file text-blue-500"></i>
                    <Label forLabel="tipo" size="text-sm">EPS (opcional)</Label>
                </div>
                <Button color="bg-blue-500" @click="
                    agregarItem(
                        'EPS',
                        {
                            nombre: '',
                        },
                        'nombre'
                    )
                    ">
                    <i class="fa-solid fa-plus"></i>
                </Button>
            </div>
            <div class="grid gap-3" v-for="(eps, i) in formData.EPS">
                <Input v-model="eps.nombre" placeholder="Nombre" name="nombre"></Input>
                <i class="fa-solid fa-close text-red-400" @click="eliminarItem('EPS', i)"></i>
            </div>
        </div>
    </ModalFormXS>
</template>
