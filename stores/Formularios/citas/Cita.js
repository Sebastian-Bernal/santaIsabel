import { useMedicosStore } from "../profesional/Profesionales";

// Estructura de datos de Citas
const estructuraCita = {
    Cita: {
        id: '',
        fecha: '',
        servicio: '',
        motivo: '',
        hora: '',
        id_paciente: '',
        name_paciente: '',
        id_medico: '',
        name_medico: '',
        estado: 'Inactiva',
        intervaloCitas: '',
        cantidadCitas: '',
        fechaHasta: '',
    },
    Plan_manejo_procedimientos: []
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

        async listCitas() {
            const varView = useVarView()
            const apiRest = useApiRest()
            let citas = await apiRest.getData('Cita', 'citas')

            citas.sort((a, b) => {
                const fechaA = new Date(`${a.fecha}T${a.hora}`);
                const fechaB = new Date(`${b.fecha}T${b.hora}`);
                return fechaA - fechaB;
            });

            // Filtrar por medico si el rol es Profesional
            const rol = varView.getRol;
            if (rol === 'Profesional') {
                const idUsuario = varView.getUser.id;
                const profesionalStore = useMedicosStore()
                const profesionales = await profesionalStore.listMedicos()
                const idProfesional = profesionales.find(p => p.id_infoUsuario === idUsuario)?.id_profesional

                citas = citas.filter(cita => {
                    return cita.id_medico === idProfesional
                });
            }

            this.Citas = citas;
            return citas;
        },

        async listCitasHoy() {
            const apiRest = useApiRest()
            let citas = await apiRest.getData('Cita', 'citas')

            let citasPendientes = citas.filter(cita => cita.estado === "Inactiva");

            // Ordenar por hora
            citasPendientes = citasPendientes.sort((a, b) => {
                const fechaA = new Date(`${a.fecha}T${a.hora}`);
                const fechaB = new Date(`${b.fecha}T${b.hora}`);
                return fechaA - fechaB;
            }).slice(0, 3);

            this.Citas = citasPendientes;
            return citasPendientes;
        },


        borrarFormulario() {
            this.Formulario = estructuraCita
        },

        async indexDBDatos() {
            const api = useApiRest()
            await api.getData('Cita', 'citas')
        },

    }
});

