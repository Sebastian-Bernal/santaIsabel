import { useIndexedDBStore } from '@/stores/indexedDB.js';

export async function guardarEnIndexedDB(data) {
    const store = useIndexedDBStore();
    await store.initialize();

    for (const [almacen, contenido] of Object.entries(data)) {
        console.log(almacen, contenido)
        store.almacen = almacen;

        if(almacen === 'HistoriaClinica'){
            await store.guardardatos({ ...contenido, id: null })
        } else if (Array.isArray(contenido)) {
            for (const item of contenido) {
                await store.guardardatos({ ...item });
            }
        } else if (typeof contenido === 'object' && contenido !== null) {
            await store.guardardatos({ ...contenido });
        }
    }
};
