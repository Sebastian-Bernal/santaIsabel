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

            state.Profesiones = Profesiones
            return Profesiones
        },
    },

    actions: {
        async listProfesiones() {
            const apiRest = useApiRest()
            const Profesiones = await apiRest.getData('Profesion', 'professions')

            return Profesiones
        },

        async listSecciones() {
            let permisos = await traerdatosSecciones()
            const mapa = {}

            permisos.forEach(({ id, nombre }) => {
                const [modulo, accion] = nombre.split('_')

                if (!mapa[modulo]) {
                mapa[modulo] = {
                    modulo,
                    acciones: []
                }
                }

                mapa[modulo].acciones.push({
                id,
                key: accion,
                nombre: `${modulo}_${accion}`
                })
            })

            return Object.values(mapa)
        },

        async traerPermisos(id) {
            let permisos = await traerdatosSecciones(id)

            return Object.values(permisos)
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