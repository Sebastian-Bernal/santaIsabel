<script setup>
import Pagina from "~/components/organism/Pagina/Pagina.vue";

import { ref, onMounted, watch } from "vue";
import { usePacientesStore } from "~/stores/Formularios/paciente/Paciente.js";
import { ComponenteBuilder } from "~/build/Constructores/ComponentesBuilder.js";
import { TablaBuilder } from "~/build/Constructores/TablaBuilder.js";
import { CardBuilder } from "~/build/Constructores/CardBuilder.js";
import { useUsuarioValidaciones } from "~/composables/Usuarios/Usuarios.js";
import { usePacienteActions } from "~/composables/Usuarios/Paciente.js";
import { validarYEnviarKardex } from "~/Core/Usuarios/Paciente/POSTKardex.js";
import { traerCeldasPintadas } from "~/Core/Usuarios/Paciente/GETColores";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const pacientesStore = usePacientesStore();
const apiRest = useApiRest()

const pacientes = ref([]);
const kardex = ref([]);
let copiaKardex = [];
const refresh = ref(1);
const celdasPintadasKardex = ref([]);
const cargandoColors = ref(false)

const show = ref(false);
const showVer = ref(false);

const {
    validarFecha,
    validarTipoDoc,
    buscarUsuarioPorDocumento,
    municipiosOptions
} = useUsuarioValidaciones(pacientesStore.Formulario);

const {
    options,
    mensaje,
    alertRespuestaInput
} = useNotificacionesStore();

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

    cargandoColors.value = true
    celdasPintadasKardex.value = await traerCeldasPintadas()

    kardex.value = await apiRest.getData('', 'traeKardex')
    copiaKardex = kardex.value
    kardex.value = kardex.value.map(k => {
        return {...k, id: k.paciente_id}
    })
    cargandoColors.value = false
});

