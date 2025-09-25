<script setup>
import Pagina from "~/components/organism/Pagina/Pagina.vue";

import { ref, onMounted, } from "vue";
import { usePacientesStore } from "~/stores/Formularios/paciente/Paciente.js";
import { storeToRefs } from "pinia";
import { ComponenteBuilder } from "~/build/Constructores/ClassFormulario.js";
import { useUserBuilder } from "~/build/Usuarios/useUserFormBuilder.js";
import { municipios } from "~/data/municipios.js";
import { useDatosEPSStore } from "~/stores/Formularios/empresa/EPS.js";
import { useUsersStore } from "~/stores/Formularios/usuarios/Users";
import { mapCampos } from "./organism/Forms/useFormulario";
import { CIE10 } from "~/data/CIE10";

const varView = useVarView();
const pacientesStore = usePacientesStore();
const usuariosStore = useUsersStore();
const epsStore = useDatosEPSStore();
const opcionesEPS = ref([]);
const { listPacientes } = storeToRefs(pacientesStore);
const pacientes = ref([]);

const props = defineProps(['showPaciente']);

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

function cerrar() {
  varView.showNuevoPaciente = false
}

async function buscarUsuario (event) {
    const document = event.target.value
    const usuarios = await usuariosStore.listUsers

    const usuarioExistente = usuarios.filter((user) => {
        return user.No_document === document
    });

    if(usuarioExistente[0]){
        mapCampos(usuarioExistente[0], pacientesStore.Formulario)
    }

}

const municipiosOptions = computed(() => {
    const departamentoSeleccionado = pacientesStore.Formulario.InformacionUser.departamento;

    const departamento = municipios.departamentos.find(dep => dep.nombre.toUpperCase() === departamentoSeleccionado.toUpperCase());

    return departamento ? departamento.municipios : [];
});


const camposRequeridos = ['InformacionUser.No_document', 'InformacionUser.name', 'Paciente.Regimen', 'Paciente.genero', 'Paciente.poblacionVulnerable', 'Paciente.sexo']

// Construccion de pagina

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder();

    const propiedadesUser = useUserBuilder({
        storeId: "NuevoPaciente",
        storePinia: "Pacientes",
        camposRequeridos,
        cerrarModal: cerrar,
        show: varView.showNuevoPaciente,
        tipoFormulario: "Wizard",
        buscarUsuario,
        departamentos: municipios.departamentos,
        seleccionarDepartamento: () => {},
        municipios: municipiosOptions,
        seleccionarMunicipio: () => { },
        EPS: opcionesEPS,
        agregarDiagnostico: () => { },
        seleccionarCIE_10: () => {},
        CIE10: CIE10,
        tipoUsuario: "Paciente",
    });

    return pagina
        .setFondo('FondoDefault')
        .addComponente("Form", propiedadesUser)
        .build();
});

</script>

<template>
    <Pagina :Propiedades="propiedades" />
</template>
