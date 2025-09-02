<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
// Data
import { ref, onMounted } from 'vue';
import { municipios } from '~/data/municipios.js'
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales.js';
import { ComponenteBuilder } from '~/composables/Formulario/ClassFormulario';
import { TablaBuilder } from '~/composables/Formulario/ClassTablas';
import { storeToRefs } from 'pinia';
import { useUserBuilder } from '~/build/Usuarios/useUserFormBuilder';

const varView = useVarView();
const medicosStore = useMedicosStore();
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
const agregarMedico = () => {
    show.value = true;
};
function cerrar() {
    show.value = false
}

function buscarUsuario () {
    console.log('buscar usuario')
}

function seleccionarDepartamento (item) {
    // formData.InformacionUser.departamento = item.nombre;
}

const propiedadesUser = useUserBuilder({
    storeId: 'NuevoProfesional',
    storePinia: 'Profesionales',
    cerrarModal: cerrar,
    show: show,
    tipoFormulario: 'Wizard',
    buscarUsuario,
    departamentos: municipios.departamentos,
    seleccionarDepartamento,
    tipoUsuario: 'Profesional'
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
</template>