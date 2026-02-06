<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue'
import PDFServicio from '~/components/paginas/PDFServicio.vue'

import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder'
import { CalendarioBuilder, CitasBuilder } from '~/build/Constructores/CalendarioBuilder'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { ref, onMounted } from 'vue'
import { CardBuilder } from '~/build/Constructores/CardBuilder'
import { TablaBuilder } from '~/build/Constructores/TablaBuilder'
import { useCitasActions } from '~/composables/Usuarios/Citas'

const varView = useVarView()
const citasStore = useCitasStore();
const citas = ref([]);

const calendarioCitasStore = useCalendarioCitas();
const show = ref(false);
const refresh = ref(1);

const {
    fecha,
    meses,
    fechaActual
} = storeToRefs(calendarioCitasStore);

const {
  cancelarCita,
  activarCita,
  actualizarCita,
  showMotivoCancelacion,
  showMotivoEdicion,
  showObservacion
} = useCitasActions({
  fecha
})

async function llamadatos() {
    varView.cargando = true
    citas.value = await citasStore.listCitas();
    varView.cargando = false
}
// Watch para actualizar citas al agregar nueva
watch(() => varView.showNuevaCita,
    async (estado) => {
        if(!estado && varView.cambioEnApi){
            await llamadatos();
            refresh.value++;
        }
    }
);

watch(() => varView.showActualizarCita,
    async (estado) => {
        if(!estado && varView.cambioEnApi){
            await llamadatos();
            refresh.value++;
        }
    }
);

watch(() => varView.showNuevaHistoria,
    async (estado) => {
        if(!estado){
            await llamadatos();
            refresh.value++;
        }
    }
);

onMounted(async () => {
    await llamadatos()
    // Rellenar fecha del formulario
    citasStore.Formulario.Cita.fecha = calendarioCitasStore.fecha.split('/').reverse().join('-')

});

// Funciones para manejar la visibilidad de los formularios
const agregarCita = () => {
    show.value = true
    varView.showNuevaCita = true
};

// Funciones para manejar visibilidad de Pagina
const showFila = () => {
    varView.showEnFila = !varView.showEnFila
};

const showCalendario = () => {
    varView.showCalendario = !varView.showCalendario
};

const showTabla = () => {
    varView.showEnTabla = !varView.showEnTabla
}

function citaEliminada (cita) {
    if(cita.estado == 'Inactiva'){
        return 'borrar'
    } else if (cita.estado == 'cancelada') {
        return 'observacion eliminada'
    }
}

function isCancelarCita (cita) {
    if(cita.estado == 'cancelada'){
        showMotivoCancelacion(cita)
    } else {
        cancelarCita(cita)
    }
}

function isCitaActualizada (cita) {
    if(cita.estado == 'Inactiva' && cita.showMotivoEdicion){
        return 'observacion editada'
    } else {
        return ''
    }
}

function isActualizarCita (cita) {
    if(cita.estado == 'Inactiva'){
        return 'actualizar'
    }
}

function citaRealizada (cita) {
    if(cita.estado == 'Realizada'){
        return 'observacion completada'
    } else if(cita.estado == 'Inactiva') {
        return 'completar'
    }
}

function isActivarCita (cita) {
    if(cita.estado == 'Realizada'){
        showObservacion(cita)
    } else if(cita.estado == 'Inactiva'){
        activarCita(cita)
    }
}

// Construccion de pagina
const builderCalendario = new CalendarioBuilder()

