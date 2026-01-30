<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import PDFFormulaMedica from '~/components/paginas/PDFFormulaMedica.vue';
import ExportarPDFs from '~/components/paginas/ExportarPDFs.vue';

import { ref, onMounted, unref } from 'vue';
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
import { PdfBuilder } from '~/build/Constructores/PDFBuilder';
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales';
import { decryptData } from '~/composables/Formulario/crypto';

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

const show = ref(false);
const showItem = ref(false)
const showActualizarNota = ref(false)
const refresh = ref(1);

const pacientesStore = usePacientesStore();
const store = useIndexedDBStore()
const showVerHistorial = ref(false)
const formularioItem = ref('')
const actualizar = ref(false)

const propiedadesHistoriaPDF = ref({})
const activePdfHistoria = ref(false)

async function llamadatos() {
    varView.cargando = true
    const datos = await historiasStore.datosHistoria
    historiasList.value = datos
    await historiasStore.indexDBDatos()
    varView.cargando = false
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

            const his = historiasList.value.find(h => {
                return h.id === id_paciente.value
            })
            historiasStore.Formulario.HistoriaClinica.name_paciente = his.paciente
            historiasStore.Formulario.HistoriaClinica.No_document_paciente = his.cedula
            historiasStore.Formulario.HistoriaClinica.id_paciente = his.id

        }
    }
);

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await llamadatos()
    await medicosStore.listMedicos();
    varView.cargando = false
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

        // Historia clínica
        const historia = await pacientesStore.listDatos(id, 'HistoriaClinica', 'id');
        const allAnalisis = await historiasStore.listDatos(historia[0]?.id, 'Analisis', 'id_historia') || [];

        // Clasificar análisis según servicio
        const analisisDatos = [];
        allAnalisis.forEach((item) => {
            if (item.servicio === 'Evolucion') {
                nutricion.value.push({ ...item });
            } else if (item.servicio === 'Trabajo Social') {
                trabajosSocial.value.push({ ...item });
            } else if (item.servicio === 'Medicina') {
                analisisDatos.push({ ...item });
            }
        });

        // Consultas (Analisis con examen físico)
        for (const item of analisisDatos) {
            const examenFisico = await historiasStore.listDatos(item.id, 'ExamenFisico', 'id_analisis') || [];
            analisis.value.push({ ...item, ...examenFisico[0] });
        }

        // Evoluciones (Terapia)
        evoluciones.value = await pacientesStore.listDatos(id, 'Terapia') || [];

        // Notas
        notas.value = await pacientesStore.listDatos(id, 'Nota') || [];

        // Tratamientos
        tratamientos.value = await pacientesStore.listDatos(id, 'Plan_manejo_procedimientos') || [];

        // Medicinas
        if (allAnalisis.length > 0) {
            const medicamentosPorAnalisis = await Promise.all(
                allAnalisis.map(async (h) => {
                    const medicamentos = await historiasStore.listDatos(h.id, 'Plan_manejo_medicamentos', 'id_analisis') || [];
                    return medicamentos.map((tratamiento) => ({
                        ...tratamiento,
                        ...h,
                        id: tratamiento.id
                    }));
                })
            );
            medicinas.value = medicamentosPorAnalisis.flat();
        }

        // Diagnósticos
        if (allAnalisis.length > 0) {
            const diagnosticosPorAnalisis = await Promise.all(
                allAnalisis.map(async (h) => {
                    const diagnostico = await historiasStore.listDatos(h.id, 'Diagnosticos', 'id_analisis') || [];
                    const diagnosticoCIF = await historiasStore.listDatos(h.id, 'DiagnosticosCIF', 'id_analisis') || [];
                    return { diagnostico, diagnosticoCIF };
                })
            );
            diagnosticos.value = diagnosticosPorAnalisis.map(d => d.diagnostico).flat();
            diagnosticosCIF.value = diagnosticosPorAnalisis.map(d => d.diagnosticoCIF).flat();
        }

        // 🔹 Ordenamientos
        notas.value.sort((a, b) => new Date(b.fecha_nota) - new Date(a.fecha_nota));
        evoluciones.value.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        analisis.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        nutricion.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        trabajosSocial.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    } catch (error) {
        console.error("Error cargando historial:", error);
    } finally {
        varView.cargando = false;
    }
}

