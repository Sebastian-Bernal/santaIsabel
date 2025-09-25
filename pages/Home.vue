<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import Paciente from '~/components/Paciente.vue';
import Historia from '~/components/Historia.vue';

import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';
import { onMounted, ref } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { useCitasStore } from '~/stores/Formularios/citas/Cita.js';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { TablaBuilder } from '~/build/Constructores/ClassTablas';
import { ModalBuilder } from '~/build/Constructores/ModalBuilder';
import { PdfBuilder } from '~/build/Constructores/PDFBuilder';
import { mapCampos, mapCamposLimpios } from '~/components/organism/Forms/useFormulario';

const citasStore = useCitasStore();
const historiaStore = useHistoriasStore();
const pacienteStore = usePacientesStore();
const varView = useVarView()
const rol = ref(null)

const Citas = ref([]);
const ultimosPacientes = ref();

const cardPaciente = ref([])
const actions = ref([])
const propiedadesHistoriaPDF = ref({})
const activePdfHistoria = ref(false)
const analisis = ref([])
const notas = ref([])
const tratamientos = ref([])
const medicinas = ref([]);
const showVerHistorial = ref(false)

onMounted(async () => {
    varView.cargando = true;
    sessionStorage.removeItem('activeButton');

    rol.value = sessionStorage.getItem('Rol')
    const Historias = await historiaStore.ultimasHistorias();
    const citas = await citasStore.listCitasHoy();
    DashboardRol(rol.value, Historias, citas)
    varView.cargando = false;
});

function nuevoPaciente() {
    varView.showNuevoPaciente = true
}

function nuevaHistoria() {
    varView.showNuevaHistoria = true
}

async function verHistorial() {
    const usuario = JSON.parse(sessionStorage.getItem('Paciente'))

    const pacientes = await pacienteStore.listPacientes
    const paciente = pacientes.filter((dato) => {
        return dato.id_usuario === usuario.id_usuario
    })?.[0]

    historiaStore.Formulario.HistoriaClinica.name_paciente = paciente.name
    historiaStore.Formulario.HistoriaClinica.No_document_paciente = paciente.No_document
    historiaStore.Formulario.HistoriaClinica.id_paciente = paciente.id_paciente
    await cargaHistorial(paciente.id_paciente)
    showVerHistorial.value = true
}

async function cargaHistorial(id) {

    // Consultas
    analisis.value = []
    const historia = await pacienteStore.listDatos(id, 'HistoriaClinica')
    // Cambiar id por id_historia
    if (Array.isArray(historia) && historia.length > 0 && historia[0].id_temporal) {
        const idTemporal = historia[0].id_temporal;

        // Obtener datos existentes
        const analisisDatos = await historiaStore.listDatos(idTemporal, 'Analisis', 'id_historia') || [];
        for (const item of analisisDatos) {
            const examenFisico = await historiaStore.listDatos(item.id, 'ExamenFisico', 'id_temporal') || [];

            analisis.value.push({ ...item, ...examenFisico[0] })
        }

    } else {
        analisis.value = []
    }


    // Evoluciones


    // Notas
    notas.value = await pacienteStore.listDatos(id, 'Nota') || []


    // Tratamientos
    tratamientos.value = await pacienteStore.listDatos(id, 'Plan_manejo_procedimientos') || []

    const tratamientosConAnalisis = await Promise.all(
        tratamientos.value.map(async (tratamiento) => {
            const analisisTratamiento = await historiaStore.listDatos(tratamiento.id_temporal, 'Analisis', 'id')
            // Aquí puedes agregar más valores del análisis si existen
            return {
                ...tratamiento,
                ...analisisTratamiento[0],
            }
        })
    )

    tratamientos.value = tratamientosConAnalisis


    // Medicinas
    medicinas.value = await pacienteStore.listDatos(id, 'Plan_manejo_medicamentos') || []

    const medicinasConAnalisis = await Promise.all(
        medicinas.value.map(async (medicina) => {
            const analisisMedicina = await historiaStore.listDatos(medicina.id_temporal, 'Analisis', 'id')
            // Aquí puedes agregar más valores del análisis si existen
            return {
                ...medicina,
                ...analisisMedicina[0],
            }
        })
    )

    medicinas.value = medicinasConAnalisis
    // console.log(analisis.value, notas.value, tratamientos.value, medicinas.value)
};