const propiedades = computed(() => {

    const builderCitas = new CitasBuilder()
    const tablabuilder = new TablaBuilder()
    const pagina = new ComponenteBuilder()

    const puedeVer = varView.getPermisos.includes('Citas_view');
    if (!puedeVer) {
        pagina
            .setFondo('FondoDefault')
            .setEstilos('')
            .setContenedor('w-full')
            .addComponente('Card', new CardBuilder()
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
                .setheaderTitle('Agenda de citas.')
                .setheaderHtml(`<a href="/Home" class="text-base text-blue-500 hover:text-blue-700"><i class="fa-solid fa-angle-left mr-1"></i>Volver al Inicio</a>`)
                .build()
            )
        return pagina.build()
    }
    const puedePost = varView.getPermisos.includes('Citas_post')

    pagina
        .setFondo('FondoDefault')
    if (!varView.showEnFila) {
        pagina
            .setHeaderPage({
                titulo: 'Calendario de tu Agenda',
                descripcion: 'Visualiza y administra la agenda de citas.',
                button: [
                    { text: 'Calendario', icon: 'fa-solid fa-calendar', color: varView.showCalendario ? 'bg-blue-700' : 'bg-gray-700', action: showCalendario },
                    { text: 'En Lista', icon: 'fa-solid fa-table', color: 'bg-gray-700', action: showFila },
                    puedePost ? { text: 'Agendar', icon: 'fa-solid fa-plus', color: 'bg-blue-500', action: agregarCita } : '',
                ]
            })
            .addComponente('Citas', builderCitas
                .setCitas(citas)
                .setShowTodas(false)
                .setFiltros([
                    { columna: 'servicio', placeholder: 'Servicio', }, 
                    { columna: 'estado', placeholder: 'Estado', }, 
                    { columna: 'name_medico', placeholder: 'Profesional'}, 
                    { columna: 'fecha', placeholder: 'Mes', tipo: 'mes' }
                ])
            )
            if(varView.showCalendario){
                pagina
                .setContenedor('grid lg:grid-cols-[1.5fr_1fr] md:grid-cols-[1fr_1fr] grid-cols-1 lg:gap-6 gap-3')
                .addComponente('Calendario', builderCalendario
                    .setCitas(citas)
                )
            } else {
                pagina
                .setContenedor('grid grid-cols-1 gap-3')
            }
    } else if (varView.showEnFila) {
        pagina
            .setHeaderPage({
                titulo: 'Calendario de tu Agenda',
                descripcion: 'Visualiza y administra la agenda de citas.',
                button: [
                    !varView.showEnTabla ? { text: 'Tabla', icon: 'fa-solid fa-table', color: 'bg-[var(--color-default-400)]', action: showTabla } :
                    { text: 'Tarjeta', icon: 'fa-solid fa-address-card', color: 'bg-[var(--color-default-400)]', action: showTabla },
                    { text: 'En Lista', icon: 'fa-solid fa-table', color: 'bg-blue-700', action: showFila },
                    puedePost ? { text: 'Agendar', icon: 'fa-solid fa-plus', color: 'bg-blue-500', action: agregarCita } : '',
                ]
            })
            .setContenedor('grid grid-cols-1 gap-3')
            if(varView.showEnTabla){
                pagina
                .addComponente('Tabla', tablabuilder
                    .setColumnas([
                    { titulo: 'fecha', value: 'Fecha', tamaño: 100, ordenar: true },
                    { titulo: 'name_paciente', value: 'Paciente', tamaño: 200, ordenar: true },
                    { titulo: 'name_medico', value: 'Profesional', tamaño: 200 },
                    { titulo: 'motivo', value: 'Motivo', tamaño: 150 },
                    { titulo: 'servicio', value: 'Servicio', tamaño: 150 },
                    { titulo: 'estado', value: 'Estado', tamaño: 100, ordenar: true },
                    ])
                    .setHeaderTabla({
                    color: 'bg-[var(--color-default)] text-white',
                    buscador: true,
                    excel: true,
                    filtros: [
                        { columna: 'servicio', placeholder: 'Servicio', }, 
                        { columna: 'estado', placeholder: 'Estado', }, 
                        { columna: 'name_medico', placeholder: 'Profesional'},
                        { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
                        { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' },
                    ],
                    noBuscarPor: ['name_medico']
                    })
                    .setDatos(citas)
                    .setAcciones(
                        { icons: [
                            // { icon: isCitaActualizada, action: showMotivoEdicion },
                            { icon: isActualizarCita, action: actualizarCita },
                            { icon: citaEliminada, action: isCancelarCita },
                            { icon: citaRealizada, action: isActivarCita },
                        ], botones: true }
                    )
                )
            } else {
                pagina
                .addComponente('Citas', builderCitas
                    .setCitas(citas)
                    .setShowTodas(true)
                    .setFiltros([
                        { columna: 'servicio', placeholder: 'Servicio', }, 
                        { columna: 'estado', placeholder: 'Estado', }, 
                        {columna: 'name_medico', placeholder: 'Profesional'},
                        { columna: 'fecha', placeholder: 'Mes', tipo: 'mes' },
                        { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' },
                    ])
                )
            }

    }

    return pagina.build()
})
// console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
    <Cita></Cita>
    <PDFServicio v-if="varView.showPDFServicio"></PDFServicio>
    <Historia v-if="varView.showNuevaHistoria" />
</template>