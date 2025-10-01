// Estructura de datos de Software
const estructura = {
    Software: {
        Dian: {
            id: '',
            pin: '',
            testID: '',
        },
    },
}

// Pinia Empresa
export const useSoftwareStore = defineStore('Software', {
    state: () => ({
        Formulario: estructura,
        Software: JSON.parse(JSON.stringify(estructura)), // estructura base compartida
        SoftwareData: []
    }),

    getters: {

    },

    actions: {
    }
});