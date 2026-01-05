import { mapCampos, mapCamposLimpios } from "~/components/organism/Forms/useFormulario";
import { validarYEnviarEliminarMedico } from "~/Core/Usuarios/Profesional/DELETEMedico";

export function useProfesionalActions({
    medicosStore,
    varView,
    notificaciones,
    show,
    showVer,
    refrescar // función opcional para actualizar lista
}) {

    /* ===============================
       MODALES
    =============================== */

    const agregarMedico = () => {
        mapCamposLimpios(medicosStore.Formulario);
        show.value = true;
        varView.soloVer = false;
    };

    const cerrar = () => {
        show.value = false;
        showVer.value = false;
        varView.soloVer = false;
    };

    /* ===============================
       VER / MODIFICAR PROFESIONAL
    =============================== */

    const modificarMedico = (medico) => {
        mapCampos(medico, medicosStore.Formulario);

        medicosStore.Formulario.Profesional.id = medico.id_profesional;
        medicosStore.Formulario.Profesional.id_temporal = medico.id_temporal;
        medicosStore.Formulario.Profesional.id_infoUsuario = medico.id_infoUsuario;

        medicosStore.Formulario.InformacionUser.id = medico.id_infoUsuario;
        medicosStore.Formulario.InformacionUser.id_temporal =
            medico.id_temporalUsuario;

        showVer.value = true;
    };

    /* ===============================
       ELIMINAR PROFESIONAL
    =============================== */

    const eliminarProfesional = async () => {
        const profesional = medicosStore.Formulario;

        notificaciones.options = {
            icono: "warning",
            titulo: "¿Deseas eliminar el profesional?",
            html: `Se eliminará el profesional: <span>${profesional.InformacionUser.name}</span>`,
            confirmtext: "Sí, eliminar",
            canceltext: "Atrás"
        };

        const respuesta = await notificaciones.alertRespuesta();
        if (respuesta !== "confirmado") return;

        const eliminado = await validarYEnviarEliminarMedico(profesional);
        if (!eliminado) return;

        notificaciones.options = {
            position: "top-end",
            texto: "Profesional eliminado con éxito.",
            background: "#6bc517",
            tiempo: 1500
        };

        notificaciones.mensaje();
        notificaciones.options.background = "#d33";

        if (refrescar) {
            await refrescar();
        } else {
            window.location.reload();
        }
    };

    return {
        agregarMedico,
        modificarMedico,
        cerrar,
        eliminarProfesional
    };
}
