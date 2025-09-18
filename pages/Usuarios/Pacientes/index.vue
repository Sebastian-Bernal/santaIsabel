<script setup>
import Pagina from "~/components/organism/Pagina/Pagina.vue";

import { ref, onMounted, watch } from "vue";
import { usePacientesStore } from "~/stores/Formularios/paciente/Paciente.js";
import { useUsersStore } from "~/stores/Formularios/usuarios/Users.js";
import { useVarView } from "../../stores/varview.js";
import { storeToRefs } from "pinia";
import { ComponenteBuilder } from "~/build/Constructores/ClassFormulario.js";
import { TablaBuilder } from "~/build/Constructores/ClassTablas.js";
import { useUserBuilder } from "~/build/Usuarios/useUserFormBuilder.js";
import { municipios } from "~/data/municipios.js";
import { useDatosEPSStore } from "~/stores/Formularios/empresa/EPS.js";
import { mapCampos } from "~/components/organism/Forms/useFormulario.js";
import { CIE10 } from "~/data/CIE10";
import { PdfBuilder } from "~/build/Constructores/PDFBuilder.js";

const varView = useVarView();
const pacientesStore = usePacientesStore();
const usuariosStore = useUsersStore()
const epsStore = useDatosEPSStore();
const opcionesEPS = ref([]);
const { listPacientes } = storeToRefs(pacientesStore);
const pacientes = ref([]);
const refresh = ref(1);
const activePdfPaciente = ref(false)
const propiedadesPDF = ref({})

const show = ref(false);
const showVer = ref(false);

async function llamadatos() {
    pacientes.value = await listPacientes.value;
}

// Refrescar pagina cuando se agrega o modifica Paciente
watch(() => show.value,
    async () => {
        await llamadatos();
        refresh.value++;
    }
);

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true;
    await llamadatos();
    // await pacientesStore.indexDBDatos()
    const EPS = await epsStore.listEPS;

    opcionesEPS.value = await EPS.map((eps) => ({
        text: eps.nombre,
        value: eps.id,
    }));

    varView.cargando = false;
});

// Funciones para manejar la visibilidad de los formularios
const agregarPaciente = () => {
    show.value = true;
};

const verPaciente = (paciente) => {
    mapCampos(paciente, pacientesStore.Formulario)
    pacientesStore.Formulario.Paciente.id = paciente.id_paciente
    pacientesStore.Formulario.User.id = paciente.id
    showVer.value = true;
};

// Formulario
function cerrar() {
    show.value = false;
    showVer.value = false;
    varView.soloVer = true
}

