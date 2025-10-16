import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { useNotificacionesStore } from '../../../stores/notificaciones.js'
import { useCalendarioCitas } from '~/stores/Calendario.js';
import { useVarView } from '~/stores/varview.js';

// funcion para Validar campos del formulario Historia Clinica
export const validarYEnviarRegistrarHistoria = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const calendarioStore = useCalendarioCitas();
    const varView = useVarView();
    datos.HistoriaClinica.fecha_historia = calendarioStore.fechaActual;
    datos.Analisis.fecha = calendarioStore.fechaActual;

    // Validacion si no se registran medicamentos
    if (datos.Plan_manejo_medicamentos?.length < 1) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.title = 'Historia sin plan de medicamentos'
        notificacionesStore.options.html = '¿Deseas registrar <strong>medicamentos</strong>?'
        notificacionesStore.options.confirmtext = 'Si'
        notificacionesStore.options.canceltext = 'No, continuar'
        let res = await notificacionesStore.alertRespuesta();
        if (res === 'confirmado') {
            varView.showMedicinas = true;
            return false
        };
    }

    // Validacion si no se registran procedimientos
    if (datos.Plan_manejo_procedimientos?.length < 1) {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.title = 'Historia sin plan de procedimientos'
        notificacionesStore.options.html = '¿Deseas registrar <strong>Procedimiento</strong>?'
        notificacionesStore.options.confirmtext = 'Si'
        notificacionesStore.options.canceltext = 'No, continuar'
        let resp = await notificacionesStore.alertRespuesta();
        if (resp === 'confirmado') {
            varView.showProcedimientos = true;
            return false
        }
    }

    const body = {
        HistoriaClinica: {
            fecha_historia: calendarioStore.fechaActual.split('/').reverse().join('-'),
            id_paciente: datos.HistoriaClinica.id_paciente
        },
        Analisis: {
            motivo: datos.Analisis.motivo,
            observacion: datos.Analisis.observacion,
            tratamiento: datos.Analisis.tratamiento,
            analisis: datos.Analisis.analisis,
            tipoAnalisis: datos.Analisis.tipoAnalisis,
            id_medico: datos.Cita.id_medico
        },
        Diagnosticos: datos.Diagnosticos.map(d => ({
            descripcion: d.descripcion,
            codigo: d.codigo
        })),
        Antecedentes: datos.Antecedentes.map(a => ({
            tipo: a.tipo,
            descripcion: a.descripcion,
            id_paciente: datos.HistoriaClinica.id_paciente
        })),
        Enfermedad: {
            valor: datos.Enfermedad.valor,
            fecha_diagnostico: calendarioStore.fechaActual.split('/').reverse().join('-'),
            fecha_rehabilitacion: datos.Enfermedad.fecha_rehabilitacion,
            id_paciente: datos.HistoriaClinica.id_paciente
        },
        ExamenFisico: {
            Peso: datos.ExamenFisico.Peso,
            altura: datos.ExamenFisico.altura,
            otros: datos.ExamenFisico.otros,
            signosVitales: {
                ta: datos.ExamenFisico.signosVitales.ta,
                fc: datos.ExamenFisico.signosVitales.fc,
                fr: datos.ExamenFisico.signosVitales.fr,
                t: datos.ExamenFisico.signosVitales.t,
                SATo2: datos.ExamenFisico.signosVitales.SATo2
            }
        },
        Plan_manejo_medicamentos: datos.Plan_manejo_medicamentos.map(m => ({
            medicamento: m.medicamento,
            dosis: m.dosis,
            cantidad: parseInt(m.cantidad)
        })),
        Plan_manejo_procedimientos: datos.Plan_manejo_procedimientos.map(p => ({
            procedimiento: p.procedimiento,
            codigo: p.codigo,
            fecha: p.fecha
        })),
        Plan_manejo_insumos: datos.Plan_manejo_insumos.map(i => ({
            nombre: i.nombre,
            cantidad: parseInt(i.cantidad)
        })),
        Plan_manejo_equipos: datos.Plan_manejo_equipos.map(e => ({
            descripcion: e.descripcion,
            uso: e.uso
        })),
        Cita: {
            id: datos.Cita.id
        }
    };

    return await enviarFormulario(body);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.historiasClinicas,
                token: token,
                body: datos
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.status == 200) {
                console.log(respuesta)
                return true
            } else {
                console.log(respuesta)
            }
            // await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
        return true
    }
};