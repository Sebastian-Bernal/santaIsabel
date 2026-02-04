import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente'
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia'
import { useDatosServicioStore } from '~/stores/Formularios/empresa/Servicio'
import { mapCampos } from '~/components/organism/Forms/useFormulario';
import { validarYEnviarCancelarCita } from '~/Core/Usuarios/Cita/CancelarCita';

export function useCitasActions({ fecha }) {
    const citasStore = useCitasStore()
    const pacientesStore = usePacientesStore()
    const historiasStore = useHistoriasStore()
    const servicioStore = useDatosServicioStore()
    const varView = useVarView()

    const notificacionesStore = useNotificacionesStore()
    const {
        alertRespuestaInput,
        simple,
        mensaje,
        options
    } = notificacionesStore

    function parseFechaISO(iso) {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d); // siempre local, sin UTC
    }

    /* =========================
       CANCELAR CITA
    ========================= */
    async function cancelarCita(cita) {
        options.icono = 'warning'
        options.titulo = 'Deseas Cancelar la cita?'
        options.html = `Se cancelara la cita de: <span>${cita.name_paciente}</span>`
        options.input = 'text'
        options.inputAtributes = { placeholder: 'Motivo de cancelacion' }
        options.confirmtext = 'Si, Cancelar'
        options.canceltext = 'Atras'

        const respuesta = await alertRespuestaInput()

        if (respuesta.estado !== 'confirmado') return

        if (!respuesta.valor) {
            options.position = 'top-end'
            options.texto = 'Ingrese un motivo de cancelacion.'
            options.background = '#d33'
            options.tiempo = 1500
            mensaje()
            return
        }

        const res = validarYEnviarCancelarCita(cita, respuestaAlert.valor)

        if (res) {
            options.position = 'top-end'
            options.texto = 'Cita Cancelada con exito.'
            options.background = '#6bc517'
            options.tiempo = 1500
            mensaje()
            options.background = '#d33'
        }
    }

    /* =========================
       ACTUALIZAR CITA
    ========================= */
    function actualizarCita(cita) {
        mapCampos(cita, citasStore.Formulario);
        varView.rangoCita = cita.motivo === 'Atención domiciliaria'
        varView.showActualizarCita = true
    }

    /* =========================
       MOSTRAR MOTIVOS
    ========================= */
    function showMotivoCancelacion(cita) {
        options.icono = 'info'
        options.titulo = 'Motivo de cancelacion'
        options.texto = cita.motivo_cancelacion || 'Cita cancelada!'
        options.tiempo = 5000
        simple()
    }

    function showMotivoEdicion(cita) {
        options.icono = 'info'
        options.titulo = 'Motivo de edición'
        options.texto = cita.motivo_edicion || 'La cita ha sido editada!'
        options.tiempo = 5000
        simple()
    }

    /* =========================
       OBSERVACIÓN PROFESIONAL
    ========================= */
    async function showObservacion(cita) {
        const historia = await historiasStore.listDatos(
            cita.id_examen_fisico,
            'Analisis',
            'id'
        )

        options.icono = 'info'
        options.titulo = 'Observacion del Profesional'
        options.texto = historia[0]?.observacion || 'Cita Realizada con exito!'
        options.tiempo = 5000
        simple()
    }

    /* =========================
       ACTIVAR CITA
    ========================= */
    async function activarCita(cita) {
        if (!cita.fechaHasta) {
            cita.fechaHasta = cita.fecha
        }

        const now = new Date()
        const horaActual = now.toTimeString().slice(0, 5)

        const fechaHoy = parseFechaISO(now.toISOString().split('T')[0])
        const fechaHasta = parseFechaISO(cita.fechaHasta)

        if (fechaHoy > fechaHasta) {
            options.icono = 'warning'
            options.titulo = 'Rango vencido'
            options.texto = 'Consulta con un administrador para habilitar Cita!'
            options.tiempo = 3000
            simple()
            return
        }

        let pacientes = pacientesStore.Pacientes
        if (!pacientes.length) {
            pacientes = await pacientesStore.listPacientes(false)
        }

        const paciente = pacientes.find(
            p => p.id_paciente === cita.id_paciente
        )

        if (!paciente) {
            options.icono = 'warning'
            options.titulo = 'No se encontro el paciente'
            options.texto = 'Verifica si existe en la lista de pacientes.'
            options.tiempo = 3000
            simple()
            return
        }

        prepararHistoria(cita, paciente)

        const servicios = await servicioStore.listServicios()
        varView.tipoConsulta = servicios.find(s => s.name === cita.servicio)

        if (!varView.tipoConsulta) {
            options.icono = 'warning'
            options.titulo = 'No se encontro el tipo de servicio'
            options.tiempo = 3000
            simple()
            return
        }

        resolverPlantilla(cita, paciente, horaActual)
        varView.showNuevaHistoria = true
    }

    /* =========================
       HELPERS INTERNOS
    ========================= */
    function prepararHistoria(cita, paciente) {
        historiasStore.Formulario.HistoriaClinica.name_paciente = cita.name_paciente
        historiasStore.Formulario.HistoriaClinica.type_doc_paciente = paciente.type_doc
        historiasStore.Formulario.HistoriaClinica.No_document_paciente = paciente.No_document
        historiasStore.Formulario.HistoriaClinica.id_paciente = cita.id_paciente

        historiasStore.Formulario.Analisis.servicio = cita.servicio
        historiasStore.Formulario.Cita = cita
    }

    function resolverPlantilla(cita, paciente, horaActual) {
        const fechaForm = fecha?.value
            ? fecha.value.split('/').reverse().join('-')
            : cita.fecha

        if (varView.tipoConsulta.plantilla === 'Terapia') {
            Object.assign(historiasStore.Formulario.Terapia, {
                id_paciente: cita.id_paciente,
                id_profesional: cita.id_medico,
                id_procedimiento: cita.id_procedimiento,
                fecha: fechaForm,
                hora: horaActual
            })
        }

        if (varView.tipoConsulta.plantilla === 'Nota') {
            Object.assign(historiasStore.Formulario.Nota, {
                id_paciente: cita.id_paciente,
                id_profesional: cita.id_medico,
                id_procedimiento: cita.id_procedimiento,
                direccion: paciente.direccion,
                fecha_nota: fechaForm,
                hora_nota: horaActual
            })
        }
    }

    return {
        cancelarCita,
        actualizarCita,
        showMotivoCancelacion,
        showMotivoEdicion,
        showObservacion,
        activarCita
    }
}
