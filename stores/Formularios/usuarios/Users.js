import { defineStore } from "pinia";
import { createFormStore } from '../../createFormStore'
import { useIndexedDBStore } from "../../indexedDB";
// Creacion del store User

// Estructura de datos de Users
const estructuraUser = {
    User: {
        id_empresa: '',
        name: '',
        No_document: '',
        tipo: '',
        celular: '',
        telefono: '',
        correo: '',
        contraseña: '',
        rol: '',
        nacimiento: '',
        direccion: '',
        municipio: '',
        departamento: '',
        barrio: '',
        zona: '',
        estado: 'activo',
    },
}

// Pinia Users
export const useUsersStore = defineStore('Users', {
    state: () => ({
        User: JSON.parse(JSON.stringify(estructuraUser)), // estructura base compartida
        Users: []
    }),

    getters: {
        async listUsers(state) {
            const store = useIndexedDBStore()
            store.almacen = 'User'
            const Users = await store.leerdatos()
            const UsersActivos = Users.filter((User) => {
                return User.estado === 'activo'
            })
            state.Users = UsersActivos // Actualiza la lista de Users en el estado
            return UsersActivos
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


