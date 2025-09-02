import { defineStore } from "pinia";
import { createFormStore } from '../../createFormStore'
import { useIndexedDBStore } from "../../indexedDB";
import { useUsersStore } from "../usuarios/Users";

// Pinia Pacientes
export const usePacientesStore = defineStore('Pacientes', {
    state: () => ({
        Pacientes: [],
        Formulario: {
            User: {
                id_empresa: '',
                correo: '',
                contraseña: null,
                rol: 'Paciente',
                estado: 'activo',
            },
            InformacionUser: {
                id_usuario: '',
                name: '',
                No_document: '',
                tipo: '',
                celular: '',
                telefono: '',
                nacimiento: '',
                direccion: '',
                municipio: '',
                departamento: '',
                barrio: '',
                zona: '',
            },
            Paciente: {
                id_usuario: '',
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
    }),

    getters: {
        async listPacientes(state) {
            const store = useIndexedDBStore()
            const usersStore = useUsersStore()

            store.almacen = 'Paciente'
            const pacientes = await store.leerdatos()

            const usuarios = await usersStore.listUsers

            const pacientesActivos = pacientes.filter((paciente) => {
                return paciente.estado === 'activo'
            })

            // Asociar cada paciente con su usuario correspondiente
            const usuariosPacientes = pacientesActivos.map((paciente) => {
                const usuario = usuarios.find((user) => user.id === paciente.id_usuario)

                if (usuario) {
                    return {
                        ...paciente,
                        ...usuario,
                        id_paciente: paciente.id // renombramos el id del paciente
                    }
                } else {
                    return {
                        ...paciente,
                        usuario: null
                    }
                }
            })

            state.Pacientes = usuariosPacientes
            return usuariosPacientes
        },

        async tablaPacientes() {
            const store = useIndexedDBStore()
            store.almacen = 'Paciente'
            const pacientes = await store.leerdatos()


            const pacientesActivos = pacientes.filter((paciente) => {
                return paciente.estado === 'activo'
            })

            return pacientesActivos
        },
    },

    actions: {
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = []) {
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


