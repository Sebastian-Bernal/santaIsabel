import { defineStore } from "pinia";

export const useCalendarioCitas = defineStore('CalendarioCitas', {
    state: () => ({
        fecha: '',
        dias: '',
        meses: '',
    }),

    getters: {
        fechaActual() {
            Date.now()
        }

    },

    actions: {
    }
})
