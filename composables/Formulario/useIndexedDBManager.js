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
            if (almacen === "HistoriaClinica") {
                const historias = await store.leerdatos();
                const existente = historias.find(h => h.id_paciente === contenido.id_paciente);

                ids.HistoriaClinica = existente
                    ? existente.id_temporal
                    : await store.guardardatosID({ ...contenido });
            } else if (almacen === "Analisis") {
                if (!ids.HistoriaClinica) {
                    store.almacen = 'HistoriaClinica'
                    const historias = await store.leerdatos();
                    const existente = historias.find(h => h.id_paciente === data.HistoriaClinica.id_paciente);

                    ids.HistoriaClinica = existente
                        ? existente.id_temporal
                        : await store.guardardatosID({ ...data.HistoriaClinica });

                    store.almacen = almacen
                }

                ids.Analisis = await store.guardardatosID({ ...contenido, id_historia: ids.HistoriaClinica });
            } else if (almacen === "Cita") {
                await store.actualiza({ ...contenido, id_analisis: ids.Analisis, estado: "Realizada" });
            } else {
                await guardarRelacionado(store, almacen, contenido, "id_temporal", ids.Analisis);
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
