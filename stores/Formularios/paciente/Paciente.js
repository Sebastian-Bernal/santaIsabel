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
import { traerProfesionales } from "~/Core/Usuarios/Profesional/GETProfesionales";

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
                estado: 1,
            },
            Diagnosticos: [],
            Antecedentes: [],
        }
    }),

    getters: {
        
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

        async listPacientes() {
            const varView = useVarView()
            const rol = varView.getRol
            const apiRest = useApiRest()
            const epsStore = useDatosEPSStore()
            if (rol === 'Profesional') {
                return await this.listPacientesAtendidos()
            }
    
            const usuarios = await apiRest.getData('InformacionUser', 'informacionUsers')
            const pacientes = await apiRest.getData('Paciente', 'pacientes')
    
            const EPSs = await epsStore.listEPSes()
    
            const mapaEPS = EPSs.reduce((acc, eps) => {
                acc[eps.id] = eps.nombre;
                return acc;
            }, {});
    
            // Asociar cada paciente con su usuario correspondiente
            const usuariosPacientes = pacientes.map((paciente) => {
    
                const usuario = usuarios.find((user) => {
                    if (user.id === paciente.id_infoUsuario) {
                        return user;
                    } // Validar si hay usuario con id
                    const idVacio = user.id === null || user.id === undefined || user.id === '';
                    if (user.id_temporal === paciente.id_usuario && idVacio) {
                        return user
                    } // Validar si hay usuario con id_temporal
                });
    
    
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
    
            this.Pacientes = usuariosPacientes
            return usuariosPacientes
        },

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
            const epsStore = useDatosEPSStore()
            const apiRest = useApiRest()
            const varView = useVarView()

            const usuarios = await apiRest.getData('InformacionUser', 'informacionUsers')
            const pacientes = await apiRest.getData('Paciente', 'pacientes')
            const EPSs = await epsStore.listEPSes()

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
                const profesionalStore = useMedicosStore()
                const profesionales = await profesionalStore.listMedicos()

                const idProfesional = profesionales.find(p => p.id_infoUsuario === usuario.id)?.id_profesional
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

                const usuario = usuarios.find((user) => {
                    if (user.id === paciente.id_infoUsuario) {
                        return user;
                    } // Validar si hay usuario con id
                    const idVacio = user.id === null || user.id === undefined || user.id === '';
                    if (user.id_temporal === paciente.id_infoUsuario && idVacio) {
                        return user
                    } // Validar si hay usuario con id_temporal
                });

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

            const pacientesIndexed = pacientes.map((data) => ({
                Paciente: {
                    id: data.id,
                    id_infoUsuario: data.infoUsuario,
                    id_eps: data.id_eps,
                    genero: data.genero,
                    sexo: data.sexo,
                    regimen: data.regimen,
                    vulnerabilidad: data.vulnerabilidad,
                    estado: data.estado,
                },
            }));

            pacientesIndexed.forEach(item => {
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