function cerrarModalVer() {
    showItem.value = false
}

function cerrarModal() {
    mapCamposLimpios(historiasStore.Formulario)
    showVerHistorial.value = false
}
// Visibilidad modal items
function verItemMedicamentoHistoria(item) {
    console.log(item)
    formularioItem.value = 'Medicamento'
    varView.tipoHistoria = 'Medicamento'
    actualizar.value = false
    mapCampos(item, historiasStore.Formulario)
    historiasStore.Formulario.Plan_manejo_medicamentos.medicamento = item.medicamento
    historiasStore.Formulario.Plan_manejo_medicamentos.dosis = item.dosis
    historiasStore.Formulario.Plan_manejo_medicamentos.cantidad = item.cantidad
    showItem.value = true
}

function actualizarItemMedicamentoHistoria(item) {
    formularioItem.value = 'Medicamento'
    varView.tipoHistoria = 'Medicamento'
    actualizar.value = true
    mapCampos(item, historiasStore.Formulario)
    historiasStore.Formulario.Plan_manejo_medicamentos.medicamento = item.medicamento
    historiasStore.Formulario.Plan_manejo_medicamentos.dosis = item.dosis
    historiasStore.Formulario.Plan_manejo_medicamentos.cantidad = item.cantidad
    historiasStore.Formulario.Plan_manejo_medicamentos.id = item.id
    showItem.value = true
}

function verItemTratamientoHistoria(item) {
    formularioItem.value = 'Tratamientos'
    varView.tipoHistoria = 'Tratamientos'
    actualizar.value = false
    mapCampos(item, historiasStore.Formulario)
    historiasStore.Formulario.Plan_manejo_procedimientos.procedimiento = item.procedimiento
    historiasStore.Formulario.Plan_manejo_procedimientos.codigo = item.codigo
    historiasStore.Formulario.Plan_manejo_procedimientos.dias_asignados = item.dias_asignados
    showItem.value = true
}

function actualizarItemTratamientoHistoria(item) {
    formularioItem.value = 'Tratamientos'
    varView.tipoHistoria = 'Tratamientos'
    actualizar.value = true
    mapCampos(item, historiasStore.Formulario)
    historiasStore.Formulario.Plan_manejo_procedimientos.procedimiento = item.procedimiento
    historiasStore.Formulario.Plan_manejo_procedimientos.codigo = item.codigo
    historiasStore.Formulario.Plan_manejo_procedimientos.dias_asignados = item.dias_asignados
    historiasStore.Formulario.Plan_manejo_procedimientos.id = item.id
    showItem.value = true
}

function verItemConsultasHistoria(item) {
    formularioItem.value = 'Consulta'
    varView.tipoHistoria = 'Consulta'
    actualizar.value = false
    const datos = { ...item, ...item.signosVitales }
    mapCampos(datos, historiasStore.Formulario)
    showItem.value = true
}

function actualizarItemConsultasHistoria(item) {
    formularioItem.value = 'Consulta'
    varView.tipoHistoria = 'Consulta'
    actualizar.value = true
    const datos = { ...item, ...item.signosVitales }
    mapCampos(datos, historiasStore.Formulario)
    showItem.value = true
}

function actualiazrItemTerapia(item) {
    formularioItem.value = 'Terapia'
    varView.tipoHistoria = 'Terapia'
    actualizar.value = true
    const datos = { ...item }
    mapCampos(datos, historiasStore.Formulario)
    historiasStore.Formulario.Terapia.id = item.id
    showItem.value = true
}

function actualizarItemEvolucionHistoria(item) {
    formularioItem.value = 'Evolucion'
    varView.tipoHistoria = 'Evolucion'
    actualizar.value = true
    mapCampos(item, historiasStore.Formulario)
    showItem.value = true
}

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

