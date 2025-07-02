import { defineStore } from "pinia";

// Store para loader
export const useVarView = defineStore('varView', {
    state: () => ({
        showInfoSelect: false,
        showNuevoPaciente: false,
        showModificarPaciente: false,
        showMedico: false,
        formComplete: false,
    })
})
