<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import ExportarPDFs from '~/components/paginas/ExportarPDFs.vue';

import { ref, onMounted } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';
import { useVerHistoriaBuilder } from '~/build/Historial/useVerHistoriaBuilder';
import { useVarView } from "~/stores/varview.js";
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { TablaBuilder } from '~/build/Constructores/TablaBuilder';
import { ModalBuilder } from '~/build/Constructores/ModalBuilder';
import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { mapCamposLimpios, mapCampos } from '~/components/organism/Forms/useFormulario';
import { useNotasBuilder } from '~/build/Historial/useNotasBuilder';
import { useNotasStore } from '~/stores/Formularios/historias/Notas';
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales';
import { historialManejoModales } from '~/composables/Historias/historialManejoModales';
import { usePDFExporter } from '~/composables/Historias/exportarServicioPDF';
import { formatDate } from '~/composables/Formulario/FormatearFecha';

const varView = useVarView();
const historiasStore = useHistoriasStore();
const notasStore = useNotasStore();
const apiRest = useApiRest();
const medicosStore = useMedicosStore();

const historiasList = ref([]);

const analisis = ref([])
const notas = ref([])
const tratamientos = ref([])
const medicinas = ref([]);
const evoluciones = ref([]);
const nutricion = ref([]);
const diagnosticos = ref([])
const diagnosticosCIF = ref([])
const trabajosSocial = ref([])
const id_paciente = ref(0)
const medicos = ref([])
const kardex = ref({})
const historialCambioSonda = ref([])

const show = ref(false);
const showItem = ref(false)
const showActualizarNota = ref(false)
const refresh = ref(1);

const pacientesStore = usePacientesStore();
const store = useIndexedDBStore()
const showVerHistorial = ref(false)
const formularioItem = ref('')
const actualizar = ref(false)

async function llamadatos() {
    const datos = await historiasStore.datosHistoria
    historiasList.value = datos
    await historiasStore.indexDBDatos()
}
// Watchers para actualizar informacion
watch(() => show.value,
    async (estado) => {
        if (!estado) {
            await llamadatos();
            refresh.value++;
        }
    }
);

watch(() => showActualizarNota.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await apiRest.getData('Descripcion_nota', 'descripcionNotas')
            notas.value = await pacientesStore.listDatos(id, 'Nota') || []
            refresh.value++;
        }
    }
);

watch(() => showItem.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            switch (varView.tipoHistoria) {
                case 'Terapia':
                    await apiRest.getData('Terapia', 'terapias')
                    evoluciones.value = await pacientesStore.listDatos(id_paciente.value, 'Terapia')
                case 'Medicamento':
                    await apiRest.getData('Plan_manejo_medicamentos', 'planManejoMedicamentos')
                    const historia = await pacientesStore.listDatos(id_paciente.value, 'HistoriaClinica', 'id')
                    const allAnalisis = await historiasStore.listDatos(historia[0]?.id, 'Analisis', 'id_historia')
                    // Obtener todos los tratamientos asociados a cada id_analisis de la historia
                    const medicamentosPorAnalisis = await Promise.all(
                        allAnalisis.map(async (h) => {

                            const medicamentos = await historiasStore.listDatos(h.id, 'Plan_manejo_medicamentos', 'id_analisis') || []

                            // Enriquecer cada tratamiento con su análisis correspondiente
                            const medicamentosConAnalisis = medicamentos.map((tratamiento) => {
                                return {
                                    ...tratamiento,
                                    ...h,
                                    id: tratamiento.id
                                }
                            })

                            return medicamentosConAnalisis
                        })
                    )

                    // Unificar todos los medicamentos en un solo array
                    medicinas.value = medicamentosPorAnalisis.flat()
                case 'Tratamientos':
                    await apiRest.getData('Plan_manejo_procedimientos', 'planManejoProcedimientos')
                    tratamientos.value = await pacientesStore.listDatos(id_paciente.value, 'Plan_manejo_procedimientos')
                case 'Consulta':
                    await apiRest.getData('Analisis', 'analisis')
                    await apiRest.getData('ExamenFisico', 'examenFisicos')
                    const historiaC = await pacientesStore.listDatos(id_paciente.value, 'HistoriaClinica', 'id')
                    const allAnalisisC = await historiasStore.listDatos(historiaC[0]?.id, 'Analisis', 'id_historia')
                    analisis.value = []
                    const analisisData = []
                    allAnalisisC.map((analisis) => {
                        if (analisis.servicio === 'Medicina') {
                            analisisData.push({ ...analisis })
                        }
                    })
                    for (const item of analisisData) {
                        const examenFisico = await historiasStore.listDatos(item.id, 'ExamenFisico', 'id_analisis') || [];

                        analisis.value.push({ ...item, ...examenFisico[0] })
                    }
                case 'Evolucion':
                    await apiRest.getData('Analisis', 'analisis')
                    const historiaE = await pacientesStore.listDatos(id_paciente.value, 'HistoriaClinica', 'id')
                    const allAnalisisE = await historiasStore.listDatos(historiaE[0]?.id, 'Analisis', 'id_historia')
                    nutricion.value = []
                    allAnalisisE.map((analisis) => {
                        if (analisis.servicio === 'Evolucion') {
                            nutricion.value.push({ ...analisis })
                        }
                    })
                case 'TrabajoSocial':
                    await apiRest.getData('Analisis', 'analisis')
                    const historiaT = await pacientesStore.listDatos(id_paciente.value, 'HistoriaClinica', 'id')
                    const allAnalisisT = await historiasStore.listDatos(historiaT[0]?.id, 'Analisis', 'id_historia')
                    trabajosSocial.value = []
                    allAnalisisT.map((analisis) => {
                        if (analisis.servicio === 'Trabajo Social') {
                            trabajosSocial.value.push({ ...analisis })
                        }
                    })
                default:
                    console.log('Tipo de consulta no encontrado')

            }


        }
        const his = historiasList.value.find(h => {
            return h.id === id_paciente.value
        })
        historiasStore.Formulario.HistoriaClinica.name_paciente = his.paciente
        historiasStore.Formulario.HistoriaClinica.No_document_paciente = his.cedula
        historiasStore.Formulario.HistoriaClinica.id_paciente = his.id
    }
);

