<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import Configuracion from '~/components/Forms/Empresa/Configuracion.vue';

import { useEmpresaStore } from "~/stores/Formularios/empresa/Empresa.js";
import { useDatosEmpresaBuilder } from '~/build/useDatosEmpresaBuilder';
import { ComponenteBuilder } from '~/composables/Formulario/ClassFormulario';

// Formulario Empresa
const storeEmpresa = useEmpresaStore();
const EmpresaStore = storeEmpresa.createForm("DatosEmpresa");
const varView = useVarView();
const notificacionesStore = useNotificacionesStore();
const camposVacios = ref(false);

const { simple, mensaje, options } = notificacionesStore;

// Importar states y funciones del store
const {
    validarForm,
    formData,
    traerDatos,
    guardarDatos,
    limpiar,
    estado,
    mandarFormulario,
} = EmpresaStore;



const propiedadesEmpresa = useDatosEmpresaBuilder({
    validarForm,
    guardarDatos,
    traerDatos,
    limpiar,
})

// Construccion de pagina
const pagina = new ComponenteBuilder()

const propiedades = pagina
    .setFondo('FondoDefault')
    .setHeaderPage({titulo: 'Configuracion de la Empresa', descripcion: 'Registra y configura segun los datos de tu Empresa.'})
    .setEstilos('')
    .setLayout('')
    .setContenedor('w-full')
    .addComponente('Form', propiedadesEmpresa)
    .build()

console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades"/>
    <fondoDefault>
        <div>
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-2xl font-bold text-gray-700">Configuracion de la Empresa</h2>
                    <p class="text-gray-600 mt-2">Registra y configura segun los datos de tu Empresa.</p>
                </div>
                <div class="flex gap-4">
                    <i class="fa-solid fa-hospital text-2xl text-blue-600"></i>
                </div>
            </div>

            <!-- <Configuracion/> -->
        </div>
    </fondoDefault>
</template>