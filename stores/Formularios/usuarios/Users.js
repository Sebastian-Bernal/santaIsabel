import { defineStore } from "pinia";
import { useIndexedDBStore } from "../../indexedDB";
import { getAll } from "~/composables/Formulario/useIndexedDBManager";

// Pinia Users
export const useUsersStore = defineStore('Users', {
    state: () => ({
        Formulario: {
            User: {
                id_empresa: '',
                correo: '',
                contraseña: '',
                rol: 'Administrador',
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

            // juntar informacion de tablas infoUsuarios y usuarios
            const usuariosCompletos = informacionUsers.map((usuario) => {

                const usuarioThesalus = Users.find((user) => user.id_infoUsuario === usuario.id)

                if (usuarioThesalus) {
                    return {
                        correo: usuarioThesalus.correo,
                        rol: usuarioThesalus.rol,
                        ...usuario,
                    }
                } else {
                    return {
                        ...usuario,
                    }
                }

            })

            state.Users = usuariosCompletos // Actualiza la lista de Users en el estado
            return usuariosCompletos
        },
    },

    actions: {

        async indexDBDatos() {
            console.log(usuarios)
            // const UsuariosIndexed = usuarios.map((profesion) => ({
            //     Profesion: {
            //         id: profesion.profession_id, 
            //         nombre: profesion.profession_name, 
            //         codigo: profesion.profession_code,
            //         // links: profesion._links
            //     }
            // }));

            // UsuariosIndexed.map((item) => {
            //     guardarEnDB(item)
            // })
        },
    }
});