// Cargar los pacientes desde el store
onMounted(async () => {
    medicos.value = await medicosStore.listMedicos();
    await apiRest.getData('Kardex', 'kardex')
    await apiRest.getData('Historial_cambio_sonda', 'historialCambioSonda')
    await llamadatos()
    varView.datosActualizados()
});

// visibilidad ver Historial
const verHistoria = async (his) => {
    await cargaHistorial(his.id)
    id_paciente.value = his.id
    historiasStore.Formulario.HistoriaClinica.name_paciente = his.paciente
    historiasStore.Formulario.HistoriaClinica.No_document_paciente = his.cedula
    historiasStore.Formulario.HistoriaClinica.id_paciente = his.id
    showVerHistorial.value = true
};

async function cargaHistorial(id) {
    try {
        varView.cargando = true;

        // Reiniciar valores
        analisis.value = [];
        notas.value = [];
        tratamientos.value = [];
        medicinas.value = [];
        evoluciones.value = [];
        nutricion.value = [];
        diagnosticos.value = [];
        trabajosSocial.value = [];
        diagnosticosCIF.value = [];
        kardex.value = {};

        // Historia clínica
        const historia = await pacientesStore.listDatos(id, 'HistoriaClinica', 'id');
        const allAnalisis = await historiasStore.listDatos(historia[0]?.id, 'Analisis', 'id_historia') || [];

        // Clasificar análisis según servicio
        const analisisDatos = [];

        const medicosMap = new Map(medicos.value.map(m => [m.id_profesional, m]));

        for (const analisis of allAnalisis) {
            let profesional = medicosMap.get(analisis.id_medico);

            if (analisis.servicio === 'Evolucion') {
                nutricion.value.push({ ...analisis, profesional: profesional ? profesional.name : 'No encontrado', fecha: formatDate(analisis.created_at) });
            } else if (analisis.servicio === 'Trabajo Social') {
                trabajosSocial.value.push({ ...analisis, profesional: profesional ? profesional.name : 'No encontrado', fecha: formatDate(analisis.created_at) });
            } else if (analisis.servicio === 'Medicina') {
                analisisDatos.push({ ...analisis, profesional: profesional ? profesional.name : 'No encontrado', fecha: formatDate(analisis.created_at) });
            } else if (analisis.servicio === 'Nota') {
                let nota = await historiasStore.listDatos(analisis.id, 'Nota', 'id_analisis')
                notas.value.push({ ...nota[0], ...analisis, profesional: profesional ? profesional.name : 'No encontrado', id: nota[0].id });
            } else if (analisis.servicio === 'Terapia') {
                let terapia = await historiasStore.listDatos(analisis.id, 'Terapia', 'id_analisis')
                evoluciones.value.push({ ...terapia[0], ...analisis, profesional: profesional ? profesional.name : 'No encontrado' });
            }
        }

        // Consultas (Analisis con examen físico)
        for (const item of analisisDatos) {
            const examenFisico = await historiasStore.listDatos(item.id, 'ExamenFisico', 'id_analisis') || [];
            analisis.value.push({ ...item, ...examenFisico[0] });
        }

        // Tratamientos
        tratamientos.value = await pacientesStore.listDatos(id, 'Plan_manejo_procedimientos') || [];

        // Medicinas
        if (allAnalisis.length > 0) {
            const medicamentosPorAnalisis = await Promise.all(
                allAnalisis.map(async (h) => {
                    let profesional = medicosMap.get(h.id_medico);
                    const medicamentos = await historiasStore.listDatos(h.id, 'Plan_manejo_medicamentos', 'id_analisis') || [];
                    return medicamentos.map((tratamiento) => ({
                        ...tratamiento,
                        ...h,
                        profesional: profesional ? profesional.name : 'No encontrado',
                        id: tratamiento.id,
                        fecha: formatDate(h.created_at)
                    }));
                })
            );
            medicinas.value = medicamentosPorAnalisis.flat();
        }

        // Diagnósticos
        if (allAnalisis.length > 0) {
            const diagnosticosPorAnalisis = await Promise.all(
                allAnalisis.map(async (h) => {
                    let profesional = medicosMap.get(h.id_medico);
                    const diagnostico = await historiasStore.listDatos(h.id, 'Diagnosticos', 'id_analisis') || [];
                    const diagnosticoCIF = await historiasStore.listDatos(h.id, 'DiagnosticosCIF', 'id_analisis') || [];

                    return {
                        diagnostico: diagnostico.map(d => ({
                            ...d,
                            ...h,
                            profesional: profesional ? profesional.name : 'No encontrado',
                            fecha: formatDate(h.created_at)
                        })),
                        diagnosticoCIF: diagnosticoCIF.map(dc => ({
                            ...dc,
                            ...h,
                            profesional: profesional ? profesional.name : 'No encontrado',
                            fecha: formatDate(h.created_at)
                        }))
                    };
                })
            );

            diagnosticos.value = diagnosticosPorAnalisis.map(d => d.diagnostico).flat();
            diagnosticosCIF.value = diagnosticosPorAnalisis.map(d => d.diagnosticoCIF).flat();
        }
        console.log(id)
        kardex.value = await historiasStore.listDatos(parseInt(id), 'Kardex', 'id_paciente');
        historialCambioSonda.value = await historiasStore.listDatos(kardex.value[0].id, 'Historial_cambio_sonda', 'id_kardex');

        // 🔹 Ordenamientos
        notas.value.sort((a, b) => new Date(b.fecha_nota) - new Date(a.fecha_nota));
        evoluciones.value.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        analisis.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        nutricion.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        trabajosSocial.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        medicinas.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    } catch (error) {
        console.error("Error cargando historial:", error);
    } finally {
        varView.cargando = false;
    }
}

