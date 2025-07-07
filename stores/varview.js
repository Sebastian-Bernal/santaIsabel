import { defineStore } from "pinia";

// Store para loader
export const useVarView = defineStore('varView', {
    state: () => ({
        showInfoSelect: false,
        showNuevoPaciente: false,
        showModificarPaciente: false,
        showNuevoProfesional: false,
        showModificarProfesional: false,
        showNuevaHistoria: false,
        showPaso2: false,
        showPaso3: false,
        showPaso4: false,
        showMedicinas: false,
        showProcedimientos: false,
        showVerHistoria: false,
        showNuevaCita: false,
        formComplete: false,
    }),

    getters: {
        isOnline: () => {
            if( typeof navigator === 'undefined' || !navigator.onLine) {
                return false;
            } else if (navigator.onLine) {
                return true;
            }
        },
    }
})
