<script setup>
import ModalLG from '~/components/Modales/ModalLG.vue';
import ButtonDashboard from '~/components/Buttons/ButtonDashboard.vue';
import VerAnalisis from './VerAnalisis.vue';
import VerConsultas from './VerConsultas.vue'
import VerEvoluciones from './VerEvoluciones.vue'
import VerNotas from './VerNotas.vue'
import VerTratamientos from './VerTratamientos.vue'
import VerMedicacion from './VerMedicacion.vue'
import { useVarView } from '~/stores/varview.js';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { ref } from 'vue';

const props = defineProps({
    historia: {
        type: Object,
        default: () => ({})
    }
});

const varView = useVarView();
const pacienteStore = usePacientesStore();
const medicinas = ref([]);
const consultas = ref([]);

const cerrarModal = () => {
    varView.showVerHistoria = false;
};

const actions = [
    {
        title: 'Consultas',
        description: 'Registro de consultas',
        icon: 'fa-hospital',
        color: 'bg-[var(--color-default-200)] hover:opacity-75',
        action: () => {}
    },
    {
        title: 'Análisis',
        description: 'Análisis del paciente',
        icon: 'fa-stethoscope',
        color: "bg-[var(--color-default-300)] hover:opacity-75",
        action: () => {}
    },
    {
        title: 'Evoluciones',
        description: 'Evoluciones de Historias',
        icon: 'fa-file',
        color: 'bg-[var(--color-default-400)] hover:opacity-75',
        action: () => {}
    },
    {
        title: 'Notas',
        description: 'Registros de Notas',
        icon: 'fa-notes-medical',
        color: 'bg-[var(--color-default-500)] hover:opacity-75',
        action: () => {}
    },
    {
        title: 'Tratamientos',
        description: 'Tratamientos del paciente',
        icon: 'fa-kit-medical',
        color: 'bg-[var(--color-default-600)] hover:opacity-75',
        action: () => {}
    },
    {
        title: 'Medicacion',
        description: 'Medicacion del paciente',
        icon: 'fa-prescription-bottle-medical',
        color: 'bg-[var(--color-default-700)] hover:opacity-75',
        action: () => {}
    },
];

async function Botones (titulo) {
    varView.showMenuHistorias = !varView.showMenuHistorias;
    if(titulo === 'Consultas'){
        consultas.value = await pacienteStore.listDatos(props.historia.id, 'HistoriaClinica')
        varView.showVerConsultas = !varView.showVerConsultas
    } else if(titulo === 'Análisis'){
        varView.showVerAnalisis = !varView.showVerAnalisis
    } else if(titulo === 'Evoluciones'){
        varView.showVerEvoluciones = !varView.showVerEvoluciones
    } else if(titulo === 'Notas'){
        varView.showVerNotas = !varView.showVerNotas
    } else if(titulo === 'Tratamientos'){
        varView.showVerTratamientos = !varView.showVerTratamientos
    } else if(titulo === 'Medicacion'){
        medicinas.value = await pacienteStore.listDatos(props.historia.id, 'Plan_manejo_medicamentos')
        varView.showVerMedicacion = !varView.showVerMedicacion
    }
};

function showBotones () {
    varView.showMenuHistorias = true;
    varView.showVerConsultas = false
    varView.showVerAnalisis = false
    varView.showVerEvoluciones = false
    varView.showVerNotas = false
    varView.showVerTratamientos = false
    varView.showVerMedicacion = false
};
</script>

<template>
    <ModalLG>
        <div class="pb-5 z-1 flex flex-col items-center h-[100%] bg-gray-50 rounded-2xl">
            <!-- Header -->
            <div
                class="w-full flex md:flex-row flex-col justify-between items-start gap-2 py-4 px-8 bg-[var(--color-default)] rounded-t-lg">
                <div>
                    <h2 class="text-white font-bold text-2xl">Historias Clinicas</h2>
                    <div class="flex gap-8 text-gray-200 font-semibold">
                        <p class=""><span class="text-sm text-gray-300">Paciente:</span> {{ props.historia.paciente }}
                        </p>
                        <p class=""><span class="text-sm text-gray-300">CC:</span> {{ 111029381 }}
                        </p>
                    </div>

                </div>
                <div v-if="varView.showMenuHistorias" class="flex h-full items-center justify-center gap-5 text-xl text-gray-200">
                    <i class="fa-solid fa-print hover:text-white"></i>
                    <i class="fa-solid fa-download hover:text-white"></i>
                    <i class="fa-solid fa-close hover:text-white" @click="cerrarModal"></i>
                </div>
                <div v-if="!varView.showMenuHistorias" class="flex h-full items-center justify-center gap-5 text-xl text-gray-200">
                    <i @click="showBotones" class="fa-solid fa-rotate-left hover:text-white"></i>    
                </div>
            </div>

            <!-- Body -->
            <div class="w-full h-full flex justify-center items-center" v-if="varView.showMenuHistorias">
                <div
                    class="scrollForm w-full flex flex-col items-center py-3 gap-[15px] max-h-[90%] overflow-y-auto p-7">

                    <div class="medical-card p-6 w-full">
                        <h2 class="text-lg font-semibold text-gray-900">Registros</h2>
                        <p class="text-gray-700 mb-4">Consulta por los diferentes Registros del paciente</p>
                        <div class="space-y-3 grid grid-cols-2 w-full gap-3">
                            <ButtonDashboard v-for="action in actions" :color="action.color" :title="action.title"
                                :description="action.description" :icon="action.icon" @click="Botones(action.title)" />
                        </div>
                    </div>

                </div>
            </div>
            <div class="w-full h-full" v-if="!varView.showMenuHistorias">
                <VerConsultas v-if="varView.showVerConsultas" :consultas="consultas"/>
                <VerAnalisis v-if="varView.showVerAnalisis"/>
                <VerEvoluciones v-if="varView.showVerEvoluciones"/>
                <VerNotas v-if="varView.showVerNotas"/>
                <VerTratamientos v-if="varView.showVerTratamientos"/>
                <VerMedicacion v-if="varView.showVerMedicacion" :medicinas="medicinas" />
            </div>
        </div>
    </ModalLG>
</template>

<style scoped>
/* Scroll */

.scrollForm::-webkit-scrollbar {
    height: 7px;
    width: 7px;
}

.scrollForm::-webkit-scrollbar-track {
    border-radius: 2px;
    background-color: #DFE9EB;
}

.scrollForm::-webkit-scrollbar-track:hover {
    background-color: #B8C0C2;
}

.scrollForm::-webkit-scrollbar-track:active {
    background-color: #B8C0C2;
}

.scrollForm::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: #326872;
}

.scrollForm::-webkit-scrollbar-thumb:hover {
    background-color: #576A72;
}

.scrollForm::-webkit-scrollbar-thumb:active {
    background-color: #107072;
}
</style>