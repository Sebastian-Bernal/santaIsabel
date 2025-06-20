import { defineStore } from "pinia";
import { validarYEnviarNuevoPaciente } from "~/Core/NuevoPaciente";

export const useNuevoPaciente = defineStore('NuevoPaciente', {
    state: () => ({
        estado: false,
    }),

    getters: {

    },

    actions: {
        async mandarFormulario(datos) {
            this.estado = await validarYEnviarNuevoPaciente(datos)
        },
    }
})
