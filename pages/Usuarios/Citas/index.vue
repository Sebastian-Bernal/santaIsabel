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

onMounted(async () => {
    medicosList.value = await medicosStore.listMedicos;
    pacientesList.value = await pacientesStore.listPacientes;
    citas.value = await citasStore.listCitas();
    citasStore.Formulario.Cita.fecha = calendarioCitasStore.fecha.split('/').reverse().join('-')
});

watch(() => calendarioCitasStore.fecha, (nuevaFecha) => {
    citasStore.Formulario.Cita.fecha = nuevaFecha.split('/').reverse().join('-')
})


// Formulario
function seleccionarPaciente(paciente) {
    citasStore.Formulario.Cita.name_paciente = paciente.name
    citasStore.Formulario.Cita.id_paciente = paciente.id
}

function seleccionarMedico(medico) {
    citasStore.Formulario.Cita.name_medico = medico.name
    citasStore.Formulario.Cita.id_medico = medico.id
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
const builderCitas = new CitasBuilder()
const pagina = new ComponenteBuilder()

const propiedades = pagina
    .setFondo('FondoDefault')
    .setHeaderPage({
        titulo: 'Calendario de Citas', 
        descripcion: 'Visualiza y administra la agenda de citas.',
        button: [{text: 'Agregar Cita', icon: 'fa-solid fa-plus', color: 'bg-blue-500', action: agregarCita}]
    })
    .setContenedor('grid lg:grid-cols-[1.5fr_1fr] md:grid-cols-[1fr_1fr] grid-cols-1 lg:gap-10 gap-3')
        .addComponente('Citas', builderCitas
            .setCitas(citas)
        )
        .addComponente('Calendario', builderCalendario
            .setCitas(citas)
        )
        .addComponente('Form', propiedadesCita)
    .build()
    // console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades"/>
</template>