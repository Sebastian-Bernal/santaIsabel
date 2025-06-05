<template>
    <div class="flex w-[100%] justify-between items-cent px-10 mt-5 md:flex-row flex-col gap-3">

        <h1 class="font-bold text-2xl tituloTabla text-gray-800">
            {{ titulo }}
        </h1>
        <div class="flex gap-3 w-[50%] justify-end">
            <InputBgGray placeholder="Buscar por datos..." icon="fa-search"/>
            <div class="flex gap-1 items-center">
                <button class="text-white w-[30px] h-[30px] rounded-full bg-[var(--color-primary)] hover:opacity-75">
                    <i class="fa-solid fa-plus"></i>
                </button>
                <h4>Agregar</h4>
            </div>
        </div>

    </div>
</template>

<script setup>
import InputBgGray from '~/components/Inputs/InputBgGray.vue';
import { defineProps } from 'vue';

const props = defineProps(['titulo']);
</script>