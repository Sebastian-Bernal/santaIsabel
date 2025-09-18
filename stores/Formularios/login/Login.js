import { defineStore } from "pinia";
import { createFormStore } from '../../createFormStore'

// Pinia Usuarios
export const useUsuariosStore = defineStore('Usuario', {
    state: () => ({
        Formulario: {
            Usuario: {
                correo: '',
                contraseña: '',
                codigo: '',
                empresa: ''
            },
        },
        Usuarios: [],
        Permisos: [],
    }),

    getters: {

    },

    actions: {
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraUsuario) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        },

        async getUsuario() {
            if (typeof window === 'undefined') {
                console.log('No estás en el navegador.');
                return 'Usuario';
            }

            const Usuario = sessionStorage.getItem('Nombre');
            if (!Usuario) return 'Usuario';

            return Usuario.split(' ')[0] + ' ' + Usuario.split(' ')[1];
        },

    }
});


