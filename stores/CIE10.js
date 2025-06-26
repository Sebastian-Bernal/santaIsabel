import { CIE10 } from "~/data/CIE10";
import { defineStore } from "pinia";

// Store para guardar codigos CIE-10
export const useCodigosCie10 = defineStore('CodigosCie10', {
    state: () => ({
        CIE10_codes: CIE10,
    }),

    getters: {

    },

    actions: {

    }
})
