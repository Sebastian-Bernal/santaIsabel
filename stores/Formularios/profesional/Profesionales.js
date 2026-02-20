import { traerProfesionales } from "~/Core/Usuarios/Profesional/GETProfesionales";
import { guardarEnDB } from "~/composables/Formulario/useIndexedDBManager";
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion.js';
import { decryptData } from "~/composables/Formulario/crypto";

// Pinia Medicos
export const useMedicosStore = defineStore('Medicos', {
    state: () => ({
        Formulario: {
            User: {
                correo: '',
            },
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
            Profesional: {
                departamento_laboral: '',
                municipio_laboral: '',
                zona_laboral: '',
                profesion: '',
                id_profesion: '',
                correoProfesional: '',
                estado: 1,
            }
        },
        Medicos: [] // Lista de medicos
    }),

    getters: {

        async tablaMedicos() {
            const store = useIndexedDBStore()
            store.almacen = 'Profesional'
            const medicos = await store.leerdatos()

            const medicosActivos = medicos.filter((medico) => {
                return medico.estado === 1
            })

            return medicosActivos
        },
    },

    actions: {
        async listMedicos(online = true) {
            const apiRest = useApiRest()
            const store = useIndexedDBStore()

            let medicos = ''
            let usuarios = ''

            if (online) {
                const token = decryptData(sessionStorage.getItem('token'))
                const config = useRuntimeConfig()
                const dataProfesionales = await apiRest.functionCall({
                    metodo: 'GET',
                    url: config.public.traeProfesionales,
                    token: token
                })

                if (dataProfesionales.success) {
                    // guardar en IndexedDB para uso offline
                    const store = useIndexedDBStore();
                    // Definir mapeo entre nombre del almacén y propiedad en dataHistoria
                    const colecciones = {
                        Profesional: dataProfesionales.profesionales,
                        InformacionUser: dataProfesionales.informacionUsers,
                    };

                    // Recorremos cada colección y guardamos en IndexedDB
                    for (const [almacen, datos] of Object.entries(colecciones)) {
                        store.almacen = almacen;
                        store.bulkPut(datos)
                    }

                    usuarios = dataProfesionales.informacionUsers;
                    medicos = dataProfesionales.profesionales;
                }
            } else {
                store.almacen = 'InformacionUser'
                usuarios = await store.leerdatos()

                store.almacen = 'Profesional'
                medicos = await store.leerdatos()
            }

            store.almacen = 'Profesion'
            const profesiones = await store.leerdatos()

            const mapaProfesion = profesiones.reduce((acc, profesion) => {
                acc[profesion.id] = profesion.nombre;
                return acc;
            }, {});

            // Asociar cada medico con su usuario correspondiente
            const usuariosProfesionales = medicos.map((medico) => {

                const usuario = usuarios.find((user) => {
                    if (user.id === medico.id_infoUsuario) {
                        return user;
                    } // Validar si hay usuario con id
                    const idVacio = user.id === null || user.id === undefined || user.id === '';
                    if (user.id_temporal === medico.id_infoUsuario && idVacio) {
                        return user
                    } // Validar si hay usuario con id_temporal
                });

                if (!usuario) return

                return {
                    ...medico,
                    ...usuario, // Agregamos los datos del usuario (o null si no se encuentra)
                    id_profesional: medico.id,
                    id_temporal: medico.id_temporal,
                    id_temporalUsuario: usuario.id_temporal,
                    profesion: mapaProfesion[medico.id_profesion] || medico.id_profesion,
                }
            })

            this.Medicos = usuariosProfesionales
            return usuariosProfesionales
        },

        async indexDBDatos() {
        },
    }
});