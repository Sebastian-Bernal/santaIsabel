import { defineStore } from "pinia";
import { buttons } from '../data/Buttons'

// Store para botones del Aside
export const useButtonsAside = defineStore('ButtonsAside', {
    state: () => ({
        buttons: buttons,
    }),

    getters: {
        getbuttons: async(state) => {
            state.buttons = buttons
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
                this.activeButton(null);
            }
        }
    }
});