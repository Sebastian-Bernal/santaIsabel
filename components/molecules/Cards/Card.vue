<script setup>
const props = defineProps({
    Contenido: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <div class="space-y-4">
        <div class="w-full max-w-md p-4 rounded-2xl shadow-md bg-white dark:bg-gray-800 flex flex-col gap-4">
            <!-- HEADER -->
            <div class="flex items-center gap-3" v-if="Contenido.header">
                <!-- Icono -->
                <div v-if="Contenido.header.icon" class="w-10 h-10 flex items-center justify-center rounded-full"
                    :class="Contenido.header.iconBg || 'bg-blue-100 dark:bg-blue-900'">
                    <i :class="Contenido.header.icon" class="text-xl"></i>
                </div>

                <!-- Imagen -->
                <img v-if="Contenido.header.img" :src="Contenido.header.img" alt="imagen"
                    class="w-12 h-12 rounded-full object-cover" />

                <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                        {{ Contenido.header.title }}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-300">
                        {{ Contenido.header.subtitle }}
                    </p>
                </div>
            </div>

            <!-- BODY -->
            <div v-if="Contenido.body">
                <p class="text-sm text-gray-700 dark:text-gray-200" v-if="Contenido.body.text">
                    {{ Contenido.body.text }}
                </p>

                <div v-if="Contenido.body.custom" v-html="Contenido.body.custom"></div>
            </div>

            <!-- FOOTER -->
            <div class="flex items-center justify-between border-t pt-2" v-if="Contenido.footer">
                <!-- Estado -->
                <span v-if="Contenido.footer.status" class="px-3 py-1 text-xs font-medium rounded-full"
                    :class="Contenido.footer.statusClass">
                    {{ Contenido.footer.status }}
                </span>

                <!-- Botones -->
                <div class="flex gap-2" v-if="Contenido.footer.buttons">
                    <button v-for="(btn, i) in Contenido.footer.buttons" :key="i" :class="btn.class">
                        <i v-if="btn.icon" :class="btn.icon"></i>
                        {{ btn.text }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>