function actualizarItemTrabajoSocial(item) {
    formularioItem.value = 'TrabajoSocial'
    varView.tipoHistoria = 'TrabajoSocial'
    actualizar.value = true
    mapCampos(item, historiasStore.Formulario)
    showItem.value = true
}

function cerrarNota() {
    showActualizarNota.value = false
}

// PDF
async function exportarNotaPDF(data) {
    exportarServicioPDF('Nota', data.id_analisis)
}

async function exportarEvolucionPDF(data) {
    exportarServicioPDF('Terapia', data.id_analisis)
}

async function exportarMedicinaPDF(data) {
    exportarServicioPDF('Medicina', data.id_analisis)
}

async function exportarNutricionPDF(data) {
    exportarServicioPDF('Evolucion', data.id)
}

async function exportarTrabajoSocialPDF(data) {
    exportarServicioPDF('Trabajo Social', data.id)
}

async function exportarHistoriaPDF() {
    // mapCampos(data, notasStore.Formulario)
    const paciente = historiasStore.Formulario.HistoriaClinica.id_paciente
    const pacientes = await pacientesStore.listPacientes()

    const dataPaciente = pacientes.filter(user => {
        return user.id_paciente === paciente
    })

    propiedadesHistoriaPDF.value = { ...dataPaciente[0], consultas: [...analisis.value] }
    activePdfHistoria.value = true
}

async function exportarServicioPDF(servicio, id_analisis) {
    try {
        varView.cargando = true
        const config = useRuntimeConfig()
        const token = decryptData(sessionStorage.getItem('token'))
        const res = await fetch(`${config.public.api}/api/v1/${servicio}/${id_analisis}/pdf`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf'
            }
        });
        if (!res.ok) {
            throw new Error(`Error en la petición: ${res.status}`);
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        // Opcion de abrimos el PDF en una nueva pestaña sin descargar
        window.open(url, '_blank');

        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        varView.cargando = false
    } catch (err) {
        console.error("Error al obtener el PDF:", err);
        varView.cargando = false
    }
}

function pdfMedicinas(data) {
    varView.propiedadesPDF = {
        id_paciente: historiasStore.Formulario.HistoriaClinica.id_paciente,
        ...data
    }
    varView.showPDFMedicamentos = true
}

// Propiedades calculadas
const fechaFormateada = () => {
    const fecha = new Date()
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const año = fecha.getFullYear();
    const fechaActual = `${dia}/${mes}/${año}`

    return fechaActual
}

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

const propiedadesActualizarNota = useNotasBuilder({
    storeId: 'ActualizarNota',
    storePinia: 'Notas',
    cerrarModal: cerrarNota,
    show: showActualizarNota,
})

// const builderCitas = new CitasBuilder()
const tablaBuilder = new TablaBuilder()

