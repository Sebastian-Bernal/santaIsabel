<script setup>
import DropdownNavbar from '~/components/molecules/Dropdowns/DropdownNavbar.vue';
import Breadcrumb from '~/components/molecules/BreadCrumbs/Breadcrumb.vue';
import { diasSemana, nombresMeses } from '~/data/Fechas';
import { useShowNavbar } from '~/stores/navbarResponsive.js';
import { useUsuariosStore } from '~/stores/Formularios/login/Login';
import { submenuNotificaciones, submenuSesion } from '~/data/NavMenu';
import { ref, computed, onMounted } from 'vue';

const { showNavbarBurguer, cambiarEstado } = useShowNavbar();
const usuarioStore = useUsuariosStore();

const usuario = ref();
const usuarioRol = ref('');

onMounted(() => {
    usuarioRol.value = sessionStorage.getItem("Rol") || [];
    // Obtener y parsear el usuario
    const datos = sessionStorage.getItem("User");
    const usuarioParseado = datos ? JSON.parse(datos) : {};
    usuario.value = usuarioParseado.name || 'Usuario';

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

            <a :href="usuarioRol === 'Paciente' ? '' : '/Home'" class="text-white text-xl font-extrabold ml-3">
                <i class="fa-solid fa-laptop-medical text-2xl"></i>
                Thesalus
            </a>
            <p class="text-xs text-white mr-10 mt-4 md:hidden block">{{ usuario }}</p>
            <div class="menuResponsive" @click="cambiarEstado()">
                <h2 class="text-white"><i class="fa-solid fa-bars"></i></h2>
            </div>

            <ul class="navbar__content__list" @click="removeStorage()"
                :class="{ 'mostrarResponsive': showNavbarBurguer, 'ocultarResponsive': !showNavbarBurguer }">
                <li>
                    <a href="/Usuarios/Citas" class="flex gap-1 text-xs text-gray-100 hover:text-blue-500">
                        <i class="fa-solid fa-calendar"></i>
                        <p class="text-black md:text-white">{{fechaActualFormateada }}</p>
                    </a>
                </li>
                <li>
                    <Breadcrumb :usuarioRol="usuarioRol"/>
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
    padding: 10px 10px 5px 10px;
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
        background-color: var(--color-default-900);
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