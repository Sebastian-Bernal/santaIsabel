import { traerNotas } from '~/Core/Historial/Notas/GETNotas';
import { useIndexedDBStore } from '~/stores/indexedDB';
import { guardarEnDB } from '~/composables/Formulario/useIndexedDBManager';

// Pinia NotasClinicas
export const useNotasStore = defineStore('Notas', {
    state: () => ({
        Formulario: {
            Nota: {
                fecha_nota: '',
                hora_nota: '',
                id_paciente: '',
                name_paciente: '',
                No_document_paciente: '',
                direccion: '',
                id_profesional: '',
                name_profesional: '',
                nota: '',
            },
        },
        Notas: [],

    }),

    getters: {
        async listNotas(state) {
            const store = useIndexedDBStore()
            store.almacen = 'Nota'
            const Notas = await store.leerdatos()

            state.Notas = Notas
            return Notas
        },
    },

    actions: {
        async indexDBDatos() {
            const notas = await traerNotas()
            const notasLocal = await this.listNotas

            // Crear un conjunto de IDs locales para comparación rápida
            const ids = new Set(
                notasLocal.map(data => data.id)
            );

            const notasIndexed = notas.map((data) => ({
                Nota: {
                    id: data.id,
                    id_paciente: data.id_paciente,
                    id_profesional: data.id_profesional,
                    direccion: data.direccion,
                    fecha_nota: data.fecha_nota,
                    hora_nota: data.hora_nota,
                    nota: data.nota,
                    tipoAnalisis: data.tipoAnalisis,
                },
            }));

            // Filtrar los que no están en local
            const nuevasNotas = notasIndexed.filter(item => {
                const key = item.Nota.id;
                return !ids.has(key);
            });

            // Guardar solo los nuevos
            nuevasNotas.forEach(item => {
                guardarEnDB(item);
            });
        },
    }
});