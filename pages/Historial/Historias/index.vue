<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import PDFFormulaMedica from '~/components/paginas/PDFFormulaMedica.vue';

import { ref, onMounted, unref, toRaw } from 'vue';
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

const varView = useVarView();
const historiasStore = useHistoriasStore();
const notasStore = useNotasStore();
const config = useRuntimeConfig()

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

const show = ref(false);
const showItem = ref(false)
const showNota = ref(false)
const showActualizarNota = ref(false)
const refresh = ref(1);

const pacientesStore = usePacientesStore();
const medicoStore = useMedicosStore()
const store = useIndexedDBStore()
const showVerHistorial = ref(false)
const showNuevoPaciente = ref(false)
const formularioItem = ref('')
const actualizar = ref(false)
const activePdfNotas = ref(false)
const activePdfEvolucion = ref(false)
const activePdfNutricion = ref(false)
const activePdfTrabajoSocial = ref(false)
const activePdfMedicina = ref(false)
const propiedadesNotaPDF = ref({})
const propiedadesEvolucionPDF = ref({})
const propiedadesNutricionPDF = ref([])
const propiedadesTrabajoSocialPDF = ref([])
const propiedadesMedicinaPDF = ref([])

const propiedadesHistoriaPDF = ref({})
const activePdfHistoria = ref(false)

const puedePostAnalisis = ref(Boolean)

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

watch(() => showNota.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos();
            refresh.value++;
        }
    }
);

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await llamadatos()
    varView.cargando = false
});


// visibilidad ver Historial
const verHistoria = async (his) => {
    await cargaHistorial(his.id)
    historiasStore.Formulario.HistoriaClinica.name_paciente = his.paciente
    historiasStore.Formulario.HistoriaClinica.No_document_paciente = his.cedula
    historiasStore.Formulario.HistoriaClinica.id_paciente = his.id
    showVerHistorial.value = true
};

async function cargaHistorial(id) {
    varView.cargando = true

    // Reiniciar valores
    analisis.value = []
    notas.value = []
    tratamientos.value = []
    medicinas.value = [];
    evoluciones.value = [];
    nutricion.value = [];
    diagnosticos.value = []
    trabajosSocial.value = []

    const historia = await pacientesStore.listDatos(id, 'HistoriaClinica', 'id')
    const allAnalisis = await historiasStore.listDatos(historia[0]?.id, 'Analisis', 'id_historia')

    // Analisis
    let analisisDatos = []

    allAnalisis.map((analisis) => {
        if (analisis.servicio === 'Evolucion') {
            nutricion.value.push({ ...analisis })
        } else if (analisis.servicio === 'Trabajo Social') {
            trabajosSocial.value.push({ ...analisis })
        } else if (analisis.servicio === 'Medicina') {
            analisisDatos.push({ ...analisis })
        }
    })

    // Consultas
    if (allAnalisis || allAnalisis.length > 0) {
        for (const item of analisisDatos) {
            const examenFisico = await historiasStore.listDatos(item.id, 'ExamenFisico', 'id_analisis') || [];

            analisis.value.push({ ...item, ...examenFisico[0] })
        }
    } else {
        analisis.value = []
    }

    // Evoluciones
    evoluciones.value = await pacientesStore.listDatos(id, 'Terapia') || []

    // Notas
    notas.value = await pacientesStore.listDatos(id, 'Nota') || []


    // Tratamientos
    tratamientos.value = await pacientesStore.listDatos(id, 'Plan_manejo_procedimientos') || []


    // Medicinas
    if (allAnalisis || allAnalisis.length > 0) {
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
    } else {
        medicinas.value = []
    }

    // Diagnosticos

    if (allAnalisis || allAnalisis.length > 0) {
        // Obtener todos los diagnosticos asociados a cada id_analisis de la historia
        const diagnosticosPorAnalisis = await Promise.all(
            allAnalisis.map(async (h) => {

                const diagnostico = await historiasStore.listDatos(h.id, 'Diagnosticos', 'id_analisis') || []
                const diagnosticoCIF = await historiasStore.listDatos(h.id, 'DiagnosticosCIF', 'id_analisis') || []

                return {
                    diagnostico,
                    diagnosticoCIF
                }
            })
        )

        // Unificar todos los medicamentos en un solo array
        diagnosticos.value = diagnosticosPorAnalisis.map(d => d.diagnostico).flat()
        diagnosticosCIF.value = diagnosticosPorAnalisis.map(d => d.diagnosticoCIF).flat()
    } else {
        diagnosticos.value = []
        diagnosticosCIF.value = []
    }

    varView.cargando = false
};

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

function actualizarItemEvolucionHistoria(item) {
    console.log(item)
    formularioItem.value = 'Evolucion'
    varView.tipoHistoria = 'Evolucion'
    actualizar.value = true
    mapCampos(item, historiasStore.Formulario)
    showItem.value = true
}

// Visibilidad notas
function actualizarNota(nota) {
    mapCampos(nota, notasStore.Formulario)
    notasStore.Formulario.Nota.name_paciente = historiasStore.Formulario.HistoriaClinica.name_paciente
    notasStore.Formulario.Nota.No_document_paciente = historiasStore.Formulario.HistoriaClinica.No_document_paciente
    notasStore.Formulario.Nota.id_temporal = nota.id_temporal
    showActualizarNota.value = true
}

function cerrarNota() {
    showNota.value = false
    showActualizarNota.value = false
}

