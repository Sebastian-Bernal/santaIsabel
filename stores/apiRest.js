import { defineStore } from "pinia";

// Store para loader
export const useApiRest = defineStore('apiRest', {
    state: () => ({
        cargando: false,
    }),
    actions: {

    }
})
