import { useUsersStore } from "../usuarios/Users";

// Pinia Medicos
export const useMedicosStore = defineStore('Medicos', {
    state: () => ({
        Formulario: {
            User: {
                id_empresa: '',
                correo: '',
                contraseña: null,
                rol: 'Profesional',
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
            Medico: {
                id_usuario: '',
                departamentoLaboral: '',
                municipioLaboral: '',
                zonaLaboral: '',
                profesion: '',
                estado: 'activo',
            }
        },
        Medicos: [] // Lista de medicos
    }),

    getters: {
        async listMedicos(state) {
            const store = useIndexedDBStore()
            const usersStore = useUsersStore()

            store.almacen = 'Medico'
            const medicos = await store.leerdatos()

            const usuarios = await usersStore.listUsers

            const medicosActivos = medicos.filter((medico) => {
                return medico.estado === 'activo'
            })

            // Asociar cada medico con su usuario correspondiente
            const usuariosProfesionales = medicosActivos.map((medico) => {
                const usuario = usuarios.find((user) => user.id === medico.id_usuario)
                usuario.id_profesional = medico.id
                return {
                    ...medico,
                    ...usuario || null, // Agregamos los datos del usuario (o null si no se encuentra)
                    id_profesional: medico.id
                }
            })

            state.Medicos = usuariosProfesionales
            return usuariosProfesionales
        },

        async tablaMedicos() {
            const store = useIndexedDBStore()
            store.almacen = 'Medico'
            const medicos = await store.leerdatos()

            const medicosActivos = medicos.filter((medico) => {
                return medico.estado === 'activo'
            })

            return medicosActivos
        },
    },

    actions: {
    }
});