<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue'
import Citas from '~/components/molecules/Calendario/Citas.vue'
import Calendario from '~/components/molecules/Calendario/Calendario.vue'
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import Form from '~/components/organism/Forms/Form.vue'

import { useFormularioCitaBuilder } from '~/build/useCitasFormBuilder'
import { ComponenteBuilder } from '~/composables/Formulario/ClassFormulario'
import { CalendarioBuilder, CitasBuilder } from '~/composables/Formulario/ClassCalendario'
import { useVarView } from '~/stores/varview.js'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico';
import { ref, onMounted } from 'vue'

const citasStore = useCitasStore();
const citas = ref([]);

const varView = useVarView();
const pacientesStore = usePacientesStore();
const medicosStore = useMedicosStore();
const medicosList = ref([]);
const pacientesList = ref([]);
const show = ref(true)

// Formulario
onMounted(async () => {

    medicosList.value = await medicosStore.listMedicos;
    pacientesList.value = await pacientesStore.listPacientes;
    citas.value = await citasStore.listCitas();
});


const NuevaCitaStore = citasStore.createForm('NuevaCita');

const {
    formData,
    traerDatos,
    guardarDatos,
    limpiar,
    validarform,
    mandarFormulario
} = NuevaCitaStore;

function seleccionarPaciente(paciente) {
    formData.Cita = {
        ...formData.Cita,
        name_paciente: paciente.name,
        id_paciente: paciente.id
    };
}

function seleccionarMedico(medico) {
    formData.Cita = {
        ...formData.Cita,
        name_medico: medico.name,
        id_medico: medico.id
    };
}


const propiedadesCita = useFormularioCitaBuilder({
    validarform,
    mandarFormulario,
    traerDatos,
    guardarDatos,
    cerrarModal: () => {
        limpiar();
        varView.showNuevaCita = false;
    },
    show: show,
    seleccionarPaciente,
    seleccionarMedico,
    pacientesList,
    medicosList
});

// Funciones para manejar la visibilidad de los formularios
const agregarCita = () => {
    console.log('prueba')
    varView.showNuevaCita = true;
    show.value = true
};


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