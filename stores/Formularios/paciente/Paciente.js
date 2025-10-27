import { defineStore } from "pinia";
import { useIndexedDBStore } from "../../indexedDB";
import { useUsersStore } from "../usuarios/Users";
import { useDatosEPSStore } from "../empresa/EPS";
import { useCitasStore } from "../citas/Cita";
import { traerPacientes } from "~/Core/Usuarios/Paciente/GETPacientes";
import { guardarEnDB } from "~/composables/Formulario/useIndexedDBManager";
import { useMedicosStore } from "../profesional/Profesionales";
import { traerAntecedentes } from "~/Core/Usuarios/Paciente/GETAntecedentes";
import { useVarView } from "~/stores/varview";

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
                Regimen: '',
                poblacionVulnerable: '',
                estado: 'activo',
            },
            Diagnosticos: [],
            Antecedentes: [],
        }
    }),

    getters: {
        async listPacientes(state) {
            const varView = useVarView()
            const rol = varView.getRol

            if (rol === 'Profesional') {
                return await this.listPacientesAtendidos()
            }

            const store = useIndexedDBStore()
            const usersStore = useUsersStore()
            const epsStore = useDatosEPSStore()

            store.almacen = 'Paciente'
            const todosLosPacientes = await store.leerdatos()
            const pacientes = todosLosPacientes.filter(p => p.estado === 1)

            const usuarios = await usersStore.listUsers
            const EPSs = await epsStore.listEPS

            const mapaEPS = EPSs.reduce((acc, eps) => {
                acc[eps.id] = eps.nombre;
                return acc;
            }, {});

            // Asociar cada paciente con su usuario correspondiente
            const usuariosPacientes = pacientes.map((paciente) => {
                const usuario = usuarios.find((user) => user.id === paciente.id_usuario)

                if (usuario) {
                    return {
                        ...paciente,
                        ...usuario,
                        Eps: mapaEPS[paciente.id_eps] || paciente.Eps,
                        id_paciente: paciente.id, // renombramos el id del paciente
                        id_temporal: paciente.id_temporal,
                        id_temporalUsuario: usuario.id_temporal
                    }
                } else {
                    return {
                        ...paciente,
                        Eps: mapaEPS[paciente.id_eps] || paciente.Eps,
                        usuario: null
                    }
                }
            })

            state.Pacientes = usuariosPacientes
            return usuariosPacientes
        },

        async tablaPacientes() {
            const store = useIndexedDBStore()
            store.almacen = 'Paciente'
            const pacientes = await store.leerdatos()


            const pacientesActivos = pacientes.filter((paciente) => {
                return paciente.estado === 'activo'
            })

            return pacientesActivos
        },
    },

    actions: {

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

        async listPacientesAtendidos(filtrar = true) {
            const store = useIndexedDBStore()
            const usersStore = useUsersStore()
            const epsStore = useDatosEPSStore()
            const varView = useVarView()

            store.almacen = 'Paciente'
            const pacientes = await store.leerdatos()

            const usuarios = await usersStore.listUsers
            const EPSs = await epsStore.listEPS

            const mapaEPS = EPSs.reduce((acc, eps) => {
                acc[eps.id] = eps.nombre;
                return acc;
            }, {});

            let pacientesFiltrados = pacientes;

            const rol = varView.getRol
            if (rol === 'Profesional' && filtrar) {
                const citasStore = useCitasStore();
                const citas = await citasStore.listCitas();

                const usuario = varView.getUser;
                const idUsuario = usuario.id;
                const profesionalStore = useMedicosStore()
                const profesionales = await profesionalStore.listMedicos
                const idProfesional = profesionales.find(p => p.id_usuario === idUsuario)?.id_profesional

                const pacientesAtendidos = [
                    ...new Set(
                        citas
                            .filter(cita => cita.id_medico === idProfesional)
                            .map(cita => cita.id_paciente)
                    )
                ];

                pacientesFiltrados = pacientes.filter(paciente =>
                    pacientesAtendidos.includes(paciente.id)
                );
            }
            // Asociar cada paciente con su usuario correspondiente
            const usuariosPacientes = pacientesFiltrados.map((paciente) => {
                const usuario = usuarios.find((user) => user.id === paciente.id_usuario)

                if (usuario) {
                    return {
                        ...paciente,
                        ...usuario,
                        Eps: mapaEPS[paciente.id_eps] || paciente.Eps,
                        id_paciente: paciente.id // renombramos el id del paciente
                    }
                } else {
                    return {
                        ...paciente,
                        Eps: mapaEPS[paciente.id_eps] || paciente.Eps,
                        usuario: null
                    }
                }
            })

            this.Pacientes = usuariosPacientes
            return usuariosPacientes
        },

        async indexDBDatos() {
            const pacientes = await traerPacientes()
            const pacientesLocal = await this.listPacientes

            // Crear un conjunto de IDs locales para comparación rápida
            const idsLocales = new Set(
                pacientesLocal.map(p => `${p.id_paciente}-${p.id_usuario}`)
            );

            const pacientesIndexed = pacientes.map((data) => ({
                Paciente: {
                    id: data.id,
                    id_usuario: data.info_usuario.id,
                    id_eps: data.id_eps,
                    genero: data.genero,
                    sexo: data.sexo,
                    Regimen: data.regimen,
                    poblacionVulnerable: data.vulnerabilidad,
                    estado: data.estado,
                },
                InformacionUser: {
                    id: data.info_usuario.id,
                    name: data.info_usuario.name,
                    No_document: data.info_usuario.No_document,
                    type_doc: data.info_usuario.type_doc,
                    celular: data.info_usuario.celular,
                    telefono: data.info_usuario.telefono,
                    nacimiento: data.info_usuario.nacimiento,
                    direccion: data.info_usuario.direccion,
                    municipio: data.info_usuario.municipio,
                    departamento: data.info_usuario.departamento,
                    barrio: data.info_usuario.barrio,
                    zona: data.info_usuario.zona,
                    estado: data.info_usuario.estado,
                },
            }));

            // Filtrar los que no están en local
            const nuevosPacientes = pacientesIndexed.filter(item => {
                const key = `${item.Paciente.id}-${item.InformacionUser.id}`;
                return !idsLocales.has(key);
            });

            // Guardar solo los nuevos
            nuevosPacientes.forEach(item => {
                guardarEnDB(item);
            });

        },

        async indexDBDatosAntecedentes() {
            const antecedentes = await traerAntecedentes(); // Datos externos

            const store = useIndexedDBStore()
            store.almacen = 'Antecedentes'
            const antecedentesLocal = await store.leerdatos() // Datos locales

            // Crear un conjunto de claves únicas para comparación rápida
            const clavesLocales = new Set(
                antecedentesLocal.map(a => a.id)
            );

            // Filtrar antecedentes que no estén en local
            const nuevosAntecedentes = antecedentes?.filter(a => {
                const clave = a.id;
                return !clavesLocales.has(clave);
            });

            // Guardar solo los nuevos antecedentes
            nuevosAntecedentes.forEach(a => {
                const datosaGuardar = {
                    Antecedentes: {
                        id: a.id,
                        tipo: a.tipo,
                        descripcion: a.descripcion,
                        id_paciente: a.id_paciente,
                    } 
                }
                guardarEnDB(datosaGuardar);
            });
        }
    }
});


