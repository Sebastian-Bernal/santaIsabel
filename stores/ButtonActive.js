import { defineStore } from "pinia";
import { buttons } from '../data/Buttons'

// Store para botones del Aside
export const useButtonsAside = defineStore('ButtonsAside', {
    state: () => ({
        buttons: buttons,
    }),

    getters: {
        getbuttons: (state) => (permisosUsuario) => {
            // return state.buttons
            return state.buttons.map(button => {
                // Filtramos las secciones
                const seccionesFiltradas = button.secciones?.map(seccion => {
                    // Filtrar subSecciones si existen
                    let subSeccionesFiltradas = seccion.subSecciones?.filter(sub =>
                        permisosUsuario.includes(sub.titulo)
                    );

                    // Si la sección no tiene subSecciones, revisamos el título directamente
                    const incluirSeccion = subSeccionesFiltradas?.length > 0 ||
                        permisosUsuario.includes(seccion.titulo);

                    // Si se debe incluir, devolvemos la sección filtrada
                    return incluirSeccion ? {
                        ...seccion,
                        ...(subSeccionesFiltradas && { subSecciones: subSeccionesFiltradas })
                    } : null;
                }).filter(Boolean); // elimina los null

                // Si aún quedan secciones visibles, devolvemos el botón
                return seccionesFiltradas.length > 0 ? {
                    ...button,
                    secciones: seccionesFiltradas
                } : null;
            }).filter(Boolean); // elimina los botones sin secciones
        }


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