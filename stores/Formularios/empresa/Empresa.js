import { createFormStore } from '../../createFormStore';
// Creacion del store para nueva cita medica

// Estructura de datos de Citas
const estructuraCita = {
    Empresa: {
        nombre: '',
        logo: '',
        logoLogin: '',
        JPG: '',
        no_identificacion: '',
        DV: '',
        registroMercantil: '',
        direccion: '',
        telefono: '',
        lenguaje: '',
        impuesto: '',
        pais: '',
        tipoDocumento: '',
        tipoOperacion: '',
        tipoEntorno: '',
        tipoMoneda: '',
        tipoOrganizacion: '',
        municipio: '',
        tipoResponsabilidad: '',
        tipoRegimen: '',
    },
}

// Pinia Empresa
export const useEmpresaStore = defineStore('Empresa', {
    state: () => ({
        Empresa: JSON.parse(JSON.stringify(estructuraCita)), // estructura base compartida
        EmpresaData: []
    }),

    getters: {

    },

    actions: {

        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraCita) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        }
    }
});