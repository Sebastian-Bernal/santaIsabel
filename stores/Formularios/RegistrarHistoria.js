import { defineStore } from "pinia";
import { validarYEnviarRegistrarHistoria } from "~/Core/RegistrarHistoria";

export const useRegistrarHistoria = defineStore('RegistrarHistoria', {
    state: () => ({
        estado: false,
    }),

    getters: {

    },

    actions: {
        async mandarFormulario(datos) {
            this.estado = await validarYEnviarRegistrarHistoria(datos)
        },
    }
})