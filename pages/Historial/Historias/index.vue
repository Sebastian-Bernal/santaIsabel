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
const activePdfNotas = ref(false)

const propiedadesHistoriaPDF = ref({})
const activePdfHistoria = ref(false)

async function llamadatos() {
    const datos = await historiasStore.datosHistoria
    historiasList.value = datos
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
        if(nuevoValor === false){
            await llamadatos();
            refresh.value++;
            window.location.reload()
        }
    }
);

watch(() => showItem.value, () => {
        console.log(historiasStore.Formulario)
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
    const datos = {...item, ...item.signosVitales}
    mapCampos(datos, historiasStore.Formulario)
    showItem.value = true
}

function actualizarItemConsultasHistoria(item) {
    formularioItem.value = 'Consulta'
    actualizar.value = true
    const datos = {...item, ...item.signosVitales}
    mapCampos(datos, historiasStore.Formulario)
    showItem.value = true
}

// Visibilidad notas
function nuevaNota() {
    notasStore.Formulario.Nota.name_paciente = historiasStore.Formulario.HistoriaClinica.name_paciente
    notasStore.Formulario.Nota.No_document_paciente = historiasStore.Formulario.HistoriaClinica.No_document_paciente
    notasStore.Formulario.Nota.id_paciente = historiasStore.Formulario.HistoriaClinica.id_paciente
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
    const pacientes = await pacientesStore.listPacientes

    const dataPaciente = pacientes.filter(user => {
        return user.id_paciente === data.id_paciente
    })

    propiedadesNotaPDF.value = { ...data, ...dataPaciente[0] }
    activePdfNotas.value = true
}

async function exportarHistoriaPDF() {
    // mapCampos(data, notasStore.Formulario)
    const paciente = historiasStore.Formulario.HistoriaClinica.id_paciente
    const pacientes = await pacientesStore.listPacientes

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
    } else {
        return 'Rojo'
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
    if(!puedeVer) return
    const puedePost = varView.getPermisos.includes('Historias_post')
    const puedePUT = varView.getPermisos.includes('Historias_put')

    const tablaConsultas = new TablaBuilder()
    const tablaEvoluciones = new TablaBuilder()
    const tablaNotas = new TablaBuilder()
    const tablaTratamientos = new TablaBuilder()
    const tablaMedicacion = new TablaBuilder()

    const pdfNotas = new PdfBuilder()
    const pdfHistorial = new PdfBuilder()

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
        storeId: 'ActualizarHistoria',
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
                accionAgregar: puedePost ? agregarHistoria : '',
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
                        [`${propiedadesHistoriaPDF.value.id_eps}`, `${propiedadesHistoriaPDF.value.Regimen}`, `${propiedadesHistoriaPDF.value.poblacionVulnerable}`,],
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
                    { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 250 },
                ])
                .setHeaderTabla({ titulo: 'Consultas y Analisis', color: 'bg-[var(--color-default-600)] text-white', })
                .setDatos(analisis)
                .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: verItemConsultasHistoria }, puedePUT ? { icon: 'actualizar', action: actualizarItemConsultasHistoria } : ''], botones: true, })
            )
            .addComponente('Form', propiedadesItemHistoria)

            .nuevaSeccion('evoluciones')
            .addComponente('Tabla', tablaEvoluciones
                .setColumnas([
                    { titulo: 'id', value: 'Cédula', tamaño: 100, ordenar: true },
                    { titulo: 'paciente', value: 'Paciente', tamaño: 250, ordenar: true },
                    { titulo: 'estado', value: 'Estado', tamaño: 150 },
                ])
                .setHeaderTabla({ titulo: 'Evoluciones', color: 'bg-[var(--color-default-600)] text-white', })
            )

            .nuevaSeccion('notas')
            .addComponente('Tabla', tablaNotas
                .setColumnas([
                    { titulo: 'fecha_nota', value: 'Fecha', tamaño: 100, ordenar: true },
                    { titulo: 'hora_nota', value: 'Hora', tamaño: 150 },
                    { titulo: 'nota', value: 'Nota', tamaño: 400 },
                ])
                .setDatos(notas)
                .setAcciones({ icons: [{ icon: 'pdf', action: exportarNotaPDF }, puedePUT ? { icon: 'actualizar', action: actualizarNota } : ''], botones: true, })
                .setHeaderTabla({ titulo: 'Notas Medicas', color: 'bg-[var(--color-default-600)] text-white', accionAgregar: nuevaNota })
            )
            .addComponente('Form', propiedadesNota)
            .addComponente('Form', propiedadesActualizarNota)
            .addComponente('PDFTemplate', pdfNotas
                .setElementId('Nota')
                .setIsActive(activePdfNotas)
                .setFileName(`Nota_${propiedadesNotaPDF.value.name_paciente}`)
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
                        ['<p class="w-full text-start text-xs">Nombres y Apellidos:</p>', '<p class="w-full text-start text-xs">Email:</p>', '<p class="w-full text-start text-xs">Fecha de Nacimiento:</p>'],
                        [`${propiedadesNotaPDF.value.name_paciente}`, `${propiedadesNotaPDF.value.correo}`, `${propiedadesNotaPDF.value.nacimiento}`,],
                        ['<p class="w-full text-start text-xs pt-2">Tipo de Documento:</p>', '<p class="w-full text-start text-xs pt-2">Documento:</p>', '<p class="w-full text-start text-xs pt-2">Genero:</p>'],
                        [`${propiedadesNotaPDF.value.type_doc}`, `${propiedadesNotaPDF.value.No_document}`, `${propiedadesNotaPDF.value.sexo}`,],
                        ['<p class="w-full text-start text-xs pt-2">Direccion:</p>', '<p class="w-full text-start text-xs pt-2">Barrio:</p>', '<p class="w-full text-start text-xs pt-2">Zona:</p>'],
                        [`${propiedadesNotaPDF.value.direccion}`, `${propiedadesNotaPDF.value.barrio}`, `${propiedadesNotaPDF.value.zona}`,]
                    ],
                })
                .addComponente('Tabla', {
                    columnas: [`<p class="text-start">Fecha:</p>`, `<p class="text-start">Hora:</p>`, `<p class="text-start">Nota:</p>`],
                    filas: [[propiedadesNotaPDF.value.fecha_nota, propiedadesNotaPDF.value.hora_nota, propiedadesNotaPDF.value.nota],]
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
// console.log(propiedades)

</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh"/>
    <Formularios v-if="showNuevoPaciente" :showPaciente="showNuevoPaciente" @ocultar="showNuevoPaciente = false" />
</template>