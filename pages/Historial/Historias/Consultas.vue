<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { ref, onMounted } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';
import { useVerHistoriaBuilder } from '~/build/Historial/useVerHistoriaBuilder';
import { useVarView } from "~/stores/varview.js";
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';
import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { mapCamposLimpios, mapCampos } from '~/components/organism/Forms/useFormulario';
import { PdfBuilder } from '~/build/Constructores/PDFBuilder';
import { TablaBuilder } from '~/build/Constructores/ClassTablas';

const varView = useVarView();
const historiasStore = useHistoriasStore()
const notificaciones = useNotificacionesStore();

const analisis = ref([])

const show = ref(false);
const showItem = ref(false)
const showCards = ref(false)
const refresh = ref(1);

const pacientesStore = usePacientesStore();
const pacientesList = ref([])
const id_paciente = ref(null)
const showVerHistorial = ref(false)
const showNuevoPaciente = ref(false)
const formularioItem = ref('')
const propiedadesNotaPDF = ref({})
const activePdfNotas = ref(false)

const propiedadesHistoriaPDF = ref({})
const activePdfHistoria = ref(false)

async function llamadatos() {
    const datos = await pacientesStore.listPacientes
    pacientesList.value = datos
}

watch(() => show.value,
    async () => {
        await llamadatos();
        refresh.value++;
    }
);
// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true

    await llamadatos()
    await cargaHistorial()
    varView.cargando = false
});

// funcion para controlar la visibilidad del formulario de nueva historia clinica
const agregarHistoria = () => {
    show.value = true
};


const verHistoria = async (his) => {
    await cargaHistorial(his.id)
    historiasStore.Formulario.HistoriaClinica.name_paciente = his.paciente
    historiasStore.Formulario.HistoriaClinica.No_document_paciente = his.cedula
    historiasStore.Formulario.HistoriaClinica.id_paciente = his.id
    showVerHistorial.value = true
};

async function cargaHistorial() {

    // Inicializar arreglo
    analisis.value = []

    // Obtener todas las historias clínicas
    const todasLasHistorias = await historiasStore.listHistorias || []

    for (const historia of todasLasHistorias) {
        const idTemporal = historia.id_temporal
        const idHistoria = historia.id_temporal // sustituir al conectar DB
        // Obtener análisis relacionados con esta historia
        const analisisDatos = await historiasStore.listDatos(idHistoria, 'Analisis', 'id_historia') || []
        const paciente = pacientesList.value.find((dato) => dato.id_paciente === historia.id_paciente)

        for (const item of analisisDatos) {
            // Obtener examen físico relacionado con el análisis
            const examenFisico = await historiasStore.listDatos(item.id, 'ExamenFisico', 'id_temporal') || []

            // Combinar datos y agregar al arreglo
            analisis.value.push({
                historia: historia, // opcional: incluir datos de la historia
                ...item,
                ...paciente,
                ...examenFisico[0] // si existe
            })
        }
    }
    console.log(analisis.value)

};


function cerrar() {
    show.value = false
}

function cerrarModalVer() {
    showItem.value = false
}

function verItemConsultasHistoria(item) {
    formularioItem.value = 'Consulta'
    const datos = { ...item, ...item.signosVitales }
    mapCampos(datos, historiasStore.Formulario)
    showItem.value = true
}

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


function estadoSemaforo(fila) {
    if (fila.tipoAnalisis === 'Estado clinico sin cambios') {
        return 'Verde'
    } else if (fila.tipoAnalisis === 'Recomendaciones Adicionales') {
        return 'Naranja'
    } else {
        return 'Rojo'
    }
}

function cerrarModal() {
    mapCamposLimpios(historiasStore.Formulario)
    showVerHistorial.value = false
}

function cambiarCard() {
    showCards.value = !showCards.value
}

const fechaFormateada = () => {
    const fecha = new Date()
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const año = fecha.getFullYear();
    const fechaActual = `${dia}/${mes}/${año}`

    return fechaActual
}

