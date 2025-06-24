import { defineStore } from "pinia";
import { validarYEnviarNuevaCita } from "~/Core/NuevaCita";

export const useNuevaCita = defineStore('NuevaCita', {
    state: () => ({
        estado: false,
    }),

    getters: {

    },

    actions: {
        async mandarFormulario(datos) {
            this.estado = await validarYEnviarNuevaCita(datos)
        },
    }
})