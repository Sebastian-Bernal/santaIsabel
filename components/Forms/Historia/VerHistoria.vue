<script setup>
import ModalLG from '~/components/Modales/ModalLG.vue';
import ButtonDashboard from '~/components/Buttons/ButtonDashboard.vue';
import VerAnalisis from './Analisis.vue/VerAnalisis.vue';
import VerConsultas from './Consultas/VerConsultas.vue'
import VerEvoluciones from './Evoluciones/VerEvoluciones.vue'
import VerNotas from './Notas/VerNotas.vue'
import VerTratamientos from './Tratamientos/VerTratamientos.vue'
import VerMedicacion from './Medicacion/VerMedicacion.vue'
import { useVarView } from '~/stores/varview.js';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { ref } from 'vue';

const props = defineProps({
    historia: {
        type: Object,
        default: () => ({})
    }
});

const varView = useVarView();
const pacienteStore = usePacientesStore();
const historiasStore = useHistoriasStore();
const medicinas = ref([]);
const analisis = ref([]);
const tratamientos = ref([]);
const notas = ref([]);

const cerrarModal = () => {
    varView.showVerHistoria = false;
};

const actions = ref([
    {
        title: 'Consultas y Analisis',
        description: 'Registro de consultas del paciente',
        icon: 'fa-hospital',
        color: 'bg-[var(--color-default-300)] hover:opacity-75 md:col-span-2',
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
]);

// onMounted(() => {
//     const permisosStore = JSON.parse(sessionStorage.getItem("Permisos")) || [];
//     actions.value = actions.value.filter((action) => {
//         return permisosStore.includes(action.title)
//     })
// });

async function Botones (titulo) {
    varView.showMenuHistorias = !varView.showMenuHistorias;
    if(titulo === 'Consultas y Analisis'){
        await historias()
        varView.showVerAnalisis = !varView.showVerAnalisis
    } else if(titulo === 'Evoluciones'){
        varView.showVerEvoluciones = !varView.showVerEvoluciones
    } else if(titulo === 'Notas'){
        notas.value = await pacienteStore.listDatos(props.historia.id, 'Nota')
        varView.showVerNotas = !varView.showVerNotas
    } else if(titulo === 'Tratamientos'){
        tratamientos.value = await pacienteStore.listDatos(props.historia.id, 'Plan_manejo_procedimientos')
        varView.showVerTratamientos = !varView.showVerTratamientos
    } else if(titulo === 'Medicacion'){
        medicinas.value = await pacienteStore.listDatos(props.historia.id, 'Plan_manejo_medicamentos')
        varView.showVerMedicacion = !varView.showVerMedicacion
    }
};

async function historias () {
    analisis.value = []
    const historia = await pacienteStore.listDatos(props.historia.id, 'HistoriaClinica')

    analisis.value = await historiasStore.listDatos(historia[0].id_temporal, 'Analisis')
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
                class="w-full flex md:flex-row flex-col justify-between items-start gap-2 py-4 md:px-8 px-2 bg-[var(--color-default)] rounded-t-lg">
                <div>
                    <h2 class="text-white font-bold text-2xl">Historias Clinicas</h2>
                    <div class="flex gap-8 text-gray-200 font-semibold">
                        <p class=""><span class="text-sm text-gray-300">Paciente:</span> {{ props.historia.paciente }}
                        </p>
                        <p class=""><span class="text-sm text-gray-300">CC:</span> {{ props.historia.cedula }}
                        </p>
                    </div>

                </div>
                <div v-if="varView.showMenuHistorias" class="flex h-full items-center justify-center gap-5 text-xl text-gray-200">
                    <i class="fa-solid fa-print hover:text-white cursor-pointer"></i>
                    <i class="fa-solid fa-download hover:text-white cursor-pointer"></i>
                    <i class="fa-solid fa-close hover:text-white cursor-pointer" @click="cerrarModal"></i>
                </div>
                <div v-if="!varView.showMenuHistorias" class="flex h-full items-center justify-center gap-5 text-xl text-gray-200">
                    <i @click="showBotones" class="fa-solid fa-rotate-left hover:text-white"></i>    
                </div>
            </div>

            <!-- Body -->
            <div class="w-full h-full flex justify-center items-center" v-if="varView.showMenuHistorias">
                <div
                    class="scrollForm w-full flex flex-col items-center gap-[15px] max-h-[90%] overflow-y-auto md:p-7 p-3">

                    <div class="medical-card md:px-6 px-2 w-full">
                        <h2 class="text-lg font-semibold text-gray-900">Registros</h2>
                        <p class="text-gray-700 mb-4">Consulta por los diferentes Registros del paciente</p>
                        <div class="space-y-3 grid md:grid-cols-2 grid-cols-1 w-full md:gap-3">
                            <ButtonDashboard v-for="action in actions" :color="action.color" :title="action.title"
                                :description="action.description" :icon="action.icon" @click="Botones(action.title)" />
                        </div>
                    </div>

                </div>
            </div>
            <div class="w-full h-full" v-if="!varView.showMenuHistorias">
                <VerAnalisis v-if="varView.showVerAnalisis" :analisis="analisis"/>
                <VerEvoluciones v-if="varView.showVerEvoluciones"/>
                <VerNotas v-if="varView.showVerNotas" :notas="notas"/>
                <VerTratamientos v-if="varView.showVerTratamientos" :tratamientos="tratamientos"/>
                <VerMedicacion v-if="varView.showVerMedicacion" :medicinas="medicinas" />
            </div>
        </div>
    </ModalLG>
</template>