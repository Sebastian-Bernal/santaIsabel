<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue'

import { useFormularioCitaBuilder } from '~/build/Usuarios/useCitasFormBuilder'
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder'
import { CalendarioBuilder, CitasBuilder } from '~/build/Constructores/CalendarioBuilder'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { ref, onMounted } from 'vue'

const citasStore = useCitasStore();
const citas = ref([]);

const calendarioCitasStore = useCalendarioCitas();
const show = ref(false);
const showEnFila = ref(false);
const refresh = ref(1);

async function llamadatos() {
    citas.value = await citasStore.listCitas();
    console.log('llamadoatos', citas)
}
// Watch para actualizar citas al agregar nueva
watch(() => show.value,
    async () => {
        await llamadatos();
        refresh.value++;
    }
);

onMounted(async () => {
    await llamadatos()
    await citasStore.indexDBDatos()
    citasStore.Formulario.Cita.fecha = calendarioCitasStore.fecha.split('/').reverse().join('-')
});

watch(() => calendarioCitasStore.fecha, (nuevaFecha) => {
    citasStore.Formulario.Cita.fecha = nuevaFecha.split('/').reverse().join('-')
})

// Funciones para manejar la visibilidad de los formularios
const agregarCita = () => {
    show.value = true
};

function cerrar () {
    show.value = false
}

// Funciones para manejar visibilidad de Pagina
const showFila = () => {
    showEnFila.value = !showEnFila.value
};

const {builder, pacientesList, medicosList} = useFormularioCitaBuilder({
    storeId: 'NuevaCita',
    storePinia: 'Citas',
    cerrarModal: cerrar,
    show: show,
});

// Construccion de pagina
const builderCalendario = new CalendarioBuilder()

const propiedades = computed(() => {
    const builderCitas = new CitasBuilder()
    const pagina = new ComponenteBuilder()
    pagina
    .setFondo('FondoDefault')
    .addComponente('Form', builder)
    if(!showEnFila.value){
        pagina
        .setHeaderPage({
            titulo: 'Calendario de Citas', 
            descripcion: 'Visualiza y administra la agenda de citas.',
            button: [
                {text: 'En Lista', icon: 'fa-solid fa-table', color: 'bg-gray-700', action: showFila},
                {text: 'Agregar Cita', icon: 'fa-solid fa-plus', color: 'bg-blue-500', action: agregarCita},
            ]
        })
        .setContenedor('grid lg:grid-cols-[1.5fr_1fr] md:grid-cols-[1fr_1fr] grid-cols-1 lg:gap-10 gap-3')
        .addComponente('Citas', builderCitas
            .setCitas(citas)
            .setShowTodas(false)
            .setFiltros([{columna: 'motivo', placeholder: 'Motivo',}, {columna: 'estado', placeholder: 'Estado',}])
        )
        .addComponente('Calendario', builderCalendario
            .setCitas(citas)
        )
    } else if(showEnFila.value){
        pagina
        .setHeaderPage({
            titulo: 'Calendario de Citas', 
            descripcion: 'Visualiza y administra la agenda de citas.',
            button: [
                {text: 'En Lista', icon: 'fa-solid fa-table', color: 'bg-blue-700', action: showFila},
                {text: 'Agregar Cita', icon: 'fa-solid fa-plus', color: 'bg-blue-500', action: agregarCita},
            ]
        })
        .setContenedor('grid grid-cols-1 gap-3')
        .addComponente('Citas', builderCitas
            .setCitas(citas)
            .setShowTodas(true)
            .setFiltros([{columna: 'motivo', placeholder: 'Motivo',}, {columna: 'estado', placeholder: 'Estado',}])
        )
    }

    return pagina.build()
})
    // console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh"/>
</template>