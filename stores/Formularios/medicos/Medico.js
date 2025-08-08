import { createFormStore } from '../../createFormStore';
// Creacion del store para Nuevo Medico

// Estructura de datos de Medicos
const estructuraMedico = {
    User: {
        id_empresa: '',
        name: '',
        No_document: '',
        tipo: '',
        celular: '',
        telefono: '',
        correo: '',
        contraseña: null,
        rol: 'Profesional',
        nacimiento: '',
        direccion: '',
        municipio: '',
        departamento: '',
        barrio: '',
        zona: '',
        estado: 'activo',
    },
    Medico: {
        id_usuario: '',
        departamentoLaboral: '',
        municipioLaboral: '',
        zonaLaboral: '',
        profesion: '',
        estado: 'activo',
    }
}

// Pinia Medicos
export const useMedicosStore = defineStore('Medicos', {
    state: () => ({
        Medico: JSON.parse(JSON.stringify(estructuraMedico)), // estructura base compartida
        Medicos: [] // Lista de medicos
    }),

    getters: {
        async listMedicos(state) {
            const store = useIndexedDBStore()
            store.almacen = 'Medico'
            const medicos = await store.leerdatos()

            store.almacen = 'User'
            const usuarios = await store.leerdatos()

            const medicosActivos = medicos.filter((medico) => {
                return medico.estado === 'activo'
            })

            // Asociar cada medico con su usuario correspondiente
            const usuariosProfesionales = medicosActivos.map((medico) => {
                const usuario = usuarios.find((user) => user.id === medico.id_usuario)
                usuario.id_profesional = medico.id
                return {
                    ...medico,
                    ...usuario || null, // Agregamos los datos del usuario (o null si no se encuentra)
                }
            })

            state.Medicos = usuariosProfesionales
            return usuariosProfesionales
        },

        async tablaMedicos() {
            const store = useIndexedDBStore()
            store.almacen = 'Medico'
            const medicos = await store.leerdatos()

            const medicosActivos = medicos.filter((medico) => {
                return medico.estado === 'activo'
            })

            return medicosActivos
        },
    },

    actions: {
        // Acción para crear nuevas instancias de formulario
        createForm(storeId, estructura = estructuraMedico) {
            const useDynamicForm = createFormStore(storeId, estructura)
            return useDynamicForm() // devuelve instancia usable del formulario
        }
    }
});