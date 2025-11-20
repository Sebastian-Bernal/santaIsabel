import { useDatosProfesionStore } from "~/stores/Formularios/empresa/Profesion";
import { useDatosEPSStore } from "~/stores/Formularios/empresa/EPS";
import { useEmpresaStore } from "~/stores/Formularios/empresa/Empresa";
import { usePacientesStore } from "~/stores/Formularios/paciente/Paciente";
import { useMedicosStore } from "~/stores/Formularios/profesional/Profesionales";
import { useCitasStore } from "~/stores/Formularios/citas/Cita";
import { useHistoriasStore } from "~/stores/Formularios/historias/Historia";
import { useNotasStore } from "~/stores/Formularios/historias/Notas";
import { useSoftwareStore } from "~/stores/Formularios/empresa/Software";
import { useFacturacionStore } from "~/stores/Formularios/empresa/Facturacion";


// Funcion que carga datos de bd
export async function traerDatos() {
    try {
        const historiaStore = useHistoriasStore()
        await historiaStore.indexDBDatos()

        const citasStore = useCitasStore()
        await citasStore.indexDBDatos()

        const epsStore = useDatosEPSStore()
        await epsStore.indexDBDatos()
    
        const profesionesStore = useDatosProfesionStore()
        await profesionesStore.indexDBDatos()
    
        const pacientesStore = usePacientesStore()
        await pacientesStore.indexDBDatos()

        await pacientesStore.indexDBDatosAntecedentes()
    
        const profesionalesStore = useMedicosStore()
        await profesionalesStore.indexDBDatos()
    
        const notasStore = useNotasStore()
        await notasStore.indexDBDatos()

    } catch (error){
        console.log(error)
        return false
    }
    // console.log('hola')
}

