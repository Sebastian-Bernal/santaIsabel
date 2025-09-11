<script setup>
import Pagina from "~/components/organism/Pagina/Pagina.vue";

import { ref, onMounted, } from "vue";
import { usePacientesStore } from "~/stores/Formularios/paciente/Paciente.js";
import { storeToRefs } from "pinia";
import { ComponenteBuilder } from "~/build/Constructores/ClassFormulario.js";
import { useUserBuilder } from "~/build/Usuarios/useUserFormBuilder.js";
import { municipios } from "~/data/municipios.js";
import { useDatosEPSStore } from "~/stores/Formularios/empresa/EPS.js";
import { CIE10 } from "~/data/CIE10";

const varView = useVarView();
const pacientesStore = usePacientesStore();
const epsStore = useDatosEPSStore();
const opcionesEPS = ref([]);
const { listPacientes } = storeToRefs(pacientesStore);
const pacientes = ref([]);

const props = defineProps(['showPaciente']);console.log(props.showPaciente)
const show = ref(false);

async function llamadatos() {
    pacientes.value = await listPacientes.value;
}

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true;
    await llamadatos();

    const EPS = await epsStore.listEPS;
    opcionesEPS.value = await EPS.map((eps) => ({
        text: eps.nombre,
        value: eps.nombre,
    }));

    varView.cargando = false;
});

// Formulario
function cerrar() {
    show.value = false;
}

function buscarUsuario() {
    console.log(pacientesStore.Formulario);
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

const municipiosOptions = computed(() => {
    const departamentoSeleccionado = pacientesStore.Formulario.InformacionUser.departamento;

    const departamento = municipios.departamentos.find(dep => dep.nombre.toUpperCase() === departamentoSeleccionado.toUpperCase());

    return departamento ? departamento.municipios : [];
});


const camposRequeridos = ['InformacionUser.No_document', 'InformacionUser.name', 'Paciente.Regimen', 'Paciente.genero', 'Paciente.poblacionVulnerable', 'Paciente.sexo']

const propiedadesUser = useUserBuilder({
    storeId: "NuevoPaciente",
    storePinia: "Pacientes",
    camposRequeridos,
    cerrarModal: cerrar,
    show: true,
    tipoFormulario: "Wizard",
    buscarUsuario,
    departamentos: municipios.departamentos,
    seleccionarDepartamento,
    municipios: municipiosOptions,
    seleccionarMunicipio: () => {},
    EPS: opcionesEPS,
    agregarDiagnostico: () => {},
    seleccionarCIE_10,
    CIE10: CIE10,
    tipoUsuario: "Paciente",
});

// Construccion de pagina

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder();

    return pagina
        .addComponente("Form", propiedadesUser)
        .build();
});

</script>

<template>
    <Pagina :Propiedades="propiedades" />
</template>