// PDF
async function exportarNotaPDF(data) {
    varView.cargando = true
    const pacientes = await pacientesStore.listPacientes()
    const profesionales = await medicoStore.listMedicos(false)

    const dataPaciente = pacientes.find(user => {
        return user.id_paciente === data.id_paciente
    })

    const profesional = profesionales.find(medico => {
        return medico.id_profesional === data.id_profesional
    });

    store.almacen = 'Descripcion_nota'
    const descripcion = await store.leerdatos()

    const tiposOrden = ["subjetivo", "objetivo", "actividades", "plan", "intervencion", "evaluacion"];

    const descripcionesNota = (descripcion || []).filter(d => d.id_nota === data.id);

    // Agrupar por tipo
    const agrupadoPorTipo = descripcionesNota.reduce((acc, nota) => {
        if (!acc[nota.tipo]) acc[nota.tipo] = [];
        acc[nota.tipo].push(nota);
        return acc;
    }, {});

    // Construir filas ordenadas
    const filasNotas = tiposOrden.map(tipo => {
        const notasTipo = (agrupadoPorTipo[tipo] || []).sort((a, b) => {
            // Ordenar por hora ascendente
            return (a.hora || "").localeCompare(b.hora || "");
        });

        if (notasTipo.length === 0) return ""; // si no hay notas de ese tipo, no mostrar nada

        // Encabezado con el nombre del tipo
        let contenido = `<p class="text-start text-xs py-1"><strong>${tipo.toUpperCase()}:</strong></p>`;

        // Filas de cada nota
        contenido += notasTipo.map(nota => `
            <div class="flex">
                <p class="text-xs border-r-1 px-3 py-1">${nota.hora || ''}</p>
                <p class="text-xs w-full px-1">${nota.descripcion || ''}</p>
            </div>
        `).join("");

        // Separador visual
        contenido += `<hr class="w-full h-1"/>`;

        return contenido;
    }).join("");


    const diagnosticosNota = Array.isArray(unref(diagnosticos.value))
        ? toRaw(diagnosticos.value)
            .filter(diagnostico => diagnostico.id_analisis === data.id_analisis) // filtra solo los que aplican
            .map(diagnostico => [
                `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
                `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
            ])
        : [];

    propiedadesNotaPDF.value = { ...data, ...dataPaciente, nameProfesional: profesional.name, cedulaProfesional: profesional.No_document, sello: profesional.sello, filasNotas, diagnosticosNota }
    activePdfNotas.value = true
    varView.cargando = false
}

async function exportarEvolucionPDF(data) {
    varView.cargando = true

    const pacientes = await pacientesStore.listPacientes()
    const profesionales = await medicoStore.listMedicos(false)

    const dataPaciente = pacientes.find(user => {
        return user.id_paciente === data.id_paciente
    });

    const profesional = profesionales.find(medico => {
        return medico.id_profesional === data.id_profesional
    })

    const diagnosticosTerapia = Array.isArray(unref(diagnosticos.value))
        ? toRaw(diagnosticos.value)
            .filter(diagnostico => diagnostico.id_analisis === data.id_analisis) // filtra solo los que aplican
            .map(diagnostico => [
                `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
                `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
            ])
        : [];

    const diagnosticosCIFs = Array.isArray(unref(diagnosticosCIF.value))
        ? toRaw(diagnosticosCIF.value)
            .filter(diagnostico => diagnostico.id_analisis === data.id_analisis) // filtra solo los que aplican
            .map(diagnostico => [
                `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
                `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
            ])
        : [];

    propiedadesEvolucionPDF.value = {
        ...data,
        ...dataPaciente,
        nameProfesional:
            profesional.name,
        cedulaProfesional:
            profesional.No_document,
        sello: profesional.sello,
        diagnosticosTerapia,
        diagnosticosCIFs,
    }
    activePdfEvolucion.value = true
    varView.cargando = false
}

async function exportarMedicinaPDF(data) {
    varView.cargando = true

    const pacientes = await pacientesStore.listPacientes()
    const profesionales = await medicoStore.listMedicos(false)

    const historia = await historiasStore.listDatos(data.id_historia, 'HistoriaClinica', 'id')
    const id_paciente = historia[0]?.id_paciente

    const dataPaciente = pacientes.find(user => {
        return user.id_paciente === id_paciente || null
    });

    const profesional = profesionales.find(medico => {
        return medico.id_profesional === data.id_medico
    })

    const enfermedad = await historiasStore.listDatos(data.id_analisis, 'Enfermedad', 'id_analisis')
    const medicamentosData = await historiasStore.listDatos(data.id_analisis, 'Plan_manejo_medicamentos', 'id_analisis')
    const procedimientosData = await historiasStore.listDatos(id_paciente, 'Plan_manejo_procedimientos', 'id_paciente')
    const antecedentesData = await historiasStore.listDatos(id_paciente, 'Antecedentes', 'id_paciente')

    const diagnosticosMedicina = Array.isArray(unref(diagnosticos.value))
        ? toRaw(diagnosticos.value)
            .filter(diagnostico => diagnostico.id_analisis === data.id_analisis) // filtra solo los que aplican
            .map(diagnostico => [
                `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
                `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
            ])
        : [];

    const antecedentes = antecedentesData.map(antecedente => [
        `<p class="text-xs leading-tight text-center py-1">${antecedente.descripcion}</p>`,
    ])

    const medicamentos = medicamentosData.map(medicamento => [
        `<p class="text-xs leading-tight py-1">${medicamento.medicamento}</p>`,
        `<p class="text-xs leading-tight py-1">${medicamento.dosis}</p>`,
        `<p class="text-xs leading-tight py-1">${medicamento.cantidad}</p>`,
    ])

    const procedimientos = procedimientosData.map(procedimiento => [
        `<p class="text-xs leading-tight py-1">${procedimiento.procedimiento}</p>`,
        `<p class="text-xs leading-tight py-1">${procedimiento.codigo}</p>`,
        `<p class="text-xs leading-tight py-1">${procedimiento.dias_asignados}</p>`,
    ])

    propiedadesMedicinaPDF.value = {
        ...data,
        ...dataPaciente,
        nameProfesional: profesional.name, cedulaProfesional: profesional.No_document, sello: profesional.sello,
        diagnosticosMedicina,
        Enfermedad: { ...enfermedad[0] },
        Medicamentos: medicamentos,
        Procedimientos: procedimientos,
        Antecedentes: antecedentes,
    }; console.log(propiedadesMedicinaPDF.value)
    activePdfMedicina.value = true
    varView.cargando = false
}

