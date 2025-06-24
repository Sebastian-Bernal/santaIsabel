<template>
    <div>
        <div>Hora de la cita</div>
        <div class="flex items-center justify-center py-5 gap-3 w-50 h-50 border border-gray-400 rounded-full">
            <h2 class="text-2xl flex items-center gap-1 relative">
                00
                <i class="fa-solid fa-angle-down text-xs text-gray-400"></i>
                <div class="absolute right-0 justify-end rounded-full opacity-1">
                    <p v-for="num in 6">{{ num }}</p>
                </div>
            </h2>
            :
            <h2 class="text-2xl flex items-center gap-1">
                00
                <i class="fa-solid fa-angle-down text-xs text-gray-400"></i>
            </h2>
        </div>
    </div>
</template>