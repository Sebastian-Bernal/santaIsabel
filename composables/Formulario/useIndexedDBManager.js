import { useIndexedDBStore } from '@/stores/indexedDB.js';

// Funcion para guardar formularios en IndexedDB 
export async function guardarEnIndexedDB(data) {
    const store = useIndexedDBStore();
    await store.initialize();

    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;

        if(almacen === 'HistoriaClinica'){
            // Si el almacen es Historia Clinica se guarda con id Null
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

export async function guardarPacienteEnIndexedDB(data) {
    const store = useIndexedDBStore();
    await store.initialize();

    let idPaciente = null;
    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;
        // Guardar Paciente y obtener ID generado
        if (almacen === 'Paciente') {
            const idGenerado = await store.guardardatosID({ ...contenido });
            idPaciente = idGenerado; // Guardamos el ID para usar en otros almacenes
        }
        // Guardar otros datos relacionados (como diagnóstico, antecedentes, etc.)
        else if (Array.isArray(contenido)) {
            for (const item of contenido) {
                await store.guardardatos({
                    ...item,
                    id_paciente: idPaciente, // Relación con paciente
                });
            }
        } else if (typeof contenido === 'object' && contenido !== null) {
            await store.guardardatos({
                ...contenido,
                id_paciente: idPaciente, // Relación con paciente
            });
        }
    }
}

// Función para actualizar datos en IndexedDB
export async function actualizarEnIndexedDB(data) {
    const store = useIndexedDBStore();
    await store.initialize();

    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;

        if(almacen === 'HistoriaClinica'){
            // Si el almacen es Historia Clinica se guarda con id Null
            await store.actualiza({ ...contenido, id: null })
        } else if (Array.isArray(contenido)) {
            for (const item of contenido) {
                await store.actualiza({ ...item });
            }
        } else if (typeof contenido === 'object' && contenido !== null) {
            await store.actualiza({ ...contenido });
        }
    }
}
