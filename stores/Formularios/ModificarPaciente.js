import { defineStore } from "pinia";
import { validarYEnviarModificarPaciente } from "~/Core/ModificarPaciente";

export const useModificarPaciente = defineStore('ModificarPaciente', {
    state: () => ({
        estado: false,
    }),

    getters: {

    },

    actions: {
        async mandarFormulario(datos) {
            this.estado = await validarYEnviarModificarPaciente(datos)
        },
    }
})
