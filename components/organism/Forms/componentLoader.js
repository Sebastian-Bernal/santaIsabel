// utils/componentLoader.js
import { defineAsyncComponent } from 'vue';

export function loadComponent(name) {
  const componentMap = {
    Input: () => import('~/components/atoms/Inputs/Input.vue'),
    Select: () => import('~/components/atoms/Selects/Select.vue'),
    Label: () => import('~/components/atoms/Labels/Label.vue'),
    SelectSearch: () => import('~/components/atoms/Selects/SelectSearch.vue'),
    SelectMultiple: () => import('~/components/atoms/Selects/SelectMultiple.vue'),
    Textarea: () => import('~/components/atoms/Textareas/Textarea.vue'),
    Checkbox: () => import('~/components/atoms/Checkbox/Checkbox.vue'),
    GroupCampos: () => import('~/components/molecules/groupCampos/GroupCampos.vue'),
    Imagen: () => import('~/components/atoms/Images/Imagen.vue'),
    Permisos: () => import('~/components/atoms/Selects/Permisos.vue'),
  };

  const loader = componentMap[name];
  return loader ? defineAsyncComponent(loader) : null;
}

export async function cargarStore(storeName) {
  let tablaStore;

  switch (storeName) {
    case 'Pacientes': {
      const { usePacientesStore } = await import('~/stores/Formularios/paciente/Paciente');
      tablaStore = usePacientesStore();
      break;
    }
    case 'Profesionales': {
      const { useMedicosStore } = await import('~/stores/Formularios/profesional/Profesionales');
      tablaStore = useMedicosStore();
      break;
    }
    case 'Usuarios': {
      const { useUsersStore } = await import('~/stores/Formularios/usuarios/Users');
      tablaStore = useUsersStore();
      break;
    }
    case 'Historias': {
      const { useHistoriasStore } = await import('~/stores/Formularios/historias/Historia');
      tablaStore = useHistoriasStore();
      break;
    }
    case 'Login': {
      const { useUsuariosStore } = await import('~/stores/Formularios/login/Login');
      tablaStore = useUsuariosStore();
      break;
    }
    case 'Notas': {
      const { useNotasStore } = await import('~/stores/Formularios/historias/Notas');
      tablaStore = useNotasStore();
      break;
    }
    case 'Citas': {
      const { useCitasStore } = await import('~/stores/Formularios/citas/Cita');
      tablaStore = useCitasStore();
      break;
    }
    case 'Resolucion': {
      const { useFacturacionStore } = await import('~/stores/Formularios/empresa/Facturacion');
      tablaStore = useFacturacionStore();
      break;
    }
    case 'Profesion': {
      const { useDatosProfesionStore } = await import('~/stores/Formularios/empresa/Profesion');
      tablaStore = useDatosProfesionStore();
      break;
    }
    case 'EPS': {
      const { useDatosEPSStore } = await import('~/stores/Formularios/empresa/EPS');
      tablaStore = useDatosEPSStore();
      break;
    }
    case 'Servicio': {
      const { useDatosServicioStore } = await import('~/stores/Formularios/empresa/Servicio');
      tablaStore = useDatosServicioStore();
      break;
    }
    case 'Empresa': {
      const { useEmpresaStore } = await import('~/stores/Formularios/empresa/Empresa');
      tablaStore = useEmpresaStore();
      break;
    }
    case 'Software': {
      const { useSoftwareStore } = await import('~/stores/Formularios/empresa/Software');
      tablaStore = useSoftwareStore();
      break;
    }
    case 'Nomina': {
      const { useNominaStore } = await import('~/stores/Formularios/empresa/Nomina');
      tablaStore = useNominaStore();
      break;
    }
    case 'DocumentosEquivalentes': {
      const { useSoftwareDEStore } = await import('~/stores/Formularios/empresa/DocumentosEquivalentes');
      tablaStore = useSoftwareDEStore();
      break;
    }
    default:
      console.warn(`Store "${storeName}" no reconocido.`);
      break;
  }

  return tablaStore;
}