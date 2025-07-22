import { createFormStore } from '../../createFormStore';
// Creacion del store para nueva cita medica

// Estructura de datos de Citas
const estructuraDatosEmpresa = {
    EPS: []
}

// Pinia Empresa
export const useDatosEmpresaStore = defineStore('DatosEmpresa', {
    state: () => ({
        Datos: JSON.parse(JSON.stringify(estructuraDatosEmpresa)), // estructura base compartida
        DatosEmpresa: []
    }),

    getters: {

    },

    actions: {

        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraDatosEmpresa) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        }
    }
});