const restriccionCard = new CardBuilder()
const consultasCard = new CardBuilder()
const evolucionesCard = new CardBuilder()
const notasCard = new CardBuilder()
const tratamientosCard = new CardBuilder()
const medicacionCard = new CardBuilder()
const nutricionCard = new CardBuilder()
const trabajoSocialCard = new CardBuilder()

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

    const pdfHistorial = new PdfBuilder()

    const filasConsultas = (unref(analisis) || []).map(consulta => {
        const fechaOriginal = consulta.created_at;
        const fechaObj = new Date(fechaOriginal);
        const fecha = `${fechaObj.getDate().toString().padStart(2, '0')}/${(fechaObj.getMonth() + 1).toString().padStart(2, '0')}/${fechaObj.getFullYear()}`;

        const contenido = `
        <p class="text-start text-base py-2"><strong>Fecha:</strong> ${fecha}</p>
        <p class="text-start text-xs py-2"><strong>Motivo:</strong> ${consulta.motivo}</p>
        <p class="text-start text-xs py-2"><strong>Analisis:</strong> ${consulta.analisis || ''}</p>
        <p class="text-start text-xs py-2"><strong>Observacion:</strong> ${consulta.observacion || ''}</p>
        <p class="text-start text-xs py-2"><strong>Tipo analisis:</strong> ${consulta.tipoAnalisis || ''}</p>
        <p class="text-start text-xs py-2"><strong>Tratamiento:</strong> ${consulta.tratamiento || ''}</p>
        <hr class="w-full h-5"/>
        `
        return [contenido]
    });

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
                    { columna: 'estado', placeholder: 'Estado', datos: [{ text: 'Creada', value: 'Creada' }, { text: 'Nueva', value: 'Nueva' }] },
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
                acciones: [puedeVerMedicina ? { icon: 'fa-solid fa-file-pdf', accion: exportarHistoriaPDF } : { icon: 'fa-solid fa-file-pdf cursor-not-allowed text-gray-400 hover:text-gray-400', accion: () => { } }]
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
                .setContenedor('col-span-2')
                .setheaderSubTitle('')
                .setcontenedorCards('w-full flex justify-center w-full col-span-2')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-300)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[100%]!')
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
                    .setContenedor('col-span-2')
                    .setheaderSubTitle('')
                    .setcontenedorCards('w-full flex justify-center w-full col-span-2')
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
            .addComponente('PDFTemplate', pdfHistorial
                .setElementId('Historia')
                .setIsActive(activePdfHistoria)
                .setFileName(`paciente_${propiedadesHistoriaPDF.value.name}`)
                // ENCABEZADO PRINCIPAL
                .addComponente('Tabla', {
                    container: 'border-b-2 pb-3',
                    border: true,
                    columnas: [
                        '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                        `
                            <p class="text-sm border-b-1 pb-2 uppercase">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 pb-2 uppercase">Registro</p></br>
                            <p class="text-sm uppercase">Historial Clinico</p>
                        `,
                        `
                            <p class="w-full text-end text-xs border-b-1 pb-2">Codigo:</p>
                            <p class="w-full text-end text-xs border-b-1 pb-2">version:</p>
                            <p class="w-full text-end text-xs border-b-1 pb-2">Fecha: ${fechaFormateada()}</p>
                            <p class="w-full text-end text-xs">Pagina:</p>
                        `
                    ],
                })
                .addComponente('Texto', {
                    texto: 'Informacion del Paciente'
                })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3',
                    styles: {
                        backgroundColor: '#fff',
                    },
                    filas: [
                        ['<p class="w-full text-start text-xs">Nombres y Apellidos:</p>', '<p class="w-full text-start text-xs">Celular:</p>', '<p class="w-full text-start text-xs">Fecha de Nacimiento:</p>'],
                        [`${propiedadesHistoriaPDF.value.name}`, `${propiedadesHistoriaPDF.value.celular}`, `${propiedadesHistoriaPDF.value.nacimiento}`,],
                        ['<p class="w-full text-start text-xs pt-2">Tipo de Documento:</p>', '<p class="w-full text-start text-xs pt-2">Documento:</p>', '<p class="w-full text-start text-xs pt-2">Genero:</p>'],
                        [`${propiedadesHistoriaPDF.value.type_doc}`, `${propiedadesHistoriaPDF.value.No_document}`, `${propiedadesHistoriaPDF.value.sexo}`,],
                        ['<p class="w-full text-start text-xs pt-2">Direccion:</p>', '<p class="w-full text-start text-xs pt-2">Barrio:</p>', '<p class="w-full text-start text-xs pt-2">Zona:</p>'],
                        [`${propiedadesHistoriaPDF.value.direccion}`, `${propiedadesHistoriaPDF.value.barrio}`, `${propiedadesHistoriaPDF.value.zona}`,]
                    ],
                })
                .addComponente('Texto', {
                    texto: 'Datos Adicionales'
                })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3',
                    styles: {
                        backgroundColor: '#fff',
                    },
                    filas: [
                        ['<p class="w-full text-start text-xs">Municipio:</p>', '<p class="w-full text-start text-xs">Departamento:</p>', '<p class="w-full text-start text-xs">Telefono:</p>'],
                        [`${propiedadesHistoriaPDF.value.municipio}`, `${propiedadesHistoriaPDF.value.departamento}`, `${propiedadesHistoriaPDF.value.telefono}`,],
                        ['<p class="w-full text-start text-xs pt-2">EPS:</p>', '<p class="w-full text-start text-xs pt-2">Regimen:</p>', '<p class="w-full text-start text-xs pt-2">Vulnerabilidad:</p>'],
                        [`${propiedadesHistoriaPDF.value.Eps}`, `${propiedadesHistoriaPDF.value.regimen}`, `${propiedadesHistoriaPDF.value.vulnerabilidad}`,],
                    ],
                })
                .addComponente('Espacio', {
                    alto: 24
                })
                .addComponente('Texto', {
                    texto: 'Resumen de Historias Clinicas'
                })
                .addComponente('Tabla', {
                    container: 'w-full space-y-2 rounded-xl py-3! px-2 flex flex-col',
                    styles: {
                        border: '1px solid #DBEAFE',
                    },
                    filas: filasConsultas.length > 0
                        ? filasConsultas
                        : [['<p class="text-xs text-gray-500">No hay consultas registradas</p>']],
                })
            )

            // consultas
            .nuevaSeccion('Consultas', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaConsultas
                .setColumnas([
                    { titulo: 'motivo', value: 'Motivo', tamaño: 250, ordenar: true },
                    { titulo: 'observacion', value: 'Observacion', tamaño: 250, ordenar: true },
                    { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 250 },
                ])
                .setHeaderTabla(
                    {
                        titulo:
                            'Consultas y Analisis',
                        color: 'bg-[var(--color-default-600)] text-white',
                        espacioMargen: '500',
                        buscador: true,
                        filtros: [
                            { columna: 'tipoAnalisis', placeholder: 'Estado' },
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
                        { icon: 'ver', action: verItemConsultasHistoria },
                        puedePutMedicina ? { icon: 'actualizar', action: actualizarItemConsultasHistoria } : '',
                        { icon: 'pdf', action: exportarMedicinaPDF }
                    ], botones: true,
                })
            )
            .addComponente('Form', propiedadesItemHistoria)


            // Terapias
            .nuevaSeccion('evoluciones', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaEvoluciones
                .setColumnas([
                    { titulo: 'fecha', value: 'Fecha', tamaño: 100, ordenar: true },
                    { titulo: 'hora', value: 'Hora', tamaño: 250, ordenar: true },
                    { titulo: 'evolucion', value: 'Evolucion', tamaño: 150 },
                ])
                .setHeaderTabla({
                    titulo: 'Avances de Tratamientos',
                    color: 'bg-[var(--color-default-600)] text-white',
                    espacioMargen: '500',
                    buscador: true,
                    filtros: [
                        { columna: 'fecha', placeholder: 'Fecha' },
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
                .setAcciones({ icons: [{ icon: 'pdf', action: exportarEvolucionPDF }, puedePutTerapias ? { icon: 'actualizar', action: actualiazrItemTerapia } : ''], botones: true, })
                .setDatos(puedeVerTerapias ? evoluciones : [])
            )
            .addComponente('Form', propiedadesItemHistoria)


            //  notas
            .nuevaSeccion('notas', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaNotas
                .setColumnas([
                    { titulo: 'fecha_nota', value: 'Fecha', tamaño: 100, ordenar: true },
                    { titulo: 'hora_nota', value: 'Hora', tamaño: 150 },
                    { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 400 },
                ])
                .setDatos(puedeVerNotas ? notas : [])
                .setAcciones({
                    icons: [
                        { icon: estadoSemaforo, action: () => { } },
                        { icon: 'pdf', action: exportarNotaPDF },
                        puedePutNotas ? { icon: 'actualizar', action: actualizarNota } : ''
                    ], botones: true,
                })
                .setHeaderTabla({
                    titulo: 'Notas Medicas',
                    color: 'bg-[var(--color-default-600)] text-white',
                    espacioMargen: '500',
                    buscador: true,
                    filtros: [
                        { columna: 'tipoAnalisis', placeholder: 'Estado' },
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
                    { titulo: 'procedimiento', value: 'Procedimiento', tamaño: 300, ordenar: true },
                    { titulo: 'codigo', value: 'CUPS', tamaño: 250, ordenar: true },
                    { titulo: 'dias_asignados', value: 'No. Dias', tamaño: 250 },
                ])
                .setDatos(puedeVerTratamientos ? tratamientos : [])
                .setAcciones({
                    icons: [
                        { icon: estadoSemaforo, action: () => { } },
                        { icon: 'ver', action: verItemTratamientoHistoria },
                        puedePutTratamientos ? { icon: 'actualizar', action: actualizarItemTratamientoHistoria } : ''], botones: true,
                })
                .setHeaderTabla({
                    titulo: 'Tratamientos',
                    color: 'bg-[var(--color-default-600)] text-white',
                    espacioMargen: '500',
                    buscador: true,
                })
            )
            .addComponente('Form', propiedadesItemHistoria)


            // medicinas
            .nuevaSeccion('medicinas', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaMedicacion
                .setColumnas([
                    { titulo: 'medicamento', value: 'Medicamento', tamaño: 200, ordenar: true },
                    { titulo: 'dosis', value: 'Dosis', tamaño: 200, ordenar: true },
                    { titulo: 'cantidad', value: 'Cantidad', tamaño: 150 },
                    { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 250 },
                ])
                .setDatos(puedeVerMedicacion ? medicinas : [])
                .setAcciones({
                    icons: [
                        { icon: estadoSemaforo, action: () => { } },
                        { icon: 'ver', action: verItemMedicamentoHistoria },
                        puedePutMedicacion ? { icon: 'actualizar', action: actualizarItemMedicamentoHistoria } : '',
                        { icon: 'pdf', action: pdfMedicinas }], botones: true,
                })
                .setHeaderTabla({
                    titulo: 'Medicamentos del Paciente',
                    color: 'bg-[var(--color-default-600)] text-white',
                    espacioMargen: '500',
                    buscador: true,
                    filtros: [
                        { columna: 'tipoAnalisis', placeholder: 'Estado' },
                    ]
                })
            )
            .addComponente('Form', propiedadesItemHistoria)


            // nutricion
            .nuevaSeccion('nutricion', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaNutricion
                .setColumnas([
                    { titulo: 'analisis', value: 'Analisis', tamaño: 200, ordenar: true },
                    { titulo: 'motivo', value: 'Motivo', tamaño: 200, ordenar: true },
                    { titulo: 'created_at', value: 'Fecha', tamaño: 150 },
                ])
                .setDatos(puedeVerEvoluciones ? nutricion : [])
                .setAcciones({
                    icons: [
                        { icon: 'pdf', action: exportarNutricionPDF },
                        puedePutEvoluciones ? { icon: 'actualizar', action: actualizarItemEvolucionHistoria } : ''
                    ], botones: true,
                })
                .setHeaderTabla({
                    titulo: 'Evoluciones',
                    color: 'bg-[var(--color-default-600)] text-white',
                    buscador: true,
                    filtros: [
                        { columna: 'created_at', placeholder: 'Fecha' },
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
                    { titulo: 'analisis', value: 'Analisis', tamaño: 200, ordenar: true },
                    { titulo: 'motivo', value: 'Motivo', tamaño: 200, ordenar: true },
                    { titulo: 'created_at', value: 'Fecha', tamaño: 150 },
                ])
                .setDatos(puedeVerTrabajo ? trabajosSocial : [])
                .setAcciones({
                    icons: [
                        { icon: 'pdf', action: exportarTrabajoSocialPDF },
                        puedePutTrabajo ? { icon: 'actualizar', action: actualizarItemTrabajoSocial } : ''
                    ], botones: true,
                })
                .setHeaderTabla({
                    titulo: 'Trabajo Social',
                    color: 'bg-[var(--color-default-600)] text-white',
                    buscador: true,
                    filtros: [
                        { columna: 'creted_at', placeholder: 'Fecha' },
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


        )

    return pagina.build()
});

</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
    <PDFFormulaMedica v-if="varView.showPDFMedicamentos"></PDFFormulaMedica>
    <ExportarPDFs v-if="varView.showExportarPDFs" :datos="analisis" />
</template>