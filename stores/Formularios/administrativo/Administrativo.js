import { defineStore } from "pinia";
import { createFormStore } from '../../createFormStore'
import { useIndexedDBStore } from "../../indexedDB";
// Creacion del store Administrativo

// Estructura de datos de Administrativos
const estructuraAdministrativo = {
    Administrativo: {
        name: '',
        No_document: '',
        celular: '',
        telefono: '',
        Tipo: '',
        correo: '',
        contraseña: '',
        estado: 'activo',
    },
}

// Pinia Administrativos
export const useAdministrativosStore = defineStore('Administrativos', {
    state: () => ({
        Administrativo: JSON.parse(JSON.stringify(estructuraAdministrativo)), // estructura base compartida
        Administrativos: []
    }),

    getters: {
        async listAdministrativos(state) {
            const store = useIndexedDBStore()
            store.almacen = 'Administrativo'
            const Administrativos = await store.leerdatos()
            const AdministrativosActivos = Administrativos.filter((Administrativo) => {
                return Administrativo.estado === 'activo'
            })
            state.Administrativos = AdministrativosActivos // Actualiza la lista de Administrativos en el estado
            return AdministrativosActivos
        },
    },

    actions: {
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraAdministrativo) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        },

    }
});


