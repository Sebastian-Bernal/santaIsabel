import {ref} from 'vue';
const showNavbarBurguer = ref(false);

export const useShowNavbar = () => {
const cambiarEstado = () => {
    showNavbarBurguer.value = !showNavbarBurguer.value;
};

return {
    showNavbarBurguer,
    cambiarEstado,
};
}