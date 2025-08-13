import { useIndexedDBStore } from '@/stores/indexedDB.js';

// Funcion para guardar formularios en IndexedDB 
export async function guardarEnIndexedDB(data) {
    const store = useIndexedDBStore();
    await store.initialize();

    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;
        console.log(almacen, contenido)
        if (almacen === 'HistoriaClinica') {
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

        if (almacen === 'InformacionUser') {
            await store.guardardatos({ ...contenido, id_usuario: idUser, });
        }

        // Guardar Paciente y obtener ID generado
        if (almacen === 'Paciente') {
            const idGenerado = await store.guardardatosID({ ...contenido, id_usuario: idUser, });
            idPaciente = idGenerado; // Guardamos el ID para usar en otros almacenes
        }

        // Guardar otros datos relacionados (como diagnóstico, antecedentes, etc.)
        else if (Array.isArray(contenido) && almacen !== 'User' && almacen !== 'InformacionUser') {
            for (const item of contenido) {
                await store.guardardatos({
                    ...item,
                    id_paciente: idPaciente, // Relación con paciente
                });
            }
        } else if (typeof contenido === 'object' && contenido !== null && almacen !== 'User' && almacen !== 'InformacionUser') {
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
            if (rolCambio) {
                await store.actualiza({ ...contenido });
            } else if (!usuarioExistente) {
                const idGeneradoUsuario = await store.guardardatosID({ ...contenido });
                idUser = idGeneradoUsuario; // Guardamos el ID para usar en otros almacenes
            }
        } else if (almacen !== 'User') {
            await store.guardardatos({
                ...contenido,
                id_usuario: idUser, // Relación con usuario
            });
        }

    }
}

export async function guardarEnIndexedDBID(data) {
    const store = useIndexedDBStore();
    let idGenerado
    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;

        if (Array.isArray(contenido)) {
            for (const item of contenido) {
                await store.guardardatosID({ ...item });
            }
        } else if (typeof contenido === 'object' && contenido !== null) {
            idGenerado = await store.guardardatosID({ ...contenido });
        }
    }
    return idGenerado
}

export async function guardarUsuarioEnIndexedDBID(data) {
    const store = useIndexedDBStore();
    let idUsuario
    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;

        if (almacen === 'User') {
            idUsuario = await store.guardardatosID({ ...contenido });
        }

        if (typeof contenido === 'object' && contenido !== null && almacen !== 'User') {
            await store.guardardatos({ ...contenido, id_usuario: idUsuario });
        }
    }

    return idUsuario
}

export async function guardarHistoriaEnIndexedDB(data) {
    const store = useIndexedDBStore();
    await store.initialize();

    // Buscar si ya existe la historia clínica
    store.almacen = 'HistoriaClinica';
    const historias = await store.leerdatos();

    const historiaExistente = historias.find(
        (historia) => historia.id_paciente === data.HistoriaClinica.id_paciente
    );

    let historiaID;

    if (!historiaExistente) {
        // Crear nueva historia clínica si no existe
        historiaID = await store.guardardatosID({ ...data.HistoriaClinica });
    } else {
        // Usar el ID de la historia existente
        historiaID = historiaExistente.id_temporal;
    }

    let id_temporal = null;
    let id_examen = null;
    // Guardar los demás datos relacionados
    for (const [almacen, contenido] of Object.entries(data)) {
        if (almacen === 'HistoriaClinica') continue; // Ya procesado

        store.almacen = almacen;

        if (almacen === 'Analisis') {
            const idGenerado = await store.guardardatosID({
                ...contenido,
                id_historia: historiaID,
            });
            id_temporal = idGenerado;
        } else if (almacen === 'Cita') {
            await store.actualiza({
                ...contenido,
                id_analisis: id_temporal,
                id_examen,
                estado: 'Realizada'
            })
        } else if (Array.isArray(contenido)) {
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

        if (almacen === 'HistoriaClinica') {
            // Si el almacen es Historia Clinica se guarda con id Null
            await store.actualiza({ ...contenido, id: null })
        } else if (Array.isArray(contenido)) {
            for (const item of contenido) {
                await store.actualiza({ ...item });
            }
        } else if (typeof contenido === 'object' && contenido !== null) {
            console.log(almacen, contenido)
            await store.actualiza({ ...contenido });
        }
    }
}
