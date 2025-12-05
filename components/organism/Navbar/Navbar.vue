<script setup>
import DropdownNavbar from '~/components/molecules/Dropdowns/DropdownNavbar.vue';
import Breadcrumb from '~/components/molecules/BreadCrumbs/Breadcrumb.vue';
import { diasSemana, nombresMeses } from '~/data/Fechas';
import { useShowNavbar } from '~/stores/navbarResponsive.js';
import { submenuNotificaciones, submenuSesion } from '~/data/NavMenu';
import { ref, computed, onMounted } from 'vue';

const { showNavbarBurguer, cambiarEstado } = useShowNavbar();

const usuario = ref();
const varView = useVarView();

onMounted(() => {
    // Obtener y parsear el usuario
    const user = varView.getUser
  if (user && typeof user.name === 'string') {
    usuario.value = user.name.split(' ')[0]
  } else {
    usuario.value = 'Usuario'
  }
})

function obtenerFechaFormateada() {
    const fecha = new Date();

    const diaSemana = diasSemana[fecha.getDay()];
    const diaMes = fecha.getDate();
    const mesNombre = nombresMeses[fecha.getMonth()];

    return `${diaSemana}, ${diaMes} ${mesNombre}`;
}

const fechaActualFormateada = computed(() => {
    return obtenerFechaFormateada();
});

const removeStorage = () => {
    sessionStorage.removeItem('seccionesGuardadas')
};

</script>

<template>
    <div class="navbar">
        <div class="navbar__content">

            <a href="/Home" class="text-white md:text-xl text-lg font-extrabold ml-3">
                <i class="fa-solid fa-laptop-medical md:text-2xl text-lg"></i>
                Thesalus
            </a>
            <p class="text-xs text-white mr-10 mt-4 md:hidden block">{{ usuario }}</p>
            <div class="menuResponsive" @click="cambiarEstado()">
                <h2 class="text-white"><i class="fa-solid fa-bars"></i></h2>
            </div>

            <ul class="navbar__content__list" @click="removeStorage()"
                :class="{ 'mostrarResponsive': showNavbarBurguer, 'ocultarResponsive': !showNavbarBurguer }">
                <li>
                    <a href="/Usuarios/Citas" class="flex gap-1 text-xs text-white md:text-gray-100 hover:text-blue-500 rounded-[5px] p-[10px] shadow-lg">
                        <i class="fa-solid fa-calendar"></i>
                        <p class="text-white md:text-white">{{fechaActualFormateada }}</p>
                    </a>
                </li>
                <li>
                    <Breadcrumb/>
                </li>
                <li>
                    <DropdownNavbar icon="fa-bell" nombre="Notificaciones" :submenu="submenuNotificaciones" />
                </li>
                <li>
                    <DropdownNavbar icon="fa-circle-user" nombre="Iniciar sesion" :submenu="submenuSesion" />
                    <p class="text-xs ml-1 font-semibold md:block hidden">{{ usuario }}</p>
                </li>
            </ul>

        </div>
    </div>
</template>

<style scoped>
.navbar {
    padding: 5px;
    grid-area: navbar;
}

.navbar__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    color: #fff;
    width: 110px;
    object-fit: contain;
    margin-left: 15px;
}

.navbar__content__list {
    display: flex;
    list-style: none;
    gap: 5px;
}

.navbar__content__list li {
    display: flex;
    align-items: center;
    color: #fff;
    padding: 10px 15px;
}

.menuResponsive {
    display: none;
    font-size: 20px;
    font-weight: bold;
}

.burgerIcon {
    cursor: pointer;
}

.buergerIcon:hover {
    background-color: var(--color-negro-rojizo);
    border-radius: 10px;
}

.mostrarResponsive {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
}

@media screen and (max-width: 768px) {
    .ocultarResponsive {
        display: none;
    }

    .navbar {
        height: 40px;
        padding: 0;
    }

    .navbar .logo {
        height: 30px;
        margin: 5px;
    }

    .menuResponsive {
        display: block;
        position: absolute;
        right: 10px;
        top: 10px;
    }

    .navbar__content__list {
        position: absolute;
        z-index: 999;
        top: 95px;
        right: 0;
        width: 100%;
        background-color: var(--color-default-600);
        color: #fff;
        backdrop-filter: blur(10px);
        border-radius: 10px;
        padding: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .menuResponsive .navbar__content__list {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

}
</style>