async function exportarNutricionPDF(data) {
    varView.cargando = true
    const pacientes = await pacientesStore.listPacientes()
    const profesionales = await medicoStore.listMedicos(false)

    const historia = await historiasStore.listDatos(data.id_historia, 'HistoriaClinica', 'id')
    const id_paciente = historia[0]?.id_paciente

    const dataPaciente = pacientes.filter(user => {
        return user.id_paciente === id_paciente || null
    });

    const profesional = profesionales.find(medico => {
        return medico.id_profesional === data.id_medico
    })

    const diagnosticosEvolucion = Array.isArray(unref(diagnosticos.value))
        ? toRaw(diagnosticos.value)
            .filter(diagnostico => diagnostico.id_analisis === data.id) // filtra solo los que aplican
            .map(diagnostico => [
                `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
                `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
            ])
        : [];

    propiedadesNutricionPDF.value = { ...data, ...dataPaciente[0], nameProfesional: profesional.name, cedulaProfesional: profesional.No_document, sello: profesional.sello, diagnosticosEvolucion }
    activePdfNutricion.value = true
    varView.cargando = false
}

async function exportarTrabajoSocialPDF(data) {
    varView.cargando = true

    const pacientes = await pacientesStore.listPacientes()
    const profesionales = await medicoStore.listMedicos(false)

    const historia = await historiasStore.listDatos(data.id_historia, 'HistoriaClinica', 'id')
    const id_paciente = historia[0]?.id_paciente

    const dataPaciente = pacientes.filter(user => {
        return user.id_paciente === id_paciente || null
    });

    const profesional = profesionales.find(medico => {
        return medico.id_profesional === data.id_medico
    })

    const diagnosticosTrabajoS = Array.isArray(unref(diagnosticos.value))
        ? toRaw(diagnosticos.value)
            .filter(diagnostico => diagnostico.id_analisis === data.id) // filtra solo los que aplican
            .map(diagnostico => [
                `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
                `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
            ])
        : [];

    propiedadesTrabajoSocialPDF.value = { ...data, ...dataPaciente[0], nameProfesional: profesional.name, cedulaProfesional: profesional.No_document, sello: profesional.sello, diagnosticosTrabajoS }
    activePdfTrabajoSocial.value = true
    varView.cargando = false
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

function pdfMedicinas (data) {
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

function calcularEdad(fechaNacimiento) {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)

    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()

    // Ajustar si aún no ha cumplido años este año
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--
    }

    return edad
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
    // const puedePost = varView.getPermisos.includes('Historias_post')
    const puedePUT = varView.getPermisos.includes('Historias_put')
    // const puedePUT = false
    puedePostAnalisis.value = varView.getPermisos.includes('Diagnosticos_view')
    const puedeVerNotas = varView.getPermisos.includes('Notas_view')
    const puedeVerEvoluciones = varView.getPermisos.includes('Evoluciones_view')
    const puedeVerTerapias = varView.getPermisos.includes('Terapias_view')
    const puedeVerTratamientos = varView.getPermisos.includes('Tratamientos_view')
    const puedeVerMedicacion = varView.getPermisos.includes('Medicacion_view')
    const puedeVerMedicina = varView.getPermisos.includes('MedicinaGeneral_view')
    const puedeVerTrabajo = varView.getPermisos.includes('TrabajoSocial_view')

    const tablaConsultas = new TablaBuilder()
    const tablaEvoluciones = new TablaBuilder()
    const tablaNotas = new TablaBuilder()
    const tablaTratamientos = new TablaBuilder()
    const tablaMedicacion = new TablaBuilder()
    const tablaNutricion = new TablaBuilder()
    const tablaTrabajoSocial = new TablaBuilder()

    const pdfNotas = new PdfBuilder()
    const pdfHistorial = new PdfBuilder()
    const pdfEvolucion = new PdfBuilder()
    const pdfNutricion = new PdfBuilder()
    const pdfTrabajoSocial = new PdfBuilder()
    const pdfMedicina = new PdfBuilder()

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
                acciones: [puedeVerMedicina ? { icon: 'fa-solid fa-file-pdf', accion: exportarHistoriaPDF } : { icon: 'fa-solid fa-file-pdf cursor-not-allowed text-gray-400 hover:text-gray-400', accion: ()=>{} }]
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
                :  consultasCard               
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
                    // puedePostAnalisis.value ? { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 250 } : { titulo: 'ta', value: 'Estado'},
                ])
                .setHeaderTabla({ titulo: 'Consultas y Analisis', color: 'bg-[var(--color-default-600)] text-white', })
                .setDatos(puedeVerMedicina ? analisis : [])
                .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: verItemConsultasHistoria }, puedePUT ? { icon: 'actualizar', action: actualizarItemConsultasHistoria } : '', { icon: 'pdf', action: exportarMedicinaPDF }], botones: true, })
            )
            .addComponente('Form', propiedadesItemHistoria)
            .addComponente('PDFTemplate', pdfMedicina
                .setElementId('Medicina')
                .setIsActive(activePdfMedicina)
                .setFileName(`MEDICINA ${propiedadesMedicinaPDF.value.name} ${fechaFormateada()}`)
                .setSello(`${config.public.api}/storage/${propiedadesMedicinaPDF.value.sello}`)
                // ENCABEZADO PRINCIPAL
                .addComponente('Tabla', {
                    container: 'border-b-1 pb-3',
                    border: true,
                    columnas: [
                        '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                        `
                            <p class="text-sm border-b-1 pb-1 uppercase">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 pb-1 uppercase">Registro</p></br>
                            <p class="text-sm uppercase">Historia Clinica </br> Medicina general domiciliaria</p></br>
                        `,
                        `
                            <p class="w-full text-start text-xs border-b-1 pb-2">Codigo: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">version: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">Fecha: ${fechaFormateada()}</p>
                            <p class="w-full text-start text-xs">Pagina: 1 de 1</p>
                        `
                    ],
                })

                // DATOS DEL PACIENTE
                .addComponente('Texto', { texto: 'Datos del paciente' })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3',
                    filas: [
                        [
                            `<p class="text-xs w-full">Nombre completo: <span class="text-xs">${propiedadesMedicinaPDF.value.name}</span></p>`,
                            `<p class="text-xs w-full"></p>`,
                        ],
                        [
                            [`<p class="text-xs">No documento: <span class="text-xs">${propiedadesMedicinaPDF.value.No_document}</span></p>
                            <p class="text-xs">Tipo de documento: <span class="text-xs">${propiedadesMedicinaPDF.value.type_doc}</span></p>`],
                            [`<p class="text-xs">Edad: <span class="text-xs">${calcularEdad(propiedadesMedicinaPDF.value.nacimiento)}</span></p>
                            <p class="text-xs">Sexo: <span class="text-xs">${propiedadesMedicinaPDF.value.sexo}</span></p>`],
                        ],
                        [
                            `<p class="text-xs">EPS: <span class="text-xs">${propiedadesMedicinaPDF.value.Eps}</span></p>`,
                            `<p class="text-xs">Zona: <span class="text-xs">${propiedadesMedicinaPDF.value.zona}</span></p>`
                        ],
                        [
                            `<p class="text-xs">Regimen: <span class="text-xs">${propiedadesMedicinaPDF.value.regimen}</span></p>`,
                            `<p class="text-xs">Direccion: <span class="text-xs">${propiedadesMedicinaPDF.value.direccion}</span></p>`
                        ],
                        [
                            `<p class="text-xs">Vulnerabilidad: <span class="text-xs">${propiedadesMedicinaPDF.value.vulnerabilidad}</span></p>`,
                            `<p class="text-xs">Celular: <span class="text-xs">${propiedadesMedicinaPDF.value.celular}</span></p>`
                        ],
                    ],
                })

                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Diagnósticos', 'CIE-10'],
                    filas: propiedadesMedicinaPDF.value.diagnosticosMedicina?.length > 0
                        ? propiedadesMedicinaPDF.value.diagnosticosMedicina
                        : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
                })

                .addComponente('Espacio', { alto: 16 })

                // SECCIÓN: NOTA DE ENFERMERÍA
                .addComponente('Tabla', {
                    filas: [
                        [
                            `<p class="text-sm text-center py-1 font-bold">Motivo de consulta</p>`,
                        ],
                        [
                            `<p class="text-sm text-center py-2">${propiedadesMedicinaPDF.value.motivo}</p>`
                        ],
                    ],
                })
                .addComponente('Tabla', {
                    filas: [
                        [
                            `<p class="text-sm text-center py-1 font-bold">Enfermedad Actual</p>`,
                        ],
                        [
                            `<p class="text-sm text-center py-2">${propiedadesMedicinaPDF.value.Enfermedad?.valor}</p>`
                        ],
                    ],
                })
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Antecedentes'],
                    filas: propiedadesMedicinaPDF.value.Antecedentes?.length > 0
                        ? propiedadesMedicinaPDF.value.Antecedentes
                        : [['<p class="text-xs text-center">Sin antecedentes registrados</p>']]
                })

                .addComponente('Titulo', { texto: 'EXAMEN FISICO' })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3!',
                    filas: [
                        [
                            '<p class="text-sm w-full">TA</p>',
                            '<p class="text-sm w-full">FC</p>',
                            '<p class="text-sm w-full">FR</p>',
                            '<p class="text-sm w-full">T</p>',
                            '<p class="text-sm w-full">SAT O2</p>',
                        ],
                        [
                            `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.signosVitales?.ta}</p>`,
                            `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.signosVitales?.fc}</p>`,
                            `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.signosVitales?.fr}</p>`,
                            `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.signosVitales?.t}</p>`,
                            `<p class="text-sm w-full">${propiedadesMedicinaPDF.value.signosVitales?.SATo2}</p>`,
                        ],

                    ],
                })

                .addComponente('Espacio', { alto: 32 })
                .addComponente('Tabla', {
                    filas: [
                        [
                            `<p class="text-sm text-center py-1 font-bold">Analsis/Tratamiento</p>`,
                        ],
                        [
                            `<p class="text-sm text-center py-2">${propiedadesMedicinaPDF.value.analisis}</p>`
                        ],
                    ],
                })

                .addComponente('Texto', { texto: 'PLAN DE MANEJO' })
                .addComponente('Espacio', { alto: 16 })
                .addComponente('Titulo', { texto: 'Medicamentos' })
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Nombre del Medicamento', 'Dosis', 'Cantidad de dias'],
                    filas: propiedadesMedicinaPDF.value.Medicamentos?.length > 0
                        ? propiedadesMedicinaPDF.value.Medicamentos
                        : [['<p class="text-xs">Sin antecedentes registrados</p>']]
                })

                .addComponente('Titulo', { texto: 'Procedimientos' })
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Descripcion', 'CUPS', 'Dias asignados'],
                    filas: propiedadesMedicinaPDF.value.Procedimientos?.length > 0
                        ? propiedadesMedicinaPDF.value.Procedimientos
                        : [['<p class="text-xs">Sin antecedentes registrados</p>']]
                })

                .addComponente('Espacio', { alto: 32 })
                // PIE DE FIRMA
                .addComponente('Tabla', {
                    container: 'pt-5',
                    border: false,
                    columnas: [
                        `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Nombre del Profesional</p> </hr>
                                <p class="text-xs text-center pt-9">${propiedadesMedicinaPDF.value.nameProfesional}</p> </hr>
                                <p class="text-xs text-center pt-3">${propiedadesMedicinaPDF.value.cedulaProfesional}</p>
                            <div>
                            `,
                        `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Firma o sello del Profesional</p>
                                <div class="flex justify-center items-center" id="selloProfesional"><img src="${config.public.api}/storage/${propiedadesMedicinaPDF.value.sello}" class="w-[100px] h-[100px] pt-1"/></div>
                            </div>
                            `
                    ],
                })
            )


            // Terapias
            .nuevaSeccion('evoluciones', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaEvoluciones
                .setColumnas([
                    { titulo: 'fecha', value: 'Fecha', tamaño: 100, ordenar: true },
                    { titulo: 'hora', value: 'Hora', tamaño: 250, ordenar: true },
                    { titulo: 'evolucion', value: 'Evolucion', tamaño: 150 },
                ])
                .setHeaderTabla({ titulo: 'Avances de Tratamientos', color: 'bg-[var(--color-default-600)] text-white', })
                .setAcciones({ icons: [{ icon: 'pdf', action: exportarEvolucionPDF }], botones: true, })
                .setDatos(puedeVerTerapias ? evoluciones : [])
            )
            .addComponente('PDFTemplate', pdfEvolucion
                .setElementId('Evolucion')
                .setIsActive(activePdfEvolucion)
                .setFileName(`TRATAMIENTO ${propiedadesEvolucionPDF.value.name} ${fechaFormateada()}`)
                .setSello(`${config.public.api}/storage/${propiedadesEvolucionPDF.value.sello}`)
                // ENCABEZADO PRINCIPAL
                .addComponente('Tabla', {
                    container: 'border-b-2 pb-3',
                    border: true,
                    columnas: [
                        '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                        `
                            <p class="text-sm border-b-1 pb-1">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 pb-1">Registro</p></br>
                            <p class="text-sm">Reporte de la atencion terapeutica realizada por especialidad</p></br>
                        `,
                        `
                            <p class="w-full text-start text-xs border-b-1 pb-2">Codigo: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">version: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">Fecha: ${fechaFormateada()}</p>
                            <p class="w-full text-start text-xs">Pagina: 1 de 1</p>
                        `
                    ],
                })

                // DATOS DEL PACIENTE
                .addComponente('Texto', { texto: 'Datos del paciente' })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3',
                    filas: [
                        [
                            `<p class="text-xs w-full">Nombre completo: <span class="text-xs">${propiedadesEvolucionPDF.value.name}</span></p>`,
                            `<p class="text-xs w-full"></p>`,
                        ],
                        [
                            [`<p class="text-xs">No documento: <span class="text-xs">${propiedadesEvolucionPDF.value.No_document}</span></p>
                            <p class="text-xs">Tipo de documento: <span class="text-xs">${propiedadesEvolucionPDF.value.type_doc}</span></p>`],
                            [`<p class="text-xs">Edad: <span class="text-xs">${calcularEdad(propiedadesEvolucionPDF.value.nacimiento)}</span></p>
                            <p class="text-xs">Sexo: <span class="text-xs">${propiedadesEvolucionPDF.value.sexo}</span></p>`],
                        ],
                        [
                            `<p class="text-xs">EPS: <span class="text-xs">${propiedadesEvolucionPDF.value.Eps}</span></p>`,
                            `<p class="text-xs">Zona: <span class="text-xs">${propiedadesEvolucionPDF.value.zona}</span></p>`
                        ],
                    ],
                })

                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Diagnósticos', 'CIE-10'],
                    filas: propiedadesEvolucionPDF.value.diagnosticosTerapia?.length > 0
                        ? propiedadesEvolucionPDF.value.diagnosticosTerapia
                        : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
                })
                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Diagnósticos', 'CIF'],
                    filas: propiedadesEvolucionPDF.value.diagnosticosCIFs?.length > 0
                        ? propiedadesEvolucionPDF.value.diagnosticosCIFs
                        : [['<p class="text-xs">Sin diagnósticos CIF registrados</p>', '']]
                })

                .addComponente('Espacio', { alto: 16 })

                // SECCIÓN: NOTA DE ENFERMERÍA
                .addComponente('Tabla', {
                    filas: [
                        [
                            `<p class="text-sm font-bold text-center py-1">Objetivos de la intervencion terapeutica</p>`,
                        ],
                        [
                            `<p class="text-sm text-center py-2">${propiedadesEvolucionPDF.value.objetivos}</p>`
                        ],
                    ],
                })

                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3!',
                    filas: [
                        [
                            '<p class="text-sm w-full font-bold">Sesion</p>',
                            '<p class="text-sm w-full font-bold">Fecha y hora:</p>',
                            '<p class="text-sm w-full font-bold">Evolucion (condición inicial, objetivo de la sesión, técnica método y/o intervención que se realice, condicion final)</p>'
                        ],
                        [
                            `<p class="text-sm w-full">${propiedadesEvolucionPDF.value.sesion}</p>`,
                            `<p class="text-sm w-full">${propiedadesEvolucionPDF.value.fecha}</p> </hr> <p class="text-sm w-full">${propiedadesEvolucionPDF.value.hora}</p>`,
                            `<p class="text-sm w-full">${propiedadesEvolucionPDF.value.evolucion}</p>`,
                        ],

                    ],
                })

                .addComponente('Espacio', { alto: 32 })

                // PIE DE FIRMA
                .addComponente('Tabla', {
                    container: 'pt-5',
                    border: false,
                    columnas: [
                        `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Nombre del Profesional</p> </hr>
                                <p class="text-xs text-center pt-9">${propiedadesEvolucionPDF.value.nameProfesional}</p> </hr>
                                <p class="text-xs text-center pt-3">${propiedadesEvolucionPDF.value.cedulaProfesional}</p>
                            <div>
                            `,
                        `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Firma o sello del Profesional</p>
                                <div class="flex justify-center items-center" id="selloProfesional"><img src="${config.public.api}/storage/${propiedadesEvolucionPDF.value.sello}" class="w-[100px] h-[100px] pt-1"/></div>
                            </div>
                            `
                    ],
                })
            )


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
                        // puedePUT ? { icon: 'actualizar', action: actualizarNota } : ''
                    ], botones: true,
                })
                .setHeaderTabla({ titulo: 'Notas Medicas', color: 'bg-[var(--color-default-600)] text-white', espacioMargen: '500' })
            )
            // .addComponente('Form', propiedadesActualizarNota)
            .addComponente('PDFTemplate', pdfNotas
                .setElementId('Nota')
                .setIsActive(activePdfNotas)
                .setFileName(`NOTA ${propiedadesNotaPDF.value.name} ${fechaFormateada()}`)
                .setSello(`${config.public.api}/storage/${propiedadesEvolucionPDF.value.sello}`)
                // ENCABEZADO PRINCIPAL
                .addComponente('Tabla', {
                    container: 'border-b-2 pb-3',
                    border: true,
                    columnas: [
                        '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                        `
                            <p class="text-sm border-b-1 uppercase">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 uppercase">Registro</p></br>
                            <p class="text-sm uppercase">Nota de enfermeria de atencion domiciliaria</p>
                        `,
                        `
                            <p class="w-full text-start text-xs border-b-1 pb-2">Codigo: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">version: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">Fecha: ${fechaFormateada()}</p>
                            <p class="w-full text-start text-xs">Pagina: 1 de 1</p>
                        `
                    ],
                })

                // DATOS DEL PACIENTE
                .addComponente('Texto', { texto: 'Datos del paciente' })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3',
                    filas: [
                        [
                            `<p class="text-xs w-full">Nombre completo: <span class="text-xs">${propiedadesNotaPDF.value.name}</span></p>`,
                            ``,
                        ],
                        [
                            [`<p class="text-xs ">No documento: <span class="text-xs">${propiedadesNotaPDF.value.No_document}</span></p>
                            <p class="text-xs ">Tipo de documento: <span class="text-xs">${propiedadesNotaPDF.value.type_doc}</span></p>`],
                            [`<p class="text-xs ">Edad: <span class="text-xs">${calcularEdad(propiedadesNotaPDF.value.nacimiento)}</span></p>
                            <p class="text-xs ">Sexo: <span class="text-xs">${propiedadesNotaPDF.value.sexo}</span></p>`],
                        ],
                        [
                            `<p class="text-xs ">EPS: <span class="text-xs">${propiedadesNotaPDF.value.Eps}</span></p>`,
                            `<p class="text-xs ">Zona: <span class="text-xs">${propiedadesNotaPDF.value.zona}</span></p>`
                        ],
                    ],
                })

                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Diagnostico', 'CIE-10'],
                    filas: propiedadesNotaPDF.value.diagnosticosNota?.length > 0
                        ? propiedadesNotaPDF.value.diagnosticosNota
                        : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
                })

                .addComponente('Espacio', { alto: 16 })

                // SECCIÓN: NOTA DE ENFERMERÍA
                .addComponente('Texto', {
                    texto: 'Nota de Enfermería',
                })

                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3!',
                    styles: { border: '1px solid #DBEAFE' },
                    filas: [
                        [
                            `
                            <div class="w-full flex justify-between"> 
                                <p class="text-xs font-bold w-[80px]">Fecha:</p>
                                <div class="w-full text-center border-l-1">
                                    <p class="text-xs font-bold w-full">Nota</p>
                                </div>
                            </div>
                            `,
                        ],
                        [
                            `
                            <div class="w-full flex justify-between">
                                <p class="text-xs w-[80px]">${propiedadesNotaPDF.value.fecha_nota ?? ''}</p>
                                <div class="w-full flex flex-col gap-2 border-l-1 pl-3">
                                    ${propiedadesNotaPDF.value.filasNotas ?? ''}
                                </div>
                            </div>`,
                        ],
                    ],
                })

                .addComponente('Espacio', { alto: 32 })

                // PIE DE FIRMA
                .addComponente('Tabla', {
                    container: 'pt-5',
                    border: false,
                    columnas: [
                        `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Nombre del Profesional</p> </hr>
                                <p class="text-xs text-center pt-9">${propiedadesNotaPDF.value.nameProfesional}</p> </hr>
                                <p class="text-xs text-center pt-3">${propiedadesNotaPDF.value.cedulaProfesional}</p>
                            <div>
                            `,
                        `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Firma o sello del Profesional</p>
                                <div class="flex justify-center items-center" id="selloProfesional"><img src="${config.public.api}/storage/${propiedadesNotaPDF.value.sello}" class="w-[100px] h-[100px] pt-1"/></div>
                            </div>
                            `
                    ],
                })
            )


            //  tratamientos
            .nuevaSeccion('tratamientos', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaTratamientos
                .setColumnas([
                    { titulo: 'procedimiento', value: 'Procedimiento', tamaño: 300, ordenar: true },
                    { titulo: 'codigo', value: 'CUPS', tamaño: 250, ordenar: true },
                    { titulo: 'dias_asignados', value: 'No. Dias', tamaño: 250 },
                ])
                .setDatos(puedeVerTratamientos ? tratamientos : [])
                .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: verItemTratamientoHistoria }, puedePUT ? { icon: 'actualizar', action: actualizarItemTratamientoHistoria } : ''], botones: true, })
                .setHeaderTabla({ titulo: 'Tratamientos', color: 'bg-[var(--color-default-600)] text-white', espacioMargen: '500' })
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
                .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: verItemMedicamentoHistoria }, puedePUT ? { icon: 'actualizar', action: actualizarItemMedicamentoHistoria } : '', {icon: 'pdf', action: pdfMedicinas}], botones: true, })
                .setHeaderTabla({ titulo: 'Medicinas', color: 'bg-[var(--color-default-600)] text-white', espacioMargen: '500' })
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
                .setAcciones({ icons: [{ icon: 'pdf', action: exportarNutricionPDF }, { icon: 'actualizar', action: actualizarItemEvolucionHistoria }], botones: true, })
                .setHeaderTabla({ titulo: 'Evoluciones', color: 'bg-[var(--color-default-600)] text-white', })
            )
            .addComponente('Form', propiedadesItemHistoria)
            .addComponente('PDFTemplate', pdfNutricion
                .setElementId('Nutricion')
                .setIsActive(activePdfNutricion)
                .setFileName(`NUTRICION ${propiedadesNutricionPDF.value.name} ${fechaFormateada()}`)

                // ENCABEZADO PRINCIPAL
                .addComponente('Tabla', {
                    container: 'border-b-2 pb-3',
                    border: true,
                    columnas: [
                        '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                        `
                            <p class="text-sm border-b-1 pb-1 uppercase">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 pb-1 uppercase">Registro</p></br>
                            <p class="text-sm uppercase pb-1">Hoja de evolucion nutricional</p>
                        `,
                        `
                            <p class="w-full text-start text-xs border-b-1 pb-2">Codigo: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">version: </p>
                            <p class="w-full text-start text-xs border-b-1 pb-2">Fecha: ${fechaFormateada()}</p>
                            <p class="w-full text-start text-xs">Pagina: 1 de 1</p>
                        `
                    ],
                })

                // DATOS DEL PACIENTE
                .addComponente('Texto', { texto: 'Datos del paciente' })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3',
                    filas: [
                        [
                            `<p class="text-xs w-full">Nombre completo: <span class="text-xs">${propiedadesNutricionPDF.value.name}</span></p>`,
                            ``,
                        ],
                        [
                            [`<p class="text-xs ">No documento: <span class="text-xs">${propiedadesNutricionPDF.value.No_document}</span></p>
                            <p class="text-xs ">Tipo de documento: <span class="text-xs">${propiedadesNutricionPDF.value.type_doc}</span></p>`],
                            [`<p class="text-xs ">Edad: <span class="text-xs">${calcularEdad(propiedadesNutricionPDF.value.nacimiento)}</span></p>
                            <p class="text-xs ">Sexo: <span class="text-xs">${propiedadesNutricionPDF.value.sexo}</span></p>`],
                        ],
                        [
                            `<p class="text-xs ">EPS: <span class="text-xs">${propiedadesNutricionPDF.value.Eps}</span></p>`,
                            `<p class="text-xs ">Zona: <span class="text-xs">${propiedadesNutricionPDF.value.zona}</span></p>`
                        ],
                    ],
                })

                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Diagnostico', 'CIE-10'],
                    filas: propiedadesNutricionPDF.value.diagnosticosEvolucion?.length > 0
                        ? propiedadesNutricionPDF.value.diagnosticosEvolucion
                        : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
                })

                .addComponente('Espacio', { alto: 16 })

                // SECCIÓN: NOTA DE ENFERMERÍA
                .addComponente('Tabla', {
                    filas: [
                        [
                            `<p class="text-sm font-bold text-center py-1 font-bold">Motivo de consulta</p>`,
                        ],
                        [
                            `<p class="text-sm text-center py-2">${propiedadesNutricionPDF.value.motivo}</p>`
                        ],
                    ],
                })

                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3!',
                    filas: [
                        [
                            '<p class="text-sm font-bold w-full text-center py-1 font-bold">Recomendaciones</p>',
                        ],
                        [
                            `<p class="text-sm w-full text-center py-2">${propiedadesNutricionPDF.value.analisis}</p>`,
                        ],

                    ],
                })

                .addComponente('Espacio', { alto: 32 })

                .addComponente('Tabla', {
                    container: 'pt-5',
                    border: false,
                    columnas: [
                        `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Nombre del Profesional</p> </hr>
                                <p class="text-xs text-center pt-9">${propiedadesNutricionPDF.value.nameProfesional}</p> </hr>
                                <p class="text-xs text-center pt-3">${propiedadesNutricionPDF.value.cedulaProfesional}</p>
                            <div>
                            `,
                        `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Firma o sello del Profesional</p>
                                <div class="flex justify-center items-center" id="selloProfesional"><img src="${config.public.api}/storage/${propiedadesNutricionPDF.value.sello}" class="w-[100px] h-[100px] pt-1"/></div>
                            </div>
                            `
                    ],
                })
            )


            // trabajo social
            .nuevaSeccion('nutricion', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaTrabajoSocial
                .setColumnas([
                    { titulo: 'analisis', value: 'Analisis', tamaño: 200, ordenar: true },
                    { titulo: 'motivo', value: 'Motivo', tamaño: 200, ordenar: true },
                    { titulo: 'created_at', value: 'Fecha', tamaño: 150 },
                ])
                .setDatos(puedeVerTrabajo ? trabajosSocial : [])
                .setAcciones({ icons: [{ icon: 'pdf', action: exportarTrabajoSocialPDF }], botones: true, })
                .setHeaderTabla({ titulo: 'Trabajo Social', color: 'bg-[var(--color-default-600)] text-white', })
            )
            .addComponente('PDFTemplate', pdfTrabajoSocial
                .setElementId('TrabajoSocial')
                .setIsActive(activePdfTrabajoSocial)
                .setFileName(`TRABAJO_SOCIAL ${propiedadesTrabajoSocialPDF.value.name} ${fechaFormateada()}`)

                // ENCABEZADO PRINCIPAL
                .addComponente('Tabla', {
                    container: 'border-b-2 pb-3',
                    border: true,
                    columnas: [
                        '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                        `
                            <p class="text-sm border-b-1 uppercase">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 uppercase">Registro</p></br>
                            <p class="text-sm uppercase">Historia Clinica </br> Trabajo Social</p>
                        `,
                        `
                            <p class="w-full text-end text-xs border-b-1 pb-2">Codigo:</p>
                            <p class="w-full text-end text-xs border-b-1 pb-2">version:</p>
                            <p class="w-full text-end text-xs border-b-1 pb-2">Fecha: ${fechaFormateada()}</p>
                            <p class="w-full text-end text-xs">Pagina:</p>
                        `
                    ],
                })

                // DATOS DEL PACIENTE
                .addComponente('Texto', { texto: 'Datos del paciente' })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3',
                    filas: [
                        [
                            `<p class="text-xs w-full">Nombre completo: <span class="text-xs">${propiedadesTrabajoSocialPDF.value.name}</span></p>`,
                            ``,
                        ],
                        [
                            [`<p class="text-xs">No documento: <span class="text-xs">${propiedadesTrabajoSocialPDF.value.No_document}</span></p>
                            <p class="text-xs">Tipo de documento: <span class="text-xs">${propiedadesTrabajoSocialPDF.value.type_doc}</span></p>`],
                            [`<p class="text-xs">Edad: <span class="text-xs">${calcularEdad(propiedadesTrabajoSocialPDF.value.nacimiento)}</span></p>
                            <p class="text-xs">Sexo: <span class="text-xs">${propiedadesTrabajoSocialPDF.value.sexo}</span></p>`],
                        ],
                        [
                            `<p class="text-xs">EPS: <span class="text-xs">${propiedadesTrabajoSocialPDF.value.Eps}</span></p>`,
                            `<p class="text-xs">Zona: <span class="text-xs">${propiedadesTrabajoSocialPDF.value.zona}</span></p>`
                        ],
                    ],
                })

                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Diagnostico', 'CIE-10'],
                    filas: propiedadesTrabajoSocialPDF.value.diagnosticosTrabajoS?.length > 0
                        ? propiedadesTrabajoSocialPDF.value.diagnosticosTrabajoS
                        : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
                })

                .addComponente('Espacio', { alto: 16 })

                // SECCIÓN: NOTA DE ENFERMERÍA
                .addComponente('Tabla', {
                    filas: [
                        [
                            `<p class="text-sm font-bold text-center py-1">Motivo de consulta</p>`,
                        ],
                        [
                            `<p class="text-sm text-center py-2">${propiedadesTrabajoSocialPDF.value.motivo}</p>`
                        ],
                    ],
                })

                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3!',
                    filas: [
                        [
                            '<p class="text-sm font-bold w-full text-center py-1">Analisis/Tratamiento</p>',
                        ],
                        [
                            `<p class="text-sm w-full text-center py-2">${propiedadesTrabajoSocialPDF.value.analisis}</p>`,
                        ],
                    ],
                })

                .addComponente('Espacio', { alto: 32 })

                // PIE DE FIRMA
                .addComponente('Tabla', {
                    container: 'pt-5',
                    border: false,
                    columnas: [
                        `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Nombre del Profesional</p> </hr>
                                <p class="text-xs text-center pt-9">${propiedadesTrabajoSocialPDF.value.nameProfesional}</p> </hr>
                                <p class="text-xs text-center pt-3">${propiedadesTrabajoSocialPDF.value.cedulaProfesional}</p>
                            <div>
                            `,
                        `
                            <div class="min-h-[150px]">
                                <p class="text-xs text-center py-1 border-1">Firma o sello del Profesional</p>
                                <div class="flex justify-center items-center" id="selloProfesional"><img src="${config.public.api}/storage/${propiedadesTrabajoSocialPDF.value.sello}" class="w-[100px] h-[100px] pt-1"/></div>
                            </div>
                            `
                    ],
                })
            )


        )

    return pagina.build()
});

</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
    <PDFFormulaMedica v-if="varView.showPDFMedicamentos"></PDFFormulaMedica>
</template>