import { createFormStore } from '../../stores/createFormStore';
// Creacion del store para Nuevo Paciente

const estructuraModificacionPaciente = {
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

export const useModificacionPacienteStore = createFormStore('ModificacionPaciente', estructuraModificacionPaciente);