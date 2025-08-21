<script setup>
import Citas from '~/components/molecules/Calendario/Citas.vue'
import Calendario from '~/components/molecules/Calendario/Calendario.vue'
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import Form from '~/components/organism/Forms/Form.vue'

import { useFormularioCitaBuilder } from '~/build/useCitasFormBuilder'
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

// Formulario
onMounted(async () => {

    // medicosList.value = medicosStore.listMedicos;
    // pacientesList.value = pacientesStore.listPacientes;

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
    seleccionarPaciente,
    seleccionarMedico,
    pacientesList,
    medicosList
});

// Funciones para manejar la visibilidad de los formularios
const agregarCita = () => {
    varView.showNuevaCita = true;
};
</script>

<template>
    <FondoDefault>
        <div>
            <div class="md:pb-8 pb-4 flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-semibold">Calendario de citas</h2>
                    <p class="text-gray-600 dark:text-gray-200 mt-1">Visualiza y administra la agenda de citas.</p>
                </div>

                <div class="flex gap-3 items-center cursor-pointer" @click="agregarCita">

                    <div class="flex gap-2 items-center bg-blue-500 p-3 rounded-2xl text-white font-semibold">
                        <i class="fa-solid fa-plus"></i>
                        <p class="md:flex hidden">Agregar Cita</p>
                    </div>

                </div>

            </div>

            <div
                class="grid lg:grid-cols-[1fr_0.6fr] md:grid-cols-[1fr_1fr] grid-cols-1 lg:gap-10 gap-3 justify-between">
                <Citas v-if="citas.length" :citas="citas" />
                <Calendario v-if="citas.length" :citas="citas" />
            </div>


        </div>
    </FondoDefault>
    <Form :Propiedades="propiedadesCita" v-if="varView.showNuevaCita" />

    <!-- <IngresarNuevaCita  /> -->

</template>