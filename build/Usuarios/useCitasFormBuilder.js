// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { decryptData } from '~/composables/Formulario/crypto';
import { ref } from 'vue'

export function useFormularioCitaBuilder({
  storeId,
  storePinia,
  cerrarModal,
  show,
  medicosList,
  pacientesList,
}) {
  const citasStore = useCitasStore()
  const varView = useVarView()
  const showTratamientos = ref(false)
  const optionsTratamientos = ref([])

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
    const maxFecha = new Date(hoy);
    maxFecha.setDate(maxFecha.getDate() - 1);

    if (fechaCita < maxFecha) {
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

  async function traerTratamientos(event) {
    const servicio = event.target.value
    console.log(servicio)
    if (servicio === 'Terapia') {
      varView.cargando = true

      const api = useApiRest()
      const config = useRuntimeConfig()
      const token = decryptData(sessionStorage.getItem('token'))

      let options = {
        metodo: 'POST',
        url: config.public.diasAsignadosRestantes,
        token: token,
        body: {
          id_paciente: citasStore.Formulario.Cita.id_paciente
        }
      }
      const respuesta = await api.functionCall(options)
      let respuestaData = ''
      if (respuesta.success) {
        varView.tipoConsulta = 'Terapia'
        showTratamientos.value = true
        respuestaData = respuesta.data
        optionsTratamientos.value = respuesta.data.map(data => {
          return { text: data.tratamiento, value: data.id }
        })
      }
      const tratamientodiv = document.getElementById('tratamientos');
      if (tratamientodiv) {
        tratamientodiv.innerHTML = `<p>${respuesta.message} ${respuestaData[0]?.dias_restantes || ''}</p>`;
      } else {
        tratamientodiv.innerHTML = ``;
      }
      varView.cargando = false
    } else {
      showTratamientos.value = false
    }
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
      tamaño: 'w-full md:col-span-2',
      forLabel: 'nombreP',
    })
    .addCampo({
      component: 'SelectSearch',
      placeholder: 'Nombre del paciente',
      id: 'nombreP',
      name: 'nombreP',
      tamaño: 'w-full md:col-span-2',
      vmodel: 'Cita.name_paciente',
      options: pacientesList,
      opciones: [{ value: 'name' }, { text: 'Cedula', value: 'No_document' }],
      seleccionarItem: seleccionarPaciente,
      upperCase: true
    })
    .addCampo({
      component: 'Label',
      text: '<i class="fa-solid fa-stethoscope text-blue-500 mr-1"></i>Detalles de la cita',
      tamaño: 'w-full md:col-span-2',
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
        { text: 'Psicología', value: 'Psicología' },
        { text: 'Terapia', value: 'Terapia' },
        { text: 'Odontología', value: 'Odontología' },
        { text: 'Pediatría', value: 'Pediatría' },
        { text: 'Ginecología', value: 'Ginecología' },
        { text: 'Medicina Interna', value: 'Medicina Interna' },
        { text: 'Cardiología', value: 'Cardiología' },
        { text: 'Dermatología', value: 'Dermatología' },
        { text: 'Oftalmología', value: 'Oftalmología' },
        { text: 'Otorrinolaringología', value: 'Otorrinolaringología' },
        { text: 'Traumatología', value: 'Traumatología' },
        { text: 'Fisioterapia', value: 'Fisioterapia' },
        { text: 'Nutrición', value: 'Nutrición' },
        { text: 'Laboratorio Clínico', value: 'Laboratorio Clínico' },
        { text: 'Imagenología', value: 'Imagenología' },
        { text: 'Otro', value: 'Otro' },
      ],
      vmodel: 'Cita.servicio',
      slot: {
        tooltip: `<div id="tratamientos" class="text-red-300 text-xs mt-1"></div>`
      },
      events: {
        onChange: traerTratamientos
      }
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
        { text: 'Consulta general', value: 'Consulta general' },
        { text: 'Consulta especializada', value: 'Consulta especializada' },
        { text: 'Exámenes de laboratorio', value: 'Exámenes de laboratorio' },
        { text: 'Imagenología (Rayos X, Ecografía, etc.)', value: 'Imagenología' },
        { text: 'Vacunación', value: 'Vacunación' },
        { text: 'Chequeo preventivo', value: 'Chequeo preventivo' },
        { text: 'Seguimiento postoperatorio', value: 'Seguimiento postoperatorio' },
        { text: 'Atención domiciliaria', value: 'Atención domiciliaria' },
        { text: 'Teleconsulta', value: 'Teleconsulta' },
        { text: 'Otro', value: 'Otro' },
      ],
      vmodel: 'Cita.motivo',
    })
  if (showTratamientos?.value) {
    builder
      .addCampo({
        component: 'Select',
        placeholder: 'Tratamientos activos',
        id: 'tratamientos',
        name: 'tratamientos',
        tamaño: 'w-full',
        options: optionsTratamientos,
        vmodel: 'Cita.id_procedimiento',
      })
  }
  builder
    .addCampo({
      component: 'Label',
      text: '<i class="fa-solid fa-calendar text-blue-500 mr-1"></i>Fecha y Hora',
      tamaño: 'w-full md:col-span-2',
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