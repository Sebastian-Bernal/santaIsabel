// Estructura de datos de Empresa
const estructura = {
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
        Formulario: estructura,
        Empresa: JSON.parse(JSON.stringify(estructura)), // estructura base compartida
        EmpresaData: []
    }),

    getters: {

    },

    actions: {
    }
});