async function buscarUsuario(event) {
    const document = event.target.value
    const usuarios = await usuariosStore.listUsers

    const usuarioExistente = usuarios.filter((user) => {
        return user.No_document === document
    });

    if (usuarioExistente[0]) {
        mapCampos(usuarioExistente[0], pacientesStore.Formulario)
    }

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

function exportarPDF(data) {
    propiedadesPDF.value = { ...data, }
    activePdfPaciente.value = true
}

const camposRequeridos = ['InformacionUser.No_document', 'InformacionUser.name', 'Paciente.Regimen', 'Paciente.genero', 'Paciente.poblacionVulnerable', 'Paciente.sexo']

const propiedadesUser = useUserBuilder({
    storeId: "NuevoPaciente",
    storePinia: "Pacientes",
    camposRequeridos,
    cerrarModal: cerrar,
    show: show,
    tipoFormulario: "Wizard",
    buscarUsuario,
    departamentos: municipios.departamentos,
    seleccionarDepartamento: () => { },
    municipios: municipiosOptions,
    seleccionarMunicipio: () => { },
    EPS: opcionesEPS,
    agregarDiagnostico: () => { },
    seleccionarCIE_10,
    CIE10: CIE10,
    tipoUsuario: "Paciente",
});

// Construccion de pagina

const propiedades = computed(() => {
    const builderTabla = new TablaBuilder();
    const pagina = new ComponenteBuilder();
    const pacientePDF = new PdfBuilder();

    const propiedadesVerUser = useUserBuilder({
        storeId: "ModificarPaciente",
        storePinia: "Pacientes",
        camposRequeridos,
        cerrarModal: cerrar,
        show: showVer,
        tipoFormulario: "Wizard",
        buscarUsuario,
        departamentos: municipios.departamentos,
        seleccionarDepartamento: () => { },
        municipios: municipiosOptions,
        seleccionarMunicipio: () => { },
        EPS: opcionesEPS,
        agregarDiagnostico: () => { },
        seleccionarCIE_10: () => { },
        CIE10: CIE10,
        verUser: true,
        soloVer: varView.soloVer,
        tipoUsuario: "Paciente",
    });

    return pagina
        .setFondo("FondoDefault")
        .setEstilos("")
        .setLayout("")
        .setContenedor("w-full")
        .addComponente(
            "Tabla",
            builderTabla
                .setColumnas([
                    { titulo: "name", value: "Nombre", tamaño: 150, ordenar: true },
                    { titulo: "No_document", value: "Documento", tamaño: 100, ordenar: true },
                    { titulo: "municipio", value: "Ciudad", tamaño: 150 },
                    { titulo: "genero", value: "Genero", tamaño: 100 },
                    { titulo: "celular", value: "Celular", tamaño: 100 },
                    { titulo: "Eps", value: "EPS", tamaño: 150, ordenar: true },
                ])
                .setHeaderTabla({
                    titulo: "Gestion de Pacientes",
                    descripcion: "Administra y consulta información de pacientes",
                    color: "bg-[var(--color-default)] text-white",
                    accionAgregar: agregarPaciente,
                    buscador: true,
                    excel: true,
                    filtros: [
                        { columna: 'municipio', placeholder: 'Ciudad', },
                        { columna: 'Eps', placeholder: 'EPS', },
                    ]
                })
                .setAcciones({
                    icons: [{ icon: "ver", action: verPaciente }, { icon: "download", action: exportarPDF }],
                    botones: true,
                })
                .setDatos(pacientes)
        )
        .addComponente("Form", propiedadesUser)
        .addComponente("Form", propiedadesVerUser)
        .addComponente("PDFTemplate", pacientePDF
            .setElementId('Paciente')
            .setIsActive(activePdfPaciente)
            .setFileName(`paciente_${propiedadesPDF.value.name}`)
            .addComponente('Titulo', {
                texto: 'Paciente'
            })
            .addComponente('Tabla', {
                columnas: ['Nombre y Apellidos', 'Fecha de nacimiento', 'Edad', 'Sexo', 'Tipo de documento', 'No. Documento'],
                filas: [
                    [`${propiedadesPDF.value.name}`, `${propiedadesPDF.value.nacimiento}`,
                    `${propiedadesPDF.value.nacimiento}`, `${propiedadesPDF.value.sexo}`,
                    `${propiedadesPDF.value.type_doc}`, `${propiedadesPDF.value.No_document}`,],
                ],
            })
            .addComponente('Tabla', {
                columnas: ['Direccion', 'Barrio'],
                filas: [
                    [`${propiedadesPDF.value.direccion}`, `${propiedadesPDF.value.barrio}`,],
                ],
            })
            .addComponente('Tabla', {
                columnas: ['Municipio', 'Zona', 'Celular', 'Telefono'],
                filas: [
                    [`${propiedadesPDF.value.municipio}`, `${propiedadesPDF.value.zona}`, `${propiedadesPDF.value.celular}`, `${propiedadesPDF.value.telefono}`],
                ],
            })
            .addComponente('Tabla', {
                columnas: ['EPS', 'Regimen', 'Poblacion Vulnerable',],
                filas: [
                    [`${propiedadesPDF.value.Eps}`, `${propiedadesPDF.value.Regimen}`, `${propiedadesPDF.value.poblacionVulnerable}`],
                ],
            })
            .addComponente('Espacio', {
                alto: 24
            })
            .addComponente('Imagen', {
                src: 'https://play-lh.googleusercontent.com/Yk1bwaX-O7BZbScyAIExW-Ktljt9ZIMwhTrcZ7DtA99TYGPKv8VCUDTfyxKpRQs8YxMf=w600-h300-pc0xffffff-pd',
                tamaño: 'w-[35px]'
            })
            .addComponente('Firma', {
                nombre: 'Camilo Jaramillo'
            })
        )
        .build();
});



</script>

<template>
    <Pagina :Propiedades="propiedades" />
</template>
