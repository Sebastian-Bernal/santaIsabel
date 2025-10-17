import { traerProfesionales } from "~/Core/Usuarios/Profesional/GETProfesionales";
import { useUsersStore } from "../usuarios/Users";
import { guardarEnDB } from "~/composables/Formulario/useIndexedDBManager";
import { useDatosProfesionStore } from "../empresa/Profesion";

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
            Profesional: {
                departamentoLaboral: '',
                municipioLaboral: '',
                zonaLaboral: '',
                profesion: '',
            }
        },
        Medicos: [] // Lista de medicos
    }),

    getters: {
        async listMedicos(state) {
            const store = useIndexedDBStore()
            const usersStore = useUsersStore()
            const profesionesStore = useDatosProfesionStore()

            store.almacen = 'Profesional'
            const medicos = await store.leerdatos()

            const usuarios = await usersStore.listUsers
            const profesiones = await profesionesStore.listProfesion

            const mapaProfesion = profesiones.reduce((acc, profesion) => {
                acc[profesion.id] = profesion.nombre;
                return acc;
            }, {});

            // Asociar cada medico con su usuario correspondiente
            const usuariosProfesionales = medicos.map((medico) => {

                const usuario = usuarios.find((user) => user.id === medico.id_usuario)

                if(!usuario) return
                // usuario.id_profesional = medico.id
                return {
                    ...medico,
                    ...usuario, // Agregamos los datos del usuario (o null si no se encuentra)
                    id_profesional: medico.id,
                    id_temporal: medico.id_temporal,
                    id_temporalUsuario: usuario.id_temporal,
                    profesion: mapaProfesion[medico.id_profesion] || medico.id_profesion,
                }
            })

            state.Medicos = usuariosProfesionales
            return usuariosProfesionales
        },

        async tablaMedicos() {
            const store = useIndexedDBStore()
            store.almacen = 'Profesional'
            const medicos = await store.leerdatos()

            const medicosActivos = medicos.filter((medico) => {
                return medico.estado === 'activo'
            })

            return medicosActivos
        },
    },

    actions: {

        async indexDBDatos() {
            const profesionales = await traerProfesionales()
            const profesionalesLocal = await this.listMedicos

            // Crear un conjunto de IDs locales para comparación rápida
            const idsLocales = new Set(
                profesionalesLocal.map(p => `${p.id_profesional}-${p.id_usuario}`)
            );

            const profesionalesIndexed = profesionales.map((data) => ({
                Profesional: {
                    id: data.id,
                    id_usuario: data.info_usuario.id,
                    id_profesion: data.id_profesion,
                    zonaLaboral: data.zona_laboral,
                    departamentoLaboral: data.departamento_laboral,
                    municipioLaboral: data.municipio_laboral,
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
                }
            }));

            // Filtrar los que no están en local
            const nuevosProfesionales = profesionalesIndexed.filter(item => {
                const key = `${item.Profesional.id}-${item.InformacionUser.id}`;
                return !idsLocales.has(key);
            });

            // Guardar solo los nuevos
            nuevosProfesionales.forEach(item => {
                guardarEnDB(item);
            });

        },
    }
});