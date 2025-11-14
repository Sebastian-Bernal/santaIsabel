import { traerdatosProfesion } from '~/Core/Empresa/Datos/Profesion/GETProfesion';
import { traerdatosSecciones } from '~/Core/Empresa/Datos/Profesion/GETSecciones';
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
        Profesiones: []
    }),

    getters: {
        async listProfesion(state) {
            const apiRest = useApiRest()
            const Profesiones = await apiRest.getData('Profesion', 'professions')
            console.log(Profesiones)
            // const store = useIndexedDBStore()
            // store.almacen = 'Profesion'
            // const Profesiones = await store.leerdatos()

            state.Profesiones = Profesiones
            return Profesiones
        },
    },

    actions: {

        async listSecciones() {
            let secciones = await traerdatosSecciones()

            secciones = [...new Set(
                secciones.map((seccion) => seccion.nombre.split('_')[0])
            )];
            const permisos = []
            secciones.map((s) => permisos.push(s))
            
            return permisos
        },

        async indexDBDatos() {
            const profesiones = await traerdatosProfesion()
            const profesionesLocal = await this.listProfesion

            // Crear un conjunto de IDs locales para comparación rápida
            const ids = new Set(
                profesionesLocal.map(data => data.id)
            );

            const ProfesionesIndexed = profesiones.map((profesion) => ({
                Profesion: {
                    id: profesion.id, 
                    nombre: profesion.nombre, 
                    codigo: profesion.codigo,
                }
            }));

            // Filtrar los que no están en local
            const nuevasProfesiones = ProfesionesIndexed.filter(item => {
                const key = item.Profesion.id;
                return !ids.has(key);
            });

            // Guardar solo los nuevos
            nuevasProfesiones.forEach(item => {
                guardarEnDB(item);
            });
        },

    }
});