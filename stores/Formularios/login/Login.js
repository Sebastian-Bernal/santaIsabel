import { defineStore } from "pinia";
import { createFormStore } from '../../createFormStore'
// Creacion del store Usuario

// Estructura de datos de Usuarios
const estructuraUsuario = {
    Usuario: {
        correo: '',
        contraseña: '',
        estado: 'activo',
    },

}

// Pinia Usuarios
export const useUsuariosStore = defineStore('Usuario', {
    state: () => ({
        Usuario: JSON.parse(JSON.stringify(estructuraUsuario)), // estructura base compartida
        Usuarios: []
    }),

    getters: {
        getUsuario(state) {
            if (typeof window === 'undefined') {
                console.warn('No estás en el navegador.');
                return 'Usuario por defecto';
            }

            const Usuario = sessionStorage.getItem('Usuario');
            if (!Usuario) return 'Usuario por defecto';

            state.Usuarios = Usuario;
            return Usuario;

        },
    },

    actions: {
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraUsuario) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        },

    }
});


