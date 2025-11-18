<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue'

import { useFormularioCitaBuilder } from '~/build/Usuarios/useCitasFormBuilder'
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales';
import { ref, onMounted } from 'vue'

const citasStore = useCitasStore();
const varView = useVarView();

const pacientesStore = usePacientesStore();
const medicosStore = useMedicosStore();
const medicosList = ref([]);
const pacientesList = ref([]);

onMounted(async () => {
    medicosList.value = await medicosStore.listMedicos();
    pacientesList.value = await pacientesStore.listPacientesAtendidos(false);
    console.log(pacientesList.value)
    // Autocompletar Campos
    const profesional = JSON.parse(sessionStorage.getItem('Profesional'))
    citasStore.Formulario.Cita.id_medico = profesional.id
    citasStore.Formulario.Cita.name_medico = profesional.name
});

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

function cerrar () {
    varView.showNuevaCita = false
}

const propiedadesCita = useFormularioCitaBuilder({
    storeId: 'NuevaCita',
    storePinia: 'Citas',
    cerrarModal: cerrar,
    show: varView.showNuevaCita,
    seleccionarPaciente,
    seleccionarMedico,
    pacientesList,
    medicosList,
    validarFecha,
    validarHora,
});

// Construccion de pagina
const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()
    pagina
    .setFondo('FondoDefault')
    .addComponente('Form', propiedadesCita)
    return pagina.build()
})

</script>

<template>
    <Pagina :Propiedades="propiedades"/>
</template>