import { mapCampos } from "~/components/organism/Forms/useFormulario";
import { useHistoriasStore } from "~/stores/Formularios/historias/Historia";
import { validarYEnviarEliminarPaciente } from "~/Core/Usuarios/Paciente/DELETEPaciente";

export function usePacienteActions({
  pacientesStore,
  varView,
  notificaciones,
  llamadatos,
  refresh,
  show,
  showVer
}) {

  /* ===============================
     MODALES
  =============================== */

  const agregarPaciente = () => {
    show.value = true;
    varView.soloVer = false;
  };

  const cerrar = () => {
    show.value = false;
    showVer.value = false;
    varView.soloVer = true;
  };

  /* ===============================
     VER PACIENTE
  =============================== */

  const verPaciente = async (paciente) => {
    mapCampos(paciente, pacientesStore.Formulario);

    pacientesStore.Formulario.Paciente.id = paciente.id_paciente;
    pacientesStore.Formulario.Paciente.id_temporal = paciente.id_temporal;

    pacientesStore.Formulario.InformacionUser.id = paciente.id_infoUsuario;
    pacientesStore.Formulario.InformacionUser.id_temporal = paciente.id_temporalUsuario;

    const historiaStore = useHistoriasStore();

    pacientesStore.Formulario.Antecedentes =
      await historiaStore.listDatos(
        paciente.id_paciente,
        "Antecedentes",
        "id_paciente"
      );

    pacientesStore.Formulario.Plan_manejo_procedimientos =
      await historiaStore.listDatos(
        paciente.id_paciente,
        "Plan_manejo_procedimientos",
        "id_paciente"
      );

    showVer.value = true;
  };

  /* ===============================
     ELIMINAR PACIENTE
  =============================== */

  const eliminarPaciente = async () => {
    const paciente = pacientesStore.Formulario;

    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar el paciente?",
      html: `Se eliminará el paciente: <span>${paciente.InformacionUser.name}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await validarYEnviarEliminarPaciente(paciente);

    if (!eliminado) return;

    notificaciones.options = {
      position: "top-end",
      texto: "Paciente eliminado con éxito.",
      background: "#6bc517",
      tiempo: 1500
    };

    notificaciones.mensaje();
    notificaciones.options.background = "#d33";

    cerrar();
    await llamadatos();
    refresh.value++;
  };

  return {
    agregarPaciente,
    verPaciente,
    cerrar,
    eliminarPaciente
  };
}