const tablaConsultas = new TablaBuilder()

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()
    const cardsConsultas = new CardBuilder()

    const pdfNotas = new PdfBuilder()
    const pdfHistorial = new PdfBuilder()

    const filasConsultas = (unref(analisis) || []).map(consulta => {
        const contenido = `
        <p class="text-start text-base py-2"><strong>Fecha:</strong> ${consulta.fecha}</p>
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
        storeId: 'Verhistoria',
        storePinia: 'Historias',
        cerrarModal: cerrarModalVer,
        formularioItem,
        show: showItem,
    })

    pagina
        .setFondo('FondoDefault')
        .setEstilos('')
        .setContenedor('w-full')
    if (!showCards.value) {
        pagina
            .setHeaderPage({
                titulo: 'Consultas Recientes',
                descripcion: 'Visualiza y administra el historial de consultas.',
                button: [
                    { text: 'En Fila', icon: 'fa-solid fa-table', color: 'bg-gray-700', action: cambiarCard },
                    { text: 'Agregar', icon: 'fa-solid fa-plus', color: 'bg-blue-500', action: ()=>{} },
                ]
            })
            .addComponente('Tabla', tablaConsultas
                .setColumnas([
                    { titulo: "observacion", value: "Observacion", tamaño: 150, ordenar: true },
                    { titulo: "No_document", value: "Documento", tamaño: 100, ordenar: true },
                    { titulo: "municipio", value: "Ciudad", tamaño: 150 },
                    { titulo: "tratamiento", value: "Tratameinto", tamaño: 150 },
                    { titulo: "tipoAnalisis", value: "Estado", tamaño: 150 },
                    { titulo: "Eps", value: "EPS", tamaño: 150, ordenar: true },
                ])
                .setHeaderTabla({
                    color: "bg-[var(--color-default)] text-white",
                    buscador: true,
                    excel: true,
                    filtros: [
                        { columna: 'municipio', placeholder: 'Ciudad', },
                        { columna: 'Eps', placeholder: 'EPS', },
                    ]
                })
                // .setAcciones({
                //     icons: [{ icon: "ver", action: verPaciente }, { icon: "download", action: exportarPDF }],
                //     botones: true,
                // })
                .setDatos(analisis)
            )
    } else {
        pagina
            .setHeaderPage({
                titulo: 'Consultas Recientes',
                descripcion: 'Visualiza y administra el historial de consultas.',
                button: [
                    { text: 'En Fila', icon: 'fa-solid fa-table', color: 'bg-blue-700', action: cambiarCard },
                    { text: 'Agregar', icon: 'fa-solid fa-plus', color: 'bg-blue-500', action: ()=>{} },
                ]
            })
            .addComponente('Card', cardsConsultas
                .setCards([
                    {
                        header: {
                            title: 'Paciente',
                            subtitle: 'Observacion'
                        },
                        body: {
                            html: `<div class="flex flex-col items-end">
                                    <i class="fa-solid fa-user "></i>
                                    <div class="flex flex-col items-start w-full">
                                        <p>Analisis</p>
                                        <p>Tratamiento</p>
                                        <p>Estado</p>
                                    </div>
                                </div>`
                        }
                    },
                    {
                        header: {
                            title: 'Paciente',
                            subtitle: 'Observacion'
                        },
                        body: {
                            html: `<div class="flex flex-col items-end">
                                    <i class="fa-solid fa-user "></i>
                                    <div class="flex flex-col items-start w-full">
                                        <p>Analisis</p>
                                        <p>Tratamiento</p>
                                        <p>Estado</p>
                                    </div>
                                </div>`
                        }
                    }])
                .setContenedor('grid grid-cols-3 gap-3')
                .setcontenedorCards('')
                .setTamaño('flex flex-row justify-between h-[100px] bg-blue-600! rounded-lg')
            )
    }

    return pagina.build()
})
// console.log(propiedades)

</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
</template>