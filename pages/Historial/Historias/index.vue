<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import Formularios from '~/components/Paciente.vue';

import { ref, onMounted } from 'vue';
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

const varView = useVarView();
const historiasStore = useHistoriasStore();
const notasStore = useNotasStore();

const historiasList = ref([]);

const analisis = ref([])
const notas = ref([])
const tratamientos = ref([])
const medicinas = ref([]);
const evoluciones = ref([]);

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

const propiedadesHistoriaPDF = ref({})
const activePdfHistoria = ref(false)

const puedePostAnalisis = ref(Boolean)

async function llamadatos() {
    const datos = await historiasStore.datosHistoria
    historiasList.value = datos
    await historiasStore.indexDBDatos()
}
// Watchers para actualizar informacion
watch(() => show.value,
    async () => {
        await llamadatos();
        refresh.value++;
    }
);

watch(() => showNota.value,
    async (nuevoValor) => {
        if (nuevoValor === false) {
            await llamadatos();
            refresh.value++;
            window.location.reload()
        }
    }
);

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await llamadatos()
    varView.cargando = false
});

// visibilidad nueva historia clinica
const agregarHistoria = () => {
    show.value = true
};

// visibilidad ver Historial
const verHistoria = async (his) => {
    await cargaHistorial(his.id)
    historiasStore.Formulario.HistoriaClinica.name_paciente = his.paciente
    historiasStore.Formulario.HistoriaClinica.No_document_paciente = his.cedula
    historiasStore.Formulario.HistoriaClinica.id_paciente = his.id
    showVerHistorial.value = true
};

