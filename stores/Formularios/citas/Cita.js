import { traerCitas } from "~/Core/Usuarios/Cita/GETCita";
import { guardarEnDB } from "~/composables/Formulario/useIndexedDBManager";

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

            console.log(citas)
            this.Citas = citas;
            return citas;
        },
        // // Filtrar por id_medico si el rol es Profesional
        // const rol = sessionStorage.getItem('Rol');
        // // Cambiar por ID
        // if (rol === 'Profesional') {
        //     const idProfesional = JSON.parse(sessionStorage.getItem('Profesional')).name;
        //     citas = citas.filter(cita => {
        //         return cita.name_medico === idProfesional
        //     });
        // }


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

        async indexDBDatos() {
            const citas = await traerCitas()
            const citasLocal = await this.listCitas()

            // Crear un conjunto de IDs locales para comparación rápida
            const ids = new Set(
                citasLocal.map(data => data.id)
            );

            const citasIndexed = citas.map((data) => ({
                Cita: {
                    id: data.id,
                    id_paciente: data.id_paciente,
                    id_medico: data.id_medico,
                    name_paciente: data.name_paciente,
                    name_medico: data.name_medico,
                    servicio: data.servicio,
                    motivo: data.motivo,
                    fecha: data.fecha,
                    hora: data.hora,
                    estado: data.estado,
                }
            }));

            // Filtrar los que no están en local
            const nuevasCitas = citasIndexed.filter(item => {
                const key = item.Cita.id;
                return !ids.has(key);
            });

            // Guardar solo los nuevos
            nuevasCitas.forEach(item => {
                guardarEnDB(item);
            });
        },

    }
});

