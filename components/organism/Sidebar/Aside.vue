<script setup>
import ButtonAside from './ButtonAside.vue';
import { useShowNavbar } from '~/stores/navbarResponsive.js';
import { useButtonsAside } from '~/stores/ButtonActive';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';

const storeAside = useButtonsAside();
const buttons = ref([]);
const varView = useVarView()
const footer = useSeccionFooter();

onMounted(() => {
    storeAside.sessionActive();
    const permisosStore = varView.getPermisos
    if (permisosStore.length < 1) { window.location.href = '/' }
    buttons.value = storeAside.getbuttons(permisosStore);
});

// Funcion para Responsive, si aside esta activo se oculta navbar
const { showNavbarBurguer, cambiarEstado } = useShowNavbar();
const cambiarEstadoFalse = () => {
    if (showNavbarBurguer.value) {
        cambiarEstado(false);
    }
};
</script>

<template>
    <div class="section-asidebar m-[8px] flex items-center" :class="{ 'expandido': varView.expandido }">

        <div class="section-asidebar__content flex flex-col items-center rounded-xl" :class="{ 'h-full': varView.expandido, 'h-[75%]': !varView.expandido }"">

            <!-- Estado colapsado -->
            <div v-if="!varView.expandido"
                class="menu-colapsado flex md:flex-col flex-row items-center justify-between md:h-screen md:w-16 shadow-lg border-r border-gray-200 md:py-4 pb-2">

                <!-- Botón expandir -->
                <ButtonRounded @click="varView.expandido = true" tooltip="Abrir Menú" tooltip-position="right"
                    color="flex items-center justify-center w-10 h-10 rounded-full md:bg-[var(--color-default)] bg-[var(--color-default-700)] text-white hover:bg-[var(--color-default-200)] transition">
                    <i class="fa-solid fa-angle-right"></i>
                </ButtonRounded>

                <!-- Navegación por íconos -->
                <nav class="flex md:flex-col flex-row items-center gap-6" @click="cambiarEstadoFalse()">
                    <!-- <ButtonAside v-for="button in buttons" :key="button.nombre" :data="button" /> -->
                    <ButtonRounded tooltip="Datos" tooltip-position="right"
                        color="flex items-center justify-center w-10 h-10 rounded-full text-white md:!text-gray-700 transition py-5">
                        <NuxtLink to="/Empresas/Datos">
                            <i class="fa-solid fa-building text-lg"></i>
                        </NuxtLink>
                    </ButtonRounded>
                    <ButtonRounded tooltip="Historias" tooltip-position="right"
                        color="flex items-center justify-center w-10 h-10 rounded-full text-white md:!text-gray-700 transition py-5">
                        <NuxtLink to="/Historial/Historias">
                            <i class="fa-solid fa-file text-lg"></i>
                        </NuxtLink> 
                    </ButtonRounded>
                    <ButtonRounded tooltip="Pacientes" tooltip-position="right"
                        color="flex items-center justify-center w-10 h-10 rounded-full text-white md:!text-gray-700 transition py-5">
                        <NuxtLink to="/Usuarios/Pacientes">
                            <i class="fa-solid fa-user text-lg"></i>
                        </NuxtLink> 
                    </ButtonRounded>
                    <ButtonRounded tooltip="Profesionales" tooltip-position="right"
                        color="flex items-center justify-center w-10 h-10 rounded-full text-white md:!text-gray-700 transition py-5">
                        <NuxtLink to="/Usuarios/Profesional">
                            <i class="fa-solid fa-user-doctor text-lg"></i>
                        </NuxtLink> 
                    </ButtonRounded>
                    <ButtonRounded tooltip="Agenda" tooltip-position="right"
                        color="flex items-center justify-center w-10 h-10 rounded-full text-white md:!text-gray-700 transition py-5">
                        <NuxtLink to="/Usuarios/Citas">
                            <i class="fa-solid fa-calendar-day text-lg"></i>
                        </NuxtLink> 
                    </ButtonRounded>
                </nav>

                <!-- Perfil / Logout -->
                <a href="/" class="flex-col items-center gap-3 md:flex flex-none">
                    <i class="fa-solid fa-right-from-bracket text-xl text-white md:text-gray-700 hover:text-red-600 cursor-pointer"></i>
                </a>
            </div>

            <!-- Estado expandido -->
            <div v-else
                class="menu-expandido md:bg-inherit flex flex-col justify-between w-full h-full shadow-lg rounded-lg py-4 px-3">
                <!-- Header -->
                <div>
                    <div class="flex justify-between items-center md:flex flex-row-reverse border-b border-gray-200 dark:border-gray-700 md:dark:border-gray-200 pb-3 mb-4">
                        <h2 class="text-lg font-bold text-gray-800 dark:text-gray-200 md:dark:text-gray-800 tracking-wide">Menú</h2>
                        <ButtonRounded @click="varView.expandido = false" tooltip="Cerrar Menú" tooltip-position="right"
                            color="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-default)] text-white hover:bg-[var(--color-default-200)] transition">
                            <i class="fa-solid fa-angle-left"></i>
                        </ButtonRounded>
                    </div>

                    <!-- Sección Explorar -->
                    <p class="text-gray-500 dark:text-gray-400 md:dark:text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Explorar</p>

                    <!-- Items dinámicos -->
                    <div v-for="button in buttons" :key="button.nombre" @click="storeAside.activeButton(button.id)"
                        class="menu-item py-4 border-b border-gray-100 dark:border-gray-600 md:dark:border-gray-100 rounded-md transition">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <span class="text-gray-800 dark:text-gray-200 md:dark:text-gray-800 font-medium text-sm">{{ button.nombre }}</span>
                            <i class="fa-solid text-lg text-gray-500 md:dark:text-gray-500 dark:text-gray-400 transition"
                                :class="button.icon"></i>
                        </div>
                        <div class="flex flex-col gap-1 pl-2">
                            <a v-for="seccion in button.secciones" :key="seccion.titulo"
                                :href="`/${button.nombre}/${seccion.titulo}`" @click="footer.cambiarSecciones(seccion.subSecciones)"
                                class="submenu-link text-gray-800 dark:text-gray-200 md:dark:text-gray-800 text-sm text-wrap transition">
                                • {{ seccion.titulo }}
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Perfil -->
                <div class="menu-item py-4 border-t border-gray-200 dark:border-gray-700 md:dark:border-gray-200 mt-4">
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <span class="text-gray-800 dark:text-gray-200 md:dark:text-gray-800 font-medium text-sm">Perfil</span>
                        <i class="fa-solid fa-user text-lg text-gray-500 dark:text-gray-400 md:dark:text-gray-500 transition"></i>
                    </div>
                    <div class="flex flex-col gap-1 pl-2">
                        <a class="text-gray-600 dark:text-gray-400 md:dark:text-gray-600 font-semibold text-sm text-wrap transition">{{ varView.getRol }}</a>
                        <a href="/" class="text-red-500 font-semibold text-sm hover:text-red-700 text-wrap transition">
                            Cerrar Sesión
                        </a>
                    </div>
                </div>
            </div>

        </div>

    </div>
