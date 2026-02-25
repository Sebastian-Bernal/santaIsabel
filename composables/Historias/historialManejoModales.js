import { mapCampos } from "~/components/organism/Forms/useFormulario"
export const adaptacionHistoria = {

  Medicamento: (item, formulario) => {
    mapCampos(item, formulario)

    formulario.Plan_manejo_medicamentos = {
      ...formulario.Plan_manejo_medicamentos,
      medicamento: item.medicamento,
      dosis: item.dosis,
      cantidad: item.cantidad,
      id: item.id ?? null
    }
  },

  Tratamientos: (item, formulario) => {
    mapCampos(item, formulario)

    formulario.Plan_manejo_procedimientos = {
      ...formulario.Plan_manejo_procedimientos,
      procedimiento: item.procedimiento,
      codigo: item.codigo,
      dias_asignados: item.dias_asignados,
      id: item.id ?? null
    }
  },

  Consulta: (item, formulario) => {
    const datos = { ...item, ...item.signosVitales }
    mapCampos(datos, formulario)
  },

  Terapia: (item, formulario) => {
    mapCampos(item, formulario)
    formulario.Terapia.id = item.id
  },

  Evolucion: (item, formulario) => {
    mapCampos(item, formulario)
  },

  TrabajoSocial: (item, formulario) => {
    mapCampos(item, formulario)
  },

  Historial_cambios_sonda: (item, formulario) => {
    mapCampos(item, formulario)
    formulario.Historial_cambios_sonda.fecha_cambio = item.fecha_cambio
    formulario.Historial_cambios_sonda.observacion = item.observacion
  }
}

export function historialManejoModales({
    historiasStore,
    showItem,
    formularioItem,
    actualizar
}) {

    function loadItem(tipo, item, mode = 'view') {
      console.log(item)
        const varView = useVarView()
        formularioItem.value = tipo
        varView.tipoHistoria = tipo
        actualizar.value = mode === 'update'

        const adapter = adaptacionHistoria[tipo]

        if (!adapter)
            throw new Error(`Adapter no definido para ${tipo}`)

        adapter(item, historiasStore.Formulario)

        showItem.value = true
    }

    return { loadItem }
}