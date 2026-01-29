import { useDatosEPSStore } from "~/stores/Formularios/empresa/EPS";
import { useCitasStore } from "~/stores/Formularios/citas/Cita";
import { useMedicosStore } from "~/stores/Formularios/profesional/Profesionales";
import { decryptData } from "~/composables/Formulario/crypto";

export async function traerPacientes({ online = true, filtrar = true } = {}) {
  const varView = useVarView();
  const rol = varView.getRol;
  const apiRest = useApiRest();
  const store = useIndexedDBStore();

  let usuarios = ''
  let pacientes = ''
  let EPSs = ''
  if (online) {

    const token = decryptData(sessionStorage.getItem('token'))
    const config = useRuntimeConfig()
    const dataPacientes = await apiRest.functionCall({
      metodo: 'GET',
      url: config.public.traePacientes,
      token: token
    })

    if (dataPacientes.success) {
      // guardar en IndexedDB para uso offline
      const store = useIndexedDBStore();
      // Definir mapeo entre nombre del almacén y propiedad en dataHistoria
      const colecciones = {
        Paciente: dataPacientes.pacientes,
        InformacionUser: dataPacientes.informacionUsers,
        EPS: dataPacientes.eps,
      };

      // Recorremos cada colección y guardamos en IndexedDB
      for (const [almacen, datos] of Object.entries(colecciones)) {
        store.almacen = almacen;
        await store.borrartodo();

        for (const item of datos) {
          await store.guardardatosID({ ...item });
        }
      }

      usuarios = dataPacientes.informacionUsers;
      pacientes = dataPacientes.pacientes;
      EPSs = dataPacientes.eps;

    }
  } else {

    // Obtener datos según si está online o no
    const getData = async (entidad, key) => {
      store.almacen = entidad;
      return await store.leerdatos();
    };

    usuarios = await getData('InformacionUser', 'informacionUsers');
    pacientes = await getData('Paciente', 'pacientes');
    EPSs = await getData('EPS', 'eps');
  }

  // Crear mapa de EPS
  const mapaEPS = EPSs.reduce((acc, eps) => {
    acc[eps.id] = eps.nombre;
    return acc;
  }, {});

  let pacientesFiltrados = pacientes;

  filtrar = !varView.getPermisos.includes('ListaPacientes')
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