async function cargaHistorial(id) {

    const historia = await pacientesStore.listDatos(id, 'HistoriaClinica', 'id')
    const allAnalisis = await historiasStore.listDatos(historia[0]?.id, 'Analisis', 'id_historia')

    // Consultas
    analisis.value = []

    // Cambiar id por id_historia
    if (Array.isArray(historia) && historia.length > 0 && historia[0].id) {
        const idHistoria = historia[0].id;

        // Obtener datos existentes
        const analisisDatos = await historiasStore.listDatos(idHistoria, 'Analisis', 'id_historia') || [];
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

    if (allAnalisis || allAnalisis.length > 0) {
        // Obtener todos los tratamientos asociados a cada id_analisis de la historia
        const tratamientosPorAnalisis = await Promise.all(
            allAnalisis.map(async (h) => {

                const tratamientos = await historiasStore.listDatos(h.id, 'Plan_manejo_procedimientos', 'id_analisis') || []

                // Enriquecer cada tratamiento con su análisis correspondiente
                const tratamientosConAnalisis = tratamientos.map((tratamiento) => {
                    return {
                        ...tratamiento,
                        ...h,
                    }
                })

                return tratamientosConAnalisis
            })
        )

        // Unificar todos los tratamientos en un solo array
        tratamientos.value = tratamientosPorAnalisis.flat()
    } else {
        tratamientos.value = []
    }



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

    // console.log(analisis.value, notas.value, tratamientos.value, medicinas.value)
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
    formularioItem.value = 'Medicamento'
    actualizar.value = false
    mapCampos(item, historiasStore.Formulario)
    historiasStore.Formulario.Plan_manejo_medicamentos.medicamento = item.medicamento
    historiasStore.Formulario.Plan_manejo_medicamentos.dosis = item.dosis
    historiasStore.Formulario.Plan_manejo_medicamentos.cantidad = item.cantidad
    showItem.value = true
}

function actualizarItemMedicamentoHistoria(item) {
    formularioItem.value = 'Medicamento'
    actualizar.value = true
    mapCampos(item, historiasStore.Formulario)
    historiasStore.Formulario.Plan_manejo_medicamentos.medicamento = item.medicamento
    historiasStore.Formulario.Plan_manejo_medicamentos.dosis = item.dosis
    historiasStore.Formulario.Plan_manejo_medicamentos.cantidad = item.cantidad
    showItem.value = true
}

function verItemTratamientoHistoria(item) {
    formularioItem.value = 'Tratamientos'
    actualizar.value = false
    mapCampos(item, historiasStore.Formulario)
    historiasStore.Formulario.Plan_manejo_procedimientos.procedimiento = item.procedimiento
    historiasStore.Formulario.Plan_manejo_procedimientos.fecha = item.fecha
    historiasStore.Formulario.Plan_manejo_procedimientos.codigo = item.codigo
    showItem.value = true
}

function actualizarItemTratamientoHistoria(item) {
    formularioItem.value = 'Tratamientos'
    actualizar.value = true
    mapCampos(item, historiasStore.Formulario)
    historiasStore.Formulario.Plan_manejo_procedimientos.procedimiento = item.procedimiento
    historiasStore.Formulario.Plan_manejo_procedimientos.fecha = item.fecha
    historiasStore.Formulario.Plan_manejo_procedimientos.codigo = item.codigo
    showItem.value = true
}

function verItemConsultasHistoria(item) {
    formularioItem.value = 'Consulta'
    actualizar.value = false
    const datos = { ...item, ...item.signosVitales }
    mapCampos(datos, historiasStore.Formulario)
    showItem.value = true
}

function actualizarItemConsultasHistoria(item) {
    formularioItem.value = 'Consulta'
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
    // mapCampos(data, notasStore.Formulario)
    const pacientes = await pacientesStore.listPacientes()

    const dataPaciente = pacientes.filter(user => {
        return user.id_paciente === data.id_paciente
    })

    propiedadesNotaPDF.value = { ...data, ...dataPaciente[0] }
    activePdfNotas.value = true
}

async function exportarEvolucionPDF(data) {
    // mapCampos(data, notasStore.Formulario)
    const pacientes = await pacientesStore.listPacientes()

    const dataPaciente = pacientes.filter(user => {
        return user.id_paciente === data.id_paciente
    }); console.log(dataPaciente)

    propiedadesEvolucionPDF.value = { ...data, ...dataPaciente[0] }
    activePdfEvolucion.value = true
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

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()
    const modal = new ModalBuilder()

    const puedeVer = varView.getPermisos.includes('Historias_view');
    if (!puedeVer) return
    // const puedePost = varView.getPermisos.includes('Historias_post')
    // const puedePUT = varView.getPermisos.includes('Historias_put')
    const puedePUT = false
    puedePostAnalisis.value = varView.getPermisos.includes('Diagnosticos_view')

    const tablaConsultas = new TablaBuilder()
    const tablaEvoluciones = new TablaBuilder()
    const tablaNotas = new TablaBuilder()
    const tablaTratamientos = new TablaBuilder()
    const tablaMedicacion = new TablaBuilder()

    const pdfNotas = new PdfBuilder()
    const pdfHistorial = new PdfBuilder()
    const pdfEvolucion = new PdfBuilder()

    const filasConsultas = (unref(analisis) || []).map(consulta => {
        const fechaOriginal = consulta.fecha;
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
        storeId: 'ActualizarHistoriass',
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

            .nuevaSeccion('Botones')
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
                .setContenedor('')
                .setheaderTitle('Consulta por las diferentes secciones del Historial')
                .setheaderSubTitle('')
                .setcontenedorCards('w-full flex justify-center')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-300)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[50vh]!')
                .build()
            )
            .addComponente('Card', evolucionesCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-file text-white',
                            iconBg: 'bg-inherit',
                            title: 'Evoluciones',
                            subtitle: 'Evoluciones de Historias',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setcontenedorCards('w-full flex justify-center')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-400)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[50vh]!')
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
                .setcontenedorCards('w-full flex justify-center')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-500)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[50vh]!')
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
                .setcontenedorCards('w-full flex justify-center')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-600)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[50vh]!')
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
                .setcontenedorCards('w-full flex justify-center')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-700)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[50vh]!')
                .build()
            )
            .addComponente('PDFTemplate', pdfHistorial
                .setElementId('Historia')
                .setIsActive(activePdfHistoria)
                .setFileName(`paciente_${propiedadesHistoriaPDF.value.name}`)
                .addComponente('Tabla', {
                    container: 'border-b-2 pb-3',
                    columnas: ['<div class="flex items-center gap-2"><img src="https://play-lh.googleusercontent.com/Yk1bwaX-O7BZbScyAIExW-Ktljt9ZIMwhTrcZ7DtA99TYGPKv8VCUDTfyxKpRQs8YxMf=w600-h300-pc0xffffff-pd" width="60px"/><p class="w-full text-start text-2xl">Thesalus</p></div>', '<p class="w-full text-end">Fecha de impresion:</p>'],
                    filas: [
                        [`Sistema de Historias Clinicas`, `<p class="w-full text-end"> ${fechaFormateada()} </p>`],
                    ],
                })
                .addComponente('Texto', {
                    texto: 'Informacion del Paciente'
                })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3',
                    styles: {
                        backgroundColor: '#EFF6FF',
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
                        backgroundColor: '#EFF6FF',
                    },
                    filas: [
                        ['<p class="w-full text-start text-xs">Municipio:</p>', '<p class="w-full text-start text-xs">Departamento:</p>', '<p class="w-full text-start text-xs">Telefono:</p>'],
                        [`${propiedadesHistoriaPDF.value.municipio}`, `${propiedadesHistoriaPDF.value.departamento}`, `${propiedadesHistoriaPDF.value.telefono}`,],
                        ['<p class="w-full text-start text-xs pt-2">EPS:</p>', '<p class="w-full text-start text-xs pt-2">Regimen:</p>', '<p class="w-full text-start text-xs pt-2">Vulnerabilidad:</p>'],
                        [`${propiedadesHistoriaPDF.value.Eps}`, `${propiedadesHistoriaPDF.value.Regimen}`, `${propiedadesHistoriaPDF.value.poblacionVulnerable}`,],
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

            .nuevaSeccion('Consultas')
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

            .nuevaSeccion('evoluciones')
            .addComponente('Tabla', tablaEvoluciones
                .setColumnas([
                    { titulo: 'fecha', value: 'Fecha', tamaño: 100, ordenar: true },
                    { titulo: 'hora', value: 'Hora', tamaño: 250, ordenar: true },
                    { titulo: 'evolucion', value: 'Evolucion', tamaño: 150 },
                ])
                .setHeaderTabla({ titulo: 'Evoluciones', color: 'bg-[var(--color-default-600)] text-white', })
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
                        '<div class="flex items-center justify-center"><img src="https://ctsantaisabel.com/assets/logo_favicon.93ce8078.png" width="60px"/></div>',
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
                    container: 'space-y-2 rounded-xl py-3 border border-gray-500',
                    filas: [
                        [
                            `<p class="text-xs">Nombre completo: <span class="text-sm">${propiedadesEvolucionPDF.value.name}</span></p>`,
                            `<p class="text-xs">Tipo de documento: <span class="text-sm">${propiedadesEvolucionPDF.value.type_doc}</span></p>`
                        ],
                        [
                            `<p class="text-xs">Edad: <span class="text-sm">${propiedadesEvolucionPDF.value.nacimiento}</span></p>`,
                            `<p class="text-xs">No documento: <span class="text-sm">${propiedadesEvolucionPDF.value.No_document}</span></p>`
                        ],
                        [
                            `<p class="text-xs">EPS: <span class="text-sm">${propiedadesEvolucionPDF.value.Eps}</span></p>`,
                            `<p class="text-xs">Zona: <span class="text-sm">${propiedadesEvolucionPDF.value.zona}</span></p>`
                        ],
                    ],
                })

                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Texto', { texto: 'Diagnósticos' })
                .addComponente('Tabla', {
                    container: 'w-full border rounded-xl p-3 bg-gray-50',
                    filas: [
                        [
                            propiedadesEvolucionPDF.value.diagnosticos
                                ? [`<p class="text-xs leading-tight">${propiedadesEvolucionPDF.value.diagnosticos}</p>`, `<p class="text-xs leading-tight">${propiedadesEvolucionPDF.value.codigo}</p>`]
                                : '<p class="text-xs text-gray-500">Sin diagnósticos registrados</p>'
                        ]
                    ]
                })

                .addComponente('Espacio', { alto: 16 })

                // SECCIÓN: NOTA DE ENFERMERÍA
                .addComponente('Tabla', {
                    filas: [
                        [
                            `<p class="text-sm text-center">Objetivos de la intervencion terapeutica</p>`,
                        ],
                        [
                            `<p class="text-sm text-center">${propiedadesEvolucionPDF.value.objetivos}</p>`
                        ],
                    ],
                })

                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3!',
                    styles: { border: '1px solid #DBEAFE' },
                    filas: [
                        [
                            '<p class="text-sm w-full">Sesion</p>',
                            ['<p class="text-sm w-full">Fecha (DD/MM/AAAA):</p>',
                            '<p class="text-sm w-full">Hora (Militar):</p>'],
                            '<p class="text-sm w-full">Evolucion</p>'
                        ],
                        [
                            `<p class="text-sm w-full">${propiedadesEvolucionPDF.value.sesion}</p>`,
                            `<p class="text-sm w-full">${propiedadesEvolucionPDF.value.fecha}</p>`,
                            `<p class="text-sm w-full">${propiedadesEvolucionPDF.value.evolucion}</p>`,
                        ],

                    ],
                })

                .addComponente('Espacio', { alto: 32 })

                // PIE DE FIRMA
                .addComponente('Tabla', {
                    container: 'pt-5',
                    border: false,
                    filas: [
                        [
                            '<p class="text-xs text-center pt-6 border-t-2">Nombre y Apellido</p>',
                            '<p class="text-xs text-center pt-6 border-t-2">Firma y sello</p>'
                        ]
                    ]
                })
            )


            .nuevaSeccion('notas')
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
                .setFileName(`Nota_${propiedadesNotaPDF.value.name_paciente}`)
                // .addComponente('Tabla', {
                //     container: 'border-b-2 pb-3',
                //     columnas: ['<div class="flex items-center gap-2"><img src="https://play-lh.googleusercontent.com/Yk1bwaX-O7BZbScyAIExW-Ktljt9ZIMwhTrcZ7DtA99TYGPKv8VCUDTfyxKpRQs8YxMf=w600-h300-pc0xffffff-pd" width="60px"/><p class="w-full text-start text-2xl">Thesalus</p></div>', '<p class="w-full text-end">Fecha de impresion:</p>'],
                //     filas: [
                //         [`Sistema de Historias Clinicas`, `<p class="w-full text-end"> ${fechaFormateada()} </p>`],
                //     ],
                // })
                // .addComponente('Texto', {
                //     texto: 'Informacion del Paciente'
                // })
                // .addComponente('Tabla', {
                //     container: 'space-y-2 rounded-xl py-3',
                //     styles: {
                //         backgroundColor: '#EFF6FF',
                //     },
                //     filas: [
                //         ['<p class="w-full text-start text-xs">Nombres y Apellidos:</p>', '<p class="w-full text-start text-xs">Celular:</p>', '<p class="w-full text-start text-xs">Fecha de Nacimiento:</p>'],
                //         [`${propiedadesNotaPDF.value.name}`, `${propiedadesNotaPDF.value.celular}`, `${propiedadesNotaPDF.value.nacimiento}`,],
                //         ['<p class="w-full text-start text-xs pt-2">Tipo de Documento:</p>', '<p class="w-full text-start text-xs pt-2">Documento:</p>', '<p class="w-full text-start text-xs pt-2">Genero:</p>'],
                //         [`${propiedadesNotaPDF.value.type_doc}`, `${propiedadesNotaPDF.value.No_document}`, `${propiedadesNotaPDF.value.sexo}`,],
                //         ['<p class="w-full text-start text-xs pt-2">Direccion:</p>', '<p class="w-full text-start text-xs pt-2">Barrio:</p>', '<p class="w-full text-start text-xs pt-2">Zona:</p>'],
                //         [`${propiedadesNotaPDF.value.direccion}`, `${propiedadesNotaPDF.value.barrio}`, `${propiedadesNotaPDF.value.zona}`,]
                //     ],
                // })
                // .addComponente('Tabla', {
                //     columnas: [`<p class="text-start">Fecha:</p>`, `<p class="text-start">Hora:</p>`, `<p class="text-start">Nota:</p>`],
                //     filas: [[propiedadesNotaPDF.value.fecha_nota, propiedadesNotaPDF.value.hora_nota, propiedadesNotaPDF.value.nota],]
                // })
                // ENCABEZADO PRINCIPAL
                .addComponente('Tabla', {
                    container: 'border-b-2 pb-3',
                    columnas: [
                        '<div class="flex items-center gap-2"><img src="https://play-lh.googleusercontent.com/Yk1bwaX-O7BZbScyAIExW-Ktljt9ZIMwhTrcZ7DtA99TYGPKv8VCUDTfyxKpRQs8YxMf=w600-h300-pc0xffffff-pd" width="60px"/><p class="w-full text-start text-xl font-semibold">Santa Isabel IPS<br/>Nota de Enfermería de Atención Domiciliaria</p></div>',
                        '<p class="w-full text-end text-xs">Fecha de impresión:</p>'
                    ],
                    filas: [
                        [
                            '<p class="text-xs">Proceso: Programa de Atención Domiciliaria</p>',
                            `<p class="w-full text-end text-xs">${fechaFormateada()}</p>`
                        ],
                    ],
                })

                // DATOS DEL PACIENTE
                .addComponente('Texto', { texto: 'Datos del Paciente' })
                .addComponente('Tabla', {
                    container: 'space-y-2 rounded-xl py-3',
                    styles: { backgroundColor: '#EFF6FF' },
                    filas: [
                        [
                            '<p class="text-xs">Nombre completo:</p>',
                            '<p class="text-xs">Edad:</p>'
                        ],
                        [
                            `${propiedadesHistoriaPDF.value.name}`,
                            `${propiedadesHistoriaPDF.value.edad}`
                        ],
                        [
                            '<p class="text-xs pt-2">Tipo de identificación:</p>',
                            '<p class="text-xs pt-2">No. Documento:</p>'
                        ],
                        [
                            `${propiedadesHistoriaPDF.value.type_doc}`,
                            `${propiedadesHistoriaPDF.value.No_document}`
                        ],
                        [
                            '<p class="text-xs pt-2">Dirección:</p>',
                            '<p class="text-xs pt-2">Barrio:</p>',
                            '<p class="text-xs pt-2">Teléfono/Celular:</p>'
                        ],
                        [
                            `${propiedadesHistoriaPDF.value.direccion}`,
                            `${propiedadesHistoriaPDF.value.barrio}`,
                            `${propiedadesHistoriaPDF.value.telefono}`
                        ]
                    ],
                })

                // SECCIÓN: DIAGNÓSTICOS
                .addComponente('Texto', { texto: 'Diagnósticos' })
                .addComponente('Tabla', {
                    container: 'w-full border rounded-xl p-3 bg-gray-50',
                    filas: [
                        [
                            propiedadesHistoriaPDF.value.diagnosticos
                                ? `<p class="text-xs leading-tight">${propiedadesHistoriaPDF.value.diagnosticos}</p>`
                                : '<p class="text-xs text-gray-500">Sin diagnósticos registrados</p>'
                        ]
                    ]
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
                            '<p class="text-xs w-full">Hora (Militar):</p>'
                        ],
                        [
                            `${propiedadesHistoriaPDF.value.fechaNota ?? ''}`,
                            `${propiedadesHistoriaPDF.value.horaNota ?? ''}`
                        ],
                        ['<p class="text-xs pt-2">Subjetivo:</p>'],
                        [
                            propiedadesHistoriaPDF.value.subjetivo
                            ?? '<p class="text-xs text-gray-500">No registrado</p>'
                        ],

                        ['<p class="text-xs pt-2">Objetivo:</p>'],
                        [
                            propiedadesHistoriaPDF.value.objetivo
                            ?? '<p class="text-xs text-gray-500">No registrado</p>'
                        ],

                        ['<p class="text-xs pt-2">Actividades:</p>'],
                        [
                            propiedadesHistoriaPDF.value.actividades
                            ?? '<p class="text-xs text-gray-500">No registrado</p>'
                        ],

                        ['<p class="text-xs pt-2">Plan:</p>'],
                        [
                            propiedadesHistoriaPDF.value.plan
                            ?? '<p class="text-xs text-gray-500">No registrado</p>'
                        ],

                        ['<p class="text-xs pt-2">Intervención:</p>'],
                        [
                            propiedadesHistoriaPDF.value.intervencion
                            ?? '<p class="text-xs text-gray-500">No registrado</p>'
                        ],

                        ['<p class="text-xs pt-2">Evaluación:</p>'],
                        [
                            propiedadesHistoriaPDF.value.evaluacion
                            ?? '<p class="text-xs text-gray-500">No registrado</p>'
                        ],
                    ],
                })

                .addComponente('Espacio', { alto: 32 })

                // PIE DE FIRMA
                .addComponente('Tabla', {
                    container: 'pt-5',
                    filas: [
                        [
                            '<p class="text-xs text-center pt-6">Nombre del Auxiliar de Enfermería</p>',
                            '<p class="text-xs text-center pt-6">Sello del Auxiliar de Enfermería</p>'
                        ]
                    ]
                })
            )

            .nuevaSeccion('tratamientos')
            .addComponente('Tabla', tablaTratamientos
                .setColumnas([
                    { titulo: 'procedimiento', value: 'Procedimiento', tamaño: 300, ordenar: true },
                    { titulo: 'fecha', value: 'Fecha', tamaño: 250, ordenar: true },
                    { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 250 },
                ])
                .setDatos(tratamientos)
                .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: verItemTratamientoHistoria }, puedePUT ? { icon: 'actualizar', action: actualizarItemTratamientoHistoria } : ''], botones: true, })
                .setHeaderTabla({ titulo: 'Tratamientos', color: 'bg-[var(--color-default-600)] text-white', })
            )
            .addComponente('Form', propiedadesItemHistoria)

            .nuevaSeccion('medicinas')
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
        )
    return pagina.build()
})

</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
    <Formularios v-if="showNuevoPaciente" :showPaciente="showNuevoPaciente" @ocultar="showNuevoPaciente = false" />
</template>