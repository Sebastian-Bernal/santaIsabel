import { useDatosEPSStore } from "~/stores/Formularios/empresa/EPS";
import { useCitasStore } from "~/stores/Formularios/citas/Cita";
import { useMedicosStore } from "~/stores/Formularios/profesional/Profesionales";

export async function traerPacientes({ online = true, filtrar = true } = {}) {
  const varView = useVarView();
  const rol = varView.getRol;
  const apiRest = useApiRest();
  const store = useIndexedDBStore();
  const epsStore = useDatosEPSStore();

  // Obtener datos según si está online o no
  const getData = async (entidad, key) => {
    if (online) return await apiRest.getData(entidad, key);
    store.almacen = entidad;
    return await store.leerdatos();
  };

  const usuarios = await getData('InformacionUser', 'informacionUsers');
  const pacientes = await getData('Paciente', 'pacientes');
  const EPSs = online ? await apiRest.getData('EPS', 'eps') : await epsStore.listEPS();

  // Crear mapa de EPS
  const mapaEPS = EPSs.reduce((acc, eps) => {
    acc[eps.id] = eps.nombre;
    return acc;
  }, {});

  let pacientesFiltrados = pacientes;

  // Si rol es profesional y se requiere filtrar, obtener solo pacientes atendidos
  if (rol === 'Profesional' && filtrar) {
    const citasStore = useCitasStore();
    const citas = await citasStore.listCitas();

    const usuario = varView.getUser;
    const profesionalStore = useMedicosStore();
    const profesionales = await profesionalStore.listMedicos();

    const idProfesional = profesionales.find(p => p.id_infoUsuario === usuario.id)?.id_profesional;
    const pacientesAtendidos = [...new Set(
      citas.filter(cita => cita.id_medico === idProfesional).map(cita => cita.id_paciente)
    )];

    pacientesFiltrados = pacientes.filter(p => pacientesAtendidos.includes(p.id));
  }

  // Asociar cada paciente con su usuario correspondiente
  const usuariosPacientes = pacientesFiltrados.map(paciente => {
    const usuario = usuarios.find(user => {
      const idVacio = !user.id;
      return user.id === paciente.id_infoUsuario ||
             (user.id_temporal === paciente.id_infoUsuario && idVacio);
    });

    return usuario
      ? {
          ...paciente,
          ...usuario,
          Eps: mapaEPS[paciente.id_eps] || paciente.Eps,
          id_paciente: paciente.id,
          id_temporal: paciente.id_temporal,
          id_temporalUsuario: usuario.id_temporal
        }
      : {
          ...paciente,
          Eps: mapaEPS[paciente.id_eps] || paciente.Eps,
          usuario: null
        };
  });

  return usuariosPacientes;
}
