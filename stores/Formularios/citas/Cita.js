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
        Citas: []
    }),

    getters: {
    },

    actions: {

        async obtenerCitas(key, fetchFn) {
            const indexedDB = useIndexedDBStore()

            // Buscar en IndexedDB primero
            let citas = await indexedDB.getData(key)

            if (citas && citas.length > 0) {
                // indexedDB.almacen = 'Cita'
                // const keys = await indexedDB.leerdatos()
                // const mapa = new Map()

                // for (const c of citas) {
                //     mapa.set(c.id, c)
                // }

                // for (const k of keys) {
                //     for (const c of k.citas) {
                //         mapa.set(c.id, c) // si ya existe, se sobrescribe y no se duplica
                //     }
                // }

                // const todas = Array.from(mapa.values())
                // for(const k of keys){
                //     citas.push(...k.citas)
                // }
                this.Citas = await this.filtrarPorRol(citas)
                return this.Citas
            }

            // Si no hay datos locales, llamar online
            citas = await fetchFn()

            this.Citas = await this.filtrarPorRol(citas)
            await indexedDB.setData(key, citas)

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
            const key = `Cita:hoy`
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

        async citasPaginada(pagina, por_pagina) {
            const key = `Cita:pagina:${pagina}:${por_pagina}`
            return await this.obtenerCitas.call(this, key, () => traerCitasPaginadas(pagina, por_pagina))
        },

        async citasFiltradas(filtros) {
            const key = `Cita:filtros:${JSON.stringify(filtros)}`
            return await this.obtenerCitas.call(this, key, () => traerCitasFiltradas(filtros))
        },

        async filtrarPorRol(citas) {
            const varView = useVarView()
            // Filtrar por medico si el rol es Profesional
            const rol = varView.getRol;
            const citasFiltradas = citas
            if (rol === 'Profesional') {
                const idUsuario = varView.getUser.id;
                const profesionalStore = useMedicosStore()
                const profesionales = await profesionalStore.listMedicos()
                const idProfesional = profesionales.find(p => p.id_infoUsuario === idUsuario)?.id_profesional

                citas = citas.filter(cita => {
                    return cita.id_medico === idProfesional
                });
            }
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

