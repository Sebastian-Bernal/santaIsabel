<script setup>
import { ref } from 'vue';
import ModalXS from '~/components/Modales/ModalXS.vue';

definePageMeta({
    layout: 'authentication'
});

const contraseña = ref('');
const correo = ref('');
const mostrarContraseña = ref(false);

const cambiarMostrarContraseña = () => {
    mostrarContraseña.value = !mostrarContraseña.value;
    const passwordInput = document.getElementById('password');
    if (mostrarContraseña.value) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
};

function ingresar() {
    window.location.href = '/'
}
</script>

<template>

    <ModalXS color="bg-inherit">
        <div class="flex flex-col w-full h-full justify-center items-center">
            <div class="flex flex-col justify-center items-center gap-1 pb-10">
                <img src="assets/img/cross.png" alt="" class="w-3/4 logo mb-5 select-none">
                <h3 class="text-white text-3xl font-bold">Thesalus</h3>
            </div>
            <div class="mb-5 md:w-1/3 w-full">
                <div class="relative">
                    <input v-model="correo" type="email" id="text" name="email" required
                        placeholder="Correo Electronico"
                        class="bg-inherit text-white mt-1 pr-8 block w-full px-3 py-3 border border-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <i class="fa-solid fa-user absolute text-white right-[3%] top-[27%] text-lg"></i>
                </div>
            </div>
            <div class="mb-5 md:w-1/3 w-full">
                <div class="relative">
                    <input v-model="contraseña" type="password" id="password" name="password" required
                        placeholder="Contraseña" autocomplete="false"
                        class="text-white bg-inherit mt-1 pr-8 block w-full px-3 py-3 border border-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <i v-if="!mostrarContraseña"
                        class="fa-solid fa-eye-slash text-gray-50 absolute right-[2%] top-[27%] text-lg"
                        @click="cambiarMostrarContraseña()"></i>
                    <i v-if="mostrarContraseña" class="fa-solid fa-eye absolute text-white right-[2%] top-[27%] text-lg"
                        @click="cambiarMostrarContraseña()"></i>
                </div>

            </div>

            <div class="mt-5 md:w-1/3 w-full">
                <button @click="ingresar" class="w-full h-[40px] bg-gray-100 text-[var(--color-default)] font-bold">
                    Ingresar
                </button>
            </div>

            <p class="text-sm my-3 text-gray-100">
                Olvidaste tu contraseña?
                <nuxtLink to="/" class="underline font-semibold cursor-pointer">Recuperar</nuxtLink>
            </p>
        </div>
    </ModalXS>
</template>

<style scoped>
.logo {
    transition: all 0.3s ease-in-out;
    animation: logo 2s;
}

@keyframes logo {
    0% {
        transform: translate(0, -20%);
        opacity: 0;
    }

    100% {
        transform: translate(0%, 0%);
        opacity: 1;
    }
}
</style>