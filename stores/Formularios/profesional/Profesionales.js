import { traerProfesionales } from "~/Core/Usuarios/Profesional/GETProfesionales";
import { guardarEnDB } from "~/composables/Formulario/useIndexedDBManager";
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion.js';

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
                correo: '',
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

            if(online){
                usuarios = await apiRest.getData('InformacionUser', 'informacionUsers')
                medicos = await apiRest.getData('Profesional', 'profesionals')
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
    
                if(!usuario) return
    
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
            const profesionales = await traerProfesionales()
            const profesionalesLocal = await this.listMedicos()

            const profesionesStore = useDatosProfesionStore()
            const profesiones = await profesionesStore.listProfesion
            const mapaProfesion = profesiones.reduce((acc, profesion) => {
                acc[profesion.id] = profesion.nombre;
                return acc;
            }, {});

            // Crear un conjunto de IDs locales para comparación rápida
            const idsLocales = new Set(
                profesionalesLocal.map(p => `${p.id_profesional}-${p.id_infoUsuario}`)
            );

            const profesionalesIndexed = profesionales.map((data) => ({
                Profesional: {
                    id: data.id,
                    id_infoUsuario: data.id_infoUsuario,
                    id_profesion: data.id_profesion,
                    profesion: mapaProfesion[data.id_profesion],
                    zonaLaboral: data.zona_laboral,
                    departamentoLaboral: data.departamento_laboral,
                    municipioLaboral: data.municipio_laboral,
                    estado: data.estado,
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