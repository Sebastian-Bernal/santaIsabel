<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue'
import PDFEvolucion from '~/components/paginas/PDFEvolucion.vue'
import PDFNota from '~/components/paginas/PDFNota.vue'
import PDFTerapia from '~/components/paginas/PDFTerapia.vue'
import PDFMedicina from '~/components/paginas/PDFMedicina.vue'
import PDFTrabajoSocial from '~/components/paginas/PDFTrabajoSocial.vue'

import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder'
import { CalendarioBuilder, CitasBuilder } from '~/build/Constructores/CalendarioBuilder'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { ref, onMounted } from 'vue'
import { CardBuilder } from '~/build/Constructores/CardBuilder'

const varView = useVarView()
const citasStore = useCitasStore();
const citas = ref([]);

const calendarioCitasStore = useCalendarioCitas();
const show = ref(false);
const showEnFila = ref(false);
const refresh = ref(1);

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
    showEnFila.value = !showEnFila.value
};

// Construccion de pagina
const builderCalendario = new CalendarioBuilder()

const propiedades = computed(() => {

    const builderCitas = new CitasBuilder()
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
    if (!showEnFila.value) {
        pagina
            .setHeaderPage({
                titulo: 'Calendario de tu Agenda',
                descripcion: 'Visualiza y administra la agenda de citas.',
                button: [
                    { text: 'En Lista', icon: 'fa-solid fa-table', color: 'bg-gray-700', action: showFila },
                    puedePost ? { text: 'Agendar', icon: 'fa-solid fa-plus', color: 'bg-blue-500', action: agregarCita } : '',
                ]
            })
            .setContenedor('grid lg:grid-cols-[1.5fr_1fr] md:grid-cols-[1fr_1fr] grid-cols-1 lg:gap-10 gap-3')
            .addComponente('Citas', builderCitas
                .setCitas(citas)
                .setShowTodas(false)
                .setFiltros([{ columna: 'servicio', placeholder: 'Servicio', }, { columna: 'estado', placeholder: 'Estado', }])
            )
            .addComponente('Calendario', builderCalendario
                .setCitas(citas)
            )
    } else if (showEnFila.value) {
        pagina
            .setHeaderPage({
                titulo: 'Calendario de tu Agenda',
                descripcion: 'Visualiza y administra la agenda de citas.',
                button: [
                    { text: 'En Lista', icon: 'fa-solid fa-table', color: 'bg-blue-700', action: showFila },
                    puedePost ? { text: 'Agendar', icon: 'fa-solid fa-plus', color: 'bg-blue-500', action: agregarCita } : '',
                ]
            })
            .setContenedor('grid grid-cols-1 gap-3')
            .addComponente('Citas', builderCitas
                .setCitas(citas)
                .setShowTodas(true)
                .setFiltros([{ columna: 'motivo', placeholder: 'Motivo', }, { columna: 'estado', placeholder: 'Estado', }])
            )
    }

    return pagina.build()
})
// console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
    <Cita v-if="varView.showNuevaCita"></Cita>
    <PDFEvolucion v-if="varView.showPDFEvolucion"/>
    <PDFNota v-if="varView.showPDFNota"></PDFNota>
    <PDFTerapia v-if="varView.showPDFTerapia"></PDFTerapia>
    <PDFMedicina v-if="varView.showPDFMedicina"/>
    <PDFTrabajoSocial v-if="varView.showPDFTrabajoSocial"/>
</template>