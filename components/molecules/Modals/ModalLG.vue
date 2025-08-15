<script setup>
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';

</script>
<template>
    <FondoBlur>
        <div class="lg:w-[70%] md:w-[85%] md:h-[85%] w-[90%] h-[90%] bg-gray-50 dark:bg-gray-900 dark:text-white rounded-2xl shadow-lg pb-7">
            <slot></slot>
        </div>
    </FondoBlur>
</template>