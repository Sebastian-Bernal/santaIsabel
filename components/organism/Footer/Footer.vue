<script setup>
import NavigationFooter from './NavigationFooter.vue';
</script>

<template>
    <footer class="section-footer h-[40px] md:px-[20px] px-[10px]">
        <div class="flex ml-0 items-center md:ml-[60px]">
            <NavigationFooter />
        </div>
    </footer>
</template>

<style scoped>
.section-footer {
    grid-area: footer;
}
</style>