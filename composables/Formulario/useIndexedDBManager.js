import { useIndexedDBStore } from '@/stores/indexedDB.js';

export async function guardarEnDB(data, contexto = "Generico", config = {}) {
    const store = useIndexedDBStore();
    await store.initialize();

    let ids = {}; // Para guardar IDs generados dinámicamente (User, Paciente, Historia, etc.)

    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;

        // ==== Reglas por contexto ====
        if (contexto === "Paciente") {

            if (almacen === "InformacionUser") {
                if (!contenido.id) {
                    ids.User = await store.guardardatosID({ ...contenido, estado: 1 });
                } else {
                    ids.User = contenido.id;
                }
            } else if (almacen === "Paciente") {
                ids.Paciente = await store.guardardatosID({ ...contenido, id_usuario: ids.User });
            } else {
                await guardarRelacionado(store, almacen, contenido, "id_paciente", ids.Paciente);
            }

        }

        else if (contexto === "Profesional") {
            if (almacen === "InformacionUser") {
                if (!contenido.id) {
                    ids.User = await store.guardardatosID({ ...contenido, estado: 1 });
                } else {
                    ids.User = contenido.id;
                }
            } else if (almacen === "Profesional") {
                ids.Profesional = await store.guardardatosID({ ...contenido, id_usuario: ids.User });
            } else {

            }
        }

        else if (contexto === "HistoriaClinica") {
            if (contexto === "HistoriaClinica") {
                switch (almacen) {
                    case 'HistoriaClinica': {
                        store.almacen = 'HistoriaClinica';
                        const historias = await store.leerdatos();
                        const historiaExistente = historias.find(h => h.id_paciente === contenido.id_paciente);

                        ids.HistoriaClinica = historiaExistente
                            ? historiaExistente.id_temporal
                            : await store.guardardatosID({ ...contenido, sincronizado: 0 });
                        break;
                    }

                    case 'Analisis': {
                        store.almacen = 'Analisis';

                        if (!ids.HistoriaClinica) {
                            // Asegurar que HistoriaClinica esté guardada antes de Analisis
                            const historias = await store.leerdatos();
                            const historiaExistente = historias.find(h => h.id_paciente === data.HistoriaClinica.id_paciente);

                            ids.HistoriaClinica = historiaExistente
                                ? historiaExistente.id_temporal
                                : await store.guardardatosID({ ...data.HistoriaClinica, sincronizado: 0 });
                        }

                        const analisisData = {
                            ...contenido,
                            id_historia: ids.HistoriaClinica,
                            sincronizado: 0
                        };
                        ids.Analisis = await store.guardardatosID(analisisData);
                        break;
                    }

                    case 'Diagnosticos': {
                        store.almacen = 'Diagnosticos';
                        ids.Diagnosticos = [];

                        for (const diagnostico of contenido ?? []) {
                            const nuevo = await store.guardardatosID({
                                ...diagnostico,
                                id_analisis: ids.Analisis,
                                sincronizado: 0
                            });
                            ids.Diagnosticos.push(nuevo);
                        }
                        break;
                    }

                    case 'Antecedentes': {
                        store.almacen = 'Antecedentes';
                        ids.Antecedentes = [];

                        for (const antecedente of contenido ?? []) {
                            const nuevo = await store.guardardatosID({ ...antecedente, sincronizado: 0 });
                            ids.Antecedentes.push(nuevo);
                        }
                        break;
                    }

                    case 'Enfermedad': {
                        if (contenido && Object.values(contenido).some(v => v)) {
                            store.almacen = 'Enfermedad';
                            const enfermedad = await store.guardardatosID({
                                ...contenido,
                                id_analisis: ids.Analisis,
                                sincronizado: 0
                            });
                            ids.Enfermedad = enfermedad;
                        }
                        break;
                    }

                    case 'ExamenFisico': {
                        if (contenido && Object.values(contenido).some(v => v)) {
                            store.almacen = 'ExamenFisico';
                            const signos = contenido.signosVitales ?? {};

                            const examenFisico = await store.guardardatosID({
                                Peso: contenido.Peso,
                                altura: contenido.altura,
                                otros: contenido.otros,
                                id_analisis: ids.Analisis,
                                signosVitales: signos,
                                sincronizado: 0
                            });
                            ids.ExamenFisico = examenFisico;
                        }
                        break;
                    }

                    case 'Cita': {
                        if (Object.keys(contenido).length > 0) {
                            store.almacen = 'Cita';
                            await store.actualiza({
                                ...contenido,
                                id_analisis: ids.Analisis,
                                estado: 'Realizada',
                                sincronizado: 0
                            });
                        }
                        break;
                    }

                    case 'Plan_manejo_medicamentos':
                    case 'Plan_manejo_procedimientos':
                    case 'Plan_manejo_insumos':
                    case 'Plan_manejo_equipos': {
                        if (Array.isArray(contenido) && contenido.length > 0) {
                            store.almacen = almacen;
                            ids[almacen] = [];

                            for (const item of contenido) {
                                const nuevo = await store.guardardatosID({
                                    ...item,
                                    id_analisis: ids.Analisis,
                                    sincronizado: 0
                                });
                                ids[almacen].push(nuevo);
                            }
                        }
                        break;
                    }

                    default:
                        // Si hay otros tipos de datos que no aplican, puedes ignorarlos aquí
                        break;
                }
            }
        }

        else {
            // Contexto Generico
            if (Array.isArray(contenido)) {
                for (const item of contenido) await store.guardardatosID({ ...item });
            } else if (typeof contenido === "object" && contenido !== null) {
                ids.data = await store.guardardatosID({ ...contenido });
            }
        }
    }

    return ids;
}

