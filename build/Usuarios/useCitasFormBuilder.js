// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'

export function useFormularioCitaBuilder({
  storeId,
  storePinia,
  cerrarModal,
  show,
  medicosList,
  pacientesList
}) {
  const citasStore = useCitasStore()

  function seleccionarPaciente(paciente) {
    citasStore.Formulario.Cita.name_paciente = paciente.name
    citasStore.Formulario.Cita.id_paciente = paciente.id_paciente
  }

  function seleccionarMedico(medico) {
    citasStore.Formulario.Cita.name_medico = medico.name
    citasStore.Formulario.Cita.id_medico = medico.id_profesional
  }

  function validarFecha(event) {
    const fechaStr = event.target.value;
    const fechaCita = new Date(fechaStr);
    const hoy = new Date();
    const errorDiv = document.getElementById('error-fecha');
    // Limpiar la hora para comparar solo fechas
    hoy.setHours(0, 0, 0, 0);
    fechaCita.setHours(0, 0, 0, 0);

    if (!fechaStr) {
      alert("Por favor ingresa una fecha.");
      return;
    }
console.log(fechaCita, hoy)
    if (fechaCita < hoy) {
      errorDiv.innerHTML = `<p>La fecha de la cita no puede ser anterior a hoy.</p>`
      return;
    }

    errorDiv.innerHTML = ''
  }

  function validarHora(event) {
    const horaStr = event.target.value; // Suponiendo que viene de un input tipo "time"
    const errorDiv = document.getElementById('error-hora');

    if (!horaStr) {
      alert("Por favor ingresa una hora.");
      return false;
    }

    const [hora, minutos] = horaStr.split(":").map(Number);
    const horaIngresada = hora + minutos / 60;

    const horaMinima = 5;   // 5:00 AM
    const horaMaxima = 22;  // 10:00 PM

    if (horaIngresada < horaMinima || horaIngresada > horaMaxima) {
      errorDiv.innerHTML = `<p>La hora debe estar entre las 5:00 AM y las 10:00 PM.</p>`
      return;
    }

    errorDiv.innerHTML = ''
  }

  const builder = new FormularioBuilder()

  builder
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setFormularioShow(show)
    .setFormulariotamaño('XS')
    .setBotones([
      { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500', type: 'cerrar' },
      { text: 'Guardar', color: 'bg-blue-500', type: 'enviar' },
    ])
    .nuevaSeccion('Agendar Cita')
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
      options: pacientesList,
      opciones: [{ value: 'name' }, { text: 'Cedula', value: 'No_document' }],
      seleccionarItem: seleccionarPaciente,
      upperCase: true
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
      events: {
        onChange: validarFecha
      },
      slot: {
        tooltip: `<div id="error-fecha" class="text-red-300 text-xs mt-1"></div>`
      },
    })
    .addCampo({
      component: 'Input',
      placeholder: 'Seleccione la hora para la cita',
      type: 'time',
      id: 'hora',
      name: 'hora',
      tamaño: 'w-full',
      vmodel: 'Cita.hora',
      events: {
        onChange: validarHora
      },
      slot: {
        tooltip: `<div id="error-hora" class="text-red-300 text-xs mt-1"></div>`
      },
    })
    .build()

    return builder
}