import { defineStore } from "pinia";

// Store para loader
export const useVarView = defineStore('varView', {
    state: () => ({
        cargando: false,
        // Formularios Paciente
        showNuevoPaciente: false,
        showModificarPaciente: false,
        // Formularios Profesional
        showNuevoProfesional: false,
        showModificarProfesional: false,
        // formularios Administrativos
        showNuevoAdministrativo: false,
        // Formularios Citas
        showNuevaCita: false,
        // formularios Notas
        showNuevaNota: false,
        // Formularios Historia
        showNuevaHistoria: false,
        showPaso2: false,
        showPaso3: false,
        showPaso4: false,
        showMedicinas: false,
        showProcedimientos: false,
        showInsumos: false,
        showEquipos: false,
        // Modales ver Historia
        showVerAnalisis : false,
        showAnalisisInfo: false,
        showVerConsultas : false,
        showConsultaInfo : false,
        showVerEvoluciones : false,
        showVerNotas : false,
        showVerTratamientos : false,
        showVerMedicacion : false,
        showMenuHistorias: true,       
        showVerHistoria: false,
        // Modales Login
        showRecuperarContraseña: false,
        showCambiarContraseña: false,
        // validacion de formularios
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
