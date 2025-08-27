<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import IngresarProfesional from '~/components/Forms/Profesionales/IngresarProfesional.vue';
import IngresarUsuario from '~/components/Forms/Profesionales/IngresarUsuarioProfesional.vue';
import ModificarProfesional from '~/components/Forms/Profesionales/ModificarProfesional.vue';
// Data
import { ref, onMounted } from 'vue';
import { municipios } from '~/data/municipios.js'
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico.js';
import { ComponenteBuilder } from '~/composables/Formulario/ClassFormulario';
import { TablaBuilder } from '~/composables/Formulario/ClassTablas';
import { storeToRefs } from 'pinia';
import { useUserProfesionalBuilder } from '~/build/useUserProfesional';

const varView = useVarView();
const medicosStore = useMedicosStore();
const nuevoProfesionalStore = medicosStore.createForm("NuevoProfesional");
const { listMedicos } = storeToRefs(medicosStore);
const medicos = ref([]);
const refresh = ref(1);
const show = ref(false)

async function llamadatos () {
    medicos.value= await listMedicos.value;
}

watch(()=> varView.showNuevoProfesionalPaso2, async()=>{
    llamadatos()
    refresh.value++
})

watch(()=> varView.showModificarProfesional, async()=>{
    llamadatos()
    refresh.value++
})

// Cargar los Medicos desde el store
onMounted(async () => {
    varView.cargando = true
    await llamadatos()
    varView.cargando = false
});

// Variable para controlar la visibilidad del formulario de ingreso de profesional
const medicoDatos = ref(false);

const modificarMedico = (medico) => {
    varView.showModificarProfesional = true;
    medicoDatos.value = medico;
};

// Formulario
const {
    formData,
    traerDatos,
    guardarDatos,
    validarform,
    limpiar,
    estado,
} = nuevoProfesionalStore;

const agregarMedico = () => {
    varView.showNuevoPaciente = true;
    show.value = true;
};

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

const propiedadesUser = useUserProfesionalBuilder({
    validarform,
    traerDatos,
    guardarDatos,
    cerrarModal: cerrar,
    show : show,
    tipoFormulario: 'Wizard',
    buscarUsuario,
    departamentos: municipios.departamentos,
    seleccionarDepartamento,
    EPS: [],
});

// Construccion de pagina
const builderTabla = new TablaBuilder()
const pagina = new ComponenteBuilder()

const propiedades = pagina
    .setFondo('FondoDefault')
    .setLayout('')
    .setContenedor('w-full')
    .addComponente('Tabla', builderTabla
        .setColumnas([
        { titulo: 'name', value: 'Nombre', tamaño: 200},
        { titulo: 'No_document', value: 'Documento', ordenar: true, tamaño: 100},
        { titulo: 'profesion', value: 'Profesión', tamaño: 100},
        { titulo: 'celular', value: 'Celular', tamaño: 100},
        { titulo: 'zona', value: 'Zona', tamaño: 50},
        { titulo: 'municipio', value: 'Municipio', tamaño: 150}
    ])
        .setHeaderTabla({titulo: 'Gestion de Profesionales de Medicina', descripcion: 'Administra y consulta información de Medicos', color: 'bg-[var(--color-default)] text-white', accionAgregar: agregarMedico})
        .setAcciones({ icons: [{icon: 'ver', action: modificarMedico}], botones: true })
        .setDatos(medicos)
    )
    .addComponente('Form', propiedadesUser)
    .build()
    console.log(propiedades)
</script>
<template>
    <Pagina :Propiedades="propiedades"/>
    <IngresarUsuario v-if="varView.showNuevoProfesional" />
    <IngresarProfesional v-if="varView.showNuevoProfesionalPaso2" />
    <ModificarProfesional v-if="varView.showModificarProfesional" :medico="medicoDatos" />
</template>