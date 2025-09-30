import { defineStore } from "pinia";
import { createFormStore } from '../../createFormStore'
import { useIndexedDBStore } from "../../indexedDB";
import { useUsersStore } from "../usuarios/Users";
import { useDatosEPSStore } from "../empresa/EPS";
import { getAll } from "~/composables/Formulario/useIndexedDBManager";
import { useCitasStore } from "../citas/Cita";

// Pinia Pacientes
export const usePacientesStore = defineStore('Pacientes', {
    state: () => ({
        Pacientes: [],
        Formulario: {
            User: {
                correo: '',
                contraseña: null,
                rol: 'Paciente',
                estado: 'activo',
            },
            InformacionUser: {
                id_usuario: '',
                name: '',
                No_document: '',
                tipo: '',
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
                id_usuario: '',
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
            const rol = sessionStorage.getItem('Rol')
            if (rol === 'Profesional') {
                return await this.listPacientesAtendidos()
            }

            const store = useIndexedDBStore()
            const usersStore = useUsersStore()
            const epsStore = useDatosEPSStore()

            store.almacen = 'Paciente'
            const pacientes = await store.leerdatos()

            const usuarios = await usersStore.listUsers
            const EPSs = await epsStore.listEPS

            const mapaEPS = EPSs.reduce((acc, eps) => {
                acc[eps.id] = eps.nombre;
                return acc;
            }, {});

            const pacientesActivos = pacientes.filter((paciente) => {
                return paciente.estado === 'activo'
            })


            // Asociar cada paciente con su usuario correspondiente
            const usuariosPacientes = pacientesActivos.map((paciente) => {
                const usuario = usuarios.find((user) => user.id === paciente.id_usuario)

                if (usuario) {
                    return {
                        ...paciente,
                        ...usuario,
                        Eps: mapaEPS[paciente.Eps] || paciente.Eps,
                        id_paciente: paciente.id // renombramos el id del paciente
                    }
                } else {
                    return {
                        ...paciente,
                        Eps: mapaEPS[paciente.Eps] || paciente.Eps,
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
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = []) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
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

        async indexDBDatos() {
            const config = useRuntimeConfig()
            const usuarios = await getAll(config.public.patients, 'store_two')

            console.log(usuarios)
            const UsuariosIndexed = usuarios.map((data) => ({
                Paciente: {
                    id: data.patient_id,
                    sexo: data.patient_gender,
                    genero: data.patient_gender_identity,
                    poblacionVulnerable: data.patient_vulnerability,
                    Eps: data.patient_eps_id,
                    user_profile: data.user_profile
                },
            }));

            // UsuariosIndexed.map((item) => {
            //     guardarEnDB(item)
            // })
        },

        async listPacientesAtendidos(filtrar = true) {
            const store = useIndexedDBStore()
            const usersStore = useUsersStore()
            const epsStore = useDatosEPSStore()

            store.almacen = 'Paciente'
            const pacientes = await store.leerdatos()

            const usuarios = await usersStore.listUsers
            const EPSs = await epsStore.listEPS

            const mapaEPS = EPSs.reduce((acc, eps) => {
                acc[eps.id] = eps.nombre;
                return acc;
            }, {});

            const pacientesActivos = pacientes.filter((paciente) => {
                return paciente.estado === 'activo'
            })

            let pacientesFiltrados = pacientesActivos;

            const rol = sessionStorage.getItem('Rol')
            if (rol === 'Profesional' && filtrar) {
                const citasStore = useCitasStore();
                // Asegúrate de que listCitas sea una función async
                const citas = await citasStore.listCitas();

                const pacientesAtendidos = [
                    ...new Set(
                        citas
                            .filter(cita => cita.name_medico === 'LAURA GARCIA')
                            .map(cita => cita.id_paciente)
                    )
                ];

                pacientesFiltrados = pacientesActivos.filter(paciente =>
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
                        Eps: mapaEPS[paciente.Eps] || paciente.Eps,
                        id_paciente: paciente.id // renombramos el id del paciente
                    }
                } else {
                    return {
                        ...paciente,
                        Eps: mapaEPS[paciente.Eps] || paciente.Eps,
                        usuario: null
                    }
                }
            })

            this.Pacientes = usuariosPacientes
            return usuariosPacientes
        },

    }
});


