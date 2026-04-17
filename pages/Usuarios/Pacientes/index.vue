<script setup>
import Pagina from "~/components/organism/Pagina/Pagina.vue";

import { ref, onMounted, watch } from "vue";
import { usePacientesStore } from "~/stores/Formularios/paciente/Paciente.js";
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
import { useMedicosStore } from "~/stores/Formularios/profesional/Profesionales";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const pacientesStore = usePacientesStore();
const apiRest = useApiRest()
const insumoStore = useInsumosStore();

const epsStore = useDatosEPSStore();
const opcionesEPS = ref([]);
const profesionalStore = useMedicosStore();
const pacientes = ref([]);
const insumos = ref([]);
const medicamentos = ref([])
const profesionales = ref([])
const refresh = ref(1);
const conveniosOptions = ref([]);

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

async function llamaConvenios() {
    const convenios = await apiRest.getData('', 'convenios');
    conveniosOptions.value = await convenios.map((convenio) => ({
        text: convenio.nombre,
        value: convenio.id,
    }));
}

async function llamaEps() {
    const EPS = await epsStore.listEPS(false);
    opcionesEPS.value = await EPS.map((eps) => ({
        text: eps.nombre,
        value: eps.id,
    }));
}

async function llamaProfesionales() {
    profesionales.value = await profesionalStore.listMedicos(false)
    // profesionales.value = dataProfesionales.map(p => {return {text: p.name, value: p.id_profesional}})
}

async function llamaInsumos() {
    const listInsumos = await insumoStore.listInsumos();
    insumos.value = listInsumos.filter(i => i.es_prestable && i.stock > 0)
    medicamentos.value = listInsumos.filter(i => !i.es_prestable && i.stock > 0)
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
    await llamaConvenios();
    await llamaEps();
    await llamaProfesionales();
    await llamaInsumos();

    await apiRest.getData('Antecedentes', 'antecedentes')
    await apiRest.getData('Plan_manejo_procedimientos', 'planManejoProcedimientos')
});

// Construccion de pagina
const propiedades = computed(() => {
    const builderTabla = new TablaBuilder();
    const pagina = new ComponenteBuilder();

    // Verificar permisos específicos
    const puedeVer = varView.getPermisos.includes('Pacientes_view');
    const puedeGet = varView.getPermisos.includes('Pacientes_get');
    const puedePost = varView.getPermisos.includes('Pacientes_post');
    const puedePut = varView.getPermisos.includes('Pacientes_put');
    const puedediagnosticar = varView.getPermisos.includes('Diagnosticos_view');

    if (!puedeVer && !puedePost && !puedePut && !puedeGet) {
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
            conveniosOptions: conveniosOptions.value,
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
            conveniosOptions: conveniosOptions.value,
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
        medicamentos,
        insumos,
        profesionales
    })

    // Tabla de pacientes
    builderTabla
        .setColumnas([
            { titulo: "No_document", value: "Documento", tamaño: 120, ordenar: true },
            { titulo: "name", value: "Nombre", tamaño: 230, ordenar: true },
            { titulo: "celular", value: "Celular", tamaño: 120 },
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

    if (puedediagnosticar) {
        acciones.push({
            icon: "fa-solid fa-store text-green-700 dark:text-gray-300", action: (fila) => {
                showItem.value = true
                varView.tipoHistoria = 'Medicamento'
                pacientesStore.PacienteSeleccionado = fila.id_paciente
            }
        });
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
        .addComponente("Tabla", builderTabla);

    if (propiedadesUser) pagina.addComponente("Form", propiedadesUser);
    if (propiedadesVerUser) pagina.addComponente("Form", propiedadesVerUser);
    if (propiedadesItemHistoria) pagina.addComponente("Form", propiedadesItemHistoria);

    return pagina.build();

});

</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
</template>
