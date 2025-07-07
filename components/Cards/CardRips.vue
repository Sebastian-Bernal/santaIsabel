<template>
    <div class="bg-white p-5 py-7 flex flex-col gap-4 shadow-lg rounded-lg relative">
        <div class="flex items-center gap-4">
            <i class="fa-solid fa-user text-blue-500 text-2xl"></i>
            <div>
                <h2 class="text-lg">Ana Sofia Perez</h2>
                <p class="text-sm">CC 101292019</p>
            </div>
        </div>

        <div class="flex justify-between items-center md:w-1/2">
            <div class="flex items-center gap-3">
                <i class="fa-solid fa-calendar text-blue-500 text-sm"></i>
                <h3>06/07/2025</h3>
            </div>
            <div class="flex items-center gap-3">
                <i class="fa-solid fa-user-doctor text-blue-500 text-sm"></i>
                <h3>Javier Perez</h3>
            </div>
            <div class="flex items-center gap-3">
                <h3>Medicina General</h3>
            </div>
        </div>

        <div>
            <h3 class="font-semibold">Diagnosticos</h3>
            <p>Enfermedad de la piel <span class="text-sm text-gray-500">f-018</span></p>
        </div>
        <div>
            <p>Codigo <span class="text-sm text-gray-500">00827</span></p>
        </div>
        <div class="absolute right-5 flex flex-col gap-2">
            <button class="flex items-center gap-2 text-blue-500 p-2 hover:text-blue-700">
                <span class="text-sm">Ver Consulta</span>
            </button>
            <button class="flex items-center gap-2 bg-gray-200 p-2 rounded-lg hover:text-blue-700">
                <i class="fa-solid fa-file-lines text-blue-500"></i>
                <span class="text-sm">Generar</span>
            </button>
        </div>
    </div>
</template>