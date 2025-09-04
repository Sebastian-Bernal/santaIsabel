<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';
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

onMounted(async () => {
    varView.cargando = true;
    sessionStorage.removeItem('activeButton');

    rol.value = sessionStorage.getItem('Rol')

    if (rol.value === 'Admin') {

    } else if (rol.value === 'Paciente') {
        const paciente = JSON.parse(sessionStorage.getItem('Paciente'))
        cardPaciente.value = [{
            header: {
                html: `<h2 class="text-xl text-white font-bold capitalize">Bienvenido, ${paciente.name.toLowerCase()}</h2>
                        <p class="text-base font-bold text-gray-200">En Thesalus encontraras un resumen de tu historial clinico</p>`,
                title: ``,
            },
            footer: {
                status: `EPS: Coomeva`
            }
        }]
    }

    // Cargar citas y pacientes desde el store
    const citasHoy = await citasStore.listCitas();
    const ultimasHistorias = await historiaStore.ultimasHistorias();

    ultimosPacientes.value = ultimasHistorias.map(card => {
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

    Citas.value = citasHoy.map(card => {
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

    varView.cargando = false;
});

const stats = [
    {
        header: {
            title: 'Pacientes Totales',
            subtitle: '1,234'
        },
        body: {
            html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-users text-white"></i></div>`
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
            html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-file text-white"></i></div>`
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
            html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-calendar text-white"></i></div>`
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
            html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-file text-white"></i></div>`
        },
        footer: {
            status: '-6% vs. mes anterior'
        },
    }
];

const actions = [
    {
        header: {
            icon: 'fa-solid fa-plus text-white',
            iconBg: 'bg-inherit',
            title: 'Nuevo Paciente',
            subtitle: 'Registrar un nuevo paciente',
            titleClass: 'text-white',
            subtitleClass: 'text-gray-300!'
        },
    },
    {
        header: {
            icon: 'fa-solid fa-search text-white',
            iconBg: 'bg-inherit',
            title: 'Nuevo Paciente',
            subtitle: 'Registrar un nuevo paciente',
            titleClass: 'text-white',
            subtitleClass: 'text-gray-300!'
        },
    },
    {
        header: {
            icon: 'fa-solid fa-file text-white',
            iconBg: 'bg-inherit',
            title: 'Nuevo Paciente',
            subtitle: 'Registrar un nuevo paciente',
            titleClass: 'text-white',
            subtitleClass: 'text-gray-300!'
        },
    },
    {
        header: {
            icon: 'fa-solid fa-download text-white',
            iconBg: 'bg-inherit',
            title: 'Nuevo Paciente',
            subtitle: 'Registrar un nuevo paciente',
            titleClass: 'text-white',
            subtitleClass: 'text-gray-300!'
        },
    },
];

// Construccion de pagina
const pagina = new ComponenteBuilder();
const cardsState = new CardBuilder();
const cardsPacientes = new CardBuilder();
const cardsCitas = new CardBuilder();
const cardsAcciones = new CardBuilder();

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
                .setcontenedorCards('flex')
                .setTamaño('flex flex-row justify-between items-center rounded-lg')
                .setheaderTitle('Pacientes Recientes')
                .setheaderHtml(`<a href="Historial/Historias" class="text-xs text-blue-500">Ver Todos</a>`)
                .build()
            )
            .addComponente('Card', cardsCitas
                .setCards(Citas)
                .setcontenedorCards('flex')
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
        console.log(rol.value)
        paginaBase
            .addComponente('Card', cardsState
                .setCards(cardPaciente)
                .setContenedor('area-status')
                .setcontenedorCards('')
                .setTamaño('flex flex-row justify-between h-[100px] bg-blue-600! rounded-lg')
                .build()
            )
        // .addComponente('Card', cardsPacientes
        //     .setCards(ultimosPacientes)
        //     .setContenedor('area-info')
        //     .setcontenedorCards('flex')
        //     .setTamaño('flex flex-row justify-between items-center rounded-lg')
        //     .setheaderTitle('Pacientes Recientes')
        //     .setheaderHtml(`<a href="Historial/Historias" class="text-xs text-blue-500">Ver Todos</a>`)
        //     .build()
        // )
    }
    return paginaBase.build()
})

console.log(propiedades.value)
</script>

<template>
    <Pagina v-if="propiedades" :Propiedades="propiedades"></Pagina>
</template>