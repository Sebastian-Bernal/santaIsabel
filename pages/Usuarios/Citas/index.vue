<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue'

import { useFormularioCitaBuilder } from '~/build/Usuarios/useCitasFormBuilder'
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder'
import { CalendarioBuilder, CitasBuilder } from '~/build/Constructores/CalendarioBuilder'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente'
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales'
import { decryptData } from '~/composables/Formulario/crypto';
import { ref, onMounted } from 'vue'

const varView = useVarView()
const citasStore = useCitasStore();
const citas = ref([]);

const calendarioCitasStore = useCalendarioCitas();
const show = ref(false);
const showEnFila = ref(false);
const refresh = ref(1);

const pacientesStore = usePacientesStore()
const medicosStore = useMedicosStore()
const pacientesList = ref([])
const medicosList = ref([])
const optionsTratamientos = ref(null)
const showTratamientos = ref(false)

async function llamadatos() {
    citas.value = await citasStore.listCitas();
}
// Watch para actualizar citas al agregar nueva
watch(() => show.value,
    async () => {
        await llamadatos();
        refresh.value++;
    }
);

watch(() => varView.showNuevaHistoria,
    async () => {
        await llamadatos();
        refresh.value++;
    }
);

watch(() => citasStore.Formulario.Cita.servicio,
    async () => {
        if (citasStore.Formulario.Cita.servicio === 'Terapia') {
            varView.cargando = true

            const api = useApiRest()
            const config = useRuntimeConfig()
            const token = decryptData(sessionStorage.getItem('token'))

            let options = {
                metodo: 'POST',
                url: config.public.diasAsignadosRestantes,
                token: token,
                body: {
                    id_paciente: citasStore.Formulario.Cita.id_paciente
                }
            }
            const respuesta = await api.functionCall(options)
            let respuestaData = ''
            if (respuesta.success) {
                varView.tipoConsulta = 'Terapia'
                showTratamientos.value = true
                respuestaData = respuesta.data
                optionsTratamientos.value = respuesta.data.map(data => {
                    return {text: data.tratamiento, value: data.id}
                })
            }
            const tratamientodiv = document.getElementById('tratamientos');
            if (tratamientodiv) {
                console.log('respuesta', respuesta.message)
                tratamientodiv.innerHTML = `<p>${respuesta.message} ${respuestaData[0]?.dias_restantes}</p>`;
            } else {
                tratamientodiv.innerHTML = ``;
            }
            varView.cargando = false
        } else {
            showTratamientos.value = false
        }
    }
);

onMounted(async () => {
    await llamadatos()
    // Rellenar fecha del formulario
    citasStore.Formulario.Cita.fecha = calendarioCitasStore.fecha.split('/').reverse().join('-')

    medicosList.value = await medicosStore.listMedicos();
    const rol = sessionStorage.getItem('Rol')
    if (rol === 'Profesional') {
        pacientesList.value = await pacientesStore.listPacientesAtendidos(false);
    } else {
        pacientesList.value = await pacientesStore.listPacientes();
    }
});

// watch(() => calendarioCitasStore.fecha, (nuevaFecha) => {
//     console.log(calendarioCitasStore.fecha)
//     citasStore.Formulario.Cita.fecha = calendarioCitasStore.fecha.split('/').reverse().join('-')
// })

// Funciones para manejar la visibilidad de los formularios
const agregarCita = () => {
    show.value = true
};

function cerrar() {
    show.value = false
}

// Funciones para manejar visibilidad de Pagina
const showFila = () => {
    showEnFila.value = !showEnFila.value
};


// Construccion de pagina
const builderCalendario = new CalendarioBuilder()

const propiedades = computed(() => {

    const builder = useFormularioCitaBuilder({
        storeId: 'NuevaCita',
        storePinia: 'Citas',
        cerrarModal: cerrar,
        show: show,
        pacientesList,
        medicosList,
        optionsTratamientos: optionsTratamientos,
        showTratamientos: showTratamientos
    });

    const builderCitas = new CitasBuilder()
    const pagina = new ComponenteBuilder()

    const puedeVer = varView.getPermisos.includes('Citas_view');
    if (!puedeVer) return
    const puedePost = varView.getPermisos.includes('Citas_post')

    pagina
        .setFondo('FondoDefault')
        .addComponente('Form', builder)
    if (!showEnFila.value) {
        pagina
            .setHeaderPage({
                titulo: 'Calendario de Citas',
                descripcion: 'Visualiza y administra la agenda de citas.',
                button: [
                    { text: 'En Lista', icon: 'fa-solid fa-table', color: 'bg-gray-700', action: showFila },
                    puedePost ? { text: 'Agregar Cita', icon: 'fa-solid fa-plus', color: 'bg-blue-500', action: agregarCita } : '',
                ]
            })
            .setContenedor('grid lg:grid-cols-[1.5fr_1fr] md:grid-cols-[1fr_1fr] grid-cols-1 lg:gap-10 gap-3')
            .addComponente('Citas', builderCitas
                .setCitas(citas)
                .setShowTodas(false)
                .setFiltros([{ columna: 'motivo', placeholder: 'Motivo', }, { columna: 'estado', placeholder: 'Estado', }])
            )
            .addComponente('Calendario', builderCalendario
                .setCitas(citas)
            )
    } else if (showEnFila.value) {
        pagina
            .setHeaderPage({
                titulo: 'Calendario de Citas',
                descripcion: 'Visualiza y administra la agenda de citas.',
                button: [
                    { text: 'En Lista', icon: 'fa-solid fa-table', color: 'bg-blue-700', action: showFila },
                    puedePost ? { text: 'Agregar Cita', icon: 'fa-solid fa-plus', color: 'bg-blue-500', action: agregarCita } : '',
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
</template>