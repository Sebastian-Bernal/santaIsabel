<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { ref, onMounted, watch } from 'vue';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';
import { useVarView } from '../../stores/varview.js';
import { storeToRefs } from 'pinia';
import { ComponenteBuilder } from '~/composables/Formulario/ClassFormulario';
import { TablaBuilder } from '~/composables/Formulario/ClassTablas';
import { useUserBuilder } from '~/build/Usuarios/useUserFormBuilder.js';
import { municipios } from '~/data/municipios.js'
import { useDatosEPSStore } from "~/stores/Formularios/empresa/EPS.js";
import { CIE10 } from '~/data/CIE10';

const varView = useVarView();
const pacientesStore = usePacientesStore();
const epsStore = useDatosEPSStore();
const opcionesEPS = ref([])
const { listPacientes } = storeToRefs(pacientesStore);
const pacientes = ref([]);
const refresh = ref(1)
const show = ref(false)
const showVer = ref(false)

async function llamadatos() {
    pacientes.value = await listPacientes.value;
}
// Refrescar pagina cuando se agrega o modifica Paciente
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

    const EPS = await epsStore.listEPS
    opcionesEPS.value = await EPS.map(eps => ({
        text: eps.nombre,
        value: eps.nombre
    }));

    varView.cargando = false
});

// Variable para controlar la visibilidad del formulario de ingreso de paciente
const pacienteDatos = ref({});

// Funciones para manejar la visibilidad de los formularios
const agregarPaciente = () => {
    show.value = true;
};

const verPaciente = (paciente) => {
    showVer.value = true;
    pacienteDatos.value = paciente;

};


// Formulario
function cerrar() {
    show.value = false
    showVer.value = false
}

function buscarUsuario() {
    console.log('buscar usuario')
}

function seleccionarDepartamento(item) {
    // formData.InformacionUser.departamento = item.nombre;
}

function seleccionarCIE_10(item) {
    // formData.Diagnosticos.push({
    //     id: '',
    //     CIE_10: item.description,
    //     codigo: item.code
    // });
}

const propiedadesUser = useUserBuilder({
    storeId: 'NuevoPaciente',
    cerrarModal: cerrar,
    show: show,
    tipoFormulario: 'Wizard',
    buscarUsuario,
    departamentos: municipios.departamentos,
    seleccionarDepartamento,
    EPS: opcionesEPS,
    agregarDiagnostico: () => { },
    seleccionarCIE_10,
    CIE10: CIE10,
    tipoUsuario: 'Paciente'
});

const propiedadesVerUser = reactive(
    useUserBuilder({
        storeId: 'ModificarPaciente',
        cerrarModal: cerrar,
        show: showVer,
        tipoFormulario: 'Wizard',
        buscarUsuario,
        departamentos: municipios.departamentos,
        seleccionarDepartamento,
        EPS: opcionesEPS.value,
        agregarDiagnostico: () => { },
        seleccionarCIE_10,
        CIE10: CIE10,
        verUser: true,
        User: pacienteDatos.value
    })
);


// Construccion de pagina

const builderTabla = new TablaBuilder()
const pagina = new ComponenteBuilder()

const propiedades = pagina
    .setFondo('FondoDefault')
    .setEstilos('')
    .setLayout('')
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
        .setAcciones({ icons: [{ icon: 'ver', action: verPaciente }], botones: true })
        .setDatos(pacientes)
    )
    .addComponente('Form', propiedadesUser)
    .addComponente('Form', toRaw(propiedadesVerUser))
    .build()

</script>

<template>
    <Pagina :Propiedades="toRaw(propiedades)" />
    <!-- <ModificarPaciente v-if="varView.showModificarPaciente" :paciente="pacienteDatos" /> -->
</template>