// Manejo de modales ver, actualizar
const { loadItem } = historialManejoModales({
    historiasStore,
    showItem,
    formularioItem,
    varView,
    actualizar
})

// PDF
const { exportar } = usePDFExporter()

function cerrarModalVer() {
    showItem.value = false
}
function cerrarModal() {
    mapCamposLimpios(historiasStore.Formulario)
    showVerHistorial.value = false
}

// formulario actualizar nota
async function actualizarNota(nota) {
    mapCampos(nota, notasStore.Formulario)

    store.almacen = 'Descripcion_nota'
    const descripcion = await store.leerdatos()

    const descripcionesNota = (descripcion || []).filter(d => d.id_nota === nota.id);

    // Agrupar por tipo
    const agrupadoPorTipo = descripcionesNota.reduce((acc, nota) => {
        if (!acc[nota.tipo]) acc[nota.tipo] = [];
        acc[nota.tipo].push(nota);
        return acc;
    }, {});

    notasStore.Formulario.Nota.subjetivo = agrupadoPorTipo.subjetivo
    notasStore.Formulario.Nota.objetivo = agrupadoPorTipo.objetivo
    notasStore.Formulario.Nota.actividades = agrupadoPorTipo.actividades
    notasStore.Formulario.Nota.plan = agrupadoPorTipo.plan
    notasStore.Formulario.Nota.intervencion = agrupadoPorTipo.intervencion
    notasStore.Formulario.Nota.evaluacion = agrupadoPorTipo.evaluacion
    notasStore.Formulario.Nota.name_paciente = historiasStore.Formulario.HistoriaClinica.name_paciente
    notasStore.Formulario.Nota.No_document_paciente = historiasStore.Formulario.HistoriaClinica.No_document_paciente
    notasStore.Formulario.Nota.id_temporal = nota.id_temporal
    showActualizarNota.value = true
}
function cerrarNota() {
    showActualizarNota.value = false
}
const propiedadesActualizarNota = useNotasBuilder({
    storeId: 'ActualizarNota',
    storePinia: 'Notas',
    cerrarModal: cerrarNota,
    show: showActualizarNota,
})

// Propiedades calculadas
function estadoSemaforo(fila) {
    if (fila.tipoAnalisis === 'Estado clinico sin cambios') {
        return 'Verde'
    } else if (fila.tipoAnalisis === 'Recomendaciones Adicionales') {
        return 'Naranja'
    } else if (fila.tipoAnalisis === 'Cambios criticos') {
        return 'Rojo'
    } else {
        return ''
    }
}


const tablaBuilder = new TablaBuilder()

