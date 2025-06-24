import { defineStore } from "pinia";
import { validarYEnviarNuevoMedico } from "~/Core/NuevoMedico";

export const useNuevoMedico = defineStore('NuevoMedico', {
    state: () => ({
        estado: false,
    }),

    getters: {

    },

    actions: {
        async mandarFormulario(datos) {
            this.estado = await validarYEnviarNuevoMedico(datos)
        },
    }
})
