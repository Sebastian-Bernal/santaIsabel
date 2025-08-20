import { FormularioBuilder } from "~/composables/Formulario/ClassFormulario";

const builder = new FormularioBuilder()

// Propiedades Cita
export const propiedadesCita = builder
  .setFormularioTitulo('Agendar Cita')

  // 📌 Sección: Paciente
  .addCampo({
    component: 'Label',
    text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente',
    tamaño: 'w-full col-span-2',
    forLabel: 'nombreP',
  })
  .addCampo({
    component: 'SelectSearch',
    options: 'PacientesList',
    seleccionarItem: 'seleccionarPaciente',
    placeholder: 'Nombre del paciente',
    id: 'nombreP',
    name: 'nombreP',
    tamaño: 'w-full',
    opciones: [
      { value: 'name' },
      { text: 'Cedula', value: 'No_document' }
    ],
    vmodel: 'Cita.name_paciente',
  })

  // 📌 Sección: Detalles de la cita
  .addCampo({
    component: 'Label',
    text: '<i class="fa-solid fa-stethoscope text-blue-500 mr-1"></i>Detalles de la cita',
    tamaño: 'w-full col-span-2',
    forLabel: 'nombreM',
  })
  .addCampo({
    component: 'SelectSearch',
    options: 'medicosList', // ⚠️ lo pasas como prop
    seleccionarItem: 'seleccionarMedico',
    placeholder: 'Nombre del profesional',
    id: 'nombreM',
    name: 'nombreM',
    tamaño: 'w-full',
    opciones: [
      { value: 'name' },
      { text: 'Profesion', value: 'profesion' }
    ],
    vmodel: 'Cita.name_medico',
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

  // 📌 Sección: Fecha y Hora
  .addCampo({
    component: 'Label',
    text: '<i class="fa-solid fa-calendar text-blue-500 mr-1"></i>Fecha y Hora',
    tamaño: 'w-full col-span-2',
    forLabel: 'fecha',
  })
  .addCampo({
    component: 'Input',
    type: 'date',
    placeholder: 'Seleccione la fecha',
    id: 'fecha',
    name: 'fecha',
    tamaño: 'w-full',
    vmodel: 'Cita.fecha',
  })
  .addCampo({
    component: 'Input',
    type: 'time',
    placeholder: 'Seleccione la hora para la cita',
    id: 'hora',
    name: 'hora',
    tamaño: 'w-full',
    vmodel: 'Cita.hora',
  })

  .build()
