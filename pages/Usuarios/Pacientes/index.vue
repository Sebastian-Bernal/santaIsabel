<script setup>
import Pagina from "~/components/organism/Pagina/Pagina.vue";

import { ref, onMounted, watch } from "vue";
import { usePacientesStore } from "~/stores/Formularios/paciente/Paciente.js";
import { useVarView } from "../../stores/varview.js";
import { ComponenteBuilder } from "~/build/Constructores/ComponentesBuilder.js";
import { TablaBuilder } from "~/build/Constructores/TablaBuilder.js";
import { useUserBuilder } from "~/build/Usuarios/useUserFormBuilder.js";
import { municipios } from "~/data/municipios.js";
import { useDatosEPSStore } from "~/stores/Formularios/empresa/EPS.js";
import { CardBuilder } from "~/build/Constructores/CardBuilder.js";
import { useUsuarioValidaciones } from "~/composables/Usuarios/Usuarios.js";
import { usePacienteActions } from "~/composables/Usuarios/Paciente/Paciente.js";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const pacientesStore = usePacientesStore();
const apiRest = useApiRest()

const epsStore = useDatosEPSStore();
const opcionesEPS = ref([]);
const pacientes = ref([]);
const refresh = ref(1);

const show = ref(false);
const showVer = ref(false);

const {
    validarFecha,
    validarTipoDoc,
    buscarUsuarioPorDocumento,
    municipiosOptions
} = useUsuarioValidaciones(pacientesStore.Formulario);

async function llamadatos() {
    varView.cargando = true
    pacientes.value = await pacientesStore.listPacientes(true);
    varView.cargando = false
}

const {
    agregarPaciente,
    verPaciente,
    cerrar,
    eliminarPaciente
} = usePacienteActions({
    pacientesStore,
    varView,
    notificaciones,
    llamadatos,
    refresh,
    show,
    showVer
});


// Refrescar pagina cuando se agrega o modifica Paciente
watch(() => show.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos();
            await apiRest.getData('Plan_manejo_procedimientos', 'planManejoProcedimientos')
            await apiRest.getData('Antecedentes', 'antecedentes')
            refresh.value++;
        }
    }
);

watch(() => showVer.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos();
            await apiRest.getData('Plan_manejo_procedimientos', 'planManejoProcedimientos')
            await apiRest.getData('Antecedentes', 'antecedentes')
            refresh.value++;
        }
    }
);

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true;

    await llamadatos();
    const EPS = await epsStore.listEPS(false);
    opcionesEPS.value = await EPS.map((eps) => ({
        text: eps.nombre,
        value: eps.id,
    }));

    await apiRest.getData('Antecedentes', 'antecedentes')
    await apiRest.getData('Plan_manejo_procedimientos', 'planManejoProcedimientos')
    varView.cargando = false;
});

function showKardex() {
    varView.pacienteKardex = !varView.pacienteKardex
}

