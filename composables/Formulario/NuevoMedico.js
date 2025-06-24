import { createFormStore } from '../../stores/useFormData';
// Creacion del store para Nuevo Medico

const estructuraNuevoMedico = {
    Medico: {
        name: '',
        nacimiento: '',
        type_doc: '',
        No_document: '',
        genero: '',
        direccion: '',
        departamento: '',
        municipio: '',
        zona: '',
        barrio: '',
        celular: '',
        telefono: '',
    }
}

export const useNuevoMedicoStore = createFormStore('NuevoMedico', estructuraNuevoMedico);