import { useIndexedDBStore } from '@/stores/indexedDB.js';

// Funcion para guardar formularios en IndexedDB 
export async function guardarEnIndexedDB(data) {
    const store = useIndexedDBStore();
    await store.initialize();

    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;
        console.log(almacen,contenido)
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
    let idUser = data.User.id ? data.User.id : null;

    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;

        // Guardar Usuario y obtener ID generado
        if (almacen === 'User' && idUser === null) {
            const idGeneradoUsuario = await store.guardardatosID({ ...contenido });
            idUser = idGeneradoUsuario; // Guardamos el ID para usar en otros almacenes
        }

        // Guardar Paciente y obtener ID generado
        if (almacen === 'Paciente') {
            const idGenerado = await store.guardardatosID({ ...contenido, id_usuario: idUser, });
            idPaciente = idGenerado; // Guardamos el ID para usar en otros almacenes
        }

        // Guardar otros datos relacionados (como diagnóstico, antecedentes, etc.)
        else if (Array.isArray(contenido) && almacen !== 'User') {
            for (const item of contenido) {
                await store.guardardatos({
                    ...item,
                    id_paciente: idPaciente, // Relación con paciente
                });
            }
        } else if (typeof contenido === 'object' && contenido !== null && almacen !== 'User') {
            await store.guardardatos({
                ...contenido,
                id_paciente: idPaciente, // Relación con paciente
            });
        }

    }
}

export async function guardarProfesionalEnIndexedDB(data) {
    const store = useIndexedDBStore();
    store.almacen = 'User'
    const usuarios = await store.leerdatos()

    // Buscar si el usuario ya existe
    const usuarioExistente = usuarios.find((usuario) => usuario.id === data.User.id);
    const rolCambio = usuarioExistente && usuarioExistente.rol !== data.User.rol;

    let idUser = data.User.id || null;

    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;

        // Guardar Usuario y obtener ID generado
        if (almacen === 'User') {
            if(rolCambio){
                await store.actualiza({...contenido});
            } else if(!usuarioExistente){
                const idGeneradoUsuario = await store.guardardatosID({ ...contenido });
                idUser = idGeneradoUsuario; // Guardamos el ID para usar en otros almacenes
            }
        } else if(almacen !== 'User'){
            await store.guardardatos({
                ...contenido,
                id_usuario: idUser, // Relación con usuario
            });
        }

    }
}

export async function guardarHistoriaEnIndexedDB(data) {
    const store = useIndexedDBStore();
    await store.initialize();

    let id_temporal = null;
    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;
        // Guardar Historia y obtener ID generado
        if (almacen === 'HistoriaClinica') {
            const idGenerado = await store.guardardatosID({ ...contenido });
            id_temporal = idGenerado; // Guardamos el ID para usar en otros almacenes
        }
        // Guardar otros datos relacionados (como diagnóstico, antecedentes, etc.)
        else if (Array.isArray(contenido)) {
            for (const item of contenido) {
                await store.guardardatos({
                    ...item,
                    id_temporal: id_temporal,
                });
            }
        } else if (typeof contenido === 'object' && contenido !== null) {
            await store.guardardatos({
                ...contenido,
                id_temporal: id_temporal,
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
