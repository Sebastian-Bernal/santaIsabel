// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/composables/Formulario/ClassFormulario'

export function usePacientesCitaBuilder({
  validarform,
  traerDatos,
  guardarDatos,
  cerrarModal,
  enviarNuevaCita,
  seleccionarPaciente,
  seleccionarMedico,
  PacientesList,
  medicosList
}) {
  const builder = new FormularioBuilder()

  return builder
    .setValidarForm(validarform)
    .setFormulariotamaño('LG')
    .setFormularioTitulo('Agendar Cita')
    .setContentTraerDatos(traerDatos)
    .setContentGuardarDatos(guardarDatos)
    .setFormularioCerrar(cerrarModal)
    .setBotones([
      { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500' },
      { text: 'Guardar', accion: enviarNuevaCita, color: 'bg-blue-500' },
    ])
    .addCampo({
      component: 'Label',
      text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente',
      tamaño: 'w-full col-span-2',
      forLabel: 'nombreP',
    })
    .addCampo({
      component: 'SelectSearch',
      placeholder: 'Nombre del paciente',
      id: 'nombreP',
      name: 'nombreP',
      tamaño: 'w-full col-span-2',
      vmodel: 'Cita.name_paciente',
      options: PacientesList,
      opciones: [{ value: 'name' }, { text: 'Cedula', value: 'No_document' }],
      seleccionarItem: seleccionarPaciente,
    })
    .addCampo({
      component: 'Label',
      text: '<i class="fa-solid fa-stethoscope text-blue-500 mr-1"></i>Detalles de la cita',
      tamaño: 'w-full col-span-2',
      forLabel: 'nombreM',
    })
    .addCampo({
      component: 'SelectSearch',
      placeholder: 'Nombre del profesional',
      id: 'nombreM',
      name: 'nombreM',
      tamaño: 'w-full',
      vmodel: 'Cita.name_medico',
      options: medicosList,
      opciones: [{ value: 'name' }, { text: 'Profesion', value: 'profesion' }],
      seleccionarItem: seleccionarMedico,
    })
    .addCampo({
      component: 'Select',
      placeholder: 'Servicio',
      id: 'servicio',
      name: 'servicio',
      tamaño: 'w-full',
      options: [
        { text: 'Medicina General', value: 'Medicina General' },
        { text: 'Psicologia', value: 'Psicologia' },
        { text: 'Odontologia', value: 'Odontologia' },
      ],
      vmodel: 'Cita.servicio',
    })
    .addCampo({
      component: 'Select',
      placeholder: 'Motivo',
      id: 'motivo',
      name: 'motivo',
      tamaño: 'w-full',
      options: [
        { text: 'Control', value: 'Control' },
        { text: 'Primera vez', value: 'Primera vez' },
        { text: 'Urgencias', value: 'Urgencias' },
      ],
      vmodel: 'Cita.motivo',
    })
    .addCampo({
      component: 'Label',
      text: '<i class="fa-solid fa-calendar text-blue-500 mr-1"></i>Fecha y Hora',
      tamaño: 'w-full col-span-2',
      forLabel: 'fecha',
    })
    .addCampo({
      component: 'Input',
      placeholder: 'Seleccione la fecha',
      type: 'date',
      id: 'fecha',
      name: 'fecha',
      tamaño: 'w-full',
      vmodel: 'Cita.fecha',
    })
    .addCampo({
      component: 'Input',
      placeholder: 'Seleccione la hora para la cita',
      type: 'time',
      id: 'hora',
      name: 'hora',
      tamaño: 'w-full',
      vmodel: 'Cita.hora',
    })
    .build()
}