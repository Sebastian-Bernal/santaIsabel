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
            const store = useIndexedDBStore();
            store.almacen = 'Cita';
            let citas = await store.leerdatos();

            // Ordenar por fecha y hora
            citas.sort((a, b) => {
                const fechaA = new Date(`${a.fecha}T${a.hora}`);
                const fechaB = new Date(`${b.fecha}T${b.hora}`);
                return fechaA - fechaB;
            });

            // Filtrar por id_medico si el rol es Profesional
            const rol = sessionStorage.getItem('Rol');
            // Cambiar por ID
            if (rol === 'Profesional') {
                const idProfesional = JSON.parse(sessionStorage.getItem('Profesional')).name;
                citas = citas.filter(cita => {
                    return cita.name_medico === idProfesional
                });
            }
            if (rol === 'Paciente') {
                const idPaciente = JSON.parse(sessionStorage.getItem('Paciente')).name;
                citas = citas.filter(cita => {
                    return cita.name_paciente === idPaciente
                });
            }

            this.Citas = citas;
            return citas;
        },


        async listCitasHoy() {
            const store = useIndexedDBStore();
            store.almacen = 'Cita';
            const citas = await store.leerdatos();

            // Obtener la fecha actual en formato YYYY-MM-DD
            const hoy = new Date().toISOString().split('T')[0];

            // Filtrar solo las citas con fecha igual a hoy
            const citasHoy = citas.filter(cita => cita.fecha === hoy);

            // Ordenar por hora
            citasHoy.sort((a, b) => {
                const fechaA = new Date(`${a.fecha}T${a.hora}`);
                const fechaB = new Date(`${b.fecha}T${b.hora}`);
                return fechaA - fechaB;
            });

            this.Citas = citasHoy;
            return citasHoy;
        },


        borrarFormulario() {
            this.Formulario = estructuraCita
        },

    }
});

