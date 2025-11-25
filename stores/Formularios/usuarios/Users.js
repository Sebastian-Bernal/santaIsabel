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
            User: {
                correo: '',
                rol: '',
                contraseña: ''
            }
        },
        Users: []
    }),

    getters: {
        async listUsers() {
            // const apiRest = useApiRest()

            // const admin = await apiRest.getData('InformacionUser', 'administradores')
            // console.log(admin)
            // return admin
        },
    },

    actions: {

        async indexDBDatos() {
            const apiRest = useApiRest()
            await apiRest.getData('InformacionUser', 'informacionUsers')
        },
        
    }
});


