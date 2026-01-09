import { defineStore } from "pinia";
import { decryptData } from "~/composables/Formulario/crypto";

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
        showActualizarCita: false,
        rangoCita: false,
        tratamientos: [],
        // formularios Notas
        showNuevaNota: false,
        // formularios Datos Empresa
        showNuevoEPS: false,
        showModificarEPS: false,
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
        showPDFNota: false,
        showPDFEvolucion: false,
        showPDFTerapia: false,
        showPDFMedicina: false,
        showPDFTrabajoSocial: false,
        showPDFMedicamentos: false,
        // Modales Login
        showRecuperarContraseña: false,
        showCambiarContraseña: false,
        // validacion de formularios
        soloVer: true,
        formComplete: false,
        camposVacios: false,
        tipoConsulta: '',
        tipoHistoria: '',
        cambioEnApi: false,
        citaRealizada: false,
        datosPaciente: {},
        // Impresion
        propiedadesPDF: {}
    }),

    getters: {
        isOnline: () => {
            if( typeof navigator === 'undefined' || !navigator.onLine) {
                return false;
            } else if (navigator.onLine) {
                return true;
            }
        },

        getPermisos: () => {
            try {
                const permisos = decryptData(sessionStorage.getItem('Permisos'));
                return Array.isArray(permisos) ? permisos : [];
            } catch (error) {
                console.error('Error al obtener permisos desde sessionStorage:', error);
                return [];
            }
        },

        getUser: () => {
            try {
                const usuario = decryptData(sessionStorage.getItem('user'));
                return usuario || {};
            } catch (error) {Aside
                console.error('Error al obtener usuario desde sessionStorage:', error);
                return {};
            }
        },

        getRol: () => {
            try {
                const rol = decryptData(sessionStorage.getItem('Rol'));
                return rol
            } catch (error) {
                console.error('Error al obtener usuario desde sessionStorage:', error);
            }
        }
    }
})
