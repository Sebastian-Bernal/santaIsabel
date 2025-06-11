import { defineStore } from "pinia";

export const useFormPendiente = defineStore('apiRest', {
    state: () => ({
        subirDespues: false,
    }),
})