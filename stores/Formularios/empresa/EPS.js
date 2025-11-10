import { useIndexedDBStore } from '~/stores/indexedDB';
import { traerdatosEPS } from '~/Core/Empresa/Datos/Eps/GETEps';
import { guardarEnDB } from '~/composables/Formulario/useIndexedDBManager';
// Creacion del store para registar eps

// Estructura de datos de eps
const estructuraDatosEPS = {
    EPS: {
        nombre: '',
        codigo: '',
        nit: '',
    }
}

// Pinia EPS
export const useDatosEPSStore = defineStore('DatosEPS', {
    state: () => ({
        Formulario: estructuraDatosEPS,
        Datos: JSON.parse(JSON.stringify(estructuraDatosEPS)), // estructura base compartida
        EPSs: []
    }),

    getters: {
        async listEPS(state) {
            const store = useIndexedDBStore()
            store.almacen = 'EPS'
            const EPS = await store.leerdatos()

            const EPSActivas = EPS.filter(p => p.estado === 1)
            state.EPSs = EPSActivas
            return EPSActivas
        },
    },

    actions: {

        async indexDBDatos() {
            const eps = await traerdatosEPS()
            const epsLocal = await this.listEPS

            // Crear un conjunto de IDs locales para comparación rápida
            const ids = new Set(
                epsLocal.map(data => data.id)
            );

            const EPSIndexed = eps?.map((data) => ({
                EPS: {
                    id: data.id, 
                    nombre: data.nombre, 
                    codigo: data.codigo,
                    nit: data.nit,
                    estado: data.estado,
                }
            }));

            // Filtrar los que no están en local
            const nuevasEPS = EPSIndexed.filter(item => {
                const key = item.EPS.id;
                return !ids.has(key);
            });

            // Guardar solo los nuevos
            nuevasEPS.forEach(item => {
                guardarEnDB(item);
            });
        },
    }
});