function cerrarModal() {
    mapCamposLimpios(historiaStore.Formulario)
    showVerHistorial.value = false
}

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

async function exportarHistoriaPDF() {
    // mapCampos(data, notasStore.Formulario)
    const paciente = historiaStore.Formulario.HistoriaClinica.id_paciente
    const pacientes = await pacienteStore.listPacientes

    const dataPaciente = pacientes.filter(user => {
        return user.id_paciente === paciente
    })
    propiedadesHistoriaPDF.value = { ...dataPaciente[0], consultas: [...analisis.value] }
    console.log(propiedadesHistoriaPDF)
    activePdfHistoria.value = true
}

function buscarHistoria() {
    location.href = 'Historial/Historias'
}

function DashboardRol(rol, Historias, citas) {
    if (rol === 'Admin') {
        if (Historias.length > 0) {
            ultimosPacientes.value = Historias.map(card => {
                return {
                    header: {
                        icon: 'fa-solid fa-user',
                        title: card.name_paciente,
                        subtitle: card.No_document_paciente
                    },
                    body: {
                        html: `<i class="fa-solid fa-clock"></i> ${card.fecha_historia}`
                    },
                    footer: {
                        status: 'completado',
                        statusClass: 'bg-green-500'
                    }
                }
            })
        } else {
            ultimosPacientes.value = [{
                header: {
                    icon: 'fa-solid fa-user',
                    title: 'No hay Pacientes Recientes',
                },
            }]
        }

        if (citas.length > 0) {
            Citas.value = citas.map(card => {
                return {
                    header: {
                        html: `<div class="flex flex-col items-center">
                     <h3 class="text-xl font-bold text-blue-600">${card.hora}</h3>
                     <p class="text-xs font-thin">Hoy</p>
                     <div/>`,
                        title: card.name_paciente,
                        subtitle: card.servicio,
                    },
                    // body: {
                    //     html: ``
                    // },
                    footer: {
                        status: card.motivo,
                        statusClass: 'bg-blue-500'
                    }
                }
            })
        } else {
            Citas.value = [
                {
                    header: {
                        title: 'No se encontraron Citas.'
                    }
                }
            ]
        }


        actions.value = [
            {
                header: {
                    icon: 'fa-solid fa-plus text-white',
                    iconBg: 'bg-inherit',
                    title: 'Nuevo Paciente',
                    subtitle: 'Registrar un nuevo paciente',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
                accion: nuevoPaciente
            },
            {
                header: {
                    icon: 'fa-solid fa-search text-white',
                    iconBg: 'bg-inherit',
                    title: 'Buscar Historia',
                    subtitle: 'Buscar historia clínica',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
                accion: buscarHistoria
            },
            {
                header: {
                    icon: 'fa-solid fa-file text-white',
                    iconBg: 'bg-inherit',
                    title: 'Nueva Historia',
                    subtitle: 'Crear historia clínica',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
                accion: nuevaHistoria
            },
            {
                header: {
                    icon: 'fa-solid fa-download text-white',
                    iconBg: 'bg-inherit',
                    title: 'Exportar RIPS',
                    subtitle: 'Generar reporte RIPS',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
            },
        ];
    } else if (rol === 'Paciente') {
        const paciente = JSON.parse(sessionStorage.getItem('Paciente'))

        ultimosPacientes.value = Historias.map(card => {
            return {
                header: {
                    icon: 'fa-solid fa-user',
                    title: paciente.name,
                    subtitle: card.No_document_paciente
                },
                body: {
                    html: `<i class="fa-solid fa-clock"></i> ${card.fecha_historia}`
                },
                footer: {
                    status: 'Sin cambios Criticos',
                    statusClass: 'bg-green-500 text-white font-bolder',
                    buttons: [{ text: 'Descargar', icon: 'fa-solid fa-download', class: 'text-base bg-blue-100 px-3 rounded-xl' }]
                }
            }
        })

        cardPaciente.value = [{
            header: {
                html: `<h2 class="text-xl text-white font-bold capitalize">Bienvenido, ${paciente.name.toLowerCase()}</h2>
                        <p class="text-base font-bold text-gray-200">En Thesalus encontraras un resumen de tu historial clinico</p>`,
                title: ``,
            },
            footer: {
                status: `EPS: Coomeva`,
                statusClass: 'bg-white text-blue-700 font-black!'
            }
        }]

        Citas.value = citas.map(card => {
            return {
                header: {
                    html: `<div class="flex flex-col items-center">
                     <h3 class="text-xl font-bold text-blue-600">${card.hora}</h3>
                     <p class="text-xs font-thin">Hoy</p>
                     <div/>`,
                    title: paciente.name,
                    subtitle: card.servicio,
                },
                // body: {
                //     html: ``
                // },
                footer: {
                    status: card.motivo,
                    statusClass: 'bg-blue-500'
                }
            }
        })

        actions.value = [
            {
                header: {
                    icon: 'fa-solid fa-plus text-white',
                    iconBg: 'bg-inherit',
                    title: 'Solicitar Cita',
                    subtitle: 'Enviar peticion para consulta medica',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
            },
            {
                header: {
                    icon: 'fa-solid fa-search text-white',
                    iconBg: 'bg-inherit',
                    title: 'Consultas',
                    subtitle: 'Visualiza tus consultas medicas',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!',
                },
                accion: verHistorial
            },
            {
                header: {
                    icon: 'fa-solid fa-file text-white',
                    iconBg: 'bg-inherit',
                    title: 'Descargar Certificados',
                    subtitle: 'Descarga constancias y archivos medicos',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
            },
        ];
    } else if (rol === 'Profesional') {
        const profesional = JSON.parse(sessionStorage.getItem('Profesional'))

        ultimosPacientes.value = Historias.map(card => {
            return {
                header: {
                    icon: 'fa-solid fa-user',
                    title: profesional.name,
                    subtitle: card.No_document_paciente
                },
                body: {
                    html: `<i class="fa-solid fa-clock"></i> ${card.fecha_historia}`
                },
                footer: {
                    status: 'Sin cambios Criticos',
                    statusClass: 'bg-green-500 text-white font-bolder',
                    buttons: [{ text: 'Descargar', icon: 'fa-solid fa-download', class: 'text-base bg-blue-100 px-3 rounded-xl' }]
                }
            }
        })

        cardPaciente.value = [{
            header: {
                html: `<h2 class="text-xl text-white font-bold capitalize">Bienvenid@, ${profesional.name.toLowerCase()}</h2>
                        <p class="text-base font-bold text-gray-200">Aqui encontraras informacion acerca tus citas y pacientes</p>`,
                title: ``,
            },
            footer: {
                status: `Profesion: Odontologia`,
                statusClass: 'bg-white text-blue-700 font-black!'
            }
        }]

        Citas.value = citas.map(card => {
            return {
                header: {
                    html: `<div class="flex flex-col items-center">
                     <h3 class="text-xl font-bold text-blue-600">${card.hora}</h3>
                     <p class="text-xs font-thin">Hoy</p>
                     <div/>`,
                    title: card.name_paciente,
                    subtitle: card.servicio,
                },
                // body: {
                //     html: ``
                // },
                footer: {
                    status: card.motivo,
                    statusClass: 'bg-blue-500'
                }
            }
        })

        actions.value = [
            {
                header: {
                    icon: 'fa-solid fa-plus text-white',
                    iconBg: 'bg-inherit',
                    title: 'Crear Cita',
                    subtitle: 'Nueva consulta medica',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
            },
            {
                header: {
                    icon: 'fa-solid fa-search text-white',
                    iconBg: 'bg-inherit',
                    title: 'Pacientes',
                    subtitle: 'Visualiza informacion de tus pacientes',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!',
                },
                accion: verHistorial
            },
            {
                header: {
                    icon: 'fa-solid fa-file text-white',
                    iconBg: 'bg-inherit',
                    title: 'Descargar Certificados',
                    subtitle: 'Descarga constancias y archivos medicos',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
            },
        ];
    }
}

const stats = [
    {
        header: {
            title: 'Pacientes Totales',
            subtitle: '1,234'
        },
        body: {
            html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-users dark:text-white text-gray-900 "></i></div>`
        },
        footer: {
            status: '+12% vs. mes anterior'
        },
    },
    {
        header: {
            title: 'Consultas Hoy',
            subtitle: '28'
        },
        body: {
            html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-file dark:text-white text-gray-900 "></i></div>`
        },
        footer: {
            status: '+8% vs. mes anterior'
        },
    },
    {
        header: {
            title: 'Citas Programadas',
            subtitle: '45'
        },
        body: {
            html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-calendar dark:text-white text-gray-900 "></i></div>`
        },
        footer: {
            status: '+15% vs. mes anterior'
        },
    },
    {
        header: {
            title: 'Rips Pendientes',
            subtitle: '7'
        },
        body: {
            html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-file dark:text-white text-gray-900 "></i></div>`
        },
        footer: {
            status: '-6% vs. mes anterior'
        },
    }
];

// Construccion de pagina
const pagina = new ComponenteBuilder();
const cardsState = new CardBuilder();
const cardsPacientes = new CardBuilder();
const cardsCitas = new CardBuilder();
const cardsAcciones = new CardBuilder();

const propiedades = computed(() => {
    if (!rol.value) return null

    const modal = new ModalBuilder()
    const consultasCard = new CardBuilder()
    const evolucionesCard = new CardBuilder()
    const notasCard = new CardBuilder()
    const tratamientosCard = new CardBuilder()
    const medicacionCard = new CardBuilder()
    const tablaConsultas = new TablaBuilder()
    const tablaEvoluciones = new TablaBuilder()
    const tablaNotas = new TablaBuilder()
    const tablaTratamientos = new TablaBuilder()
    const tablaMedicacion = new TablaBuilder()

    const pdfNotas = new PdfBuilder()
    const pdfHistorial = new PdfBuilder()

    const filasConsultas = (analisis.value || []).map(consulta => {
        const contenido = `
        <p class="text-start text-xs py-2"><strong>Motivo:</strong> ${consulta.motivo}</p>
        <p class="text-start text-xs py-2"><strong>Analisis:</strong> ${consulta.analisis || ''}</p>
        <p class="text-start text-xs py-2"><strong>Observacion:</strong> ${consulta.observacion || ''}</p>
        <p class="text-start text-xs py-2"><strong>Tipo analisis:</strong> ${consulta.tipoAnalisis || ''}</p>
        <p class="text-start text-xs py-2"><strong>Tratamiento:</strong> ${consulta.tratamiento || ''}</p>
        <hr class="w-full h-5"/>
        `
        return [contenido]
    })

    const paginaBase = pagina
        .setFondo('FondoDefault')
        .setContenedor('containerDashboard gap-5')
    if (rol.value === 'Admin') {
        paginaBase
            .setHeaderPage({
                titulo: 'Dashboard',
                descripcion: 'Resumen de actividad del sistema de historias clínicas.',
            })
            .addComponente('Card', cardsState
                .setCards(stats)
                .setContenedor('area-status')
                .setcontenedorCards('grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-5')
                .setTamaño('grid grid-cols-[1fr_0.5fr] place-items-center h-[160px] bg-white dark:bg-gray-700')
                .build()
            )
            .addComponente('Card', cardsPacientes
                .setCards(ultimosPacientes)
                .setContenedor('area-info')
                .setcontenedorCards('flex flex-col')
                .setTamaño('flex flex-row justify-between items-center rounded-lg')
                .setheaderTitle('Pacientes Recientes')
                .setheaderHtml(`<a href="Historial/Historias" class="text-xs text-blue-500">Ver Todos</a>`)
                .build()
            )
            .addComponente('Card', cardsCitas
                .setCards(Citas)
                .setcontenedorCards('flex flex-col')
                .setContenedor('area-infoCitas')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200')
                .setheaderTitle('Citas de Hoy')
                .setheaderHtml(`<a href="Usuarios/Citas" class="text-xs text-blue-500">Ver Agenda</a>`)
                .build()
            )
            .addComponente('Card', cardsAcciones
                .setCards(actions)
                .setContenedor('area-actions')
                .setcontenedorCards('flex flex-col area-actions')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-500)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white!')
                .setheaderTitle('Acciones Rapidas')
                .build()
            )
    }
    else if (rol.value === 'Paciente') {
        paginaBase
            .addComponente('Card', cardsState
                .setCards(cardPaciente)
                .setContenedor('area-status')
                .setcontenedorCards('')
                .setTamaño('flex flex-row justify-between h-[100px] bg-blue-600! rounded-lg')
                .build()
            )
            .addComponente('Card', cardsCitas
                .setCards(Citas)
                .setcontenedorCards('flex flex-col')
                .setContenedor('area-infoCitas')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200')
                .setheaderTitle('Citas Proximas')
                .setheaderHtml(`<a href="" class="text-xs text-blue-500">Ver Agenda</a>`)
                .build()
            )
            .addComponente('Card', cardsAcciones
                .setCards(actions)
                .setContenedor('area-actions')
                .setcontenedorCards('flex flex-col area-actions')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-500)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white!')
                .setheaderTitle('Acciones Rapidas')
                .build()
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
                        <p>Paciente: ${historiaStore.Formulario.HistoriaClinica.name_paciente}</p> 
                        <p>CC: ${historiaStore.Formulario.HistoriaClinica.No_document_paciente}</p>
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
                            ['<p class="w-full text-start text-xs">Nombres y Apellidos:</p>', '<p class="w-full text-start text-xs">Email:</p>', '<p class="w-full text-start text-xs">Fecha de Nacimiento:</p>'],
                            [`${propiedadesHistoriaPDF.value.name}`, `${propiedadesHistoriaPDF.value.correo}`, `${propiedadesHistoriaPDF.value.nacimiento}`,],
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
                            [`${propiedadesHistoriaPDF.value.municipio}`, `${propiedadesHistoriaPDF.value.departamento}`, `${propiedadesHistoriaPDF.value.celular}`,],
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
                        { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 250 },
                    ])
                    .setHeaderTabla({ titulo: 'Consultas y Analisis', color: 'bg-[var(--color-default-600)] text-white', })
                    .setDatos(analisis)
                    .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: () => {} }], botones: true, })
                )
                // .addComponente('Form', propiedadesItemHistoria)

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
                        { titulo: 'name_paciente', value: 'Paciente', tamaño: 100, ordenar: true },
                        { titulo: 'fecha_nota', value: 'Fecha', tamaño: 100, ordenar: true },
                        { titulo: 'hora_nota', value: 'Hora', tamaño: 150 },
                        { titulo: 'nota', value: 'Nota', tamaño: 300 },
                    ])
                    .setDatos(notas)
                    .setAcciones({ icons: [{ icon: 'download', action: () => {} }], botones: true, })
                    .setHeaderTabla({ titulo: 'Notas Medicas', color: 'bg-[var(--color-default-600)] text-white', accionAgregar: ()=>{} })
                )
                // .addComponente('Form', propiedadesNota)
                // .addComponente('PDFTemplate', pdfNotas
                //     .setElementId('Nota')
                //     // .setIsActive(activePdfNotas)
                //     .setFileName(`Nota_${propiedadesNotaPDF.value.name_paciente}`)
                //     .addComponente('Tabla', {
                //         container: 'border-b-2 pb-3',
                //         columnas: ['<div class="flex items-center gap-2"><img src="https://play-lh.googleusercontent.com/Yk1bwaX-O7BZbScyAIExW-Ktljt9ZIMwhTrcZ7DtA99TYGPKv8VCUDTfyxKpRQs8YxMf=w600-h300-pc0xffffff-pd" width="60px"/><p class="w-full text-start text-2xl">Thesalus</p></div>', '<p class="w-full text-end">Fecha de impresion:</p>'],
                //         filas: [
                //             [`Sistema de Historias Clinicas`, `<p class="w-full text-end"> ${fechaFormateada()} </p>`],
                //         ],
                //     })
                //     .addComponente('Texto', {
                //         texto: 'Informacion del Paciente'
                //     })
                //     .addComponente('Tabla', {
                //         container: 'space-y-2 rounded-xl py-3',
                //         styles: {
                //             backgroundColor: '#EFF6FF',
                //         },
                //         filas: [
                //             ['<p class="w-full text-start text-xs">Nombres y Apellidos:</p>', '<p class="w-full text-start text-xs">Email:</p>', '<p class="w-full text-start text-xs">Fecha de Nacimiento:</p>'],
                //             [`${propiedadesNotaPDF.value.name_paciente}`, `${propiedadesNotaPDF.value.correo}`, `${propiedadesNotaPDF.value.nacimiento}`,],
                //             ['<p class="w-full text-start text-xs pt-2">Tipo de Documento:</p>', '<p class="w-full text-start text-xs pt-2">Documento:</p>', '<p class="w-full text-start text-xs pt-2">Genero:</p>'],
                //             [`${propiedadesNotaPDF.value.type_doc}`, `${propiedadesNotaPDF.value.No_document}`, `${propiedadesNotaPDF.value.sexo}`,],
                //             ['<p class="w-full text-start text-xs pt-2">Direccion:</p>', '<p class="w-full text-start text-xs pt-2">Barrio:</p>', '<p class="w-full text-start text-xs pt-2">Zona:</p>'],
                //             [`${propiedadesNotaPDF.value.direccion}`, `${propiedadesNotaPDF.value.barrio}`, `${propiedadesNotaPDF.value.zona}`,]
                //         ],
                //     })
                //     .addComponente('Tabla', {
                //         columnas: [`<p class="text-start">Fecha:</p>`, `<p class="text-start">Hora:</p>`, `<p class="text-start">Nota:</p>`],
                //         filas: [[propiedadesNotaPDF.value.fecha_nota, propiedadesNotaPDF.value.hora_nota, propiedadesNotaPDF.value.nota],]
                //     })
                // )

                .nuevaSeccion('tratamientos')
                .addComponente('Tabla', tablaTratamientos
                    .setColumnas([
                        { titulo: 'descripcion', value: 'Descripcion', tamaño: 300, ordenar: true },
                        { titulo: 'mes', value: 'Mes', tamaño: 250, ordenar: true },
                        { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 250 },
                    ])
                    .setDatos(tratamientos)
                    .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: () => {} }], botones: true, })
                    .setHeaderTabla({ titulo: 'Tratamientos', color: 'bg-[var(--color-default-600)] text-white', })
                )
                // .addComponente('Form', propiedadesItemHistoria)

                .nuevaSeccion('medicinas')
                .addComponente('Tabla', tablaMedicacion
                    .setColumnas([
                        { titulo: 'nombre', value: 'Medicamento', tamaño: 200, ordenar: true },
                        { titulo: 'presentacion', value: 'Presentacion', tamaño: 200, ordenar: true },
                        { titulo: 'cantidad', value: 'Cantidad', tamaño: 150 },
                        { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 250 },
                    ])
                    .setDatos(medicinas)
                    .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: ()=>{} }], botones: true, })
                    .setHeaderTabla({ titulo: 'Medicinas', color: 'bg-[var(--color-default-600)] text-white', })
                )
                // .addComponente('Form', propiedadesItemHistoria)
            )
    }
    else if (rol.value === 'Profesional') {
       paginaBase
            .addComponente('Card', cardsState
                .setCards(cardPaciente)
                .setContenedor('area-status')
                .setcontenedorCards('')
                .setTamaño('flex flex-row justify-between h-[100px] bg-blue-600! rounded-lg')
                .build()
            )
            .addComponente('Card', cardsCitas
                .setCards(Citas)
                .setcontenedorCards('flex flex-col')
                .setContenedor('area-infoCitas')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200')
                .setheaderTitle('Citas Proximas')
                .setheaderHtml(`<a href="" class="text-xs text-blue-500">Ver Agenda</a>`)
                .build()
            )
            .addComponente('Card', cardsAcciones
                .setCards(actions)
                .setContenedor('area-actions')
                .setcontenedorCards('flex flex-col area-actions')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-500)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white!')
                .setheaderTitle('Acciones Rapidas')
                .build()
            ) 
    }
    return paginaBase.build()
})


</script>

<template>
    <Pagina v-if="propiedades" :Propiedades="propiedades"></Pagina>
    <Paciente v-if="varView.showNuevoPaciente"/>
    <Historia v-if="varView.showNuevaHistoria" />
</template>