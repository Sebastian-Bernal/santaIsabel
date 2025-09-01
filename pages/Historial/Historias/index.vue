<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import Ingresar from '~/components/Forms/Historia/Ingresar.vue';
import Paso2 from '~/components/Forms/Historia/Paso2.vue';
import Paso3 from '~/components/Forms/Historia/Paso3.vue';
import Paso4 from '~/components/Forms/Historia/Paso4.vue';
import VerHistoria from '~/components/Forms/Historia/VerHistoria.vue';

import { ref, onMounted } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';
import { useHistoriaBuilder } from '~/build/Historial/useHistoriaBuilder';
import { useVarView } from "~/stores/varview.js";
import { ComponenteBuilder } from '~/composables/Formulario/ClassFormulario';
import { TablaBuilder } from '~/composables/Formulario/ClassTablas';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { CIE10 } from '~/data/CIE10';

const varView = useVarView();
const historiasStore = useHistoriasStore();

const historiasList = ref([]);
const historia = ref([]);
const refresh = ref(1);
const onlyWatch = ref(true);
const show = ref(false);
const pacientesStore = usePacientesStore();
const pacientesList = ref([])

async function llamadatos(){
    const datos = await historiasStore.datosHistoria
    historiasList.value = datos
}

watch(() => varView.showPaso4, async()=>{
    await llamadatos()
    refresh.value++
})

// Cargar los pacientes desde el store
onMounted(async() => {
    varView.cargando = true
    pacientesList.value = await pacientesStore.listPacientes;
    const permisosStore = JSON.parse(sessionStorage.getItem("Permisos")) || [];
    onlyWatch.value = permisosStore.includes('Historia')
    await llamadatos()
    varView.cargando = false
});

// funcion para controlar la visibilidad del formulario de nueva historia clinica
const agregarHistoria = () => {
    show.value = true
    // varView.showNuevaHistoria = true
};


const verHistoria = (his) => {
    historia.value = his;
    varView.showVerHistoria = true
};

function cerrar () {
    show.value = false
}

function seleccionarPaciente(){

}

function validarCampo(){
    console.log('campo')
}

const propiedadesForm = useHistoriaBuilder({
    storeId: 'RegistrarHistoria',
    cerrarModal: cerrar,
    show: show,
    tipoFormulario: 'Wizard',
    PacientesList: pacientesList,
    seleccionarPaciente: seleccionarPaciente,
    CIE10: CIE10,
    validarCampo,
    seleccionarCIE_10: () => {}
});

// const builderCitas = new CitasBuilder()
const tablaBuilder = new TablaBuilder()
const pagina = new ComponenteBuilder()

const propiedades = pagina
    .setFondo('FondoDefault')
    .setEstilos('')
    .setContenedor('w-full')
        .addComponente('Tabla', tablaBuilder
            .setColumnas([
                { titulo: 'cedula', value: 'Cédula', tamaño: 100, ordenar: true },
                { titulo: 'paciente', value: 'Paciente', tamaño: 250, ordenar: true },
                { titulo: 'estado', value: 'Estado', tamaño: 150 },
            ])
            .setHeaderTabla({ titulo: 'Gestion de Historias Clinicas', descripcion: 'Administra y consulta información sobre historias clinicas', color: 'bg-[var(--color-default)] text-white', accionAgregar: agregarHistoria })
            .setAcciones({ icons: [ {icon: 'ver', action: agregarHistoria} ], botones: true, })
            .setDatos(historiasList)
        )
        .addComponente('Form', propiedadesForm)
    .build()
    console.log(propiedades)

</script>

<template>
    <Pagina :Propiedades="propiedades"/>

    <Ingresar v-if="varView.showNuevaHistoria" />
    <Paso2 v-if="varView.showPaso2" />
    <Paso3 v-if="varView.showPaso3" />
    <Paso4 v-if="varView.showPaso4" />
    <VerHistoria v-if="varView.showVerHistoria" :historia="historia" />
</template>