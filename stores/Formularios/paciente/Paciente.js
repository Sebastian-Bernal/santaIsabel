import { defineStore } from "pinia";
import { useIndexedDBStore } from "../../indexedDB";
import { validarYEnviarNuevoPaciente } from "~/Core/Usuarios/Paciente/POSTPaciente";
import { validarYEnviarModificarPaciente } from "~/Core/Usuarios/Paciente/PUTPaciente";
import { validarYEnviarEliminarPaciente } from "~/Core/Usuarios/Paciente/DELETEPaciente";
import { traerPacientes } from "~/Core/Usuarios/Paciente/GETPacientes";

// Pinia Pacientes
export const usePacientesStore = defineStore('Pacientes', {
    state: () => ({
        Pacientes: [],
        Formulario: {
            InformacionUser: {
                id: '',
                name: '',
                No_document: '',
                type_doc: '',
                celular: '',
                telefono: '',
                nacimiento: '',
                direccion: '',
                municipio: '',
                departamento: '',
                barrio: '',
                zona: '',
            },
            Paciente: {
                id_infoUsuario: '',
                sexo: '',
                genero: '',
                Eps: '',
                id_eps: '',
                regimen: '',
                vulnerabilidad: '',
                estado: 1,
            },
            Plan_manejo_procedimientos: [],
            Antecedentes: [],
        },
        PacienteSeleccionado: null,
    }),

    getters: {

    },
    
    actions: {
        // Funcion para CRUD Pacientes POST
        async guardarPaciente(datos) {
            return await validarYEnviarNuevoPaciente(datos);
        },

        // Funcion para CRUD Pacientes PUT
        async actualizarPaciente(datos){
            return await validarYEnviarModificarPaciente(datos);
        },

        // Funcion para CRUD Pacientes DELETE
        async eliminarPaciente(datos){
            return await validarYEnviarEliminarPaciente(datos);
        },

        // Funcion para listar Pacientes GET
        async listPacientes(online = true, filtrar) {
            const pacientes = await traerPacientes(online, filtrar)
            this.Pacientes = pacientes
            return pacientes
        },

        // Funcion para listar datos de un paciente en especifico
        async listDatos(id, Tabla) {
            // Traer datos de indexedDB
            const store = useIndexedDBStore()
            store.almacen = Tabla
            const datosTabla = await store.leerdatos()

            // Array que devuelve los datos filtrados por paciente
            const datos = datosTabla.filter((dato) => {
                return parseInt(dato.id_paciente) === parseInt(id)
            })

            return datos
        },

        async indexDBDatos() {

        },
    }
});


