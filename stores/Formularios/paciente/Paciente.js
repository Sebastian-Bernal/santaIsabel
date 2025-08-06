import { defineStore } from "pinia";
import { createFormStore } from '../../createFormStore'
import { useIndexedDBStore } from "../../indexedDB";
// Creacion del store Paciente

// Estructura de datos de Pacientes
const estructuraPaciente = {
    User: {
        id_empresa: '',
        name: '',
        No_document: '',
        tipo: '',
        celular: '',
        telefono: '',
        correo: '',
        contraseña: null,
        rol: 'Paciente',
        nacimiento: '',
        direccion: '',
        municipio: '',
        departamento: '',
        barrio: '',
        zona: '',
        estado: 'activo',
    },
    Paciente: {
        sexo: '',
        genero: '',
        Eps: '',
        Regimen: '',
        poblacionVulnerable: '',
        estado: 'activo',
    },
    Diagnosticos: [],
    Antecedentes: [],

}

// Pinia Pacientes
export const usePacientesStore = defineStore('Pacientes', {
    state: () => ({
        Paciente: estructuraPaciente, // estructura base compartida
        Pacientes: []
    }),

    getters: {
        async listPacientes(state) {
            const store = useIndexedDBStore()
            store.almacen = 'Paciente'
            const pacientes = await store.leerdatos()

            store.almacen = 'User'
            const usuarios = await store.leerdatos()

            const pacientesActivos = pacientes.filter((paciente) => {
                return paciente.estado === 'activo'
            })

            // Asociar cada paciente con su usuario correspondiente
            const usuariosPacientes = pacientesActivos.map((paciente) => {
                const usuario = usuarios.find((user) => user.id === paciente.id_usuario)
                return {
                    ...paciente,
                    ...usuario || null, // Agregamos los datos del usuario (o null si no se encuentra)
                }
            })

            state.Pacientes = usuariosPacientes // Actualiza la lista de pacientes en el estado
            return usuariosPacientes
        },
    },

    actions: {
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraPaciente) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        },

        async listDatos(id, Tabla) {
            // Traer datos de indexedDB
            const store = useIndexedDBStore()
            store.almacen = Tabla
            const datosTabla = await store.leerdatos()

            // Array que devuelve los datos filtrados por paciente
            const datos = datosTabla.filter((dato) => {
                return parseInt(dato.id_paciente) === parseInt(id)
            })

            return datos
        },

    }
});


