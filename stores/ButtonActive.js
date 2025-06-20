import { getButtonsAside } from '../Core/getButtonsAside';
import { defineStore } from "pinia";

export const useButtonsAside = defineStore('ButtonsAside', {
    state: () => ({
        buttons: [],
    }),

    getters: {
        getbuttons: async(state) => {
            const online = navigator.onLine;
            if(online){
                state.buttons = await getButtonsAside();
            }
        },
    },

    actions: {
        activeButton(id) {
            this.buttons.forEach(button => {
                if (button.id == id) {
                    button.active = true;
                    sessionStorage.setItem('activeButton', id);
                } else {
                    button.active = false;
                };
            });
        },

        sessionActive() {
            const botonActivo = sessionStorage.getItem('activeButton');
            if (botonActivo) {
                this.activeButton(parseInt(botonActivo));
            } else {
                this.activeButton(1);
            }
        }
    }
})

// Configuracion para el estado activo del boton
// export const activeButton = (id) => {
//     buttons.value.forEach(button => {
//         if (button.id == id) {
//             button.active = true;
//             sessionStorage.setItem('activeButton', id);
//         } else {
//             button.active = false;
//         };
//     });
// }

// export const sessionActive = () => {
//     const botonActivo = sessionStorage.getItem('activeButton');
//     if (botonActivo) {
//         activeButton(parseInt(botonActivo));
//     } else {
//         activeButton(1);
//     }
// }