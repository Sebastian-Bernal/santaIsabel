<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import Formularios from '~/components/Paciente.vue';

import { ref, onMounted, unref, toRaw } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';
import { useHistoriaBuilder } from '~/build/Historial/useHistoriaBuilder';
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

const historiasList = ref([]);

const analisis = ref([])
const notas = ref([])
const tratamientos = ref([])
const medicinas = ref([]);
const evoluciones = ref([]);
const nutricion = ref([]);
const diagnosticos = ref([])
const trabajosSocial = ref([])

const show = ref(false);
const showItem = ref(false)
const showNota = ref(false)
const showActualizarNota = ref(false)
const refresh = ref(1);

const pacientesStore = usePacientesStore();
const showVerHistorial = ref(false)
const showNuevoPaciente = ref(false)
const formularioItem = ref('')
const actualizar = ref(false)
const propiedadesNotaPDF = ref({})
const propiedadesEvolucionPDF = ref({})
const activePdfNotas = ref(false)
const activePdfEvolucion = ref(false)
const activePdfNutricion = ref(false)
const propiedadesNutricionPDF = ref([])
const activePdfTrabajoSocial = ref(false)
const propiedadesTrabajoSocialPDF = ref([])

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
        } else if(analisis.servicio === 'Trabajo Social'){
            trabajosSocial.value.push({ ...analisis})
        } else if(analisis.servicio === 'Medicina'){
            analisisDatos.push({ ...analisis})
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
                return diagnostico
            })
        )

        // Unificar todos los medicamentos en un solo array
        diagnosticos.value = diagnosticosPorAnalisis.flat()
    } else {
        diagnosticos.value = []
    }

    varView.cargando = false
};

// Funciones cerrar modales
function cerrar() {
    show.value = false
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

// Visibilidad notas
function nuevaNota() {
    notasStore.Formulario.Nota.name_paciente = historiasStore.Formulario.HistoriaClinica.name_paciente
    notasStore.Formulario.Nota.No_document_paciente = historiasStore.Formulario.HistoriaClinica.No_document_paciente
    notasStore.Formulario.Nota.id_paciente = historiasStore.Formulario.HistoriaClinica.id_paciente
    console.log(historiasStore.Formulario.HistoriaClinica)
    showNota.value = true
}

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

    const dataPaciente = pacientes.filter(user => {
        return user.id_paciente === data.id_paciente
    })

    propiedadesNotaPDF.value = { ...data, ...dataPaciente[0] }
    activePdfNotas.value = true
    varView.cargando = false
}

async function exportarEvolucionPDF(data) {
    varView.cargando = true
    const medicoStore = useMedicosStore()
    const pacientes = await pacientesStore.listPacientes()
    const profesionales = await medicoStore.listMedicos(false)

    const dataPaciente = pacientes.find(user => {
        return user.id_paciente === data.id_paciente
    });

    const profesional = profesionales.find(medico => {
        return medico.id_profesional === data.id_profesional
    })

    propiedadesEvolucionPDF.value = { ...data, ...dataPaciente, nameProfesional: profesional.name, cedulaProfesional: profesional.No_document, sello: profesional.sello }
    activePdfEvolucion.value = true
    varView.cargando = false
}

async function exportarNutricionPDF(data) {
    varView.cargando = true
    const pacientes = await pacientesStore.listPacientes()

    const historia = await historiasStore.listDatos(data.id_historia, 'HistoriaClinica', 'id')
    const id_paciente = historia[0]?.id_paciente

    const dataPaciente = pacientes.filter(user => {
        return user.id_paciente === id_paciente || null
    });

    propiedadesNutricionPDF.value = { ...data, ...dataPaciente[0] }
    activePdfNutricion.value = true
    varView.cargando = false
}

