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
import { usePacienteActions } from "~/composables/Usuarios/Paciente.js";
import { usePlanesBuilder } from "~/build/Historial/usePlanesBuilder.js";
import { useInsumosStore } from "~/stores/Formularios/insumos/Insumos.js";
import { validarYEnviarKardex } from "~/Core/Usuarios/Paciente/POSTKardex.js";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const pacientesStore = usePacientesStore();
const apiRest = useApiRest()
const insumoStore = useInsumosStore();

const epsStore = useDatosEPSStore();
const opcionesEPS = ref([]);
const pacientes = ref([]);
const kardex = ref([]);
const insumos = ref([]);
const refresh = ref(1);

const show = ref(false);
const showVer = ref(false);
const showItem = ref(false);

const {
    validarFecha,
    validarTipoDoc,
    buscarUsuarioPorDocumento,
    municipiosOptions
} = useUsuarioValidaciones(pacientesStore.Formulario);

async function llamadatos() {
    pacientes.value = await pacientesStore.listPacientes(true);
    varView.datosActualizados()
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
    pacientes.value = await pacientesStore.listPacientes(false);
    await llamadatos();
    const EPS = await epsStore.listEPS(false);
    opcionesEPS.value = await EPS.map((eps) => ({
        text: eps.nombre,
        value: eps.id,
    }));
    insumos.value = await insumoStore.listInsumos();

    await apiRest.getData('Antecedentes', 'antecedentes')
    await apiRest.getData('Plan_manejo_procedimientos', 'planManejoProcedimientos')
    kardex.value = await apiRest.getData('', 'traeKardex')
    console.log(kardex.value)
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
    const puedediagnosticar = varView.getPermisos.includes('Diagnosticos_view');

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

    const propiedadesItemHistoria = usePlanesBuilder({
        storeId: 'AgregarPlan',
        storePinia: 'Historias',
        cerrarModal: () => {
            showItem.value = false
        },
        formularioItem: 'Medicamento',
        show: showItem,
        insumos,
    })

    // Tabla de pacientes
    builderTabla
        .setColumnas([
            { titulo: "No_document", value: "Documento", tamaño: 120, ordenar: true },
            { titulo: "name", value: "Nombre", tamaño: 250, ordenar: true },
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
    const acciones = [];
    if (puedePut) {
        acciones.push({ icon: "ver", action: verPaciente });
        // acciones.push({ icon: "download", action: exportarPDF });
    }

    if(puedediagnosticar) {
        acciones.push({ icon: "agregar", action: (fila) => {
            showItem.value = true
            varView.tipoHistoria = 'Medicamento'
            pacientesStore.PacienteSeleccionado = fila.id_paciente
        } });
    }

    if (acciones.length > 0) {
        builderTabla.setAcciones({ icons: acciones, botones: true });
    }

    builderTablaKardex
        .setColumnas([
            { titulo: "No_document", value: "DOCUMENTO", tamaño: 120, ordenar: true, pinned: true },
            { titulo: "name", value: "NOMBRE", tamaño: 200, ordenar: true, pinned: true },
            { titulo: "Eps", value: "EPS", tamaño: 200, ordenar: true, pinned: true },
            { titulo: "type_doc", value: "TIPO DOC", tamaño: 100 },
            { titulo: "celular", value: "N. Tel", tamaño: 150 },
            { titulo: "direccion", value: "DIRECCION", tamaño: 100 },
            { titulo: "barrio", value: "Barrio", tamaño: 130 },
            { titulo: "nacimiento", value: "Fecha Nto", tamaño: 100 },
            { titulo: "municipio", value: "Municipio Atencion", tamaño: 130 },
            { titulo: "regimen", value: "Regimen", tamaño: 150 },
            { titulo: "diagnostico", value: "Diagnostico", tamaño: 160 },
            // { titulo: "correo", value: "Correo", tamaño: 100 },
            // { titulo: "fecha", value: "Fecha Inicio", tamaño: 100 },
            { titulo: "kit_cateterismo", value: "Kit Cateterismo", tamaño: 180, },
            { titulo: "kit_cambioSonda", value: "Kit sonda", tamaño: 180, },
            { titulo: "kit_gastro", value: "Kit gastro", tamaño: 180, },
            { titulo: "traqueo", value: "Traqueo", tamaño: 180, },
            { titulo: "equipos_biomedicos", value: "Equipos Biomedicos", tamaño: 180, },
            { titulo: "oxigeno", value: "Oxigeno", tamaño: 180, },
            { titulo: "vm", value: "VM", tamaño: 180, },
            { titulo: "estado", value: "Estado", tamaño: 180, },
            { titulo: "cuidadores", value: "Cuidadores", tamaño: 180, },
            { titulo: "fecha_ultima_visita", value: "Fecha ultima visita medica", tamaño: 180, },
            // { titulo: "mes", value: "Mes", tamaño: 180, },
            { titulo: "terapia_respiratoria", value: "TR", tamaño: 180, },
            { titulo: "terapeuta_respiratoria", value: "Terapeuta Respiratoria", tamaño: 180, },
            { titulo: "terapia_fisica", value: "TF", tamaño: 180, },
            { titulo: "terapeuta_fisica", value: "Terapeuta Fisico", tamaño: 180, },
            { titulo: "terapia_fonoaudiologia", value: "TFO", tamaño: 180, },
            { titulo: "terapeuta_fonoaudiologia", value: "Terapeuta Fonoaudiologia", tamaño: 180, },
            { titulo: "terapia_ocupacional", value: "TO", tamaño: 180, },
            { titulo: "terapeuta_ocupacional", value: "Terapeuta Ocupacional", tamaño: 180, },
            { titulo: "TEO_cantidad", value: "TEO Cantidad", tamaño: 180, },
            { titulo: "profesional_nutricionista", value: "Nutricionista", tamaño: 180, },
            { titulo: "nutricionista", value: "Control Nutricion", tamaño: 180, },
            { titulo: "VPSico", value: "VPSico", tamaño: 180, },
            { titulo: "psicologia", value: "Control Psicologia", tamaño: 180, },
            { titulo: "trabajo_social", value: "T social", tamaño: 180, },
            { titulo: "profesional_trabajo_social", value: "Control T social", tamaño: 180, },
            { titulo: "guia_espiritual", value: "Guia Espiritual", tamaño: 180, },
            { titulo: "complejidad", value: "Complejidad", tamaño: 180, },
            { titulo: "tipoHerida", value: "Tipo de Herida", tamaño: 180, },
            { titulo: "profesionalTEO", value: "Profesional TEO", tamaño: 180, },
            { titulo: "observacionTeo", value: "Observacion TEO", tamaño: 180, },
            { titulo: "enfermeriaJefe", value: "Enfermeria Jefe", tamaño: 180, },
            { titulo: "internista", value: "Medico Internista", tamaño: 180, },
            { titulo: "control", value: "Control M/ Internista", tamaño: 180, },
            { titulo: "fisiatra", value: "Medico Fisiatra", tamaño: 180, },
            { titulo: "fisiatria", value: "Control de Fisitria", tamaño: 180, },
            { titulo: "familiar", value: "Medicina Familiar", tamaño: 180, },
            { titulo: "controlFamiliar", value: "Control Medicina Familiar", tamaño: 180, },
            { titulo: "enfermeria", value: "Auxiliar de Enfermeria", tamaño: 180, },
            { titulo: "admon", value: "ADMON MTOS", tamaño: 180, },
            { titulo: "laboratorio", value: "Orden de laboratorio", tamaño: 180, },
            { titulo: "resultado", value: "Fecha de resultado", tamaño: 180, },
            { titulo: "pagor", value: "Pago como rural", tamaño: 180, },
            { titulo: "llama", value: "Fecha de la llamada y hora", tamaño: 180, },
            { titulo: "observacion", value: "Observacion", tamaño: 180, },
        ])
        .setHeaderTabla({
            titulo: "Kardex Cronicos",
            descripcion: "Administra y consulta información de pacientes",
            color: "bg-[var(--color-default)] text-white",
            excel: true,
            buscador: true,
            filtros: [
                { columna: 'municipio', placeholder: 'Ciudad' },
                { columna: 'Eps', placeholder: 'EPS' },
            ]
        })
        .setDatos(kardex)
        .setConfiguracion({
            tipo: 'pinned',
            camposEditables: true,
            onUpdate: async (fila) => {
                console.log(fila)
                    try {
                        await validarYEnviarKardex(fila);
                        console.log('Kardex actualizado correctamente');
                    } catch (error) {
                    }
            }
        });

    // Construcción de la página
    pagina
        .setFondo("FondoDefault")
        .setEstilos("")
        .setLayout("")
        .setContenedor("w-full")
    if (varView.getRol === 'Admin') {
        pagina
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
            
            .addComponente("Tabla", builderTabla)
            .addComponente("Tabla", builderTablaKardex)
        }
    }
    else {
        pagina
            .addComponente("Tabla", builderTabla);
    }

    if (propiedadesUser) pagina.addComponente("Form", propiedadesUser);
    if (propiedadesVerUser) pagina.addComponente("Form", propiedadesVerUser);
    if (propiedadesItemHistoria) pagina.addComponente("Form", propiedadesItemHistoria);

    return pagina.build();

});

</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
</template>
