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
import { validarYEnviarEliminarPaciente } from "~/Core/Usuarios/Paciente/EliminarPaciente.js";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
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

async function eliminarPaciente() {
    const paciente = pacientesStore.Formulario

    notificaciones.options.icono = 'warning';
    notificaciones.options.titulo = 'Deseas Eliminar Paciente?';
    notificaciones.options.html = `Se eliminará el paciente: <span>${paciente.InformacionUser.name}</span>`;
    notificaciones.options.confirmtext = 'Si, Eliminar'
    notificaciones.options.canceltext = 'Atras'
    const respuestaAlert = await notificaciones.alertRespuesta()
    if (respuestaAlert.estado === 'confirmado') {
        const res = await validarYEnviarEliminarPaciente(paciente)
        if (res) {
            options.position = 'top-end';
            options.texto = "Paciente eliminado con exito.";
            options.background = '#6bc517'
            options.tiempo = 1500
            mensaje()
            options.background = '#d33'
        }
    }
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
        eliminar: eliminarPaciente,
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
            .addComponente('Tabla', {
                container: 'border-b-2 pb-3',
                columnas: ['<div class="flex items-center gap-2"><img src="https://play-lh.googleusercontent.com/Yk1bwaX-O7BZbScyAIExW-Ktljt9ZIMwhTrcZ7DtA99TYGPKv8VCUDTfyxKpRQs8YxMf=w600-h300-pc0xffffff-pd" width="60px"/><p class="w-full text-start text-2xl">Thesalus</p></div>', '<p class="w-full text-end">Fecha de impresion:</p>'],
                filas: [
                    [`Sistema de Historias Clinicas`, `<p class="w-full text-end">19/009/2025</p>`],
                ],
            })
            .addComponente('Texto', {
                texto: 'Informacion del Paciente'
            })
            .addComponente('Tabla', {
                container: 'space-y-2 rounded py-3',
                styles: {
                    backgroundColor: '#DBEAFE',
                },
                filas: [
                    ['<p class="w-full text-start text-xs">Nombres y Apellidos:</p>', '<p class="w-full text-start text-xs">Email:</p>', '<p class="w-full text-start text-xs">Fecha de Nacimiento:</p>'],
                    [`${propiedadesPDF.value.name}`, `${propiedadesPDF.value.correo}`, `${propiedadesPDF.value.nacimiento}`,],
                    ['<p class="w-full text-start text-xs pt-2">Tipo de Documento:</p>', '<p class="w-full text-start text-xs pt-2">Documento:</p>', '<p class="w-full text-start text-xs pt-2">Genero:</p>'],
                    [`${propiedadesPDF.value.type_doc}`, `${propiedadesPDF.value.No_document}`, `${propiedadesPDF.value.sexo}`,],
                    ['<p class="w-full text-start text-xs pt-2">Direccion:</p>', '<p class="w-full text-start text-xs pt-2">Barrio:</p>', '<p class="w-full text-start text-xs pt-2">Zona:</p>'],
                    [`${propiedadesPDF.value.direccion}`, `${propiedadesPDF.value.barrio}`, `${propiedadesPDF.value.zona}`,]
                ],
            })
            .addComponente('Texto', {
                texto: 'Datos Adicionales'
            })
            .addComponente('Tabla', {
                container: 'space-y-2 rounded py-3',
                styles: {
                    backgroundColor: '#DBEAFE',
                },
                filas: [
                    ['<p class="w-full text-start text-xs">Municipio:</p>', '<p class="w-full text-start text-xs">Departamento:</p>', '<p class="w-full text-start text-xs">Telefono:</p>'],
                    [`${propiedadesPDF.value.municipio}`, `${propiedadesPDF.value.departamento}`, `${propiedadesPDF.value.celular}`,],
                    ['<p class="w-full text-start text-xs pt-2">EPS:</p>', '<p class="w-full text-start text-xs pt-2">Regimen:</p>', '<p class="w-full text-start text-xs pt-2">Vulnerabilidad:</p>'],
                    [`${propiedadesPDF.value.Eps}`, `${propiedadesPDF.value.Regimen}`, `${propiedadesPDF.value.poblacionVulnerable}`,],
                ],
            })
            .addComponente('Espacio', {
                alto: 24
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