// Construccion de pagina
const propiedades = computed(() => {
    const builderTablaKardex = new TablaBuilder();
    const pagina = new ComponenteBuilder();

    // Verificar permisos específicos
    const puedeVerKardex = varView.getPermisos.includes('Kardex_view');
    const puedeGetKardex = varView.getPermisos.includes('Kardex_get');
    const puedePutKardex = varView.getPermisos.includes('Kardex_put');

    if (!puedeVerKardex && !puedePutKardex && !puedeGetKardex) {
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

    builderTablaKardex
        .setColumnas([
            { titulo: "No_document", value: "DOCUMENTO", tamaño: 120, ordenar: true, pinned: true },
            { titulo: "name", value: "NOMBRE", tamaño: 200, ordenar: true, pinned: true },
            { titulo: "Eps", value: "EPS", tamaño: 200, ordenar: true, pinned: true },
            { titulo: "type_doc", value: "TIPO DOC", tamaño: 100, campo: 'input' },
            { titulo: "celular", value: "N. Tel", tamaño: 150, campo: 'input'  },
            { titulo: "direccion", value: "DIRECCION", tamaño: 100, campo: 'input'  },
            { titulo: "barrio", value: "Barrio", tamaño: 130, campo: 'input'  },
            { titulo: "nacimiento", value: "Fecha Nto", tamaño: 100, campo: 'input'  },
            { titulo: "municipio", value: "Municipio Atencion", tamaño: 130, campo: 'input'  },
            { titulo: "regimen", value: "Regimen", tamaño: 150, campo: 'input'  },
            { titulo: "diagnostico", value: "Diagnostico", tamaño: 160, campo: 'input'  },
            // { titulo: "correo", value: "Correo", tamaño: 100 },
            // { titulo: "fecha", value: "Fecha Inicio", tamaño: 100 },
            {
                titulo: "kit_cateterismo", value: "Kit Cateterismo", tamaño: 180, campo: 'select', options: [
                    {
                        text: 'SI',
                        value: 1,
                    },
                    {
                        text: 'NO',
                        value: 0,
                    },
                ]
            },
            {
                titulo: "rango", value: "C/ cuanto", tamaño: 180, campo: 'select', options: [
                    {
                        text: 'Cada 4 horas',
                        value: 'Cada 4 horas',
                    },
                    {
                        text: 'Cada 6 horas',
                        value: 'Cada 6 horas',
                    },
                    {
                        text: 'Cada 8 horas',
                        value: 'Cada 8 horas',
                    },
                    {
                        text: 'Cada 12 horas',
                        value: 'Cada 12 horas',
                    },
                    {
                        text: 'No requiere',
                        value: 'No requiere',
                    },
                ]
            },
            {
                titulo: "kit_cambioSonda", value: "Cambio de sonda", tamaño: 180, campo: 'select', options: [
                    {
                        text: 'SI',
                        value: 1,
                    },
                    {
                        text: 'NO',
                        value: 0,
                    },
                ]
            },
            {
                titulo: "kit_gastro", value: "Kit gastro", tamaño: 180, campo: 'select', options: [
                    {
                        text: 'SI',
                        value: 1,
                    },
                    {
                        text: 'NO',
                        value: 0,
                    },
                ]
            },
            {
                titulo: "traqueo", value: "Traqueo", tamaño: 180, campo: 'select', options: [
                    {
                        text: 'SI',
                        value: 1,
                    },
                    {
                        text: 'NO',
                        value: 0,
                    },
                ]
            },
            {
                titulo: "equipos_biomedicos", value: "Equipos Biomedicos", tamaño: 180, campo: 'select', options: [
                    {
                        text: 'SI',
                        value: 1,
                    },
                    {
                        text: 'NO',
                        value: 0,
                    },
                ]
            },
            {
                titulo: "oxigeno", value: "Oxigeno", tamaño: 180, campo: 'select', options: [
                    {
                        text: 'SI',
                        value: 1,
                    },
                    {
                        text: 'NO',
                        value: 0,
                    },
                ]
            },
            {
                titulo: "estado", value: "Estado", tamaño: 180, campo: 'select', options: [
                    {
                        text: 'ACTIVO',
                        value: 'ACTIVO',
                    },
                    {
                        text: 'FALLECIDO',
                        value: 'FALLECIDO',
                    },
                    {
                        text: 'CAMBIO DE PRESTADOR',
                        value: 'CAMBIO DE PRESTADOR',
                    },
                    {
                        text: 'RETIRADO',
                        value: 'RETIRADO',
                    },
                    {
                        text: 'EGRESO',
                        value: 'EGRESO',
                    },
                    {
                        text: 'SUSPENDIDO',
                        value: 'SUSPENDIDO',
                    },
                    {
                        text: 'CANCELADO',
                        value: 'CANCELADO',
                    },
                ]
            },
            {
                titulo: "vm", value: "VM", tamaño: 180, campo: 'select', options: [
                    {
                        text: 'SI',
                        value: 1,
                    },
                    {
                        text: 'NO',
                        value: 0,
                    },
                ]
            },
            // { titulo: "cuidadores", value: "Cuidadores", tamaño: 180, campo: 'select', options: [
            //     {
            //         text: 'SI',
            //         value: true,
            //     },
            //     {
            //         text: 'NO',
            //         value: false,
            //     },
            // ]},
            { titulo: "ultimoCambio", value: "Ultimo cambio de sonda", tamaño: 180, campo: 'input', type: 'date' },
            { titulo: "fecha_ultima_visita", value: "Fecha ultima visita medica", tamaño: 180, campo: 'input', },
            // { titulo: "mes", value: "Mes", tamaño: 180, },
            { titulo: "terapia_respiratoria", value: "TR", tamaño: 180, campo: 'input',  },
            { titulo: "terapeuta_respiratoria", value: "Terapeuta Respiratoria", tamaño: 180, campo: 'input',  },
            { titulo: "terapia_fisica", value: "TF", tamaño: 180, campo: 'input',  },
            { titulo: "terapeuta_fisica", value: "Terapeuta Fisico", tamaño: 180, campo: 'input', },
            { titulo: "terapia_fonoaudiologia", value: "TFO", tamaño: 180, campo: 'input', },
            { titulo: "terapeuta_fonoaudiologia", value: "Terapeuta Fonoaudiologia", tamaño: 180, campo: 'input', },
            { titulo: "terapia_ocupacional", value: "TO", tamaño: 180, campo: 'input', },
            { titulo: "terapeuta_ocupacional", value: "Terapeuta Ocupacional", tamaño: 180, campo: 'input', },
            { titulo: "TEO_cantidad", value: "TEO Cantidad", tamaño: 180, campo: 'input', },
            { titulo: "profesional_nutricionista", value: "Nutricionista", tamaño: 180, campo: 'input', },
            { titulo: "nutricionista", value: "Control Nutricion", tamaño: 180, campo: 'input', },
            { titulo: "VPSico", value: "VPSico", tamaño: 180, campo: 'input', },
            { titulo: "psicologia", value: "Control Psicologia", tamaño: 180, campo: 'input', },
            { titulo: "trabajo_social", value: "T social", tamaño: 180, campo: 'input', },
            { titulo: "profesional_trabajo_social", value: "Control T social", tamaño: 180, campo: 'input', },
            { titulo: "guia_espiritual", value: "Guia Espiritual", tamaño: 180, campo: 'input', },
            // { titulo: "complejidad", value: "Complejidad", tamaño: 180, },
            // { titulo: "tipoHerida", value: "Tipo de Herida", tamaño: 180, },
            // { titulo: "profesionalTEO", value: "Profesional TEO", tamaño: 180, },
            // { titulo: "observacionTeo", value: "Observacion TEO", tamaño: 180, },
            // { titulo: "enfermeriaJefe", value: "Enfermeria Jefe", tamaño: 180, },
            // { titulo: "internista", value: "Medico Internista", tamaño: 180, },
            // { titulo: "control", value: "Control M/ Internista", tamaño: 180, },
            // { titulo: "fisiatra", value: "Medico Fisiatra", tamaño: 180, },
            // { titulo: "fisiatria", value: "Control de Fisitria", tamaño: 180, },
            // { titulo: "familiar", value: "Medicina Familiar", tamaño: 180, },
            // { titulo: "controlFamiliar", value: "Control Medicina Familiar", tamaño: 180, },
            // { titulo: "enfermeria", value: "Auxiliar de Enfermeria", tamaño: 180, },
            // { titulo: "admon", value: "ADMON MTOS", tamaño: 180, },
            // { titulo: "laboratorio", value: "Orden de laboratorio", tamaño: 180, },
            // { titulo: "resultado", value: "Fecha de resultado", tamaño: 180, },
            // { titulo: "pagor", value: "Pago como rural", tamaño: 180, },
            // { titulo: "llama", value: "Fecha de la llamada y hora", tamaño: 180, },
            // { titulo: "observacion", value: "Observacion", tamaño: 180, },
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
            celdasPintadas: unref(celdasPintadasKardex.value),
            camposEditables: !puedePutKardex,
            camposInputs: true,
            onUpdate: async (fila) => {
                const filaAfectada = copiaKardex.find(k => k.id_paciente === fila.id_paciente)
                const cambioSonda = filaAfectada.ultimoCambio !== fila.ultimoCambio
                if (fila.ultimoCambio && cambioSonda) {
                    options.icono = 'warning'
                    options.titulo = 'Agrega detalles del cambio de sonda'
                    options.html = `<div class="flex flex-col items-start">`
                    options.input = 'text'
                    options.inputAtributes = { placeholder: 'Observaciones de cambio de sonda' }
                    options.confirmtext = 'Si, Guardar'
                    options.canceltext = 'Atras'

                    const respuesta = await alertRespuestaInput()

                    if (respuesta.estado !== 'confirmado') return

                    if (!respuesta.valor) {
                        options.position = 'top-end'
                        options.texto = 'Ingrese una observación de cambio de sonda.'
                        options.background = '#d33'
                        options.tiempo = 1500
                        mensaje()
                        return
                    }

                    fila.observacion = respuesta.valor
                }
                try {
                    await validarYEnviarKardex(fila);
                    notificaciones.options = {
                        tipo: 'success',
                        background: '#22c55e',
                        texto: 'Kardex actualizado correctamente',
                        tiempo: 3000,
                        position: 'top-right',
                    }
                    notificaciones.mensaje()
                } catch (error) {
                    notificaciones.options = {
                        tipo: 'error',
                        background: '#d33',
                        texto: 'No se pudo actualizar Kardex',
                        tiempo: 3000,
                        position: 'top-right',
                    }
                    notificaciones.mensaje()
                }
            }
        });

    // Construcción de la página
    pagina
        .setFondo("FondoDefault")
        .setEstilos("")
        .setLayout("")
        .setContenedor("w-full")
    if ((puedeVerKardex || puedePutKardex || puedeGetKardex) && !cargandoColors.value ) {
        pagina
            .addComponente("Tabla", builderTablaKardex)
    }

    return pagina.build();

});

</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
</template>
