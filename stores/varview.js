import { defineStore } from "pinia";

// Store para loader
export const useVarView = defineStore('varView', {
    state: () => ({
        cargando: false,
        // Formularios Paciente
        showNuevoPaciente: false,
        showNuevoPacientePaso2: false,
        showModificarPaciente: false,
        // formularios Administrativos
        showNuevoAdministrativo: false,
        showModificarAdministrativo: false,
        // formularios Users
        showNuevoUser: false,
        showModificarUser: false,
        // Formularios Citas
        showNuevaCita: false,
        // formularios Notas
        showNuevaNota: false,
        // formularios Datos Empresa
        showNuevoEPS: false,
        // formulario Datos Excel
        showDatosExcel: false,
        showCrearTabla: false,
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
        showNotasInfo : false,
        showVerTratamientos : false,
        showTratamientoInfo: false,
        showVerMedicacion : false,
        showMedicacionInfo: false,
        showMenuHistorias: true,       
        showVerHistoria: false,
        // Modales Login
        showRecuperarContraseña: false,
        showCambiarContraseña: false,
        // validacion de formularios
        soloVer: true,
        formComplete: false,
        camposVacios: false,
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