</template>

<style scoped>
.section-asidebar {
    grid-area: aside;
    width: 50px;
    height: 100%;
    overflow: hidden;
    /* ancho colapsado */
    transition: width 0.3s ease;
    padding: 10px 0;
}

.section-asidebar.expandido {
    /* width: 250px; */
    width: 100%;
    /* ancho expandido */
    padding: 10px 5px 10px 0;
}

.section-asidebar__content {
    width: 100%;
    background: var(--color-default-claro);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    padding: 5px;
}

/* Links */
.submenu-link {
    font-size: 0.95rem;
    font-weight: 500;
    transition: color 0.2s ease;
}

.submenu-link:hover {
    color: var(--color-warning);
}

/* Responsive móvil */
@media screen and (max-width: 768px) {
    .section-asidebar {
        position: fixed;
        top: 40px;
        left: 0;
        right: 0;
        width: 100%;
        height: 40px;
        border-radius: 0;
        z-index: 9;
        padding: 0;
        margin: 0;
    }

    .section-asidebar.expandido {
        height: auto;
    }

    .section-asidebar__content {
        background: inherit;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        padding: 0;
        margin: 0;
        border-radius: 0;
    }

    .menu-colapsado {
        display: flex;
        width: 100%;
        justify-content: space-around;
    }

    .menu-expandido {
        background-color: white;
        border-top: 1px solid #e5e7eb;
        padding: 10px;
    }

    .dark .menu-expandido {
        background-color: var(--color-gray-900);
    }
}
</style>
