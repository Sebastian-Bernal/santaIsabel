<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import Paciente from '~/components/Paciente.vue';
import Historia from '~/components/Historia.vue';
import Cita from '~/components/Cita.vue';
import { useFormularioCitaBuilder } from '~/build/Usuarios/useCitasFormBuilder';

import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { onMounted, ref } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { useCitasStore } from '~/stores/Formularios/citas/Cita.js';

const citasStore = useCitasStore();
const historiaStore = useHistoriasStore();
const varView = useVarView()
const rol = ref(null)

const Citas = ref([]);
const ultimosPacientes = ref();

const cardPaciente = ref([])
const actions = ref([])

onMounted(async () => {
    varView.cargando = true;
    sessionStorage.removeItem('activeButton');
    sessionStorage.removeItem('seccionIdActivo')

    rol.value = sessionStorage.getItem('Rol')

    const Historias = await historiaStore.ultimasHistorias();
    let citas = []

    if(rol.value === 'Admin'){

        citas = await citasStore.listCitasHoy();

    } else if (rol.value === 'Profesional'){

        const listCitas = await citasStore.listCitas();
        const hoy = new Date();
        citas = listCitas.filter((cita) => {
            const fechaCita = new Date(cita.fecha);
            return (
                cita.name_medico === 'LAURA GARCIA' &&
                fechaCita > hoy
            )
        })

    } else if (rol.value === 'Paciente'){

        const listCitas = await citasStore.listCitas();
        citas = listCitas.filter((cita) => {
            return cita.name_paciente === 'CAMILO JARAMILLO'
        })

    }

    DashboardRol(rol.value, Historias, citas)
    varView.cargando = false;
});
// Funcion para cargar Dashboard por rol
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
                     <p class="text-xs font-thin">${card.fecha}</p>
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
                    title: 'Historial',
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

        cardPaciente.value = [{
            header: {
                html: `<h2 class="text-xl text-white font-bold capitalize">Bienvenid@, ${profesional.name.toLowerCase()}</h2>
                        <p class="text-base font-bold text-gray-100">Aqui encontraras informacion acerca tus citas y pacientes</p>

                    `,
                title: ``,
            },
            footer: {
                status: `Profesion: Odontologia`,
                statusClass: 'text-gray-300 font-black!',
                buttons: [
                    {
                        text: 'Actualizar Informacion',
                        class: 'text-xs text-gray-100 font-semibold p-1 px-2 rounded-xl hover:bg-gray-900 cursor-pointer',
                        icon: 'fa-solid fa-file'
                    }
                ]
            }
        }]

        Citas.value = citas.map(card => {
            return {
                header: {
                    html: `<div class="flex flex-col items-center">
                     <h3 class="text-xl font-bold text-blue-600">${card.hora}</h3>
                     <p class="text-xs font-thin">${card.fecha}</p>
                     <div/>`,
                    title: card.name_paciente,
                    subtitle: card.servicio,
                },
                body: {
                    text: `${profesional.name}`
                },
                footer: {
                    status: card.motivo,
                    statusClass: 'bg-blue-500 text-white'
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
                accion: nuevaCita
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
                accion: buscarHistoria
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

// Visibilidad de Formularios en acciones rapidas
function nuevoPaciente() {
    varView.showNuevoPaciente = true
}

function nuevaHistoria() {
    varView.showNuevaHistoria = true
}

function nuevaCita() {
    varView.showNuevaCita = true
}

// Acciones rapidas
function buscarHistoria() {
    location.href = 'Historial/Historias'
}

const stats = [
    {
        header: {
            html: `<div>
                    <p class="font-semibold">Pacientes totales</p>
                    <p class="text-sm text-gray-700">1,234</p>
                    <p class="text-sm py-2">+12% vs. mes anterior</p>
                </div>`
        },
        body: {
            html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-users dark:text-white text-gray-900 text-xl "></i></div>`
        },
    },
    {
        header: {
            html: `<div>
                    <p class="font-semibold">Consultas Hoy</p>
                    <p class="text-sm text-gray-700">28</p>
                    <p class="text-sm py-2">+8% vs. mes anterior</p>
                </div>`
        },
        body: {
            html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-file dark:text-white text-gray-900 text-xl"></i></div>`
        },
    },
    {
        header: {
            html: `<div>
                    <p class="font-semibold">Citas Programadas</p>
                    <p class="text-sm text-gray-700">45</p>
                    <p class="text-sm py-2">+15% vs. mes anterior</p>
                </div>`
        },
        body: {
            html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-calendar dark:text-white text-gray-900 text-xl"></i></div>`
        },
    },
    {
        header: {
            html: `<div>
                    <p class="font-semibold">Rips Pendientes</p>
                    <p class="text-sm text-gray-700">7</p>
                    <p class="text-sm py-2">-6% vs. mes anterior</p>
                </div>`
        },
        body: {
            html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-file-medical dark:text-white text-gray-900 text-xl"></i></div>`
        },
    }
];

// Construccion de pagina
const pagina = new ComponenteBuilder();
const cardsState = new CardBuilder();
const cardsPacientes = new CardBuilder();
const cardsCitas = new CardBuilder();
const cardsAcciones = new CardBuilder();

function cerrar(){
    varView.showNuevaCita = false
}

const {builder, pacientesList, medicosList} = useFormularioCitaBuilder({
    storeId: 'NuevaCita',
    storePinia: 'Citas',
    cerrarModal: cerrar,
    show: varView.showNuevaCita,
});

const propiedades = computed(() => {
    if (!rol.value) return null

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
                .setheaderHtml(`<a href="Historial/Historias" class="text-xs text-blue-500 hover:text-blue-700">Ver Todos</a>`)
                .build()
            )
            .addComponente('Card', cardsCitas
                .setCards(Citas)
                .setcontenedorCards('flex flex-col')
                .setContenedor('area-infoCitas')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200')
                .setheaderTitle('Citas de Hoy')
                .setheaderHtml(`<a href="Usuarios/Citas" class="text-xs text-blue-500 hover:text-blue-700">Ver Agenda</a>`)
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
            .setHeaderPage({
                titulo: 'Dashboard',
                descripcion: 'Resumen de actividad del sistema de historias clínicas.',
            })
            .addComponente('Card', cardsState
                .setCards(cardPaciente)
                .setContenedor('area-status')
                .setcontenedorCards('')
                .setTamaño('flex flex-row justify-between h-[100px] bg-gradient-to-r from-blue-600 to-blue-900 rounded-lg')
                .build()
            )
            .addComponente('Card', cardsCitas
                .setCards(Citas)
                .setcontenedorCards('flex flex-col')
                .setContenedor('area-info bg-gray-100 dark:bg-gray-800 px-3 pb-3 rounded-xl')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200')
                .setheaderTitle('Citas Proximas')
                .setheaderHtml(`<a href="/Usuarios/Citas" class="text-xs text-blue-500 hover:text-blue-700">Ver Agenda</a>`)
                .build()
            )
            .addComponente('Card', cardsAcciones
                .setCards(actions)
                .setContenedor('area-actions bg-gray-100 dark:bg-gray-800 px-3 pb-3 rounded-xl h-fit')
                .setcontenedorCards('flex flex-col area-actions')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-500)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white!')
                .setheaderTitle('Acciones Rapidas')
                .build()
            )
    }
    else if (rol.value === 'Profesional') {
       paginaBase
            .setHeaderPage({
                titulo: 'Dashboard',
                descripcion: 'Resumen de actividad del sistema de historias clínicas.',
            })
            .addComponente('Card', cardsState
                .setCards(cardPaciente)
                .setContenedor('area-status')
                .setcontenedorCards('')
                .setTamaño('flex md:flex-row justify-between md:h-[100px] bg-gradient-to-r from-blue-600 to-blue-900 rounded-lg')
                .build()
            )
            .addComponente('Card', cardsCitas
                .setCards(Citas)
                .setcontenedorCards('flex flex-col')
                .setContenedor('area-info bg-gray-100 dark:bg-gray-800 px-3 pb-3 rounded-xl')
                .setTamaño('flex md:flex-row justify-between md:items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200 hover:bg-white! dark:hover:bg-gray-900!')
                .setheaderTitle('Citas Proximas')
                .setheaderHtml(`<a href="/Usuarios/Citas" class="text-xs text-blue-500 hover:text-blue-700">Ver Agenda</a>`)
                .build()
            )
            .addComponente('Card', cardsAcciones
                .setCards(actions)
                .setContenedor('area-actions bg-gray-100 dark:bg-gray-800 px-3 pb-3 rounded-xl h-fit')
                .setcontenedorCards('flex flex-col area-actions')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-500)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white!')
                .setheaderTitle('Acciones Rapidas')
                .build()
            )
            .addComponente('Form', builder)
    }
    return paginaBase.build()
})

</script>

<template>
    <Pagina v-if="propiedades" :Propiedades="propiedades"></Pagina>
    <Paciente v-if="varView.showNuevoPaciente"/>
    <Historia v-if="varView.showNuevaHistoria" />
    <!-- <Cita v-if="varView.showNuevaCita"/> -->
</template>