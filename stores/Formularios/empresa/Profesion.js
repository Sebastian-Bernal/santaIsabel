import { traerdatos } from '~/Core/Empresa/Datos/DatosProfesion';
import { guardarEnDB } from '~/composables/Formulario/useIndexedDBManager';

// Estructura de datos de Profesion
const estructuraDatosProfesion = {
    Profesion: {
        nombre: '',
        codigo: '',
        permisos: [],
    }
}

// Pinia Profesion
export const useDatosProfesionStore = defineStore('DatosProfesion', {
    state: () => ({
        Formulario: estructuraDatosProfesion,
        Datos: JSON.parse(JSON.stringify(estructuraDatosProfesion)), // estructura base compartida
        DatosProfesion: []
    }),

    getters: {
        async listProfesion(state) {
            const store = useIndexedDBStore()
            store.almacen = 'Profesion'
            const Notas = await store.leerdatos()

            state.Notas = Notas
            return Notas
        },
    },

    actions: {

        async indexDBDatos() {
            const profesiones = await traerdatos()

            const ProfesionesIndexed = profesiones.map((profesion) => ({
                Profesion: {
                    id: profesion.profession_id, 
                    nombre: profesion.profession_name, 
                    codigo: profesion.profession_code,
                    // links: profesion._links
                }
            }));

            ProfesionesIndexed.map((item) => {
                guardarEnDB(item)
            })
        },

    }
});