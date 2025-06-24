

<template>
    <div class="py-5 mx-8 flex flex-col gap-1 border border-gray-300 rounded-2xl h-fit bg-white">
        <h2 class="text-xl font-semibold my-2 px-10">Martes 24, Junio</h2>
        <div class="py-4 px-10 flex justify-between items-center pb-2 rounded-2xl border border-gray-200 hover:bg-white" v-for="item in 5">
            <div class="flex flex-col items-center">
                <h2 class="text-blue-500">6:00 AM</h2>
                <p class="text-xs text-gray-500">Hoy</p>
            </div>
            <div>
                <p class="font-semibold">Juan Perez Perez</p>
                <p class="text-sm text-gray-700">Medicina general</p>
            </div>
            <div class="flex flex-col gap-2">
                <h3 class="text-sm flex gap-2 items-center"> <i class="fa-solid fa-user-doctor text-gray-500"></i> Victor Gonzales</h3>
                <h3 class="text-sm"><i class="fa-solid fa-stethoscope text-blue-500"></i> Control</h3>
            </div>
        </div>
    </div>
</template>