async function exportarTrabajoSocialPDF(data) {
    varView.cargando = true
    const pacientes = await pacientesStore.listPacientes()

    const historia = await historiasStore.listDatos(data.id_historia, 'HistoriaClinica', 'id')
    const id_paciente = historia[0]?.id_paciente

    const dataPaciente = pacientes.filter(user => {
        return user.id_paciente === id_paciente || null
    });

    propiedadesTrabajoSocialPDF.value = { ...data, ...dataPaciente[0] }
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

// Funciones Formulario historia


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

const { builder, PacientesList, id_paciente } = useHistoriaBuilder({
    storeId: 'RegistrarHistoria',
    storePinia: 'Historias',
    cerrarModal: cerrar,
    show: show,
});

const propiedadesNota = useNotasBuilder({
    storeId: 'NuevaNota',
    storePinia: 'Notas',
    cerrarModal: cerrarNota,
    show: showNota,
})

const propiedadesActualizarNota = useNotasBuilder({
    storeId: 'ActualizarNota',
    storePinia: 'Notas',
    cerrarModal: cerrarNota,
    show: showActualizarNota,
})

// const builderCitas = new CitasBuilder()
const tablaBuilder = new TablaBuilder()

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
    if (!puedeVer) return
    // const puedePost = varView.getPermisos.includes('Historias_post')
    const puedePUT = varView.getPermisos.includes('Historias_put')
    // const puedePUT = false
    puedePostAnalisis.value = varView.getPermisos.includes('Diagnosticos_view')

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

    const diagnosticosEvolucion = Array.isArray(unref(diagnosticos.value))
    ? toRaw(diagnosticos.value).map(diagnostico => [
        `<p class="text-xs leading-tight py-1">${diagnostico.descripcion}</p>`,
        `<p class="text-xs leading-tight py-1">${diagnostico.codigo}</p>`
        ])
    : [];



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
        .addComponente('Form', builder)
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
                acciones: [{ icon: 'fa-solid fa-file-pdf', accion: exportarHistoriaPDF }]
            })

            .nuevaSeccion('Botones', 'md:grid grid-cols-2 flex flex-col justify-center gap-1 w-full h-full content-center py-5 px-8')
            .addComponente('Card', consultasCard
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
            )
            .addComponente('Card', evolucionesCard
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
            )
            .addComponente('Card', notasCard
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
            )
            .addComponente('Card', tratamientosCard
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
            )
            .addComponente('Card', medicacionCard
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
            )
            .addComponente('Card', nutricionCard
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
            )
            .addComponente('Card', trabajoSocialCard
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
                .setDatos(analisis)
                .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: verItemConsultasHistoria }, puedePUT ? { icon: 'actualizar', action: actualizarItemConsultasHistoria } : ''], botones: true, })
            )
            .addComponente('Form', propiedadesItemHistoria)


            // evoluciones
            .nuevaSeccion('evoluciones', 'flex flex-col gap-3 w-full h-full py-5 px-8')
            .addComponente('Tabla', tablaEvoluciones
                .setColumnas([
                    { titulo: 'fecha', value: 'Fecha', tamaño: 100, ordenar: true },
                    { titulo: 'hora', value: 'Hora', tamaño: 250, ordenar: true },
                    { titulo: 'evolucion', value: 'Evolucion', tamaño: 150 },
                ])
                .setHeaderTabla({ titulo: 'Avances de Tratamientos', color: 'bg-[var(--color-default-600)] text-white', })
                .setAcciones({ icons: [{ icon: 'pdf', action: exportarEvolucionPDF },], botones: true, })
                .setDatos(evoluciones)
            )
            .addComponente('PDFTemplate', pdfEvolucion
                .setElementId('Evolucion')
                .setIsActive(activePdfEvolucion)
                .setFileName(`Evolucion_${propiedadesEvolucionPDF.value.name_paciente}`)

                // ENCABEZADO PRINCIPAL
                .addComponente('Tabla', {
                    container: 'border-b-2 pb-3',
                    border: true,
                    columnas: [
                        '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                        `
                            <p class="text-sm border-b-1 pb-2">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 pb-2">Registro</p></br>
                            <p class="text-sm">Reporte de la atencion terapeutica realizada por especialidad</p></br>
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
                .addComponente('Texto', { texto: 'Informacion de identificacion del paciente' })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3',
                    filas: [
                        [
                            `<p class="text-xs w-full">Nombre completo: <span class="text-sm">${propiedadesEvolucionPDF.value.name}</span></p>`,
                            `<p class="text-xs w-full"></p>`,
                        ],
                        [
                            [`<p class="text-xs">No documento: <span class="text-sm">${propiedadesEvolucionPDF.value.No_document}</span></p>
                            <p class="text-xs">Tipo de documento: <span class="text-sm">${propiedadesEvolucionPDF.value.type_doc}</span></p>`],
                            [`<p class="text-xs">Edad: <span class="text-sm">${propiedadesEvolucionPDF.value.nacimiento}</span></p>
                            <p class="text-xs">Sexo: <span class="text-sm">${propiedadesEvolucionPDF.value.sexo}</span></p>`],
                        ],
                        [
                            `<p class="text-xs">EPS: <span class="text-sm">${propiedadesEvolucionPDF.value.Eps}</span></p>`,
                            `<p class="text-xs">Zona: <span class="text-sm">${propiedadesEvolucionPDF.value.zona}</span></p>`
                        ],
                    ],
                })

                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Diagnóstico', 'CIE-10'],
                    filas: diagnosticosEvolucion?.length > 0
                        ? diagnosticosEvolucion
                        : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
                })

                .addComponente('Espacio', { alto: 16 })

                // SECCIÓN: NOTA DE ENFERMERÍA
                .addComponente('Tabla', {
                    filas: [
                        [
                            `<p class="text-sm text-center py-2">Objetivos de la intervencion terapeutica</p>`,
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
                            '<p class="text-sm w-full">Sesion</p>',
                            '<p class="text-sm w-full">Fecha - hora:</p>',
                            '<p class="text-sm w-full">Evolucion</p>'
                        ],
                        [
                            `<p class="text-sm w-full">${propiedadesEvolucionPDF.value.sesion}</p>`,
                            `<p class="text-sm w-full">${propiedadesEvolucionPDF.value.fecha}</p> - <p class="text-sm w-full">${propiedadesEvolucionPDF.value.hora}</p>`,
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
                                <p class="text-xs text-center pt-6 border-1">Nombre y Apellido</p> </hr>
                                <p class="text-xs text-center pt-8">${propiedadesEvolucionPDF.value.nameProfesional}</p> </hr>
                                <p class="text-xs text-center pt-3">${propiedadesEvolucionPDF.value.cedulaProfesional}</p>
                            `, 
                            `
                            <p class="text-xs text-center pt-6 border-1">Firma y sello</p>
                            <img src="http://localhost/proyecto/backendThesalus/storage/app/public/profesionales/sellos/pH1NfZsOuQk7F0VWfSSV.jpg" class="w-[100px] h-[100px]"/>
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
                    { titulo: 'nota', value: 'Nota', tamaño: 400 },
                ])
                .setDatos(notas)
                .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'pdf', action: exportarNotaPDF }, puedePUT ? { icon: 'actualizar', action: actualizarNota } : ''], botones: true, })
                .setHeaderTabla({ titulo: 'Notas Medicas', color: 'bg-[var(--color-default-600)] text-white', accionAgregar: nuevaNota })
            )
            .addComponente('Form', propiedadesNota)
            .addComponente('Form', propiedadesActualizarNota)
            .addComponente('PDFTemplate', pdfNotas
                .setElementId('Nota')
                .setIsActive(activePdfNotas)
                .setFileName(`Nota_${propiedadesNotaPDF.value.name}`)
                // ENCABEZADO PRINCIPAL
                .addComponente('Tabla', {
                    container: 'border-b-2 pb-3',
                    border: true,
                    columnas: [
                        '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                        `
                            <p class="text-sm border-b-1 pb-2 uppercase">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 pb-2 uppercase">Registro</p></br>
                            <p class="text-sm uppercase">Nota de enfermeria de atencion domiciliaria</p>
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
                .addComponente('Texto', { texto: 'Informacion de identificacion del paciente' })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3',
                    filas: [
                        [
                            `<p class="text-xs w-full">Nombre completo: <span class="text-sm">${propiedadesNotaPDF.value.name}</span></p>`,
                            ``,
                        ],
                        [
                            [`<p class="text-xs py-2">No documento: <span class="text-sm">${propiedadesNotaPDF.value.No_document}</span></p>
                            <p class="text-xs py-2">Tipo de documento: <span class="text-sm">${propiedadesNotaPDF.value.type_doc}</span></p>`],
                            [`<p class="text-xs py-2">Edad: <span class="text-sm">${propiedadesNotaPDF.value.nacimiento}</span></p>
                            <p class="text-xs py-2">Sexo: <span class="text-sm">${propiedadesNotaPDF.value.sexo}</span></p>`],
                        ],
                        [
                            `<p class="text-xs py-2">EPS: <span class="text-sm">${propiedadesNotaPDF.value.Eps}</span></p>`,
                            `<p class="text-xs py-2">Zona: <span class="text-sm">${propiedadesNotaPDF.value.zona}</span></p>`
                        ],
                    ],
                })

                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Diagnostico', 'CIE-10'],
                    filas: diagnosticosEvolucion?.length > 0
                        ? diagnosticosEvolucion
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
                            '<p class="text-xs w-full">Fecha (DD/MM/AAAA):</p>',
                            '<p class="text-xs w-full">Hora (Militar):</p>',
                            '<p class="text-xs w-full">Nota</p>'
                        ],
                        [
                            `${propiedadesNotaPDF.value.fecha_nota ?? ''}`,
                            `${propiedadesNotaPDF.value.hora_nota ?? ''}`,
                            `${propiedadesNotaPDF.value.nota ?? ''}`,
                        ],
                    ],
                })

                .addComponente('Espacio', { alto: 32 })

                // PIE DE FIRMA
                .addComponente('Tabla', {
                    container: 'pt-5',
                    border: false,
                    columnas: ['<p class="text-xs text-center pt-6 border-t-2">Nombre y Apellido del profesional</p>', '<p class="text-xs text-center pt-6 border-t-2">Firma y sello</p>'],
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
                .setDatos(tratamientos)
                .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: verItemTratamientoHistoria }, puedePUT ? { icon: 'actualizar', action: actualizarItemTratamientoHistoria } : ''], botones: true, })
                .setHeaderTabla({ titulo: 'Tratamientos', color: 'bg-[var(--color-default-600)] text-white', })
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
                .setDatos(medicinas)
                .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: verItemMedicamentoHistoria }, puedePUT ? { icon: 'actualizar', action: actualizarItemMedicamentoHistoria } : ''], botones: true, })
                .setHeaderTabla({ titulo: 'Medicinas', color: 'bg-[var(--color-default-600)] text-white', })
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
                .setDatos(nutricion)
                .setAcciones({ icons: [{ icon: 'pdf', action: exportarNutricionPDF }], botones: true, })
                .setHeaderTabla({ titulo: 'Evoluciones', color: 'bg-[var(--color-default-600)] text-white', })
            )
            .addComponente('PDFTemplate', pdfNutricion
                .setElementId('Nutricion')
                .setIsActive(activePdfNutricion)
                .setFileName(`Nutricion_${propiedadesNutricionPDF.value.name}`)

                // ENCABEZADO PRINCIPAL
                .addComponente('Tabla', {
                    container: 'border-b-2 pb-3',
                    border: true,
                    columnas: [
                        '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                        `
                            <p class="text-sm border-b-1 pb-2 uppercase">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 pb-2 uppercase">Registro</p></br>
                            <p class="text-sm uppercase">Hoja de evolucion nutricional</p>
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
                .addComponente('Texto', { texto: 'Informacion de identificacion del paciente' })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3',
                    filas: [
                        [
                            `<p class="text-xs w-full">Nombre completo: <span class="text-sm">${propiedadesNutricionPDF.value.name}</span></p>`,
                            ``,
                        ],
                        [
                            [`<p class="text-xs py-2">No documento: <span class="text-sm">${propiedadesNutricionPDF.value.No_document}</span></p>
                            <p class="text-xs py-2">Tipo de documento: <span class="text-sm">${propiedadesNutricionPDF.value.type_doc}</span></p>`],
                            [`<p class="text-xs py-2">Edad: <span class="text-sm">${propiedadesNutricionPDF.value.nacimiento}</span></p>
                            <p class="text-xs py-2">Sexo: <span class="text-sm">${propiedadesNutricionPDF.value.sexo}</span></p>`],
                        ],
                        [
                            `<p class="text-xs py-2">EPS: <span class="text-sm">${propiedadesNutricionPDF.value.Eps}</span></p>`,
                            `<p class="text-xs py-2">Zona: <span class="text-sm">${propiedadesNutricionPDF.value.zona}</span></p>`
                        ],
                    ],
                })

                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Diagnostico', 'CIE-10'],
                    filas: diagnosticosEvolucion?.length > 0
                        ? diagnosticosEvolucion
                        : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
                })

                .addComponente('Espacio', { alto: 16 })

                // SECCIÓN: NOTA DE ENFERMERÍA
                .addComponente('Tabla', {
                    filas: [
                        [
                            `<p class="text-sm text-center py-1">Motivo de consulta</p>`,
                        ],
                        [
                            `<p class="text-sm text-center py-1">${propiedadesNutricionPDF.value.motivo}</p>`
                        ],
                    ],
                })

                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3!',
                    filas: [
                        [
                            '<p class="text-sm w-full text-center py-1">Recomendaciones</p>',
                        ],
                        [
                            `<p class="text-sm w-full text-center py-1">${propiedadesNutricionPDF.value.analisis}</p>`,
                        ],

                    ],
                })

                .addComponente('Espacio', { alto: 32 })

                // PIE DE FIRMA
                .addComponente('Tabla', {
                    container: 'pt-5',
                    border: false,
                    columnas: ['<p class="text-xs text-center pt-6 border-t-2">Nombre y Apellido del profesional</p>', '<p class="text-xs text-center pt-6 border-t-2">Firma y sello</p>'],
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
                .setDatos(trabajosSocial)
                .setAcciones({ icons: [{ icon: 'pdf', action: exportarTrabajoSocialPDF }], botones: true, })
                .setHeaderTabla({ titulo: 'Trabajo Social', color: 'bg-[var(--color-default-600)] text-white', })
            )
            .addComponente('PDFTemplate', pdfTrabajoSocial
                .setElementId('TrabajoSocial')
                .setIsActive(activePdfTrabajoSocial)
                .setFileName(`Trabajo_Social_${propiedadesTrabajoSocialPDF.value.name}`)

                // ENCABEZADO PRINCIPAL
                .addComponente('Tabla', {
                    container: 'border-b-2 pb-3',
                    border: true,
                    columnas: [
                        '<div class="flex items-center justify-center flex-col"><img src="/logo.png" width="60px"/><p>Santa Isabel IPS</p></div>',
                        `
                            <p class="text-sm border-b-1 pb-2 uppercase">Proceso: Programa de Atención Domiciliaria</p></br>
                            <p class="text-sm border-b-1 pb-2 uppercase">Registro</p></br>
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
                .addComponente('Texto', { texto: 'Informacion de identificacion del paciente' })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3',
                    filas: [
                        [
                            `<p class="text-xs w-full">Nombre completo: <span class="text-sm">${propiedadesTrabajoSocialPDF.value.name}</span></p>`,
                            ``,
                        ],
                        [
                            [`<p class="text-xs py-2">No documento: <span class="text-sm">${propiedadesTrabajoSocialPDF.value.No_document}</span></p>
                            <p class="text-xs py-2">Tipo de documento: <span class="text-sm">${propiedadesTrabajoSocialPDF.value.type_doc}</span></p>`],
                            [`<p class="text-xs py-2">Edad: <span class="text-sm">${propiedadesTrabajoSocialPDF.value.nacimiento}</span></p>
                            <p class="text-xs py-2">Sexo: <span class="text-sm">${propiedadesTrabajoSocialPDF.value.sexo}</span></p>`],
                        ],
                        [
                            `<p class="text-xs py-2">EPS: <span class="text-sm">${propiedadesTrabajoSocialPDF.value.Eps}</span></p>`,
                            `<p class="text-xs py-2">Zona: <span class="text-sm">${propiedadesTrabajoSocialPDF.value.zona}</span></p>`
                        ],
                    ],
                })

                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Tabla', {
                    container: 'w-full p-3',
                    columnas: ['Diagnostico', 'CIE-10'],
                    filas: diagnosticosEvolucion?.length > 0
                        ? diagnosticosEvolucion
                        : [['<p class="text-xs">Sin diagnósticos registrados</p>', '']]
                })

                .addComponente('Espacio', { alto: 16 })

                // SECCIÓN: NOTA DE ENFERMERÍA
                .addComponente('Tabla', {
                    filas: [
                        [
                            `<p class="text-sm text-center py-1">Motivo de consulta</p>`,
                        ],
                        [
                            `<p class="text-sm text-center py-1">${propiedadesTrabajoSocialPDF.value.motivo}</p>`
                        ],
                    ],
                })

                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3!',
                    filas: [
                        [
                            '<p class="text-sm w-full text-center py-1">Analisis/Tratamiento</p>',
                        ],
                        [
                            `<p class="text-sm w-full text-center py-1">${propiedadesTrabajoSocialPDF.value.analisis}</p>`,
                        ],
                    ],
                })

                .addComponente('Espacio', { alto: 32 })

                // PIE DE FIRMA
                .addComponente('Tabla', {
                    container: 'pt-5',
                    border: false,
                    columnas: ['<p class="text-xs text-center pt-6 border-t-2">Nombre y Apellido del profesional</p>', '<p class="text-xs text-center pt-6 border-t-2">Firma y sello</p>'],
                })
            )

            

        )
    return pagina.build()
});

</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
    <Formularios v-if="showNuevoPaciente" :showPaciente="showNuevoPaciente" @ocultar="showNuevoPaciente = false" />
</template>