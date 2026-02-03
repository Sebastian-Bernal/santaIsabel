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

function accesoRapidoSelected(nombre) {
    switch (nombre) {
        case 'Datos': {
            const button = buttons.value.find(btn => btn.nombre === 'Empresas');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(1)
            }
            break;
        }
        case 'Historias': {
            const button = buttons.value.find(btn => btn.nombre === 'Historial');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(0)
            }
            break;
        }
        case 'Pacientes': {
            const button = buttons.value.find(btn => btn.nombre === 'Usuarios');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(0)
            }
            break;
        }
        case 'Profesional': {
            const button = buttons.value.find(btn => btn.nombre === 'Usuarios');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(1)
            }
            break;
        }
        case 'Citas': {
            const button = buttons.value.find(btn => btn.nombre === 'Usuarios');
            console.log(button);
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(2)
            }
            break;
        }
        default:
            console.log("No se encontró el caso para:", nombre);
    }


}
</script>

<template>
    <div class="section-asidebar flex items-center relative" :class="{ 'expandido': varView.expandido }">

        <div class="section-asidebar__content w-full flex flex-col p-[5px] items-center rounded-r-lg bg-[var(--color-default-claro)] dark:bg-[var(--color-default-700)] shadow-lg"
            :class="{ 'h-full': varView.expandido, 'h-[75%] clip': !varView.expandido }"">

            <!-- Estado colapsado -->
            <div v-if="!varView.expandido"
                class="menu-colapsado flex md:flex-col flex-row items-center justify-between md:h-screen md:w-16 md:py-4 pb-2">

                <!-- Botón expandir -->
                <ButtonRounded @click="() => {
                    varView.expandido = true;
                    cambiarEstadoFalse()
                }" tooltip="Abrir Menú" tooltip-position="right"
                    color="flex items-center justify-center w-10 h-10 rounded-full md:text-black dark:text-white font-bold text-white transition">
                    <i class="fa-solid fa-angle-right text-lg"></i>
                </ButtonRounded>

                <!-- Navegación por íconos -->
                <nav class="flex md:flex-col flex-row items-center gap-6" @click="cambiarEstadoFalse()">
                    <!-- <ButtonAside v-for="button in buttons" :key="button.nombre" :data="button" /> -->
                    <ButtonRounded tooltip="Datos" tooltip-position="right"
                        color="flex items-center justify-center w-10 h-10 rounded-full text-white md:text-gray-700 dark:text-white transition py-5">
                        <NuxtLink to="/Empresas/Datos" @click="accesoRapidoSelected('Datos')">
                            <i class="fa-solid fa-building text-lg"></i>
                        </NuxtLink>
                    </ButtonRounded>
                    <ButtonRounded tooltip="Historias" tooltip-position="right"
                        color="flex items-center justify-center w-10 h-10 rounded-full text-white md:text-gray-700 dark:text-white transition py-5">
                        <NuxtLink to="/Historial/Historias" @click="accesoRapidoSelected('Historias')">
                            <i class="fa-solid fa-file text-lg"></i>
                        </NuxtLink>
                    </ButtonRounded>
                    <ButtonRounded tooltip="Pacientes" tooltip-position="right"
                        color="flex items-center justify-center w-10 h-10 rounded-full text-white md:text-gray-700 dark:text-white transition py-5">
                        <NuxtLink to="/Usuarios/Pacientes" @click="accesoRapidoSelected('Pacientes')">
                            <i class="fa-solid fa-user text-lg"></i>
                        </NuxtLink>
                    </ButtonRounded>
                    <ButtonRounded tooltip="Profesionales" tooltip-position="right"
                        color="flex items-center justify-center w-10 h-10 rounded-full text-white md:text-gray-700 dark:text-white transition py-5">
                        <NuxtLink to="/Usuarios/Profesional" @click="accesoRapidoSelected('Profesional')">
                            <i class="fa-solid fa-user-doctor text-lg"></i>
                        </NuxtLink>
                    </ButtonRounded>
                    <ButtonRounded tooltip="Agenda" tooltip-position="right"
                        color="flex items-center justify-center w-10 h-10 rounded-full text-white md:text-gray-700 dark:text-white transition py-5">
                        <NuxtLink to="/Usuarios/Citas" @click="accesoRapidoSelected('Citas')">
                            <i class="fa-solid fa-calendar-day text-lg"></i>
                        </NuxtLink>
                    </ButtonRounded>
                </nav>

                <!-- Perfil / Logout -->
                <a href="/" class="flex-col items-center gap-3 md:flex flex-none">
                    <i
                        class="fa-solid fa-right-from-bracket text-lg text-white md:text-gray-700 dark:text-white hover:text-red-600 cursor-pointer"></i>
                </a>
            </div>

            <!-- Estado expandido -->
            <div v-else
                class="menu-expandido md:bg-inherit flex flex-col justify-between w-full h-full shadow-lg rounded-lg py-4 px-3">
                <!-- Header -->
                <div>
                    <div
                        class="flex justify-between items-center md:flex flex-row-reverse border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                        <h2 class="text-lg font-bold text-gray-800 dark:text-gray-200 tracking-wide">
                            Menú</h2>
                        <ButtonRounded @click="varView.expandido = false" tooltip="Cerrar Menú" tooltip-position="right"
                            color="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-default-200)] text-white hover:bg-[var(--color-default-200)] transition">
                            <i class="fa-solid fa-angle-left"></i>
                        </ButtonRounded>
                    </div>

                    <!-- Sección Explorar -->
                    <p
                        class="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                        Secciones</p>

                    <!-- Items dinámicos -->
                    <div v-for="button in buttons" :key="button.nombre"
                        @click="() => { storeAside.activeButton(button.id); footer.cambiarIdActivo(0) }"
                        class="menu-item py-2 border-b border-gray-100 dark:border-gray-600 rounded-md transition">
                        <a class="flex items-center justify-between gap-2 mb-2"
                            :href="`/${button.nombre}/${button.secciones[0].titulo}`"
                            @click="footer.cambiarSecciones(button.secciones)">
                            <span class="text-gray-800 dark:text-gray-200 font-medium text-sm">{{
                                button.nombre }}</span>
                            <i class="fa-solid text-lg text-gray-500 dark:text-gray-400 transition"
                                :class="button.icon"></i>
                        </a>
                    </div>

                    <!-- Sección Explorar -->
                    <p
                        class="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider my-2">
                        Acceso Rapido</p>

                    <!-- Navegación por íconos -->
                    <div @click="cambiarEstadoFalse()">

                        <a class="flex items-center justify-between gap-2 py-2" href="/Empresas/Datos"
                            @click="accesoRapidoSelected('Datos')">
                            <span
                                class="text-gray-800 dark:text-gray-200 font-medium text-sm">Datos</span>
                            <i
                                class="fa-solid fa-building text-lg text-gray-500 dark:text-gray-400 transition"></i>
                        </a>
                        <a class="flex items-center justify-between gap-2 py-2" href="/Historial/Historias"
                            @click="accesoRapidoSelected('Historias')">
                            <span
                                class="text-gray-800 dark:text-gray-200 font-medium text-sm">Historias</span>
                            <i
                                class="fa-solid fa-file text-lg text-gray-500 dark:text-gray-400 transition"></i>
                        </a>
                        <a class="flex items-center justify-between gap-2 py-2" href="/Usuarios/Pacientes"
                            @click="accesoRapidoSelected('Pacientes')">
                            <span
                                class="text-gray-800 dark:text-gray-200 font-medium text-sm">Pacientes</span>
                            <i
                                class="fa-solid fa-user text-lg text-gray-500 dark:text-gray-400 transition"></i>
                        </a>
                        <a class="flex items-center justify-between gap-2 py-2" href="/Usuarios/Profesional"
                            @click="accesoRapidoSelected('Profesional')">
                            <span
                                class="text-gray-800 dark:text-gray-200 font-medium text-sm">Profesional</span>
                            <i
                                class="fa-solid fa-user-doctor text-lg text-gray-500 dark:text-gray-400 transition"></i>
                        </a>
                        <a class="flex items-center justify-between gap-2 py-2" href="/Usuarios/Citas"
                            @click="accesoRapidoSelected('Citas')">
                            <span
                                class="text-gray-800 dark:text-gray-200 font-medium text-sm">Citas</span>
                            <i
                                class="fa-solid fa-calendar-day text-lg text-gray-500 dark:text-gray-400 transition"></i>
                        </a>
                    </div>
                </div>

                <!-- Perfil -->
                <div class="menu-item py-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <span
                            class="text-gray-800 dark:text-gray-200 font-medium text-sm">Perfil</span>
                        <i
                            class="fa-solid fa-user text-lg text-gray-500 dark:text-gray-400 transition"></i>
                    </div>
                    <div class="flex flex-col gap-1 pl-2">
                        <a
                            class="text-gray-600 dark:text-gray-400 font-semibold text-sm text-wrap transition">{{
                                varView.getRol }}</a>
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
    /* ancho colapsado */
    grid-area: aside;
    width: 50px;
    height: 80vh;
    padding: 10px 0;
    transition: width 0.4s ease, transform 0.6s ease, opacity 0.6s ease;

}

.section-asidebar.expandido {
    /* ancho expandido */
    /* width: 100%; */
    width: 180px;
    padding: 10px 5px 10px 0;
}

/* Estado colapsado */
.section-asidebar .menu-colapsado {
  transition: all 0.3s ease;
  transform: translateX(-4px);
  opacity: 0.9;
}

/* Estado expandido */
.section-asidebar .menu-expandido {
  transition: all 0.3s ease;
  transform: translateX(0);
  opacity: 1;
  animation: fadeIn 0.6s ease;
}

/* Animación extra */
@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.section-asidebar__content {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.clip {
    clip-path: polygon(50% 0%, 100% 0, 100% 13%, 85% 15%, 85% 100%, 30% 100%, 0 100%, 0% 45%, 0 0);
}

.section-asidebar__content .clip {
    filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.4));
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
        width: 100%;
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
