import { traerCitasFiltradas, traerCitasHoy, traerCitasPaginadas, traerCitasPorRango } from "~/Core/Usuarios/Cita/GETCita";
import { useMedicosStore } from "../profesional/Profesionales";

// Estructura de datos de Citas
const estructuraCita = {
    Cita: {
        id: '',
        fecha: '',
        servicio: '',
        id_servicio: '',
        motivo: '',
        hora: '',
        id_paciente: '',
        name_paciente: '',
        id_medico: '',
        name_medico: '',
        estado: 'Inactiva',
        intervaloCitas: '',
        cantidadCitas: '',
        fechaHasta: '',
    },
    Plan_manejo_procedimientos: []
}

// Pinia Citas
export const useCitasStore = defineStore('Citas', {
    state: () => ({
        Formulario: estructuraCita,
        Cita: JSON.parse(JSON.stringify(estructuraCita)), // estructura base compartida
        Citas: [],
        contexto: '',
        ultimo_id: 1,
        mesCitaGuardada: 0,
    }),

    getters: {
    },

    actions: {

        async obtenerCitas(key, fetchFn) {
            const indexedDB = useIndexedDBStore()
            const apiRest = useApiRest()

            // Buscar en IndexedDB primero
            let keyCita = await indexedDB.getData(key)

            if (keyCita) {
                indexedDB.almacen = 'Cita'
                let citas = await indexedDB.leerdatos()
                this.Citas = await this.filtrarPorRol(citas)
                return this.Citas
            }

            // Si no hay datos locales, llamar online
            let citas = await fetchFn()

            // ── CONTEXTO TABLA: filtrar duplicados y acumular ──────────────────
            if (this.contexto === 'Tabla') {
                const idsActuales = new Set(this.Citas.map(c => c.id))
                citas = citas.filter(c => !idsActuales.has(c.id))  // solo las nuevas

                citas = await this.filtrarPorRol(citas)
                await apiRest.postOfflineData('KeyCitas', [{ key }])
                await apiRest.postOfflineData('Cita', citas)        // guarda solo las nuevas

                this.Citas = [...this.Citas, ...citas]              // acumula sobre las existentes
                return this.Citas
            }

            citas = await this.filtrarPorRol(citas)
            await apiRest.postOfflineData('KeyCitas', [{ key: key }])
            await apiRest.postOfflineData('Cita', citas)

            this.Citas = citas
            return this.Citas
        },

        async listCitas(online = true) {
            const apiRest = useApiRest()

            let citas = []
            if (online) {
                citas = await apiRest.getData('Cita', 'citas')
            } else {
                const store = useIndexedDBStore()
                store.almacen = 'Cita'
                citas = await store.leerdatos()
            }

            citas = await this.filtrarPorRol(citas)

            this.Citas = citas;
            return citas;
        },

        async citasHoy(online, cambio) {
            const key = cambio ? `Cita:cambio:${Date.now()}` : `Cita:hoy`
            
            if(cambio) {
                return await this.obtenerCitas.call(this, key, () => traerCitasPorRango(this.mesCitaGuardada, this.mesCitaGuardada))
            }
            if (online || cambio) {
                return await this.obtenerCitas.call(this, key, () => traerCitasHoy())
            }
            return await this.obtenerCitas.call(this, key, async () => {
                const apiRest = useApiRest()
                return await apiRest.getOfflineData('Cita')
            })
        },

        async citasPorRango(inicio, fin) {
            const key = `Cita:rango:${inicio}:${fin}`
            return await this.obtenerCitas.call(this, key, () => traerCitasPorRango(inicio, fin))
        },

        async citasPaginada(datos, por_pagina) {
            this.contexto = 'Tabla'

            const ultimo_id = datos.length > 0
                ? Math.max(...datos.map(c => c.id))
                : 0
            const key = `Cita:cursor:${ultimo_id}`
            return await this.obtenerCitas.call(this, key, () => traerCitasPaginadas(ultimo_id, por_pagina))
        },

        async citasFiltradas(filtros) {
            this.contexto = 'Filtrar'
            const key = `Cita:filtros:${JSON.stringify(filtros)}`
            return await this.obtenerCitas.call(this, key, () => traerCitasFiltradas(filtros))
        },

        async filtrarPorRol(citas) {
            const varView = useVarView()
            // Filtrar por medico si el rol es Profesional
            const rol = varView.getRol;

            let citasFiltradas = citas
            if (rol === 'Profesional') {
                const idUsuario = varView.getUser.id;
                const profesionalStore = useMedicosStore()
                const profesionales = await profesionalStore.listMedicos()
                const idProfesional = profesionales.find(p => p.id_infoUsuario === idUsuario)?.id_profesional

                citas = citas.filter(cita => {
                    return cita.id_medico === idProfesional
                });
            }

            citasFiltradas = citasFiltradas.sort((a, b) => {
                const fechaA = new Date(`${a.fecha}T${a.hora}`);
                const fechaB = new Date(`${b.fecha}T${b.hora}`);
                return fechaB - fechaA;
            });
            return citasFiltradas
        },

        async listCitasHoy() {
            const apiRest = useApiRest()
            let citas = await apiRest.getData('Cita', 'citas')

            let citasPendientes = citas.filter(cita => cita.estado === "Inactiva");

            // Ordenar por hora
            citasPendientes = citasPendientes.sort((a, b) => {
                const fechaA = new Date(`${a.fecha}T${a.hora}`);
                const fechaB = new Date(`${b.fecha}T${b.hora}`);
                return fechaA - fechaB;
            }).slice(0, 3);

            this.Citas = citasPendientes;
            return citasPendientes;
        },


        borrarFormulario() {
            this.Formulario = estructuraCita
        },

        async indexDBDatos() {
            const api = useApiRest()
            await api.getData('Cita', 'citas')
        },

    }
});

