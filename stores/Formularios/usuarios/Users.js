import { defineStore } from "pinia";
import { useIndexedDBStore } from "../../indexedDB";

// Pinia Users
export const useUsersStore = defineStore('Users', {
    state: () => ({
        Formulario: {
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

            store.almacen = 'InformacionUser'
            const informacionUsers = await store.leerdatos()

            state.Users = informacionUsers // Actualiza la lista de Users en el estado
            return informacionUsers
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


