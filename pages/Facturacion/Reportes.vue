<script setup>
import CrearTabla from '~/components/organism/Table/CrearTabla.vue';
import Tabla from '~/components/organism/Table/Tabla.vue';
const varView = useVarView();
const tablaConfigurada = ref(null);
const datosTabla = ref([])
function crearTabla() {
    varView.showCrearTabla = true
};

function recibirTabla(tabla) {
  tablaConfigurada.value = tabla;
  console.log(tabla)
  datosTabla.value = tabla.datos.content
  varView.showCrearTabla = false; // Oculta el formulario si quieres
}

</script>

<template>
    <div class="bg-gray-100 dark:bg-gray-900 flex flex-col items-center h-[100%] py-10">
        <h2 class="text-2xl font-bold text-gray-700">Seccion Reportes en desarrollo...</h2>
        <div class="w-full flex justify-end px-10">
            <button @click="crearTabla" class="p-3 bg-blue-500 rounded-2xl text-white hover:bg-blue-600">Crear Tabla</button>
        </div>
        <div class="w-full px-10 my-5">
        <Tabla v-if="tablaConfigurada" :Propiedades="tablaConfigurada" />
    </div>
    </div>
    <CrearTabla v-if="varView.showCrearTabla" @tabla-creada="recibirTabla"/>
</template>