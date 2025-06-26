import { defineStore } from "pinia";
import { createFormStore } from '../../createFormStore'
// Creacion del store Paciente

// Estructura de datos de Pacientes
const estructuraPaciente = {
    Paciente: {
        name: '',
        nacimiento: '',
        type_doc: '',
        No_document: '',
        genero: '',
        direccion: '',
        departamento: '',
        municipio: '',
        zona: '',
        barrio: '',
        celular: '',
        telefono: '',
        Eps: '',
        Regimen: '',
        poblacionVulnerable: '',
        Tipo: '',
    }
}

// Pinia Pacientes
export const usePacientesStore = defineStore('Pacientes', {
    state: () => ({
        Paciente: JSON.parse(JSON.stringify(estructuraPaciente)) // estructura base compartida
    }),

    actions: {
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraPaciente) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        }
    }
});


