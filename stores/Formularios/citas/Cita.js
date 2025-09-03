import { createFormStore } from '../../createFormStore';
// Creacion del store para nueva cita medica

// Estructura de datos de Citas
const estructuraCita = {
    Cita: {
        fecha: '',
        servicio: '',
        motivo: '',
        hora: '',
        id_paciente: '',
        name_paciente: '',
        id_medico: '',
        name_medico: '',
        estado: 'Inactiva',
    },
}

// Pinia Citas
export const useCitasStore = defineStore('Citas', {
    state: () => ({
        Formulario: estructuraCita,
        Cita: JSON.parse(JSON.stringify(estructuraCita)), // estructura base compartida
        Citas: []
    }),

    getters: {
    },

    actions: {
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraCita) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        },

        async listCitas() {
            const store = useIndexedDBStore()
            store.almacen = 'Cita'
            const citas = await store.leerdatos()

            citas.sort((a, b) => {
                const fechaA = new Date(`${a.fecha}T${a.hora}`);
                const fechaB = new Date(`${b.fecha}T${b.hora}`);
                return fechaA - fechaB; // Orden descendente
            });

            this.Citas = citas
            return citas
        },

        borrarFormulario(){
            this.Formulario = estructuraCita
        },

    }
});