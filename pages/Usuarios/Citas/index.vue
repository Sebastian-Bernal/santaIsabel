<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue'

import { useFormularioCitaBuilder } from '~/build/Usuarios/useCitasFormBuilder'
import { ComponenteBuilder } from '~/composables/Formulario/ClassFormulario'
import { CalendarioBuilder, CitasBuilder } from '~/composables/Formulario/ClassCalendario'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales';
import { ref, onMounted } from 'vue'

const citasStore = useCitasStore();
const citas = ref([]);

const pacientesStore = usePacientesStore();
const medicosStore = useMedicosStore();
const medicosList = ref([]);
const pacientesList = ref([]);
const show = ref(false)

onMounted(async () => {
    medicosList.value = await medicosStore.listMedicos;
    pacientesList.value = await pacientesStore.listPacientes;
    citas.value = await citasStore.listCitas();
});


// Formulario
function seleccionarPaciente(paciente) {
    // formData.Cita = {
    //     ...formData.Cita,
    //     name_paciente: paciente.name,
    //     id_paciente: paciente.id
    // };
    console.log('prueba')
}

function seleccionarMedico(medico) {
    // formData.Cita = {
    //     ...formData.Cita,
    //     name_medico: medico.name,
    //     id_medico: medico.id
    // };
    console.log('prueba')
}

// Funciones para manejar la visibilidad de los formularios
const agregarCita = () => {
    show.value = true
};

function cerrar () {
    console.log('prueba')
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
    medicosList
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
    console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades"/>
</template>