<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
// import Tabla from '../../components/Tables/Tabla.vue';
import IngresarPaciente from '../../components/Forms/Pacientes/IngresarPaciente.vue';
import IngresarUsuario from '~/components/Forms/Pacientes/IngresarUsuario.vue';
import ModificarPaciente from '../../components/Forms/Pacientes/ModificarPaciente.vue';

import { ref, onMounted, watch } from 'vue';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { useVarView } from '../../stores/varview.js';
import { storeToRefs } from 'pinia';
import { ComponenteBuilder, FormularioBuilder } from '~/composables/Formulario/ClassFormulario';
import { TablaBuilder } from '~/composables/Formulario/ClassTablas';
import { useUserBuilder } from '~/build/useUserFormBuilder';
import { usePacientesBuilder } from '~/build/usePacientesFormBuilder';
import { municipios } from '~/data/municipios.js'

const varView = useVarView();
const storePaciente = usePacientesStore();
const pacientesStore = usePacientesStore();
const nuevoPacienteStore = storePaciente.createForm("NuevoPaciente");
const { listPacientes } = storeToRefs(pacientesStore);
const pacientes = ref([]);
const refresh = ref(1)
const show = ref(false)

async function llamadatos() {
    pacientes.value = await listPacientes.value;
}

watch(() => varView.showNuevoPacientePaso2, async () => {
    await llamadatos()
    refresh.value++
})

watch(() => varView.showModificarPaciente, async () => {
    await llamadatos()
    refresh.value++
})
// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await llamadatos()
    varView.cargando = false
});

// Variable para controlar la visibilidad del formulario de ingreso de paciente
const pacienteDatos = ref({});

// Funciones para manejar la visibilidad de los formularios
const agregarPaciente = () => {
    varView.showNuevoPaciente = true;
};

const verPaciente = (paciente) => {
    varView.showModificarPaciente = true;
    pacienteDatos.value = paciente;
    
};

function showForm() {
    console.log('show')
  show.value = true;
}

// Formulario
const {
    formData,
    traerDatos,
    guardarDatos,
    validarform,
    agregarItem,
    eliminarItem,
    limpiar,
    estado,
} = nuevoPacienteStore;

function cerrar() {
    limpiar()
    show.value = false
}

function buscarUsuario () {
    console.log('buscar usuario')
}

function seleccionarDepartamento (item) {
    formData.InformacionUser.departamento = item.nombre;
}

const propiedadesUser = useUserBuilder({
    validarform,
    traerDatos,
    guardarDatos,
    cerrarModal: cerrar,
    show : show,
    tipoFormulario: 'Wizard',
    secciones: [
    { numPagina: 1, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
    { numPagina: 2, color: 'bg-gray-300 dark:bg-gray-500 dark:text-gray-200 text-dark font-bold' },
  ],
    buscarUsuario,
    departamentos: municipios.departamentos,
    seleccionarDepartamento,
});


// Construccion de pagina
const builderTabla = new TablaBuilder()
const pagina = new ComponenteBuilder()

const propiedades = pagina
    .setFondo('FondoDefault')
    .setEstilos('bg-gray-200')
    .setLayout('')
    // .setHeaderPage('Prueba de Pagina Costruida')
    .setContenedor('w-full')
    .addComponente('Tabla', builderTabla
        .setColumnas([
            { titulo: 'name', value: 'Nombre', tamaño: 150, ordenar: true },
            { titulo: 'No_document', value: 'Documento', tamaño: 100, ordenar: true },
            { titulo: 'municipio', value: 'Ciudad', tamaño: 150 },
            { titulo: 'genero', value: 'Genero', tamaño: 100 },
            { titulo: 'celular', value: 'Celular', tamaño: 100 },
            { titulo: 'Eps', value: 'EPS', tamaño: 150, ordenar: true }
        ])
        .setHeaderTabla({ titulo: 'Gestion de Pacientes', descripcion: 'Administra y consulta información de pacientes', color: 'bg-[var(--color-default)] text-white', accionAgregar: agregarPaciente })
        .setAcciones({ icons: [{ icon: 'ver', action: showForm }], botones: true })
        .setDatos(pacientes)
    )
    .addComponente('Form', propiedadesUser)
    .build()

console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades" />
    <IngresarUsuario v-if="varView.showNuevoPaciente" />
    <IngresarPaciente v-if="varView.showNuevoPacientePaso2" />
    <ModificarPaciente v-if="varView.showModificarPaciente" :paciente="pacienteDatos" />
</template>