const restriccionCard = new CardBuilder()
const consultasCard = new CardBuilder()
const evolucionesCard = new CardBuilder()
const diagnosticosCard = new CardBuilder()
const notasCard = new CardBuilder()
const tratamientosCard = new CardBuilder()
const medicacionCard = new CardBuilder()
const nutricionCard = new CardBuilder()
const trabajoSocialCard = new CardBuilder()
const KardexInfo = new CardBuilder()

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()
    const modal = new ModalBuilder()

    const puedeVer = varView.getPermisos.includes('Historias_view');
    if (!puedeVer) {
        pagina
            .setFondo('FondoDefault')
            .setEstilos('')
            .setContenedor('w-full')
            .addComponente('Card', restriccionCard
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
                .setheaderTitle('Historial de Pacientes')
                .setheaderHtml(`<a href="/Home" class="text-base text-blue-500 hover:text-blue-700"><i class="fa-solid fa-angle-left mr-1"></i>Volver al Inicio</a>`)
                .build()
            )
        return pagina.build()
    }

    const puedeVerNotas = varView.getPermisos.includes('Notas_view')
    const puedeVerEvoluciones = varView.getPermisos.includes('Evoluciones_view')
    const puedeVerTerapias = varView.getPermisos.includes('Terapias_view')
    const puedeVerDiagnosticos = varView.getPermisos.includes('Diagnosticos_view')
    const puedeVerTratamientos = varView.getPermisos.includes('Tratamientos_view')
    const puedeVerMedicacion = varView.getPermisos.includes('Medicacion_view')
    const puedeVerMedicina = varView.getPermisos.includes('MedicinaGeneral_view')
    const puedeVerTrabajo = varView.getPermisos.includes('TrabajoSocial_view')

    const puedePutNotas = varView.getPermisos.includes('Notas_put')
    const puedePutEvoluciones = varView.getPermisos.includes('Evoluciones_put')
    const puedePutTerapias = varView.getPermisos.includes('Terapias_put')
    const puedePutTratamientos = varView.getPermisos.includes('Tratamientos_put')
    const puedePutMedicacion = varView.getPermisos.includes('Medicacion_put')
    const puedePutMedicina = varView.getPermisos.includes('MedicinaGeneral_put')
    const puedePutTrabajo = varView.getPermisos.includes('TrabajoSocial_put')

    const tablaConsultas = new TablaBuilder()
    const tablaEvoluciones = new TablaBuilder()
    const tablaNotas = new TablaBuilder()
    const tablaTratamientos = new TablaBuilder()
    const tablaMedicacion = new TablaBuilder()
    const tablaNutricion = new TablaBuilder()
    const tablaTrabajoSocial = new TablaBuilder()
    const tablaDiagnosticos = new TablaBuilder()
    const tablaKardex = new TablaBuilder()

    const propiedadesItemHistoria = useVerHistoriaBuilder({
        storeId: 'ActualizarHistorias',
        storePinia: 'Historias',
        cerrarModal: cerrarModalVer,
        formularioItem,
        actualizar,
        show: showItem,
    })

    pagina
        .setFondo('FondoDefault')
        .setEstilos('')
        .setContenedor('w-full')
        .addComponente('Tabla', tablaBuilder
            .setColumnas([
                { titulo: 'cedula', value: 'Cédula', tamaño: 100, ordenar: true },
                { titulo: 'paciente', value: 'Paciente', tamaño: 250, ordenar: true },
                { titulo: 'estado', value: 'Estado', tamaño: 150 },
            ])
            .setHeaderTabla({
                titulo: 'Gestion de Historias Clinicas',
                descripcion: 'Administra y consulta información sobre historias clinicas',
                color: 'bg-[var(--color-default)] text-white',
                buscador: true,
                filtros: [
                    { columna: 'estado', placeholder: 'Estado', },
                ],
                acciones: [
                    {
                        icon: 'fa-solid fa-file-pdf',
                        accion: () => {
                            varView.showExportarPDFs = true
                            varView.onlyPaciente = false
                            varView.id_pacientePDF = ''
                            varView.servicioPDF = ''
                        },
                        color: 'bg-gray-600 text-white hover:bg-gray-900 dark:bg-gray-500 dark:hover:bg-gray-600',
                        text: 'Exportar'
                    },
                ]
            })
            .setAcciones({ icons: [{ icon: 'ver', action: verHistoria },], botones: true, })
            .setDatos(historiasList)
        )
        .addComponente('Modal', modal
            .setFondo('FondoBlur')
            .setShowModal(showVerHistorial)
            .setCerrarModal(cerrarModal)
            .setTamaño('LG')
            .setContenedor('flex flex-col gap-3 w-full h-full py-5 px-8')
            .setHeaderModal({
                titulo: 'Historial Medico',
                html: `
                    <div class="flex gap-2">
                        <p>Paciente: ${historiasStore.Formulario.HistoriaClinica.name_paciente}</p> 
                        <p>CC: ${historiasStore.Formulario.HistoriaClinica.No_document_paciente}</p>
                    </div>`,
            })

            .nuevaSeccion('Botones', 'md:grid grid-cols-2 flex flex-col md:justify-center gap-1 w-full h-full content-center py-5 px-8')
            .addComponente('Card', puedeVerMedicina ? consultasCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-hospital text-white',
                            iconBg: 'bg-inherit',
                            title: 'Consultas y Analisis',
                            subtitle: 'Registro de consultas del paciente',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setheaderSubTitle('')
                .setcontenedorCards('w-full flex justify-center w-full ')
                .setTamaño('flex flex-row justify-between items-center shadow-md rounded-lg bg-[var(--color-default-300)]! hover:bg-[var(--color-default-100)]! cursor-pointer text-white! w-[100%]!')
                .build()
                : consultasCard
                    .setCards([
                        {
                            header: {
                                icon: 'fa-solid fa-hospital text-white',
                                iconBg: 'bg-inherit',
                                title: 'Consultas y Analisis',
                                subtitle: 'Registro de consultas del paciente',
                                titleClass: 'text-white',
                                subtitleClass: 'text-gray-300!'
                            },
                        },
                    ])
                    .setContenedor('')
                    .setheaderSubTitle('')
                    .setcontenedorCards('w-full flex justify-center w-full ')
                    .setTamaño('flex flex-row justify-between items-center rounded-lg shadow-md bg-gray-600! hover:bg-gray-700! cursor-not-allowed text-white! w-[100%]!')
                    .build()
            )
            .addComponente('Card', puedeVerDiagnosticos ? diagnosticosCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-clipboard-list text-white',
                            iconBg: 'bg-inherit',
                            title: 'Diagnosticos',
                            subtitle: 'Diagnosticos del paciente',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setcontenedorCards('w-full flex justify-center w-full')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-400)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[100%]!')
                .build()
                : diagnosticosCard
                    .setCards([
                        {
                            header: {
                                icon: 'fa-solid fa-clipboard-list text-white',
                                iconBg: 'bg-inherit',
                                title: 'Diagnosticos',
                                subtitle: 'Diagnosticos del paciente',
                                titleClass: 'text-white',
                                subtitleClass: 'text-gray-300!'
                            },
                        },
                    ])
                    .setContenedor('')
                    .setcontenedorCards('w-full flex justify-center w-full')
                    .setTamaño('flex flex-row justify-between items-center rounded-lg bg-gray-600! hover:bg-gray-700! cursor-not-allowed text-white! w-[100%]!')
                    .build()
            )
            .addComponente('Card', puedeVerTerapias ? evolucionesCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-heart-pulse text-white',
                            iconBg: 'bg-inherit',
                            title: 'Terapias',
                            subtitle: 'Evoluciones de Procedimientos',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setcontenedorCards('w-full flex justify-center w-full')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-400)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[100%]!')
                .build()
                : evolucionesCard
                    .setCards([
                        {
                            header: {
                                icon: 'fa-solid fa-heart-pulse text-white',
                                iconBg: 'bg-inherit',
                                title: 'Terapias',
                                subtitle: 'Evoluciones de Procedimientos',
                                titleClass: 'text-white',
                                subtitleClass: 'text-gray-300!'
                            },
                        },
                    ])
                    .setContenedor('')
                    .setcontenedorCards('w-full flex justify-center w-full')
                    .setTamaño('flex flex-row justify-between items-center rounded-lg bg-gray-600! hover:bg-gray-700! cursor-not-allowed text-white! w-[100%]!')
                    .build()
            )
            .addComponente('Card', puedeVerNotas ? notasCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-notes-medical text-white',
                            iconBg: 'bg-inherit',
                            title: 'Notas',
                            subtitle: 'Registro de notas medicas',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setcontenedorCards('w-full flex justify-center w-full')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-400)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[100%]!')
                .build()
                : notasCard
                    .setCards([
                        {
                            header: {
                                icon: 'fa-solid fa-notes-medical text-white',
                                iconBg: 'bg-inherit',
                                title: 'Notas',
                                subtitle: 'Registro de notas medicas',
                                titleClass: 'text-white',
                                subtitleClass: 'text-gray-300!'
                            },
                        },
                    ])
                    .setContenedor('')
                    .setcontenedorCards('w-full flex justify-center w-full')
                    .setTamaño('flex flex-row justify-between items-center rounded-lg bg-gray-600! hover:bg-gray-700! cursor-not-allowed text-white! w-[100%]!')
                    .build()
            )
            .addComponente('Card', puedeVerTratamientos ? tratamientosCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-kit-medical text-white',
                            iconBg: 'bg-inherit',
                            title: 'Tratamientos del paciente',
                            subtitle: 'Tratamientos del paciente',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setcontenedorCards('w-full flex justify-center w-full')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-600)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[100%]!')
                .build()
                : tratamientosCard
                    .setCards([
                        {
                            header: {
                                icon: 'fa-solid fa-kit-medical text-white',
                                iconBg: 'bg-inherit',
                                title: 'Tratamientos del paciente',
                                subtitle: 'Tratamientos del paciente',
                                titleClass: 'text-white',
                                subtitleClass: 'text-gray-300!'
                            },
                        },
                    ])
                    .setContenedor('')
                    .setcontenedorCards('w-full flex justify-center w-full')
                    .setTamaño('flex flex-row justify-between items-center rounded-lg bg-gray-600! hover:bg-gray-700! cursor-cursor-not-allowed text-white! w-[100%]!')
                    .build()
            )
            .addComponente('Card', puedeVerMedicacion ? medicacionCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-prescription-bottle-medical text-white',
                            iconBg: 'bg-inherit',
                            title: 'Medicacion',
                            subtitle: 'Medicacion del paciente',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setcontenedorCards('w-full flex justify-center w-full')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-600)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[100%]!')
                .build()
                : medicacionCard
                    .setCards([
                        {
                            header: {
                                icon: 'fa-solid fa-prescription-bottle-medical text-white',
                                iconBg: 'bg-inherit',
                                title: 'Medicacion',
                                subtitle: 'Medicacion del paciente',
                                titleClass: 'text-white',
                                subtitleClass: 'text-gray-300!'
                            },
                        },
                    ])
                    .setContenedor('')
                    .setcontenedorCards('w-full flex justify-center w-full')
                    .setTamaño('flex flex-row justify-between items-center rounded-lg bg-gray-600! hover:bg-gray-700! cursor-not-allowed text-white! w-[100%]!')
                    .build()
            )
            .addComponente('Card', puedeVerEvoluciones ? nutricionCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-user-check text-white',
                            iconBg: 'bg-inherit',
                            title: 'Evoluciones',
                            subtitle: 'Evolucion del paciente',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setcontenedorCards('w-full flex justify-center w-full')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-700)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[100%]!')
                .build()
                : nutricionCard
                    .setCards([
                        {
                            header: {
                                icon: 'fa-solid fa-user-check text-white',
                                iconBg: 'bg-inherit',
                                title: 'Evoluciones',
                                subtitle: 'Evolucion del paciente',
                                titleClass: 'text-white',
                                subtitleClass: 'text-gray-300!'
                            },
                        },
                    ])
                    .setContenedor('')
                    .setcontenedorCards('w-full flex justify-center w-full')
                    .setTamaño('flex flex-row justify-between items-center rounded-lg bg-gray-600! hover:bg-gray-700! cursor-not-allowed text-white! w-[100%]!')
                    .build()
            )
            .addComponente('Card', puedeVerTrabajo ? trabajoSocialCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-book-medical text-white',
                            iconBg: 'bg-inherit',
                            title: 'Trabajo Social',
                            subtitle: 'Trabajo Social del paciente',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setcontenedorCards('w-full flex justify-center w-full')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-700)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[100%]!')
                .build()
                : trabajoSocialCard
                    .setCards([
                        {
                            header: {
                                icon: 'fa-solid fa-book-medical text-white',
                                iconBg: 'bg-inherit',
                                title: 'Trabajo Social',
                                subtitle: 'Trabajo Social del paciente',
                                titleClass: 'text-white',
                                subtitleClass: 'text-gray-300!'
                            },
                        },
                    ])
                    .setContenedor('')
                    .setcontenedorCards('w-full flex justify-center w-full')
                    .setTamaño('flex flex-row justify-between items-center rounded-lg bg-gray-600! hover:bg-gray-700! cursor-not-allowed text-white! w-[100%]!')
                    .build()
            )
            .addComponente('Card', KardexInfo
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-crutch' + (kardex.value[0]?.ultimoCambio ? ' text-white' : ' text-gray-300'),
                            iconBg: 'bg-inherit',
                            title: 'Kardex',
                            subtitle: `Ultimo cambio de sonda: ${kardex.value[0]?.ultimoCambio ? kardex.value[0].ultimoCambio : 'No hay cambio de sonda'} - ${kardex.value[0]?.rango ? kardex.value[0].rango : 'No hay rango'}`,
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('col-span-2 mt-5')
                .setcontenedorCards('w-full flex justify-center w-full')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-gray-500)]! hover:bg-[var(--color-gray-500)]! cursor-pointer text-white! w-[100%]!')
                .build()
            )

            // consultas
            .nuevaSeccion('Consultas', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaConsultas
                .setColumnas([
                    { titulo: 'fecha', value: 'Fecha', tamaño: 110, ordenar: true },
                    { titulo: 'profesional', value: 'Profesional', tamaño: 200, ordenar: true },
                    { titulo: 'nombreServicio', value: 'Servicio', tamaño: 160, ordenar: true },
                    { titulo: 'motivo', value: 'Motivo', tamaño: 250, },
                    { titulo: 'observacion', value: 'Observacion', tamaño: 200, },
                    { titulo: 'tratamiento', value: 'Tratamiento', tamaño: 200, },
                    { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 250 },
                ])
                .setHeaderTabla(
                    {
                        titulo:
                            'Consultas y Analisis',
                        color: 'bg-[var(--color-default-600)] text-white',
                        espacioMargen: '520',
                        buscador: true,
                        filtros: [
                            { columna: 'nombreServicio', placeholder: 'Servicio', },
                            { columna: 'profesional', placeholder: 'Profesional' },
                            { columna: 'tipoAnalisis', placeholder: 'Estado' },
                            { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
                            { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' },
                        ],
                        acciones: [
                            {
                                icon: 'fa-solid fa-file-pdf',
                                accion: () => {
                                    varView.showExportarPDFs = true
                                    varView.onlyPaciente = true
                                    varView.id_pacientePDF = historiasStore.Formulario.HistoriaClinica.id_paciente
                                    varView.servicioPDF = 'Medicina'
                                },
                                color: 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-200 dark:text-black',
                                text: 'Exportar'
                            },
                        ]
                    })
                .setDatos(puedeVerMedicina ? analisis : [])
                .setAcciones({
                    icons: [
                        { icon: estadoSemaforo, action: () => { } },
                        { icon: 'ver', action: (item) => loadItem('Consulta', item) },
                        puedePutMedicina ? { icon: 'actualizar', action: (item) => loadItem('Consulta', item, 'update') } : '',
                        { icon: 'pdf', action: (item) => exportar('Medicina', item.id_analisis) }
                    ], botones: true,
                })
            )
            .addComponente('Form', propiedadesItemHistoria)

            //  Diagnosticos
            .nuevaSeccion('diagnosticos', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaDiagnosticos
                .setColumnas([
                    { titulo: 'fecha', value: 'Fecha', tamaño: 110, ordenar: true },
                    { titulo: 'profesional', value: 'Profesional', tamaño: 200, ordenar: true },
                    { titulo: 'nombreServicio', value: 'Servicio', tamaño: 160 },
                    { titulo: 'descripcion', value: 'Descripcion', tamaño: 280, ordenar: true },
                    { titulo: 'codigo', value: 'CIE10', tamaño: 250, ordenar: true },
                    { titulo: 'dias_asignados', value: 'No. Dias', tamaño: 250 },
                ])
                .setDatos(puedeVerDiagnosticos ? diagnosticos : [])
                .setHeaderTabla({
                    titulo: 'Diagnosticos',
                    color: 'bg-[var(--color-default-600)] text-white',
                    espacioMargen: '500',
                    excel: true,
                    buscador: true,
                    filtros: [
                        { columna: 'nombreServicio', placeholder: 'Servicio', },
                        { columna: 'profesional', placeholder: 'Profesional' },
                        { columna: 'tipoAnalisis', placeholder: 'Estado' },
                        { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
                        { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' },
                    ]
                })
            )

            // Terapias
            .nuevaSeccion('evoluciones', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaEvoluciones
                .setColumnas([
                    { titulo: 'fecha', value: 'Fecha', tamaño: 110, ordenar: true },
                    { titulo: 'profesional', value: 'Profesional', tamaño: 200, ordenar: true },
                    { titulo: 'nombreServicio', value: 'Sericio', tamaño: 160, ordenar: true },
                    { titulo: 'sesion', value: 'Sesión', tamaño: 60, },
                    { titulo: 'objetivos', value: 'Objetivos', tamaño: 250, },
                    { titulo: 'evolucion', value: 'Evolucion', tamaño: 250 },
                ])
                .setHeaderTabla({
                    titulo: 'Avances de Tratamientos',
                    color: 'bg-[var(--color-default-600)] text-white',
                    espacioMargen: '520',
                    buscador: true,
                    filtros: [
                        { columna: 'nombreServicio', placeholder: 'Servicio', },
                        { columna: 'profesional', placeholder: 'Profesional' },
                        { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
                        { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' },
                    ],
                    acciones: [
                        {
                            icon: 'fa-solid fa-file-pdf',
                            accion: () => {
                                varView.showExportarPDFs = true
                                varView.onlyPaciente = true
                                varView.id_pacientePDF = historiasStore.Formulario.HistoriaClinica.id_paciente
                                varView.servicioPDF = 'Terapia'
                            },
                            color: 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-200 dark:text-black',
                            text: 'Exportar'
                        },
                    ]
                })
                .setAcciones({ icons: [
                    puedePutTerapias ? { icon: 'actualizar', action: (item) => loadItem('Terapia', item, 'update') } : '',
                    { icon: 'pdf', action: (item) => exportar('Terapia', item.id_analisis) }, 
                ], botones: true, })
                .setDatos(puedeVerTerapias ? evoluciones : [])
            )
            .addComponente('Form', propiedadesItemHistoria)


            //  notas
            .nuevaSeccion('notas', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaNotas
                .setColumnas([
                    { titulo: 'fecha_nota', value: 'Fecha', tamaño: 110, ordenar: true },
                    { titulo: 'profesional', value: 'Profesional', tamaño: 200, ordenar: true },
                    { titulo: 'nombreServicio', value: 'servicio', tamaño: 160, ordenar: true },
                    { titulo: 'direccion', value: 'Direccion', tamaño: 100 },
                    { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 200 },
                ])
                .setDatos(puedeVerNotas ? notas : [])
                .setAcciones({
                    icons: [
                        { icon: estadoSemaforo, action: () => { } },
                        puedePutNotas ? { icon: 'actualizar', action: actualizarNota } : '',
                        { icon: 'pdf', action: (item) => exportar('Nota', item.id_analisis) },
                    ], botones: true,
                })
                .setHeaderTabla({
                    titulo: 'Notas Medicas',
                    color: 'bg-[var(--color-default-600)] text-white',
                    espacioMargen: '520',
                    buscador: true,
                    filtros: [
                        { columna: 'nombreServicio', placeholder: 'Servicio', },
                        { columna: 'profesional', placeholder: 'Profesional' },
                        { columna: 'tipoAnalisis', placeholder: 'Estado' },
                        { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
                        { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' },
                    ],
                    acciones: [
                        {
                            icon: 'fa-solid fa-file-pdf',
                            accion: () => {
                                varView.showExportarPDFs = true
                                varView.onlyPaciente = true
                                varView.id_pacientePDF = historiasStore.Formulario.HistoriaClinica.id_paciente
                                varView.servicioPDF = 'Nota'
                            },
                            color: 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-200 dark:text-black',
                            text: 'Exportar'
                        },
                    ]
                })
            )
            .addComponente('Form', propiedadesActualizarNota)


            //  tratamientos
            .nuevaSeccion('tratamientos', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaTratamientos
                .setColumnas([
                    { titulo: 'created_at', value: 'Fecha', tamaño: 120, ordenar: true },
                    { titulo: 'procedimiento', value: 'Procedimiento', tamaño: 250, ordenar: true },
                    { titulo: 'codigo', value: 'CUPS', tamaño: 250, ordenar: true },
                    { titulo: 'dias_asignados', value: 'No. Dias', tamaño: 250 },
                ])
                .setDatos(puedeVerTratamientos ? tratamientos : [])
                .setAcciones({
                    icons: [
                        { icon: estadoSemaforo, action: () => { } },
                        { icon: 'ver', action: (item) => loadItem('Tratamientos', item) },
                        puedePutTratamientos ? { icon: 'actualizar', action: (item) => loadItem('Tratamientos', item, 'update') } : ''], botones: true,
                })
                .setHeaderTabla({
                    titulo: 'Tratamientos',
                    color: 'bg-[var(--color-default-600)] text-white',
                    espacioMargen: '520',
                    buscador: true,
                })
            )
            .addComponente('Form', propiedadesItemHistoria)


            // medicinas
            .nuevaSeccion('medicinas', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaMedicacion
                .setColumnas([
                    { titulo: 'fecha', value: 'Fecha', tamaño: 110, ordenar: true },
                    { titulo: 'profesional', value: 'Profesional', tamaño: 200, ordenar: true },
                    { titulo: 'nombreServicio', value: 'Servicio', tamaño: 160 },
                    { titulo: 'medicamento', value: 'Medicamento', tamaño: 200, ordenar: true },
                    { titulo: 'dosis', value: 'Dosis', tamaño: 200, },
                    { titulo: 'nombreServicio', value: 'Servicio', tamaño: 250 },
                ])
                .setDatos(puedeVerMedicacion ? medicinas : [])
                .setAcciones({
                    icons: [
                        { icon: estadoSemaforo, action: () => { } },
                        { icon: 'ver', action: (item) => loadItem('Medicamento', item) },
                        puedePutMedicacion ? { icon: 'actualizar', action: (item) => loadItem('Medicamento', item, 'update') } : '',
                        { icon: 'pdf', action: (item) => exportar('Formula', item.id_analisis) }], botones: true,
                })
                .setHeaderTabla({
                    titulo: 'Medicamentos del Paciente',
                    color: 'bg-[var(--color-default-600)] text-white',
                    espacioMargen: '500',
                    buscador: true,
                    filtros: [
                        { columna: 'nombreServicio', placeholder: 'Servicio', },
                        { columna: 'profesional', placeholder: 'Profesional' },
                        { columna: 'tipoAnalisis', placeholder: 'Estado' },
                        { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
                        { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' },
                    ]
                })
            )
            .addComponente('Form', propiedadesItemHistoria)


            // nutricion
            .nuevaSeccion('nutricion', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaNutricion
                .setColumnas([
                    { titulo: 'fecha', value: 'Fecha', tamaño: 110, ordenar: true },
                    { titulo: 'profesional', value: 'Profesional', tamaño: 200, ordenar: true },
                    { titulo: 'nombreServicio', value: 'Servicio', tamaño: 160, ordenar: true },
                    { titulo: 'analisis', value: 'Analisis', tamaño: 220, },
                    { titulo: 'motivo', value: 'Motivo', tamaño: 220, },
                ])
                .setDatos(puedeVerEvoluciones ? nutricion : [])
                .setAcciones({
                    icons: [
                        puedePutEvoluciones ? { icon: 'actualizar', action: (item) => loadItem('Evolucion', item, 'update') } : '',
                        { icon: 'pdf', action: (item) => exportar('Evolucion', item.id) },
                    ], botones: true,
                })
                .setHeaderTabla({
                    titulo: 'Evoluciones',
                    color: 'bg-[var(--color-default-600)] text-white',
                    buscador: true,
                    filtros: [
                        { columna: 'nombreServicio', placeholder: 'Servicio', },
                        { columna: 'profesional', placeholder: 'Profesional' },
                        { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
                        { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' },
                    ],
                    acciones: [
                        {
                            icon: 'fa-solid fa-file-pdf',
                            accion: () => {
                                varView.showExportarPDFs = true
                                varView.onlyPaciente = true
                                varView.id_pacientePDF = historiasStore.Formulario.HistoriaClinica.id_paciente
                                varView.servicioPDF = 'Evolucion'
                            },
                            color: 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-200 dark:text-black',
                            text: 'Exportar'
                        },
                    ]
                })
            )
            .addComponente('Form', propiedadesItemHistoria)


            // trabajo social
            .nuevaSeccion('nutricion', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaTrabajoSocial
                .setColumnas([
                    { titulo: 'fecha', value: 'Fecha', tamaño: 110, ordenar: true },
                    { titulo: 'profesional', value: 'Profesional', tamaño: 200, ordenar: true },
                    { titulo: 'nombreServicio', value: 'Servicio', tamaño: 160, ordenar: true },
                    { titulo: 'analisis', value: 'Analisis', tamaño: 220, },
                    { titulo: 'motivo', value: 'Motivo', tamaño: 220, },
                ])
                .setDatos(puedeVerTrabajo ? trabajosSocial : [])
                .setAcciones({
                    icons: [
                        puedePutTrabajo ? { icon: 'actualizar', action: (item) => loadItem('TrabajoSocial', item, 'update') } : '',
                        { icon: 'pdf', action: (item) => exportar('Trabajo Social', item.id) },
                    ], botones: true,
                })
                .setHeaderTabla({
                    titulo: 'Trabajo Social',
                    color: 'bg-[var(--color-default-600)] text-white',
                    buscador: true,
                    filtros: [
                        { columna: 'nombreServicio', placeholder: 'Servicio', },
                        { columna: 'profesional', placeholder: 'Profesional' },
                        { columna: 'tipoAnalisis', placeholder: 'Estado' },
                        { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
                        { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' },
                    ],
                    acciones: [
                        {
                            icon: 'fa-solid fa-file-pdf',
                            accion: () => {
                                varView.showExportarPDFs = true
                                varView.onlyPaciente = true
                                varView.id_pacientePDF = historiasStore.Formulario.HistoriaClinica.id_paciente
                                varView.servicioPDF = 'Trabajo Social'
                            },
                            color: 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-200 dark:text-black',
                            text: 'Exportar'
                        },
                    ]
                })
            )
            .addComponente('Form', propiedadesItemHistoria)

            // kardex
            .nuevaSeccion('nutricion', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaKardex
                .setColumnas([
                    { titulo: 'fecha_cambio', value: 'Fecha', tamaño: 110, ordenar: true },
                    { titulo: 'tipo_sonda', value: 'Tipo de sonda', tamaño: 200, ordenar: true },
                    { titulo: 'observacion', value: 'Observación', tamaño: 160, ordenar: true },
                ])
                .setDatos(historialCambioSonda)
                .setHeaderTabla({
                    titulo: 'Historial de cambios de sonda',
                    color: 'bg-[var(--color-default-600)] text-white',
                    filtros: [
                        { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
                        { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' },
                    ],
                })
            )


        )

    return pagina.build()
});

</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
    <ExportarPDFs v-if="varView.showExportarPDFs" :datos="analisis" />
</template>