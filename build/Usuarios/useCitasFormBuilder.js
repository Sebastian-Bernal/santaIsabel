// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { decryptData } from '~/composables/Formulario/crypto';
import { watch } from 'vue'
import { useDatosServicioStore } from '~/stores/Formularios/empresa/Servicio';
import { CUPS } from '~/data/CUPS';

export function useFormularioCitaBuilder({
  storeId,
  storePinia,
  cerrarModal,
  show,
  medicosList,
  pacientesList,
  servicios,
  showTratamientos,
  optionsTratamientos,
  variasCitas,
  rangoFecha,
  nuevoProcedimiento,
  verUser
}) {
  const citasStore = useCitasStore()
  const calendarioCitasStore = useCalendarioCitas();

  watch(() => calendarioCitasStore.fecha, () => {
    citasStore.Formulario.Cita.fecha = calendarioCitasStore.fecha.split('/').reverse().join('-')
  })

  async function changeServicio(event) {
    const id_servicio = event.target.value

    const servicioStore = useDatosServicioStore()
    const serviciosPlantilla = await servicioStore.listServicios()
    const tipoConsulta = serviciosPlantilla.find((s) => {
      return s.id === id_servicio
    })?.plantilla

    if (tipoConsulta === 'Terapia') {
      const varView = useVarView()

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

      if (respuesta.success) {
        varView.tratamientos = respuesta.data

        optionsTratamientos.value = respuesta.data.map(data => {
          return { text: `${data.tratamiento} - ${data.dias_restantes}`, value: data.id }
        })
      }

      showTratamientos.value = true
      // const tratamientodiv = document.getElementById('tratamientos');

      // if (tratamientodiv) {
      //   tratamientodiv.innerHTML = `<p>Tratamientos activos: ${varView.tratamientos.length || 0}</p>`;
      // } else {
      //   tratamientodiv.innerHTML = ``;
      // }

    } else {

      showTratamientos.value = false
      // const tratamientodiv = document.getElementById('tratamientos');
      // if (tratamientodiv) {
      //   tratamientodiv.innerHTML = ` `;
      // }

    }

  }

  watch(() => citasStore.Formulario.Cita.motivo,
    async () => {
      if (citasStore.Formulario.Cita.motivo === 'Atención domiciliaria') {
        variasCitas.value = false
        rangoFecha.value = true
      } else {
        rangoFecha.value = false
      }
    }
  );

  watch(() => citasStore.Formulario.Cita.tipo,
    async () => {
      if (citasStore.Formulario.Cita.tipo === true) {
        variasCitas.value = true
      } else {
        variasCitas.value = false
      }
    }
  );

  watch(() => citasStore.Formulario.Cita.nuevoProcedimiento,
    async () => {
      if (citasStore.Formulario.Cita.nuevoProcedimiento === true) {
        citasStore.Formulario.Cita.id_procedimiento = null
        nuevoProcedimiento.value = true
      } else {
        nuevoProcedimiento.value = false
      }
    }
  );

  function seleccionarPaciente(paciente) {
    citasStore.Formulario.Cita.name_paciente = paciente.name
    citasStore.Formulario.Cita.id_paciente = paciente.id_paciente
  }

  function seleccionarMedico(medico) {
    citasStore.Formulario.Cita.name_medico = medico.name
    citasStore.Formulario.Cita.id_medico = medico.id_profesional
  }

  // function validarFecha(event) {
  //   const fechaStr = event.target.value;
  //   const fechaCita = new Date(fechaStr);
  //   const hoy = new Date();
  //   const errorDiv = document.getElementById('error-fecha');
  //   // Limpiar la hora para comparar solo fechas
  //   hoy.setHours(0, 0, 0, 0);
  //   fechaCita.setHours(0, 0, 0, 0);

  //   if (!fechaStr) {
  //     alert("Por favor ingresa una fecha.");
  //     return;
  //   }
  //   const maxFecha = new Date(hoy);
  //   maxFecha.setDate(maxFecha.getDate() - 1);

  //   if (fechaCita < maxFecha) {
  //     errorDiv.innerHTML = `<p>La fecha de la cita no puede ser anterior a hoy.</p>`
  //     return;
  //   }

  //   errorDiv.innerHTML = ''
  // }

  function validarFecha() {

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
    .setEditarFormulario(verUser)
    .setFormulariotamaño('XS')
    .setBotones([
      { text: 'Guardar', color: 'bg-blue-500 hover:bg-blue-600', type: 'enviar' },
      { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500 hover:bg-gray-600', type: 'cerrar' },
    ])
    if(verUser){
      builder
      .setFormularioTipo('Wizard')
      .setFormulariotamaño('MD')
      .setFormularioTituloFormulario('Actualizar Cita')
    }
    builder
    .nuevaSeccion('Agregar Cita a tu Agenda')
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
      upperCase: true,
      disabled: verUser
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
      tamaño: 'w-full col-span-2',
      vmodel: 'Cita.name_medico',
      options: medicosList,
      opciones: [{ value: 'name' }, { text: 'Cedula', value: 'No_document' }],
      seleccionarItem: seleccionarMedico,
      upperCase: true,
      disabled: verUser
    })
    .addCampo({
      component: 'Select',
      placeholder: 'Motivo',
      id: 'motivo',
      name: 'motivo',
      tamaño: 'w-full md:col-span-1 col-span-2',
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
    .addCampo({
      component: 'Select',
      placeholder: 'Servicio',
      id: 'servicio',
      name: 'servicio',
      tamaño: 'w-full md:col-span-1 col-span-2',
      options: servicios,
      vmodel: 'Cita.id_servicio',
      slot: {
        tooltip: `<div id="tratamientos" class="text-green-600 dark:text-green-300 text-xs mt-1"></div>`
      },
      events: {
        onChange: changeServicio
      }
    })
  if (showTratamientos?.value) {
    builder
      .addCampo({
        component: 'Checkbox',
        placeholder: 'Nuevo Procedimiento',
        tamaño: 'w-full col-span-2 py-3',
        vmodel: 'Cita.nuevoProcedimiento',
      })
    if (nuevoProcedimiento?.value || optionsTratamientos.value.length < 1) {
      builder
        .addCampo({
          name: 'procedimiento',
          id: 'descripcionProcedimiento',
          vmodel: 'Cita.procedimiento',
          component: 'SelectSearch',
          placeholder: 'Procedimiento (CUPS)',
          tamaño: 'w-full col-span-2',
          UpperCase: true,
          options: CUPS,
          opciones: [{ value: 'DESCRIPCION' }, { text: 'Codigo', value: 'CODIGO' }],
          seleccionarItem: (item) => {
            citasStore.Formulario.Cita.procedimiento = item.DESCRIPCION
            citasStore.Formulario.Cita.codigo = item.CODIGO
          },
        },)
    } else {
      builder
        // 📌 Sección: tratamientos
        .addCampo({
          component: 'Select',
          placeholder: 'Seleccione procedimiento',
          name: 'procedimientoActivo',
          id: 'procedimientoActivo',
          vmodel: 'Cita.id_procedimiento',
          tamaño: 'w-full col-span-2',
          options: optionsTratamientos
        })
    }
  }
  if (unref(rangoFecha)) {
    builder
      .addCampo({
        component: 'Label',
        text: '<i class="fa-solid fa-calendar text-blue-500 mr-1"></i>Rango de fecha cumplimiento',
        tamaño: 'w-full col-span-2',
        forLabel: 'fechaInicial',
      })
      .addCampo({
        component: 'Input',
        type: 'date',
        label: 'Fecha Desde',
        id: 'fechaInicial',
        name: 'fechaInicial',
        tamaño: 'w-full md:col-span-1 col-span-2',
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
        type: 'date',
        label: 'Fecha Hasta',
        id: 'fechaFinal',
        name: 'fechaFinal',
        tamaño: 'w-full md:col-span-1 col-span-2',
        vmodel: 'Cita.fechaHasta',
        events: {
          onChange: validarFecha
        },
        slot: {
          tooltip: `<div id="error-fecha" class="text-red-300 text-xs mt-1"></div>`
        },
      })
      if(!verUser){
        builder
        .addCampo({
          component: 'Input',
          type: 'number',
          label: 'No. Citas',
          placeholder: 'Cantidad de Citas',
          id: 'cantidadCitas',
          name: 'cantidadCitas',
          tamaño: 'w-full md:col-span-1 col-span-2',
          vmodel: 'Cita.cantidadCitas',
        })
      }
  } else {
    builder
    if(!verUser){
      builder
      .addCampo({
        component: 'Checkbox',
        placeholder: 'Agendar varias Citas',
        tamaño: 'w-full col-span-2 py-3',
        vmodel: 'Cita.tipo',
      })
    }
    builder
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
        tamaño: 'w-full md:col-span-1 col-span-2',
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
        tamaño: 'w-full md:col-span-1 col-span-2',
        vmodel: 'Cita.hora',
        events: {
          onChange: validarHora
        },
        slot: {
          tooltip: `<div id="error-hora" class="text-red-300 text-xs mt-1"></div>`
        },
      })
  }
  if (variasCitas?.value) {
    builder
      .addCampo({
        component: 'Input',
        type: 'number',
        label: 'Dias de separacion',
        placeholder: 'Intervalo de Agendamiento (dias)',
        id: 'intervaloCitas',
        name: 'intervaloCitas',
        tamaño: 'w-full md:col-span-1 col-span-2',
        vmodel: 'Cita.intervaloCitas',
      })
      .addCampo({
        component: 'Input',
        type: 'number',
        label: 'No. Citas',
        placeholder: 'Cantidad de Citas',
        id: 'cantidadCitas',
        name: 'cantidadCitas',
        tamaño: 'w-full md:col-span-1 col-span-2',
        vmodel: 'Cita.cantidadCitas',
      })
      .addCampo({
        component: 'Label',
        text: '<i class="fa-solid fa-gear text-blue-600 mr-1"></i>Agregar Varias Citas',
        tamaño: 'w-full col-span-2',
        forLabel: 'fechaInicial',
      })
  }
  if(verUser){
    builder
      .addCampo({
        component: 'Input',
        type: 'text',
        label: 'Motivo de edición',
        placeholder: 'Describa brevemente el motivo de la edicion de cita.',
        id: 'motivoEdicion',
        name: 'motivoEdicion',
        tamaño: 'w-full col-span-2',
        vmodel: 'Cita.motivo_edicion',
      })
  }
  builder.build()

  return builder
}