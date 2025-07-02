import { defineStore } from "pinia";
import { createFormStore } from '../../createFormStore'
import { useIndexedDBStore } from "../../indexedDB";
import { pacientes } from "~/data/pacientes";
// Creacion del store Paciente

// Estructura de datos de Pacientes
const estructuraPaciente = {
    Paciente: {
        name: '',
        nacimiento: '',
        type_doc: '',
        No_document: '',
        sexo: '',
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
    },
    Diagnosticos: [{
        id: '',
        tipo: '',
        CIE_10: '',
        id_paciente: '',
        rol_attention: '',
    }],
    Antecedentes: [{
        id: '',
        valor: '',
        id_paciente: '',
        tipo: 'personal',
    }],
}

// Pinia Pacientes
export const usePacientesStore = defineStore('Pacientes', {
    state: () => ({
        Paciente: JSON.parse(JSON.stringify(estructuraPaciente)), // estructura base compartida
        Pacientes: pacientes
    }),

    getters: {
        async listPacientes(state) {
            const store = useIndexedDBStore()
            store.almacen = 'Paciente'
            const pacientes = await store.leerdatos()
            state.Pacientes = pacientes // Actualiza la lista de pacientes en el estado
            return pacientes
        }
    },

    actions: {
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraPaciente) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        },


    }
});


