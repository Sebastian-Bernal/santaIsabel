import { useIndexedDBStore } from '@/stores/indexedDB.js';

export async function guardarEnIndexedDB(data) {
    const store = useIndexedDBStore();
    await store.initialize();

    const guardarConAlmacen = async (almacen, datos) => {
        store.almacen = almacen;
        if (Array.isArray(datos)) {
            for (const item of datos) {
                await store.guardardatos({ ...item });
            }
        } else {
            await store.guardardatos({ ...datos });
        }
    };

    await guardarConAlmacen('Paciente', data.Paciente);
    await guardarConAlmacen('Diagnosticos', data.Diagnosticos);
    await guardarConAlmacen('Antecedentes', data.Antecedentes);
    await guardarConAlmacen('Enfermedad', data.Enfermedad);
    await guardarConAlmacen('HistoriaClinica', { ...data.HistoriaClinica, id: null });
    await guardarConAlmacen('ExamenFisico', data.examenFisico);
    await guardarConAlmacen('AnalisisTratamiento', data.AnalisisTratamiento);

    await guardarConAlmacen('Plan_manejo_medicamentos', data.Plan_manejo_medicamentos?.map(m => ({ ...m, id: generarId() })) || []);
    await guardarConAlmacen('Plan_manejo_procedimientos', data.Plan_manejo_procedimietos?.map(p => ({ ...p, id: generarId() })) || []);
}

function generarId() {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
}