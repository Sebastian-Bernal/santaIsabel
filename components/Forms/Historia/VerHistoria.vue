<script setup>
import ModalLG from '~/components/Modales/ModalLG.vue';
import { useVarView } from '~/stores/varview.js';

const props = defineProps({
    historia: {
        type: Object,
        default: () => ({})
    }
});

const varView = useVarView();

const cerrarModal = () => {
    varView.showVerHistoria = false;
};

const actions = [
    {
        title: 'Consultas',
        description: 'Registrar un nuevo paciente',
        icon: 'fa-plus',
        color: 'bg-blue-500 hover:bg-blue-600',
        // action: () => varView.showNuevoPaciente = true,
    },
    {
        title: 'Analisis',
        description: 'Buscar historia clínica',
        icon: 'fa-search',
        color: 'bg-[#4aa759] hover:bg-green-600',
        url: '/Historial/Historias',
        // action: () => console.log('Buscar historia')
    },
    {
        title: 'Evoluciones',
        description: 'Crear historia clínica',
        icon: 'fa-file',
        color: 'bg-[#a74a98] hover:bg-purple-600',
        // action: () => varView.showNuevaHistoria = true
    },
    {
        title: 'Notas',
        description: 'Generar reporte RIPS',
        icon: 'fa-download',
        color: 'bg-[#a7594a] hover:opacity-75',
        url: '/Facturacion/rips',
        // action: () => console.log('Exportar RIPS')
    },
    {
        title: 'Tratamientos',
        description: 'Crear historia clínica',
        icon: 'fa-file',
        color: 'bg-[#a74a98] hover:bg-purple-600',
        // action: () => varView.showNuevaHistoria = true
    },,
    {
        title: 'Medicacion',
        description: 'Crear historia clínica',
        icon: 'fa-file',
        color: 'bg-[#a74a98] hover:bg-purple-600',
        // action: () => varView.showNuevaHistoria = true
    },
];
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
                        <p class=""><span class="text-sm text-gray-300">Ultima Fecha:</span> {{ props.historia.fecha }}
                        </p>
                    </div>

                </div>
                <div class="flex h-full items-center justify-center gap-5 text-xl text-gray-200">
                    <i class="fa-solid fa-print hover:text-white"></i>
                    <i class="fa-solid fa-download hover:text-white"></i>
                    <i class="fa-solid fa-close hover:text-white" @click="cerrarModal"></i>
                </div>
            </div>

            <!-- Body -->
            <div class="w-full h-full flex justify-center">
                <div
                    class="scrollForm w-full flex flex-col items-center py-3 gap-[15px] max-h-[90%] overflow-y-auto p-7">

        <div class="medical-card p-6 w-full">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Paciente</h2>
            <div class="space-y-3 grid grid-cols-2 w-full gap-3">


                <button v-for="action in actions"
                    class="w-full p-4 rounded-lg text-white transition-colors duration-200" :class="action.color">
                    <a :href="action.url">
                        <div class="flex items-center space-x-3">
                            <i class="fa-solid" :class="action.icon"></i>
                            <div class="text-left">
                                <div class="font-medium">{{ action.title }}</div>
                                <div class="text-sm opacity-90">{{ action.description }}</div>
                            </div>
                        </div>
                    </a>
                </button>

            </div>
        </div>
                    <!-- <div class="w-full flex justify-center items-center gap-3">
                        <div class="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full">
                            <i class="fa-solid fa-angle-left "></i>
                        </div>
                        <span class="text-[var(--color-default)] font-bold text-lg">Historia Clinica</span>
                        <div class="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full">
                            <i class="fa-solid fa-angle-right "></i>
                        </div>
                    </div>

                    <div class="w-full flex gap-3">
                        <div class="w-full flex flex-col gap-1">
                            <h3 class="text-[var(--color-default)] font-bold text-lg">Motivo de la Consulta</h3>
                            <p class="text-gray-600 p-5 border border-gray-200 rounded-lg bg-white">Descripción de la
                                consulta y
                                otros detalles relevantes.</p>
                        </div>
                        <div class="w-full flex flex-col gap-1">
                            <h3 class="text-[var(--color-default)] font-bold text-lg">Profesional</h3>
                            <p class="text-gray-600 p-5 border border-gray-200 rounded-lg bg-white">Juan Perez Perez</p>
                        </div>
                    </div>
                    <div class="w-full flex flex-col gap-3">
                        <h3 class="text-[var(--color-default)] font-bold text-lg">Diagnóstico</h3>
                        <p class="text-gray-600 p-5 border border-gray-200 rounded-lg bg-white">
                            Descripción del diagnóstico realizado.
                        </p>
                    </div>

                    <div class="grid grid-cols-2 gap-3 w-full">
                        <div class="w-full flex flex-col gap-3">
                            <h3 class="text-[var(--color-default)] font-bold text-lg">Signos vitales</h3>
                            <div class="text-gray-600 p-5 border border-gray-200 rounded-lg bg-white">
                                <p>Presión arterial: 120/80 mmHg</p>
                                <p>Frecuencia cardíaca: 72 lpm</p>
                                <p>Frecuencia respiratoria: 16 rpm</p>
                                <p>Temperatura: 36.5 °C</p>
                                <p> Saturación de oxígeno: 98%</p>
                            </div>
                        </div>

                        <div class="w-full flex flex-col gap-3">
                            <h3 class="text-[var(--color-default)] font-bold text-lg">Medidas Antropometricas</h3>
                            <div class="text-gray-600 p-5 border border-gray-200 rounded-lg bg-white">
                                <p>Peso: 76K</p>
                                <p>Estatura: 178 CM</p>
                                <p>Otros: </p>
                            </div>
                        </div>
                    </div>

                    <div class="w-full flex flex-col gap-3">
                        <h3 class="text-[var(--color-default)] font-bold text-lg">Diagnóstico</h3>
                        <p class="text-gray-600 p-5 border border-gray-200 rounded-lg">Descripción del diagnóstico
                            realizado.</p>
                    </div>

                    <div class="w-full flex flex-col gap-3">
                        <h3 class="text-[var(--color-default)] font-bold text-lg">Tratamiento</h3>
                        <p class="text-gray-600 p-5 border border-gray-200 rounded-lg bg-white">Descripción del
                            tratamiento
                            recomendado.</p>
                    </div>

                    <div class="grid grid-cols-2 gap-3 w-full">
                        <div class="w-full flex flex-col gap-3">
                            <h3 class="text-[var(--color-default)] font-bold text-lg">Medicina</h3>
                            <div class="text-gray-600 p-5 border border-gray-200 rounded-lg bg-white">
                                <div>
                                    <p class="mb-2">Acetaminofen - 20grm</p>
                                </div>
                            </div>
                        </div>
                        <div class="w-full flex flex-col gap-3">
                            <h3 class="text-[var(--color-default)] font-bold text-lg">Servicios</h3>
                            <div class="text-gray-600 p-5 border border-gray-200 rounded-lg bg-white">
                                <div>
                                    <p class="mb-2">Terapia</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 w-full">
                        <div class="w-full flex flex-col gap-3">
                            <h3 class="text-[var(--color-default)] font-bold text-lg">Inventario</h3>
                            <div class="text-gray-600 p-5 border border-gray-200 rounded-lg bg-white">
                                <div>
                                    <p class="mb-2">inventario</p>
                                </div>
                            </div>
                        </div>
                        <div class="w-full flex flex-col gap-3">
                            <h3 class="text-[var(--color-default)] font-bold text-lg">Equipos</h3>
                            <div class="text-gray-600 p-5 border border-gray-200 rounded-lg bg-white">
                                <div>
                                    <p class="mb-2">equipo</p>
                                </div>
                            </div>
                        </div>
                    </div> -->

                </div>
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