import { defineStore } from "pinia";

// Pinia Usuario
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


