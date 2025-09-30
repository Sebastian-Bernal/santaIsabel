<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue'

import { useFormularioCitaBuilder } from '~/build/Usuarios/useCitasFormBuilder'
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario'
import { CalendarioBuilder, CitasBuilder } from '~/build/Constructores/ClassCalendario'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales';
import { ref, onMounted } from 'vue'

const citasStore = useCitasStore();
const citas = ref([]);

const pacientesStore = usePacientesStore();
const medicosStore = useMedicosStore();
const calendarioCitasStore = useCalendarioCitas();
const medicosList = ref([]);
const pacientesList = ref([]);
const show = ref(false);
const showEnFila = ref(false);
const refresh = ref(1);

async function llamadatos() {
    citas.value = await citasStore.listCitas();
}

watch(() => show.value,
    async () => {
        await llamadatos();
        refresh.value++;
    }
);

onMounted(async () => {
    medicosList.value = await medicosStore.listMedicos;
    const rol = sessionStorage.getItem('Rol')
    if(rol === 'Profesional'){
        pacientesList.value = await pacientesStore.listPacientesAtendidos(false);
    } else {
        pacientesList.value = await pacientesStore.listPacientes;
    }
    citas.value = await citasStore.listCitas();
    citasStore.Formulario.Cita.fecha = calendarioCitasStore.fecha.split('/').reverse().join('-')
});

watch(() => calendarioCitasStore.fecha, (nuevaFecha) => {
    citasStore.Formulario.Cita.fecha = nuevaFecha.split('/').reverse().join('-')
})


// Formulario
function seleccionarPaciente(paciente) {
    citasStore.Formulario.Cita.name_paciente = paciente.name
    citasStore.Formulario.Cita.id_paciente = paciente.id_paciente
}

function seleccionarMedico(medico) {
    citasStore.Formulario.Cita.name_medico = medico.name
    citasStore.Formulario.Cita.id_medico = medico.id_profesional
}

function validarFecha(event) {
    const fechaStr = event.target.value;
    const fechaCita = new Date(fechaStr);
    const hoy = new Date();
    const errorDiv = document.getElementById('error-fecha');
    // Limpiar la hora para comparar solo fechas
    hoy.setHours(0, 0, 0, 0);
    fechaCita.setHours(0, 0, 0, 0);

    if (!fechaStr) {
        alert("Por favor ingresa una fecha.");
        return;
    }

    if (fechaCita <= hoy) {
        errorDiv.innerHTML = `<p>La fecha de la cita no puede ser anterior a hoy.</p>`
        return;
    }

    errorDiv.innerHTML = ''
}

function validarHora(event) {
    const horaStr = event.target.value; // Suponiendo que viene de un input tipo "time"
    const errorDiv = document.getElementById('error-hora');

    if (!horaStr) {
        alert("Por favor ingresa una hora.");
        return false;
    }

    const [hora, minutos] = horaStr.split(":").map(Number);
    const horaIngresada = hora + minutos / 60;

    const horaMinima = 5;   // 5:00 AM
    const horaMaxima = 22;  // 10:00 PM

    if (horaIngresada < horaMinima || horaIngresada > horaMaxima) {
        errorDiv.innerHTML = `<p>La hora debe estar entre las 5:00 AM y las 10:00 PM.</p>`
        return;
    }

    errorDiv.innerHTML = ''
}


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

const propiedadesCita = useFormularioCitaBuilder({
    storeId: 'NuevaCita',
    storePinia: 'Citas',
    cerrarModal: cerrar,
    show: show,
    seleccionarPaciente,
    seleccionarMedico,
    pacientesList,
    medicosList,
    validarFecha,
    validarHora,
});

// Construccion de pagina
const builderCalendario = new CalendarioBuilder()

const propiedades = computed(() => {
    const builderCitas = new CitasBuilder()
    const pagina = new ComponenteBuilder()
    pagina
    .setFondo('FondoDefault')
    .addComponente('Form', propiedadesCita)
    if(!showEnFila.value){
        pagina
        .setHeaderPage({
            titulo: 'Calendario de Citas', 
            descripcion: 'Visualiza y administra la agenda de citas.',
            button: [
                {text: 'En Fila', icon: 'fa-solid fa-table', color: 'bg-gray-700', action: showFila},
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
                {text: 'En Fila', icon: 'fa-solid fa-table', color: 'bg-blue-700', action: showFila},
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