// Helper para guardar arrays u objetos con relación
async function guardarRelacionado(store, almacen, contenido, foreignKey, foreignValue) {
    if (Array.isArray(contenido)) {
        for (const item of contenido) {
            await store.guardardatos({ ...item, [foreignKey]: foreignValue });
        }
    } else if (typeof contenido === "object" && contenido !== null) {
        await store.guardardatos({ ...contenido, [foreignKey]: foreignValue });
    }
}

export async function getAll(url) {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const token = sessionStorage.getItem('token')

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'GET',
                url: url,
                token: token
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                return respuesta.data
            }
        } catch (error) {
            console.error('Fallo al traer datos', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.texto = 'en desarrollo'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return false
    }
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

// Función para actualizar datos en IndexedDB
export async function actualizarEnIndexedDB(data) {
    const store = useIndexedDBStore();
    await store.initialize();
    console.log(data)
    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;

        if (Array.isArray(contenido)) {
            for (const item of contenido) {
                await store.actualiza({ ...item });
            }
        } else if (typeof contenido === 'object' && contenido !== null) {
            console.log(almacen, contenido)
            await store.actualiza({ ...contenido });
        }
    }
}

export const guardarHistoriaLocal = async (store, data) => {
    const ids = {};

    // 1️⃣ Historia Clínica
    store.almacen = 'HistoriaClinica';
    const historias = await store.leerdatos();
    const historiaExistente = historias.find(h => h.id_paciente === data.HistoriaClinica.id_paciente);

    ids.HistoriaClinica = historiaExistente
        ? historiaExistente.id_temporal
        : await store.guardardatosID({ ...data.HistoriaClinica });

    // 2️⃣ Análisis
    store.almacen = 'Analisis';
    const analisisData = {
        ...data.Analisis,
        id_historia: ids.HistoriaClinica
    };
    ids.Analisis = await store.guardardatosID(analisisData);

    // 3️⃣ Diagnósticos
    store.almacen = 'Diagnosticos';
    ids.Diagnosticos = [];
    for (const diagnostico of data.Diagnosticos ?? []) {
        const nuevo = await store.guardardatosID({
            ...diagnostico,
            id_analisis: ids.Analisis
        });
        ids.Diagnosticos.push(nuevo);
    }

    // 4️⃣ Antecedentes
    store.almacen = 'Antecedentes';
    ids.Antecedentes = [];
    for (const antecedente of data.Antecedentes ?? []) {
        const nuevo = await store.guardardatosID({ ...antecedente });
        ids.Antecedentes.push(nuevo);
    }

    // 5️⃣ Enfermedad
    if (data.Enfermedad && Object.values(data.Enfermedad).some(v => v)) {
        store.almacen = 'Enfermedad';
        const enfermedad = await store.guardardatosID({
            ...data.Enfermedad,
            id_analisis: ids.Analisis
        });
        ids.Enfermedad = enfermedad;
    }

    // 6️⃣ Examen Físico
    if (data.ExamenFisico && Object.values(data.ExamenFisico).some(v => v)) {
        store.almacen = 'ExamenFisico';
        const examen = data.ExamenFisico;
        const signos = examen.signosVitales ?? {};

        const examenFisico = await store.guardardatosID({
            Peso: examen.Peso,
            altura: examen.altura,
            otros: examen.otros,
            id_analisis: ids.Analisis,
            signosVitales: signos
        });
        ids.ExamenFisico = examenFisico;
    }

    // 7️⃣ Planes de manejo
    const planes = {
        Plan_manejo_medicamentos: 'Plan_manejo_medicamentos',
        Plan_manejo_procedimientos: 'Plan_manejo_procedimientos',
        Plan_manejo_insumos: 'Plan_manejo_insumos',
        Plan_manejo_equipos: 'Plan_manejo_equipos'
    };

    for (const [key, almacen] of Object.entries(planes)) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
            store.almacen = almacen;
            ids[key] = [];
            for (const item of data[key]) {
                const nuevo = await store.guardardatosID({
                    ...item,
                    id_analisis: ids.Analisis
                });
                ids[key].push(nuevo);
            }
        }
    }

    // 8️⃣ Cita
    if (data.Cita && Object.keys(data.Cita).length > 0) {
        store.almacen = 'Cita';
        await store.actualiza({
            ...data.Cita,
            id_analisis: ids.Analisis,
            estado: 'Realizada'
        });
    }

    return ids;
};
