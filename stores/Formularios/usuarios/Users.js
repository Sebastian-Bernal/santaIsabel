import { defineStore } from "pinia";
import { createFormStore } from '../../createFormStore'
import { useIndexedDBStore } from "../../indexedDB";

// Pinia Users
export const useUsersStore = defineStore('Users', {
    state: () => ({
        Formulario: {
            User: {
                id_empresa: '',
                correo: '',
                contraseña: '',
                rol: '',
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
        },
        Users: []
    }),

    getters: {
        async listUsers(state) {
            const store = useIndexedDBStore()
            store.almacen = 'User'
            const Users = await store.leerdatos()

            store.almacen = 'InformacionUser'
            const informacionUsers = await store.leerdatos()

            const UsersActivos = Users.filter((User) => {
                return User.estado === 'activo'
            })

            const usuariosCompletos = UsersActivos.map((usuario) => {
                const usuarioInfo = informacionUsers.find((user) => user.id_usuario === usuario.id)

                if (usuarioInfo) {
                    return {
                        ...usuarioInfo,
                        ...usuario,
                        // id_paciente: usuario.id // renombramos el id del paciente
                    }
                } else {
                    return {
                        ...usuario,
                        // usuario: null
                    }
                }
            })
            state.Users = usuariosCompletos // Actualiza la lista de Users en el estado
            return usuariosCompletos
        },
    },

    actions: {
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraUser) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        },
    }
});


