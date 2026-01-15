<script>
const props = defineProps({
    Propiedades: {
        type: Object,
        required: true
    }
});
</script>
<template>
    <div class="mx-3 mb-3 py-4 flex flex-col  justify-between items-start rounded-xl border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-gray-900 transition hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        v-for="cita in props.Propiedades.showTodas ? datosPaginados : citasFiltradas"
        :class="[{ 'bg-red-50 dark:bg-gray-900': cita.estado === 'cancelada' }, props.Propiedades.tamaño]">
        <!-- Información principal -->
        <div class="flex gap-3 items-center justify-center w-full">
            <!-- Hora / Fecha -->
            <div class="flex flex-col items-center text-center w-2/4">
                <div v-if="cita.updated_at !== cita.created_at && cita.estado === 'Inactiva'"
                    class="w-2 h-2 bg-orange-400 rounded-full"></div>
                <h2 class="text-blue-600 text-lg font-extrabold">
                    {{ cita.hora === '00:00:00' ? cita.fechaHasta.substring(5, 11) : cita.hora ?
                        cita.hora.substring(0, 5) : '' }}
                </h2>
                <p class="text-xs text-gray-500 dark:text-gray-300">
                    {{ props.Propiedades.showTodas ? cita.fecha : fechaCita }}
                </p>
            </div>
            <!-- Paciente -->
            <div class="flex flex-col">
                <p class="text-base font-semibold text-gray-800 dark:text-gray-100 text-pretty">{{
                    cita.name_paciente }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ cita.servicio }}</p>
            </div>
        </div>

        <!-- Información secundaria -->
        <div class="flex items-center justify-center gap-4 w-full mt-5">
            <div class="flex flex-col gap-2 w-2/4">
                <h3 class="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <i class="fa-solid fa-user-doctor text-gray-500"></i> {{ cita.name_medico }}
                </h3>
                <h3 class="text-xs flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <i class="fa-solid fa-stethoscope text-blue-500"></i> {{ cita.motivo }}
                </h3>
            </div>

            <!-- Acciones -->
            <div class="flex flex-col gap-2 items-center">
                <!-- Estado Inactiva -->
                <template v-if="cita.estado === 'Inactiva'">
                    <ButtonRounded
                        color="bg-green-500 hover:bg-green-500 text-white w-[70px]! h-[28px]! font-bold text-xs gap-1 shadow-sm"
                        tooltip="Completar Cita" tooltipPosition="left" @click="activarCita(cita)">
                        <i class="fa-solid fa-check"></i> Asistir
                    </ButtonRounded>
                    <div class="flex">
                        <ButtonRounded
                            color="bg-danger hover:bg-red-600 text-white w-[35px]! h-[25px]! !rounded-l-full !rounded-r-[0px] shadow-sm"
                            tooltip="Cancelar" tooltipPosition="top"
                            @click="puedeDelete ? cancelarCita(cita) : () => { }">
                            <i class="fa-solid fa-xmark"></i>
                        </ButtonRounded>
                        <ButtonRounded
                            color="bg-amber-500 hover:bg-amber-600 text-white w-[35px]! h-[25px]! !rounded-r-full !rounded-l-[0px] shadow-sm"
                            tooltip="Editar" tooltipPosition="top" @click="puedePut ? actualizarCita(cita) : () => { }">
                            <i class="fa-solid fa-pencil"></i>
                        </ButtonRounded>
                    </div>
                </template>

                <!-- Estado Cancelada -->
                <template v-if="cita.estado === 'cancelada'">
                    <ButtonRounded color="bg-gray-500 hover:bg-gray-600 text-white w-[30px]! h-[30px]! shadow-sm"
                        tooltip="Información" tooltipPosition="top" @click="showMotivo(cita)">
                        <i class="fa-solid fa-info"></i>
                    </ButtonRounded>
                </template>

                <!-- Estado Realizada -->
                <template v-if="cita.estado === 'Realizada'">
                    <ButtonRounded color="bg-blue-600 hover:bg-blue-700 text-white w-[30px]! h-[30px]! shadow-sm"
                        tooltip="Observación" tooltipPosition="top" @click="showObservacion(cita)">
                        <i class="fa-solid fa-info"></i>
                    </ButtonRounded>
                </template>
            </div>
        </div>
    </div>
</template>