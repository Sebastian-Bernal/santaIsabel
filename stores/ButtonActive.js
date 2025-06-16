import { buttons } from "~/data/Buttons";

// Configuracion para el estado activo del boton
export const activeButton = (id) => {
    buttons.value.forEach(button => {
        if (button.id == id) {
            button.active = true;
            sessionStorage.setItem('activeButton', id);
        } else {
            button.active = false;
        };
    });
}

export const sessionActive = () => {
    const botonActivo = sessionStorage.getItem('activeButton');
    if (botonActivo) {
        activeButton(parseInt(botonActivo));
    } else {
        activeButton(1);
    }
}