// Construccion de pagina
const propiedades = computed(() => {
    const builderTabla = new TablaBuilder();
    const builderTablaKardex = new TablaBuilder();
    const pagina = new ComponenteBuilder();

    // Verificar permisos específicos
    const puedeVer = varView.getPermisos.includes('Pacientes_view');
    if (!puedeVer) {
        pagina
            .setFondo('FondoDefault')
            .setEstilos('')
            .setContenedor('w-full')
            .addComponente('Card', new CardBuilder()
                .setCards(
                    [
                        {
                            header: {
                                html: `<div class="flex flex-col items-center justify-center h-full text-gray-500">
                                <i class="fa-solid fa-user-lock text-6xl mb-4"></i>
                                <h2 class="text-lg font-semibold">Acceso restringido</h2>
                                <p class="text-sm text-center">
                                    No tienes permisos para acceder a este módulo.
                                </p>
                                </div>`,
                            },
                        },
                        {

                        },
                        {

                        }
                    ]
                )
                .setcontenedorCards('flex flex-col')
                .setContenedor('w-full')
                .setTamaño('flex sm:flex-row justify-center items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200')
                .setheaderTitle('Gestión de Pacientes')
                .setheaderHtml(`<a href="/Home" class="text-base text-blue-500 hover:text-blue-700"><i class="fa-solid fa-angle-left mr-1"></i>Volver al Inicio</a>`)
                .build()
            )
        return pagina.build()
    }
    const puedePost = varView.getPermisos.includes('Pacientes_post');
    const puedePut = varView.getPermisos.includes('Pacientes_put');

    // Formulario para crear paciente
    const propiedadesUser = puedePost
        ? useUserBuilder({
            storeId: "NuevoPaciente",
            storePinia: "Pacientes",
            cerrarModal: cerrar,
            show: show,
            tipoFormulario: "Wizard",
            buscarUsuario: buscarUsuarioPorDocumento,
            departamentos: municipios,
            seleccionarDepartamento: () => { },
            municipios: municipiosOptions,
            seleccionarMunicipio: () => { },
            EPS: opcionesEPS,
            agregarDiagnostico: () => { },
            tipoUsuario: "Paciente",
            validarFecha,
            validarTipoDoc,
        })
        : null;

    // Formulario para ver/modificar paciente
    const propiedadesVerUser = puedePut
        ? useUserBuilder({
            storeId: "ModificarPaciente",
            storePinia: "Pacientes",
            cerrarModal: cerrar,
            show: showVer,
            tipoFormulario: "Wizard",
            buscarUsuario: buscarUsuarioPorDocumento,
            departamentos: municipios,
            seleccionarDepartamento: () => { },
            municipios: municipiosOptions,
            seleccionarMunicipio: () => { },
            EPS: opcionesEPS,
            agregarDiagnostico: () => { },
            verUser: true,
            soloVer: varView.soloVer,
            eliminar: eliminarPaciente,
            tipoUsuario: "Paciente",
            validarFecha,
            validarTipoDoc,
        })
        : null;

    // Tabla de pacientes
    builderTabla
        .setColumnas([
            { titulo: "name", value: "Nombre", tamaño: 250, ordenar: true },
            { titulo: "No_document", value: "Documento", tamaño: 120, ordenar: true },
            { titulo: "celular", value: "Celular", tamaño: 100 },
            { titulo: "sexo", value: "Sexo", tamaño: 100 },
            { titulo: "municipio", value: "Ciudad", tamaño: 120 },
            { titulo: "regimen", value: "Regimen", tamaño: 150 },
            { titulo: "vulnerabilidad", value: "Vulnerabilidad", tamaño: 200, ordenar: true },
            { titulo: "Eps", value: "EPS", tamaño: 200, ordenar: true },
        ])
        .setHeaderTabla({
            titulo: "Gestión de Pacientes",
            descripcion: "Administra y consulta información de pacientes",
            color: "bg-[var(--color-default)] text-white",
            accionAgregar: puedePost ? agregarPaciente : null,
            buscador: true,
            excel: true,
            filtros: [
                { columna: 'municipio', placeholder: 'Ciudad' },
                { columna: 'Eps', placeholder: 'EPS' },
            ]
        })
        .setDatos(pacientes)

    builderTablaKardex
        .setColumnas([
            { titulo: "Eps", value: "EPS", tamaño: 200, ordenar: true, pinned: true },
            { titulo: "name", value: "NOMBRE", tamaño: 200, ordenar: true, pinned: true },
            { titulo: "type_doc", value: "TIPO DOC", tamaño: 100, pinned: true },
            { titulo: "No_document", value: "DOCUMENTO", tamaño: 120, ordenar: true, pinned: true },
            { titulo: "celular", value: "N. Tel", tamaño: 150 },
            { titulo: "direccion", value: "DIRECCION", tamaño: 100 },
            { titulo: "barrio", value: "Barrio", tamaño: 130 },
            { titulo: "nacimiento", value: "Fecha Nto", tamaño: 100 },
            { titulo: "municipio", value: "Municipio Atencion", tamaño: 130 },
            { titulo: "regimen", value: "Regimen", tamaño: 150 },
            { titulo: "diagnostico", value: "Diagnostico", tamaño: 160 },
            { titulo: "correo", value: "Correo", tamaño: 100 },
            { titulo: "fecha", value: "Fecha Inicio", tamaño: 100 },
            { titulo: "kitCateterismo", value: "Kit Cateterismo", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Kit sonda", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Kit gastro", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Traqueo", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Equipos Biomedicos", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Oxigeno", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Cuidadores", tamaño: 180, },
            { titulo: "estado", value: "Estado", tamaño: 180, },
            { titulo: "kitCateterismo", value: "VM", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Fecha ultima visita medica", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Mes", tamaño: 180, },
            { titulo: "kitCateterismo", value: "TR", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Terapeuta Respiratoria", tamaño: 180, },
            { titulo: "kitCateterismo", value: "TF", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Terapia Fisico", tamaño: 180, },
            { titulo: "kitCateterismo", value: "TFO", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Terapia Fonoaudiologia", tamaño: 180, },
            { titulo: "kitCateterismo", value: "TO", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Terapia Ocupacional", tamaño: 180, },
            { titulo: "kitCateterismo", value: "TEO Cantidad", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Complejidad", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Tipo de Herida", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Profesional TEO", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Observacion TEO", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Nutricionista", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Nutricionista", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Control Nutricion", tamaño: 180, },
            { titulo: "kitCateterismo", value: "VPSico", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Control Psicologia", tamaño: 180, },
            { titulo: "kitCateterismo", value: "T social", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Control T social", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Guia Espiritual", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Enfermeria Jefe", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Medico Internista", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Control M/ Internista", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Control M/ Internista", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Medico Fisiatra", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Control de Fisiatra", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Medicina Familiar", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Control Medicina Familiar", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Auxiliar de Enfermeria", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Observacion", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Equipos Biomedicos", tamaño: 180, },
            { titulo: "kitCateterismo", value: "ADMON MTOS", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Orden de laboratorio", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Fecha de resultado", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Pago como rural", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Fecha de la llamada y hora", tamaño: 180, },
            { titulo: "kitCateterismo", value: "Observacion", tamaño: 180, },
        ])
        .setHeaderTabla({
            titulo: "Kardex Cronicos",
            descripcion: "Administra y consulta información de pacientes",
            color: "bg-[var(--color-default)] text-white",
        })
        .setDatos(pacientes)
        .setConfiguracion({
            tipo: 'pinned',
            camposEditables: true,
            onUpdate: async (fila) => {
                console.log(fila)
            }
        });

    const acciones = [];
    if (puedePut) {
        acciones.push({ icon: "ver", action: verPaciente });
        // acciones.push({ icon: "download", action: exportarPDF });
    }

    if (acciones.length > 0) {
        builderTabla.setAcciones({ icons: acciones, botones: true });
    }

    // Construcción de la página
    pagina
        .setFondo("FondoDefault")
        .setEstilos("")
        .setLayout("")
        .setContenedor("w-full")
    if (varView.getRol === 'Admin') {

        if (varView.pacienteKardex) {
            pagina
                .setHeaderPage({
                    titulo: 'Gestión información de pacientes',
                    button: [
                        { text: 'Kardex', icon: 'fa-solid fa-table', color: 'bg-blue-700', action: showKardex },
                    ]
                })
                .addComponente("Tabla", builderTablaKardex)
        } else {
            pagina
                .setHeaderPage({
                    titulo: 'Gestión información de pacientes',
                    button: [
                        { text: 'Kardex', icon: 'fa-solid fa-table', color: 'bg-gray-500', action: showKardex },
                    ]
                })
                .addComponente("Tabla", builderTabla);
        }
    }
    else {
        pagina
            .addComponente("Tabla", builderTabla);
    }

    if (propiedadesUser) pagina.addComponente("Form", propiedadesUser);
    if (propiedadesVerUser) pagina.addComponente("Form", propiedadesVerUser);

    return pagina.build();

});

</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
</template>
