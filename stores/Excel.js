import { defineStore } from "pinia";
import { useIndexedDBStore } from "~/stores/indexedDB";
import { usePacientesStore } from "./Formularios/paciente/Paciente";

// Store para loader
export const useExcelExport = defineStore('exportExcel', {
    state: () => ({
        cargando: false,
    }),
    actions: {
        async obtenerPacientes(datos) {
            const pacientesStore = usePacientesStore();
            const pacientes = await pacientesStore.listPacientes

            // Mapear cada dato y agregarle los datos del paciente correspondiente
            const datosCombinados = datos.map(dato => {
                const paciente = pacientes.find(pac => pac.id === dato.id);
                return paciente ? { ...dato, ...paciente } : dato; // Añade info del paciente si se encuentra
            });

            return datosCombinados;
        },

        async obtenerTabla(datos, tabla, id_comparar, id_compararTabla) {
            const storeIndexDB = useIndexedDBStore();
            storeIndexDB.almacen = tabla;
            const tablaAtraer = await storeIndexDB.leerdatos();

            // Mapear cada dato y agregarle los datos de la tabla correspondiente
            const datosCombinados = datos.map(dato => {
                const row = tablaAtraer.find(fila => fila[id_compararTabla] === dato[id_comparar]);
                return row ? { ...dato, ...row } : dato; // Añade info de la tabla si se encuentra
            });

            return datosCombinados;
        },

        async obtenerCamposTabla(tabla) {
            const storeIndexDB = useIndexedDBStore();
            storeIndexDB.almacen = tabla;
            const tablaAtraer = await storeIndexDB.leerdatos();
            console.log(tablaAtraer)
            const datos = Object.keys(tablaAtraer[0])
            console.log(datos)
            const datosOptionsTabla = datos.map((dato) => {
                return {text: dato, value: dato}
            })
            return datosOptionsTabla;
        },
    }
})
