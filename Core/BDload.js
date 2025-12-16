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
import { actualizarProgreso } from "./Login/Ingresar";


// Funcion que carga datos de bd
// export async function traerDatos() {
//     try {
//         const historiaStore = useHistoriasStore()
//         await historiaStore.indexDBDatos()

//         const citasStore = useCitasStore()
//         await citasStore.indexDBDatos()

//         const epsStore = useDatosEPSStore()
//         await epsStore.indexDBDatos()
    
//         const profesionesStore = useDatosProfesionStore()
//         await profesionesStore.indexDBDatos()
    
//         const pacientesStore = usePacientesStore()
//         await pacientesStore.indexDBDatos()

//         await pacientesStore.indexDBDatosAntecedentes()
    
//         const profesionalesStore = useMedicosStore()
//         await profesionalesStore.indexDBDatos()
    
//         const notasStore = useNotasStore()
//         await notasStore.indexDBDatos()

//     } catch (error){
//         console.log(error)
//         return false
//     }
// }

export async function traerDatos(onProgress = () => {}) {
    try {
        const historiaStore = useHistoriasStore()
        const profesionalesStore = useMedicosStore()
        const pacientesStore = usePacientesStore()
        const profesionesStore = useDatosProfesionStore()
        const citasStore = useCitasStore()

        const pasos = [
            { texto: 'Cargando historias clínicas...', fn: () => historiaStore.indexDBDatos() },
            { texto: 'Cargando citas...', fn: () => citasStore.indexDBDatos() },
            { texto: 'Cargando profesiones...', fn: () => profesionalesStore.indexDBDatos() },
            { texto: 'Cargando pacientes...', fn: () => pacientesStore.indexDBDatos() },
            { texto: 'Cargando profesionales...', fn: () => profesionesStore.indexDBDatos() },
        ];

        const total = pasos.length;

        for (let i = 0; i < total; i++) {
            const porcentaje = Math.round(((i + 1) / total) * 100);
            onProgress(porcentaje, pasos[i].texto);
            await pasos[i].fn();
        }

        return true;
    } catch (error) {
        console.error('Error al traer datos:', error);
        throw error;
    }
}

