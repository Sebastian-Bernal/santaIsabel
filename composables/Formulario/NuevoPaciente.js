import { createFormStore } from '../../stores/useFormData';
// Creacion del store para Nuevo Paciente

const estructuraNuevoPaciente = {
    Paciente: {
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
        Eps: '',
        Regimen: '',
        poblacionVulnerable: '',
        Tipo: '',
    }
}

export const useNuevoPacienteStore = createFormStore('NuevoPaciente', estructuraNuevoPaciente);