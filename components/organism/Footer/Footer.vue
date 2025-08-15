<script setup>
import NavigationFooter from './NavigationFooter.vue';
</script>

<template>
    <footer class="section-footer fixed bottom-0 left-0 right-0 h-[40px] md:px-[20px] px-[10px]">
        <div class="flex w-[100%] ml-0 items-center md:ml-[70px] ">
            <NavigationFooter />
        </div>
    </footer>
</template>

<style scoped>
.section-footer {
    grid-area: footer;
}
</style>