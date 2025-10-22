import { traerCitas } from "~/Core/Usuarios/Cita/GETCita";
import { guardarEnDB } from "~/composables/Formulario/useIndexedDBManager";
import { useMedicosStore } from "../profesional/Profesionales";

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

            // Validar que todos los objetos tengan el campo fecha_historia
            const faltanFechas = citas.some(h => !h.fecha || typeof h.fecha !== 'string');

            if (faltanFechas) {
                // Volver a llamar si hay datos incompletos
                store.almacen = 'Cita';
                citas = await store.leerdatos();
            }
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
                const idUsuario = JSON.parse(sessionStorage.getItem('user')).id;
                const profesionalStore = useMedicosStore()
                const profesionales = await profesionalStore.listMedicos
                const idProfesional = profesionales.find(p => p.id_usuario === idUsuario)?.id_profesional

                citas = citas.filter(cita => {
                    return cita.id_medico === idProfesional
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
                    motivo_cancelacion: data.motivo_cancelacion,
                    id_analisis: data.id_examen_fisico,
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

